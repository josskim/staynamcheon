"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type ChatMessage, clientMessageIdPattern, failMessage, mergeMessages, messageId } from "./chat-delivery";

type Threads = Record<string, ChatMessage[]>;

export function useReliableChat(roomId: string | null, sender: "admin" | "visitor") {
  const [threads, setThreads] = useState<Threads>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [restored, setRestored] = useState(false);
  const fetching = useRef(new Set<string>());
  const sendingRooms = useRef(new Set<string>());
  const storageKey = `stay-chat-outbox-v1-${sender}`;

  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(sessionStorage.getItem(storageKey) || "{}");
      const recovered: Threads = {};
      if (saved && typeof saved === "object" && !Array.isArray(saved)) {
        for (const [room, entries] of Object.entries(saved)) {
          if (!Array.isArray(entries)) continue;
          recovered[room] = entries.filter((m): m is ChatMessage =>
            !!m && m.senderType === sender && typeof m.content === "string" &&
            typeof m.createdAt === "string" && Number.isFinite(Date.parse(m.createdAt)) &&
            typeof m.clientMessageId === "string" && clientMessageIdPattern.test(m.clientMessageId) &&
            m.id === messageId(room, sender, m.clientMessageId)
          ).map(m => ({ ...m, delivery: "failed", error: "전송 결과를 확인하지 못했습니다. 다시 조회 후 재시도할 수 있습니다." }));
        }
      }
      setThreads(prev => {
        const result = { ...recovered };
        for (const [room, messages] of Object.entries(prev)) result[room] = mergeMessages(result[room] || [], messages);
        return result;
      });
    } catch { /* Storage may be unavailable in private browsing. */ }
    setRestored(true);
  }, [storageKey, sender]);

  useEffect(() => {
    if (!restored) return;
    try {
      const outbox = Object.fromEntries(Object.entries(threads)
        .map(([room, messages]) => [room, messages.filter(m => m.delivery)]));
      sessionStorage.setItem(storageKey, JSON.stringify(outbox));
    } catch { /* In-memory failed messages are still preserved. */ }
  }, [threads, storageKey, restored]);

  const refresh = useCallback(async (room: string) => {
    if (fetching.current.has(room)) return true;
    fetching.current.add(room);
    try {
      const response = await fetch(`/api/chat/messages?${new URLSearchParams({ roomId: room })}`, {
        cache: "no-store", signal: AbortSignal.timeout(15000),
      });
      const data = await response.json();
      if (!response.ok || !data.ok || !Array.isArray(data.messages)) throw new Error("조회 실패");
      setThreads(prev => ({ ...prev, [room]: mergeMessages(prev[room] || [], data.messages) }));
      setErrors(prev => ({ ...prev, [room]: "" }));
      return true;
    } catch {
      setErrors(prev => ({ ...prev, [room]: "채팅을 불러오지 못했습니다. 기존 내용은 유지되며 자동으로 다시 확인합니다." }));
      return false;
    } finally { fetching.current.delete(room); }
  }, []);

  const send = useCallback((content: string, retry?: ChatMessage) => {
    const room = roomId;
    if (!room || !content.trim() || sendingRooms.current.has(room)) return false;
    if (retry && (!retry.clientMessageId || retry.senderType !== sender || retry.id !== messageId(room, sender, retry.clientMessageId))) return false;
    const key = retry?.clientMessageId || crypto.randomUUID();
    const pending: ChatMessage = {
      id: messageId(room, sender, key), clientMessageId: key, senderType: sender,
      content: content.trim(), isRead: false, createdAt: retry?.createdAt || new Date().toISOString(), delivery: "sending",
    };
    sendingRooms.current.add(room);
    setThreads(prev => ({ ...prev, [room]: mergeMessages(prev[room] || [], [pending]) }));
    void (async () => {
      try {
        const response = await fetch("/api/chat/messages", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId: room, content: pending.content, senderType: sender, clientMessageId: key }),
          signal: AbortSignal.timeout(15000),
        });
        const data = await response.json();
        if (!response.ok || !data.ok || data.message?.id !== pending.id) {
          throw new Error(response.status === 401 ? "로그인이 만료되었습니다. 다시 로그인한 후 재시도해 주세요." : "전송 결과를 확인하지 못했습니다. 재시도해 주세요.");
        }
        setThreads(prev => ({ ...prev, [room]: mergeMessages(prev[room] || [], [data.message]) }));
      } catch (error) {
        const reason = error instanceof Error && error.message.startsWith("로그인")
          ? error.message : "전송 결과를 확인하지 못했습니다. 내용은 보관되어 있으며 재시도해도 중복 저장되지 않습니다.";
        setThreads(prev => ({ ...prev, [room]: failMessage(prev[room] || [], pending.id, reason) }));
      } finally { sendingRooms.current.delete(room); }
    })();
    return true;
  }, [roomId, sender]);

  const messages = roomId ? threads[roomId] || [] : [];
  return { messages, refresh, send, error: roomId ? errors[roomId] || "" : "", sending: messages.some(m => m.delivery === "sending") };
}

/** No overlapping polls. Keep foreground responsiveness, reduce hidden-tab load. */
export function useChatPolling(task: () => Promise<boolean>, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    let stopped = false;
    let running = false;
    let timer: ReturnType<typeof setTimeout>;
    const run = async () => {
      if (running || stopped) return;
      clearTimeout(timer);
      running = true;
      let ok = false;
      try { ok = await task(); } catch { ok = false; } finally {
        running = false;
        if (!stopped) timer = setTimeout(run, document.hidden ? 30000 : ok ? 4000 : 15000);
      }
    };
    const wake = () => { if (!document.hidden) void run(); };
    timer = setTimeout(run, document.hidden ? 30000 : 4000);
    document.addEventListener("visibilitychange", wake);
    return () => { stopped = true; clearTimeout(timer); document.removeEventListener("visibilitychange", wake); };
  }, [task, enabled]);
}
