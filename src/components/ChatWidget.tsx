"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

interface Message {
  id: string;
  senderType: "visitor" | "admin";
  content: string;
  isRead: boolean;
  createdAt: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastFetchRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 알림음 초기화
  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
    audioRef.current.volume = 0.6;
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 채팅 초기화
  const initChat = useCallback(async () => {
    if (roomId) return;
    setInitializing(true);
    try {
      const res = await fetch("/api/chat/init", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setRoomId(data.roomId);
        setNickname(data.nickname);
      }
    } catch {
      // ignore
    } finally {
      setInitializing(false);
    }
  }, [roomId]);

  // 메시지 가져오기
  const fetchMessages = useCallback(async (rid: string, isInitial?: boolean) => {
    try {
      const params = new URLSearchParams({ roomId: rid });
      if (!isInitial && lastFetchRef.current) {
        params.set("after", lastFetchRef.current);
      }

      const res = await fetch(`/api/chat/messages?${params}`);
      const data = await res.json();
      if (!data.ok) return;

      if (isInitial) {
        setMessages(data.messages);
      } else if (data.messages.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const newMsgs = data.messages.filter((m: Message) => !existingIds.has(m.id));
          return newMsgs.length > 0 ? [...prev, ...newMsgs] : prev;
        });
      }

      if (data.messages.length > 0) {
        lastFetchRef.current = data.messages[data.messages.length - 1].createdAt;
      }

      // admin 메시지 수신 시 알림음 + unread 카운트
      if (!isInitial && data.messages.length > 0) {
        const adminNew = data.messages.filter((m: Message) => m.senderType === "admin");
        if (adminNew.length > 0) {
          audioRef.current?.play().catch(() => {});
          setUnread((prev) => prev + adminNew.length);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // 위젯 열 때
  useEffect(() => {
    if (open && !roomId) {
      initChat();
    }
  }, [open, roomId, initChat]);

  // roomId 확보 후 초기 메시지 로드
  useEffect(() => {
    if (roomId && open) {
      lastFetchRef.current = null;
      fetchMessages(roomId, true);
    }
  }, [roomId, open, fetchMessages]);

  // 폴링
  useEffect(() => {
    if (!roomId) return;

    pollingRef.current = setInterval(() => {
      fetchMessages(roomId);
    }, 4000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [roomId, fetchMessages]);

  // 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 위젯 열면 unread 초기화 + 읽음 처리
  useEffect(() => {
    if (open && roomId) {
      setUnread(0);
      fetch("/api/chat/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, senderType: "visitor" }),
      }).catch(() => {});
    }
  }, [open, roomId]);

  const handleSend = async () => {
    if (!input.trim() || !roomId || sending) return;
    const content = input.trim();
    setInput("");
    setSending(true);

    // Optimistic
    const tempMsg: Message = {
      id: "temp-" + Date.now(),
      senderType: "visitor",
      content,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, content, senderType: "visitor" }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempMsg.id ? data.message : m))
        );
        lastFetchRef.current = data.message.createdAt;
      }
    } catch {
      // keep optimistic msg
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  return (
    <>
      {/* 채팅창 */}
      {open && (
        <div className="fixed bottom-[170px] right-[24px] md:bottom-[180px] md:right-[40px] z-[9999] w-[340px] sm:w-[380px] max-h-[520px] flex flex-col bg-white rounded-2xl shadow-2xl border border-[#e4dcdd] overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-[#DB5461] text-white">
            <div>
              <p className="font-bold text-sm">스테이 남천</p>
              <p className="text-[11px] opacity-80">실시간 채팅문의</p>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8f6f6] min-h-[280px] max-h-[360px]">
            {initializing ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-[#DB5461]" size={24} />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="mx-auto mb-3 text-[#DB5461] opacity-40" size={32} />
                <p className="text-sm text-[#856669]">안녕하세요! 궁금하신 점이 있으시면</p>
                <p className="text-sm text-[#856669]">편하게 문의해주세요.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderType === "visitor" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.senderType === "visitor"
                        ? "bg-[#DB5461] text-white rounded-br-md"
                        : "bg-white text-[#171212] border border-[#e4dcdd] rounded-bl-md"
                    }`}
                  >
                    {msg.senderType === "admin" && (
                      <p className="text-[10px] font-bold text-[#DB5461] mb-1">스테이남천</p>
                    )}
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <div className={`flex items-center gap-1.5 mt-1 ${msg.senderType === "visitor" ? "justify-end" : ""}`}>
                      <span
                        className={`text-[10px] ${
                          msg.senderType === "visitor" ? "text-white/60" : "text-[#856669]"
                        }`}
                      >
                        {formatTime(msg.createdAt)}
                      </span>
                      {msg.senderType === "visitor" && (
                        <span className={`text-[10px] ${msg.isRead ? "text-white/80" : "text-white/40"}`}>
                          {msg.isRead ? "읽음" : "안읽음"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-[#f4f1f1] bg-white">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="메시지를 입력하세요..."
                className="flex-1 px-3 py-2.5 bg-[#f8f6f6] rounded-xl text-sm outline-none placeholder:text-[#856669] text-[#171212] focus:ring-2 focus:ring-[#DB5461]/20"
                disabled={!roomId}
                autoFocus
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || !roomId || sending}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#DB5461] text-white disabled:opacity-40 hover:bg-[#c44a55] transition-colors shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 플로팅 버튼 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-[100px] right-[24px] md:bottom-[110px] md:right-[40px] z-[9998] flex items-center gap-2 bg-[#DB5461] text-white pl-4 pr-5 py-3 rounded-full shadow-lg hover:bg-[#c44a55] transition-all hover:scale-105 active:scale-95"
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
        <span className="text-sm font-bold whitespace-nowrap">
          {open ? "닫기" : "실시간 채팅문의"}
        </span>
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
            {unread}
          </span>
        )}
      </button>
    </>
  );
}
