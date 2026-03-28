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
  Layout,
  CalendarDays,
  BarChart2
} from "lucide-react";

import { LogoutButton } from "./LogoutButton";
import AdminLayoutClient from "./AdminLayoutClient";

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
    { name: "Overview", icon: "LayoutDashboard", href: "/admin/dashboard" },
    { name: "Main Page", icon: "Layout", href: "/admin/dashboard/home" },
    { name: "Pension", icon: "Home", href: "/admin/dashboard/pension" },
    { name: "Campnic", icon: "Tent", href: "/admin/dashboard/campnic" },
    { name: "Cafe", icon: "Coffee", href: "/admin/dashboard/cafe" },
    { name: "Other", icon: "Compass", href: "/admin/dashboard/other" },
    { name: "Reservation", icon: "CalendarDays", href: "/admin/dashboard/reservation" },
    { name: "Gallery", icon: "Image", href: "/admin/dashboard/gallery" },
    { name: "Analytics", icon: "BarChart2", href: "/admin/dashboard/analytics" },
    { name: "Settings", icon: "Settings", href: "/admin/dashboard/settings" },
  ];

  return (
    <AdminLayoutClient menuItems={menuItems}>
      {children}
    </AdminLayoutClient>
  );
}
