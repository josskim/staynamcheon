"use client";

import { LogOut } from "lucide-react";

export function LogoutButton() {
  const handleLogout = () => {
    // Simple logout logic (handled client-side by clearing cookie)
    document.cookie = "admin_session=; Max-Age=0; path=/;";
    window.location.href = "/admin/login";
  };

  return (
    <button 
      className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-500 rounded-xl transition-all hover:bg-red-50"
      onClick={handleLogout}
    >
      <LogOut size={18} />
      Logout
    </button>
  );
}
