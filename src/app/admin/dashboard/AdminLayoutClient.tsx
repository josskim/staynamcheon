"use client";

import { useState } from "react";
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
  BarChart2
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

  return (
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

        <div className="p-4 border-t border-[#f4f1f1]">
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

        <div className="p-4 md:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
