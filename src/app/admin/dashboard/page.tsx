"use client";

import { useEffect, useState } from "react";
import { Loader2, TrendingUp, Calendar, Globe, ArrowUpRight } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsData {
  today: number;
  thisMonth: number;
  total: number;
  daily: { date: string; count: number }[];
  topReferrers: { domain: string; count: number }[];
}

function formatChartDate(iso: string) {
  const [, month, day] = iso.split("-");
  return `${parseInt(month)}/${parseInt(day)}`;
}

const REFERRER_COLORS = ["#DB5461", "#4F8EF7", "#F7C04F", "#5CB87A", "#A78BFA", "#F97316"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#171212] text-white text-xs rounded-xl px-3 py-2 shadow-xl">
        <p className="font-bold mb-1">{label}</p>
        <p>{payload[0].value}명</p>
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#171212] text-white text-xs rounded-xl px-3 py-2 shadow-xl">
        <p className="font-bold">{payload[0].name}</p>
        <p>{payload[0].value}명</p>
      </div>
    );
  }
  return null;
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [prevMonth, setPrevMonth] = useState(0);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d: any) => {
        if (d && Array.isArray(d.daily)) {
          setData(d as AnalyticsData);
          // Estimate prev month from daily data (days 31-60)
          const daily: { date: string; count: number }[] = d.daily ?? [];
          const prev = daily.slice(0, Math.max(0, daily.length - 30)).reduce((s: number, x: { count: number }) => s + x.count, 0);
          setPrevMonth(prev);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-[#DB5461]" />
      </div>
    );
  }

  const today = data?.today ?? 0;
  const thisMonth = data?.thisMonth ?? 0;
  const total = data?.total ?? 0;
  const last30 = (data?.daily ?? []).slice(-30);
  const last7 = (data?.daily ?? []).slice(-7);
  const referrers = (data?.topReferrers ?? []).slice(0, 6);

  const monthGrowth = prevMonth > 0 ? Math.round(((thisMonth - prevMonth) / prevMonth) * 100) : null;

  // Weekly bar data
  const weekData = last7.map((d) => ({
    name: formatChartDate(d.date),
    count: d.count,
  }));

  // 30-day area data
  const areaData = last30.map((d) => ({
    name: formatChartDate(d.date),
    count: d.count,
  }));

  // Peak day this week
  const peakDay = last7.reduce((a, b) => (b.count > a.count ? b : a), last7[0] ?? { count: 0, date: "" });

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-[#171212] tracking-tight">Dashboard Overview</h1>
        <p className="text-[#856669] mt-2 font-medium">실시간 방문자 통계</p>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Today */}
        <div className="bg-gradient-to-br from-rose-50 to-white p-6 rounded-3xl border border-[#e4dcdd]">
          <div className="inline-flex p-3 rounded-2xl bg-rose-100 mb-4">
            <Calendar size={20} className="text-[#DB5461]" />
          </div>
          <p className="text-xs font-bold text-[#856669] uppercase tracking-widest">오늘 방문</p>
          <p className="text-4xl font-bold text-[#171212] mt-1">{today.toLocaleString()}</p>
        </div>

        {/* This Month */}
        <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-3xl border border-[#e4dcdd]">
          <div className="inline-flex p-3 rounded-2xl bg-blue-100 mb-4">
            <TrendingUp size={20} className="text-[#4F8EF7]" />
          </div>
          <p className="text-xs font-bold text-[#856669] uppercase tracking-widest">이번달 방문</p>
          <div className="flex items-end gap-2 mt-1">
            <p className="text-4xl font-bold text-[#171212]">{thisMonth.toLocaleString()}</p>
            {monthGrowth !== null && (
              <span className={`text-xs font-bold flex items-center gap-0.5 mb-1 px-2 py-0.5 rounded-full ${monthGrowth >= 0 ? "text-green-600 bg-green-50" : "text-red-500 bg-red-50"}`}>
                <ArrowUpRight size={12} className={monthGrowth < 0 ? "rotate-180" : ""} />
                {monthGrowth >= 0 ? "+" : ""}{monthGrowth}%
              </span>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-3xl border border-[#e4dcdd]">
          <div className="inline-flex p-3 rounded-2xl bg-green-100 mb-4">
            <Globe size={20} className="text-[#5CB87A]" />
          </div>
          <p className="text-xs font-bold text-[#856669] uppercase tracking-widest">전체 누적</p>
          <p className="text-4xl font-bold text-[#171212] mt-1">{total.toLocaleString()}</p>
        </div>
      </div>

      {/* Charts Row 1: 30-day Area + Weekly Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 30-day Area Chart */}
        <div className="bg-white rounded-3xl border border-[#e4dcdd] p-8">
          <h2 className="text-lg font-bold text-[#171212] mb-6">30일 방문 추이</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={areaData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DB5461" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#DB5461" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f1f1" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#856669" }}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis tick={{ fontSize: 10, fill: "#856669" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#DB5461"
                strokeWidth={2.5}
                fill="url(#areaGrad)"
                dot={false}
                activeDot={{ r: 5, fill: "#DB5461", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Bar Chart */}
        <div className="bg-white rounded-3xl border border-[#e4dcdd] p-8">
          <h2 className="text-lg font-bold text-[#171212] mb-1">이번주 일별</h2>
          {peakDay?.count > 0 && (
            <p className="text-xs text-[#856669] mb-5">
              최고: <span className="font-bold text-[#DB5461]">{formatChartDate(peakDay.date)}</span> — {peakDay.count}명
            </p>
          )}
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f1f1" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#856669" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#856669" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8f6f6" }} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {weekData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === weekData.length - 1 ? "#DB5461" : "#f4d0d3"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2: Referrer Pie + Referrer Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="bg-white rounded-3xl border border-[#e4dcdd] p-8">
          <h2 className="text-lg font-bold text-[#171212] mb-6">유입 경로 비율</h2>
          {referrers.length === 0 ? (
            <p className="text-[#856669] text-sm text-center py-10">데이터 없음</p>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={referrers}
                    dataKey="count"
                    nameKey="domain"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {referrers.map((_, i) => (
                      <Cell key={i} fill={REFERRER_COLORS[i % REFERRER_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                {referrers.map((r, i) => {
                  const total = referrers.reduce((s, x) => s + x.count, 0);
                  const pct = total > 0 ? Math.round((r.count / total) * 100) : 0;
                  return (
                    <div key={r.domain} className="flex items-center gap-2 text-sm min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: REFERRER_COLORS[i % REFERRER_COLORS.length] }} />
                      <span className="text-[#171212] font-medium truncate flex-1">{r.domain}</span>
                      <span className="text-[#856669] text-xs shrink-0">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Referrer Horizontal Bar */}
        <div className="bg-white rounded-3xl border border-[#e4dcdd] p-8">
          <h2 className="text-lg font-bold text-[#171212] mb-6">유입 경로 방문수</h2>
          {referrers.length === 0 ? (
            <p className="text-[#856669] text-sm text-center py-10">데이터 없음</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={referrers}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                barSize={16}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f1f1" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#856669" }} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="domain"
                  tick={{ fontSize: 11, fill: "#171212" }}
                  tickLine={false}
                  axisLine={false}
                  width={72}
                />
                <Tooltip content={<PieTooltip />} cursor={{ fill: "#f8f6f6" }} />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {referrers.map((_, i) => (
                    <Cell key={i} fill={REFERRER_COLORS[i % REFERRER_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
