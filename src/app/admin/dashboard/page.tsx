"use client";

import { 
  BarChart3, 
  Users, 
  Eye, 
  ArrowUpRight,
  Plus
} from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    { label: "Total Views", value: "1,284", icon: Eye, color: "blue" },
    { label: "Bookings", value: "48", icon: BarChart3, color: "green" },
    { label: "Manage Admins", value: "1", icon: Users, color: "purple" },
  ];

  return (
    <div className="space-y-12">
      {/* Welcome Header */}
      <div>
        <h1 className="text-4xl font-bold text-[#171212] tracking-tight">Dashboard Overview</h1>
        <p className="text-[#856669] mt-2 font-medium">Welcome back, Administrator. Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-8 rounded-3xl border border-[#e4dcdd] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="p-4 bg-[#f8f6f6] rounded-2xl">
                <stat.icon size={24} className="text-[#DB5461]" />
              </div>
              <div className="text-green-500 font-bold text-xs flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                <ArrowUpRight size={14} />
                +12%
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm font-medium text-[#856669] uppercase tracking-widest leading-none">{stat.label}</p>
              <p className="text-4xl font-bold text-[#171212] mt-2">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-[#171212] tracking-tight mb-6">Quick Management</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <button className="flex flex-col items-center justify-center gap-4 aspect-square bg-white border border-dashed border-[#e4dcdd] rounded-3xl text-[#856669] hover:border-[#DB5461] hover:text-[#DB5461] hover:bg-white transition-all group">
            <div className="p-4 bg-[#f8f6f6] rounded-full group-hover:bg-[#DB5461]/10">
              <Plus size={24} />
            </div>
            <span className="font-bold text-sm tracking-widest uppercase">Add Content</span>
          </button>
          
          {/* Add more shortcut tiles here if needed */}
        </div>
      </div>
    </div>
  );
}
