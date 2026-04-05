"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Loader2, Send, MessageCircle, User, ArrowLeft, Bell, BellOff,
} from "lucide-react";

interface Room {
  id: string;
  nickname: string;
  isClosed: boolean;
  lastMessage: string | null;
  lastSender: string | null;
  lastMessageAt: string;
  unreadCount: number;
}

interface Message {
  id: string;
  senderType: "visitor" | "admin";
  content: string;
  isRead: boolean;
  createdAt: string;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  return `${d}일 전`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function AdminChatPage() {
  const searchParams = useSearchParams();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 알림음 초기화
  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
    audioRef.current.volume = 0.6;
  }, []);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // 채팅방 목록 로드
  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/chat/rooms");
      const data = await res.json();
      if (data.ok) setRooms(data.rooms);
    } catch {} finally {
      setLoadingRooms(false);
    }
  }, []);

  // 메시지 로드 (매번 전체 fetch → isRead 상태 갱신)
  const fetchMessages = useCallback(async (rid: string, initial?: boolean) => {
    try {
      const params = new URLSearchParams({ roomId: rid });
      const res = await fetch(`/api/chat/messages?${params}`);
      const data = await res.json();
      if (!data.ok) return;

      setMessages((prev) => {
        const prevIds = new Set(prev.map((m) => m.id));
        const newVisitorMsgs = initial ? [] : data.messages.filter(
          (m: Message) => m.senderType === "visitor" && !prevIds.has(m.id)
        );

        // 방문자 메시지 수신 시 알림음
        if (newVisitorMsgs.length > 0) {
          audioRef.current?.play().catch(() => {});
        }

        return data.messages;
      });
    } catch {}
  }, []);

  // 초기 로드
  useEffect(() => {
    fetchRooms();
    const roomParam = searchParams.get("room");
    if (roomParam) setSelectedRoom(roomParam);
  }, [fetchRooms, searchParams]);

  // 룸 선택 시
  useEffect(() => {
    if (!selectedRoom) return;
    setLoadingMsgs(true);
    fetchMessages(selectedRoom, true).then(() => setLoadingMsgs(false));

    // 읽음 처리
    fetch("/api/chat/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: selectedRoom, senderType: "admin" }),
    }).catch(() => {});

    // unread 카운트 제거 (로컬)
    setRooms((prev) =>
      prev.map((r) => (r.id === selectedRoom ? { ...r, unreadCount: 0 } : r))
    );
  }, [selectedRoom, fetchMessages]);

  // 폴링: 메시지 + 룸 목록
  useEffect(() => {
    pollingRef.current = setInterval(() => {
      if (selectedRoom) fetchMessages(selectedRoom);
      fetchRooms();
    }, 4000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [selectedRoom, fetchMessages, fetchRooms]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  // 푸시 알림 상태 확인
  useEffect(() => {
    if ("Notification" in window) {
      setPushEnabled(Notification.permission === "granted");
    }
  }, []);

  const togglePush = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("이 브라우저에서는 푸시 알림을 지원하지 않습니다.");
      return;
    }

    if (Notification.permission === "granted") {
      alert("알림이 이미 활성화되어 있습니다.");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      alert("알림 권한이 거부되었습니다. 브라우저 설정에서 허용해주세요.");
      return;
    }

    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      await fetch("/api/admin/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });

      setPushEnabled(true);
      alert("푸시 알림이 활성화되었습니다!");
    } catch (err) {
      console.error("Push subscribe error:", err);
      alert("알림 등록 중 오류가 발생했습니다.");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedRoom || sending) return;
    const content = input.trim();
    setInput("");
    setSending(true);

    const tempMsg: Message = {
      id: "temp-" + Date.now(),
      senderType: "admin",
      content,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: selectedRoom, content, senderType: "admin" }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessages((prev) => prev.map((m) => (m.id === tempMsg.id ? data.message : m)));
      }
    } catch {} finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectedRoomData = rooms.find((r) => r.id === selectedRoom);
  const totalUnread = rooms.reduce((sum, r) => sum + r.unreadCount, 0);

  // 날짜 그룹
  const messagesByDate: Record<string, Message[]> = {};
  messages.forEach((m) => {
    const dateKey = formatDate(m.createdAt);
    if (!messagesByDate[dateKey]) messagesByDate[dateKey] = [];
    messagesByDate[dateKey].push(m);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#171212] tracking-tight">Chat</h1>
          <p className="text-[#856669] mt-2 font-medium">
            실시간 채팅 문의 관리
            {totalUnread > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-[#DB5461] text-white text-xs rounded-full font-bold">
                {totalUnread}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={togglePush}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-colors ${
            pushEnabled
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-[#f8f6f6] text-[#856669] border border-[#e4dcdd] hover:border-[#DB5461] hover:text-[#DB5461]"
          }`}
        >
          {pushEnabled ? <Bell size={16} /> : <BellOff size={16} />}
          {pushEnabled ? "알림 ON" : "알림 켜기"}
        </button>
      </div>

      <div className="flex gap-6 h-[calc(100vh-260px)] min-h-[500px]">
        {/* 채팅방 목록 */}
        <div className={`w-80 shrink-0 bg-white rounded-3xl border border-[#e4dcdd] flex flex-col overflow-hidden ${selectedRoom ? "hidden lg:flex" : "flex"}`}>
          <div className="p-5 border-b border-[#f4f1f1]">
            <h2 className="text-lg font-bold text-[#171212]">문의 목록</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingRooms ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="animate-spin text-[#DB5461]" size={24} />
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-16 text-[#856669]">
                <MessageCircle className="mx-auto mb-3 opacity-40" size={32} />
                <p className="text-sm">아직 문의가 없습니다.</p>
              </div>
            ) : (
              rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id)}
                  className={`w-full text-left px-5 py-4 border-b border-[#f8f6f6] transition-colors hover:bg-[#f8f6f6] ${
                    selectedRoom === room.id ? "bg-rose-50 border-l-[3px] border-l-[#DB5461]" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#f4f1f1] flex items-center justify-center shrink-0">
                        <User size={16} className="text-[#856669]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#171212] truncate">{room.nickname}</p>
                        <p className="text-xs text-[#856669] truncate mt-0.5">
                          {room.lastMessage || "대화 없음"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-[10px] text-[#856669]">{timeAgo(room.lastMessageAt)}</p>
                      {room.unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-[#DB5461] text-white text-[10px] font-bold rounded-full mt-1">
                          {room.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* 대화창 */}
        <div className={`flex-1 bg-white rounded-3xl border border-[#e4dcdd] flex flex-col overflow-hidden ${!selectedRoom ? "hidden lg:flex" : "flex"}`}>
          {!selectedRoom ? (
            <div className="flex-1 flex items-center justify-center text-[#856669]">
              <div className="text-center">
                <MessageCircle className="mx-auto mb-4 opacity-30" size={48} />
                <p className="text-sm">채팅방을 선택해주세요.</p>
              </div>
            </div>
          ) : (
            <>
              {/* 대화 헤더 */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-[#f4f1f1]">
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="lg:hidden p-1.5 hover:bg-[#f8f6f6] rounded-xl"
                >
                  <ArrowLeft size={18} className="text-[#856669]" />
                </button>
                <div className="w-10 h-10 rounded-full bg-[#f4f1f1] flex items-center justify-center">
                  <User size={18} className="text-[#856669]" />
                </div>
                <div>
                  <p className="font-bold text-[#171212] text-sm">
                    {selectedRoomData?.nickname || "방문자"}
                  </p>
                  <p className="text-[11px] text-[#856669]">방문자 문의</p>
                </div>
              </div>

              {/* 메시지 영역 */}
              <div className="flex-1 overflow-y-auto px-6 py-4 bg-[#f8f6f6] space-y-1">
                {loadingMsgs ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="animate-spin text-[#DB5461]" size={24} />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-16 text-[#856669] text-sm">
                    아직 메시지가 없습니다.
                  </div>
                ) : (
                  Object.entries(messagesByDate).map(([dateStr, msgs]) => (
                    <div key={dateStr}>
                      <div className="text-center my-4">
                        <span className="px-3 py-1 bg-[#e4dcdd] text-[#856669] text-[11px] rounded-full">
                          {dateStr}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {msgs.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.senderType === "admin" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                msg.senderType === "admin"
                                  ? "bg-[#DB5461] text-white rounded-br-md"
                                  : "bg-white text-[#171212] border border-[#e4dcdd] rounded-bl-md"
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                              <div className={`flex items-center gap-1.5 mt-1 ${msg.senderType === "admin" ? "justify-end" : ""}`}>
                                <span
                                  className={`text-[10px] ${
                                    msg.senderType === "admin" ? "text-white/60" : "text-[#856669]"
                                  }`}
                                >
                                  {formatTime(msg.createdAt)}
                                </span>
                                {msg.senderType === "admin" && (
                                  <span className={`text-[10px] ${msg.isRead ? "text-white/80" : "text-white/40"}`}>
                                    {msg.isRead ? "읽음" : "안읽음"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 입력 */}
              <div className="p-4 border-t border-[#f4f1f1] bg-white">
                <div className="flex items-center gap-3">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="답변을 입력하세요..."
                    className="flex-1 px-4 py-3 bg-[#f8f6f6] rounded-2xl text-sm outline-none placeholder:text-[#856669] text-[#171212] focus:ring-2 focus:ring-[#DB5461]/20"
                    autoFocus
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || sending}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#DB5461] text-white disabled:opacity-40 hover:bg-[#c44a55] transition-colors shrink-0"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
