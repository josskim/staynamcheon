"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    window.location.href = "/admin/login";
  };

  return (
    <button
      className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-500 rounded-xl transition-all hover:bg-red-50 disabled:opacity-50"
      onClick={handleLogout}
      disabled={loading}
    >
      <LogOut size={18} />
      {loading ? "로그아웃 중..." : "Logout"}
    </button>
  );
}
