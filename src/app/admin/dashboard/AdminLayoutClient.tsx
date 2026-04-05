"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  Settings,
  LayoutDashboard,
  Layout,
  Home,
  Tent,
  Coffee,
  Compass,
  CalendarDays,
  Image as ImageIcon,
  BarChart2,
  PieChart,
  MessageCircle,
  Download,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "./LogoutButton";

interface MenuItem {
  name: string;
  icon: string;
  href: string;
}

const ICON_MAP: Record<string, any> = {
  LayoutDashboard,
  Layout,
  Home,
  Tent,
  Coffee,
  Compass,
  CalendarDays,
  Image: ImageIcon,
  BarChart2,
  PieChart,
  MessageCircle,
  Settings,
};

export default function AdminLayoutClient({
  children,
  menuItems
}: {
  children: React.ReactNode;
  menuItems: MenuItem[];
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPushBanner, setShowPushBanner] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevUnreadRef = useRef<number>(-1);

  // 알림음 초기화
  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
    audioRef.current.volume = 0.7;
  }, []);

  // 전역 새 메시지 폴링 (어느 admin 페이지에서든 알림음 재생)
  useEffect(() => {
    const checkUnread = async () => {
      try {
        const res = await fetch("/api/admin/chat/rooms");
        const data = await res.json();
        if (!data.ok) return;
        const totalUnread = data.rooms.reduce((sum: number, r: any) => sum + r.unreadCount, 0);
        if (prevUnreadRef.current >= 0 && totalUnread > prevUnreadRef.current) {
          audioRef.current?.play().catch(() => {});
        }
        prevUnreadRef.current = totalUnread;
      } catch {}
    };

    checkUnread();
    const interval = setInterval(checkUnread, 5000);
    return () => clearInterval(interval);
  }, []);

  // Service Worker 메시지 수신 → 즉시 알림음 재생
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === "NEW_CHAT_MESSAGE") {
        audioRef.current?.play().catch(() => {});
      }
    };
    navigator.serviceWorker?.addEventListener("message", handler);
    return () => navigator.serviceWorker?.removeEventListener("message", handler);
  }, []);

  // Service Worker 등록 + 알림 상태 확인
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/admin/sw.js").catch(() => {});
    }

    // PWA 설치 가능 여부 캡처
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // 이미 설치된 경우 감지
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // 알림 권한 상태 확인 → 미허용이면 배너 표시
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setPushEnabled(true);
      } else if (Notification.permission === "default") {
        // 3초 후에 배너 표시 (바로 뜨면 무시당하기 쉬움)
        const timer = setTimeout(() => setShowPushBanner(true), 3000);
        return () => { clearTimeout(timer); window.removeEventListener("beforeinstallprompt", handler); };
      }
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleEnablePush = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("이 브라우저에서는 푸시 알림을 지원하지 않습니다.");
      setShowPushBanner(false);
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setShowPushBanner(false);
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
    } catch (err) {
      console.error("Push subscribe error:", err);
    }
    setShowPushBanner(false);
  };

  return (
    <>
      {/* theme-color for PWA */}
      <meta name="theme-color" content="#DB5461" />
    <div className="flex min-h-screen bg-[#f8f6f6]">
      {/* Sidebar Backdrop Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "w-64 bg-white border-r border-[#e4dcdd] flex flex-col fixed inset-y-0 z-[70] transition-transform duration-300 md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 border-b border-[#f4f1f1] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-[#DB5461]">
            <div className="w-8 h-8 bg-[#DB5461] rounded-lg flex items-center justify-center text-white font-bold">S</div>
            <span className="font-bold tracking-tight text-xl">StayNamcheon</span>
          </Link>
          <button 
            className="md:hidden text-[#856669]" 
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const IconComponent = ICON_MAP[item.icon] || Settings;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#856669] rounded-xl transition-all duration-200 hover:bg-[#f8f6f6] hover:text-[#DB5461] group"
              >
                <IconComponent size={18} className="group-hover:scale-110 transition-transform" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#f4f1f1] space-y-1">
          {!isInstalled && deferredPrompt && (
            <button
              onClick={handleInstall}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-[#DB5461] rounded-xl transition-all hover:bg-rose-50 group"
            >
              <Download size={18} className="group-hover:scale-110 transition-transform" />
              앱 설치하기
            </button>
          )}
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen w-full">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#f4f1f1] flex items-center justify-between px-6 md:px-12 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 -ml-2 text-[#856669] hover:bg-[#f8f6f6] rounded-xl transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg md:text-xl font-bold text-[#171212] whitespace-nowrap">Management Portal</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-[#171212]">Administrator</p>
              <p className="text-[10px] text-[#856669] uppercase tracking-widest">Master Admin</p>
            </div>
            <div className="w-10 h-10 bg-[#f8f6f6] rounded-full border border-[#e4dcdd] flex items-center justify-center text-[#DB5461]">
              <Settings size={20} />
            </div>
          </div>
        </header>

        {/* 알림 허용 배너 */}
        {showPushBanner && !pushEnabled && (
          <div className="mx-4 md:mx-12 mt-4 flex items-center justify-between gap-4 bg-[#DB5461] text-white px-6 py-4 rounded-2xl shadow-lg animate-in slide-in-from-top-4 fade-in duration-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <Bell size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">채팅 알림을 켜시겠습니까?</p>
                <p className="text-xs opacity-80 mt-0.5">고객 문의가 오면 즉시 알림을 받을 수 있습니다.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleEnablePush}
                className="px-4 py-2 bg-white text-[#DB5461] text-sm font-bold rounded-xl hover:bg-white/90 transition-colors"
              >
                허용
              </button>
              <button
                onClick={() => setShowPushBanner(false)}
                className="px-3 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                나중에
              </button>
            </div>
          </div>
        )}

        <div className="p-4 md:p-12">
          {children}
        </div>
      </main>
    </div>
    </>
  );
}
