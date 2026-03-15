import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  FileText, 
  Settings, 
  LogOut,
  Home,
  Coffee,
  Bed,
  Tent,
  Compass,
  Layout
} from "lucide-react";

import { LogoutButton } from "./LogoutButton";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!session) {
    redirect("/admin/login");
  }

  const menuItems = [
    { name: "Overview", icon: LayoutDashboard, href: "/admin/dashboard" },
    { name: "Main Page", icon: Layout, href: "/admin/dashboard/home" },
    { name: "Pension", icon: Home, href: "/admin/dashboard/pension" },
    { name: "Campnic", icon: Tent, href: "/admin/dashboard/campnic" },
    { name: "Cafe", icon: Coffee, href: "/admin/dashboard/cafe" },
    { name: "Other", icon: Compass, href: "/admin/dashboard/other" },
    { name: "Gallery", icon: ImageIcon, href: "/admin/dashboard/gallery" },
    { name: "Settings", icon: Settings, href: "/admin/dashboard/settings" },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8f6f6]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#e4dcdd] flex flex-col fixed inset-y-0 z-50">
        <div className="p-8 border-b border-[#f4f1f1]">
          <Link href="/" className="flex items-center gap-3 text-[#DB5461]">
            <div className="w-8 h-8 bg-[#DB5461] rounded-lg flex items-center justify-center text-white font-bold">S</div>
            <span className="font-bold tracking-tight text-xl">StayNamcheon</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#856669] rounded-xl transition-all duration-200 hover:bg-[#f8f6f6] hover:text-[#DB5461] group"
            >
              <item.icon size={18} className="group-hover:scale-110 transition-transform" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[#f4f1f1]">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#f4f1f1] flex items-center justify-between px-12 sticky top-0 z-40">
          <h2 className="text-xl font-bold text-[#171212]">Management Portal</h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-[#171212]">Administrator</p>
              <p className="text-[10px] text-[#856669] uppercase tracking-widest">Master Admin</p>
            </div>
            <div className="w-10 h-10 bg-[#f8f6f6] rounded-full border border-[#e4dcdd] flex items-center justify-center text-[#DB5461]">
              <Settings size={20} />
            </div>
          </div>
        </header>

        <div className="p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
