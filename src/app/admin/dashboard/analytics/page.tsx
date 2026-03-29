"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, TrendingUp, Calendar, BarChart2, Globe, Filter, X } from "lucide-react";

interface DailyData {
  date: string;
  count: number;
}

interface AnalyticsData {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
  rangeCount: number | null;
  hasFilter: boolean;
  daily: DailyData[];
  topPages: { path: string; count: number }[];
  topReferrers: { domain: string; count: number }[];
  devices: { device: string; count: number }[];
  browsers: { browser: string; count: number }[];
  os: { os: string; count: number }[];
  recentViews: {
    path: string;
    referrerDomain: string;
    device: string;
    browser: string;
    os: string;
    createdAt: string;
  }[];
}

type DateRange = 7 | 30 | 90;

function PercentBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-[#171212] font-medium">{label}</span>
        <span className="text-[#856669]">
          {count.toLocaleString()} ({pct}%)
        </span>
      </div>
      <div className="h-2 bg-[#f4f1f1] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatChartDate(iso: string) {
  const [, month, day] = iso.split("-");
  return `${month}/${day}`;
}

function getTodayKST() {
  const now = new Date();
  // KST = UTC+9
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<DateRange>(30);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");

  const fetchData = useCallback((from: string, to: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const url = `/api/admin/analytics${params.toString() ? "?" + params.toString() : ""}`;
    fetch(url)
      .then((r) => r.json())
      .then((d: any) => {
        if (d && Array.isArray(d.daily)) {
          setData(d as AnalyticsData);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData("", "");
  }, [fetchData]);

  const handleApplyFilter = () => {
    setAppliedFrom(dateFrom);
    setAppliedTo(dateTo);
    fetchData(dateFrom, dateTo);
  };

  const handleReset = () => {
    setDateFrom("");
    setDateTo("");
    setAppliedFrom("");
    setAppliedTo("");
    fetchData("", "");
  };

  const handleFromToday = () => {
    const today = getTodayKST();
    setDateFrom(today);
    setDateTo("");
    setAppliedFrom(today);
    setAppliedTo("");
    fetchData(today, "");
  };

  const isFiltered = !!(appliedFrom || appliedTo);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-[#DB5461]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-[#856669] py-20">
        데이터를 불러올 수 없습니다.
      </div>
    );
  }

  // Filter daily chart by range (only when no custom date filter)
  const filteredDaily = isFiltered ? (data.daily ?? []) : (data.daily ?? []).slice(-range);
  const maxCount = Math.max(...filteredDaily.map((d) => d.count), 1);

  const totalDevices = (data.devices ?? []).reduce((s, d) => s + d.count, 0);
  const totalBrowsers = (data.browsers ?? []).reduce((s, d) => s + d.count, 0);
  const totalOS = (data.os ?? []).reduce((s, d) => s + d.count, 0);

  const deviceColors: Record<string, string> = {
    mobile: "#DB5461",
    desktop: "#4F8EF7",
    tablet: "#F7C04F",
  };

  const browserColors = ["#DB5461", "#4F8EF7", "#F7C04F", "#5CB87A", "#A78BFA", "#F97316"];
  const osColors = ["#DB5461", "#4F8EF7", "#F7C04F", "#5CB87A", "#A78BFA", "#F97316"];

  const summaryCards = isFiltered
    ? [
        {
          label: "선택 기간",
          value: data.rangeCount ?? 0,
          icon: Filter,
          bg: "bg-purple-50",
          accent: "#A78BFA",
          iconBg: "bg-purple-100",
          sublabel: `${appliedFrom || "~"}${appliedTo ? " ~ " + appliedTo : " 이후"}`,
        },
        {
          label: "오늘",
          value: data.today,
          icon: Calendar,
          bg: "bg-rose-50",
          accent: "#DB5461",
          iconBg: "bg-rose-100",
          sublabel: null,
        },
        {
          label: "이번주",
          value: data.thisWeek,
          icon: TrendingUp,
          bg: "bg-blue-50",
          accent: "#4F8EF7",
          iconBg: "bg-blue-100",
          sublabel: null,
        },
        {
          label: "전체",
          value: data.total,
          icon: Globe,
          bg: "bg-green-50",
          accent: "#5CB87A",
          iconBg: "bg-green-100",
          sublabel: null,
        },
      ]
    : [
        {
          label: "오늘",
          value: data.today,
          icon: Calendar,
          bg: "bg-rose-50",
          accent: "#DB5461",
          iconBg: "bg-rose-100",
          sublabel: null,
        },
        {
          label: "이번주",
          value: data.thisWeek,
          icon: TrendingUp,
          bg: "bg-blue-50",
          accent: "#4F8EF7",
          iconBg: "bg-blue-100",
          sublabel: null,
        },
        {
          label: "이번달",
          value: data.thisMonth,
          icon: BarChart2,
          bg: "bg-amber-50",
          accent: "#F7A84F",
          iconBg: "bg-amber-100",
          sublabel: null,
        },
        {
          label: "전체",
          value: data.total,
          icon: Globe,
          bg: "bg-green-50",
          accent: "#5CB87A",
          iconBg: "bg-green-100",
          sublabel: null,
        },
      ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-[#171212] tracking-tight">
          Analytics
        </h1>
        <p className="text-[#856669] mt-2 font-medium">
          방문자 통계 및 페이지 분석
        </p>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-3xl border border-[#e4dcdd] p-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[#856669] uppercase tracking-widest">
              시작일
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border border-[#e4dcdd] rounded-xl px-4 py-2 text-sm text-[#171212] focus:outline-none focus:border-[#DB5461]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[#856669] uppercase tracking-widest">
              종료일
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border border-[#e4dcdd] rounded-xl px-4 py-2 text-sm text-[#171212] focus:outline-none focus:border-[#DB5461]"
            />
          </div>
          <button
            onClick={handleApplyFilter}
            className="px-5 py-2 bg-[#DB5461] text-white rounded-xl text-sm font-medium hover:bg-[#c44452] transition-colors"
          >
            검색
          </button>
          <button
            onClick={handleFromToday}
            className="px-5 py-2 bg-[#f8f6f6] text-[#171212] rounded-xl text-sm font-medium hover:bg-[#f0ecec] transition-colors border border-[#e4dcdd]"
          >
            오늘부터
          </button>
          {isFiltered && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-4 py-2 bg-[#f8f6f6] text-[#856669] rounded-xl text-sm font-medium hover:bg-[#f0ecec] transition-colors"
            >
              <X size={14} />
              초기화
            </button>
          )}
        </div>
        {isFiltered && (
          <p className="mt-3 text-sm text-[#A78BFA] font-medium">
            필터 적용 중: {appliedFrom || "전체"} ~ {appliedTo || "현재"}
          </p>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className={`${card.bg} p-6 rounded-3xl border border-[#e4dcdd]`}
          >
            <div className={`inline-flex p-3 rounded-2xl ${card.iconBg} mb-4`}>
              <card.icon size={20} style={{ color: card.accent }} />
            </div>
            <p className="text-sm font-medium text-[#856669] uppercase tracking-widest">
              {card.label}
            </p>
            <p className="text-3xl font-bold text-[#171212] mt-1">
              {card.value.toLocaleString()}
            </p>
            {card.sublabel && (
              <p className="text-xs text-[#A78BFA] mt-1 font-medium truncate">
                {card.sublabel}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Daily Chart */}
      <div className="bg-white rounded-3xl border border-[#e4dcdd] p-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h2 className="text-xl font-bold text-[#171212]">일별 방문수</h2>
          {!isFiltered && (
            <div className="flex gap-2">
              {([7, 30, 90] as DateRange[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    range === r
                      ? "bg-[#DB5461] text-white"
                      : "bg-[#f8f6f6] text-[#856669] hover:bg-[#f0ecec]"
                  }`}
                >
                  {r}일
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-end gap-1 h-48 overflow-x-auto pb-2">
          {filteredDaily.map((d) => (
            <div
              key={d.date}
              className="flex flex-col items-center flex-1 min-w-[20px] h-full"
            >
              <div className="flex-1 w-full flex items-end">
                <div
                  className="w-full bg-[#DB5461] rounded-t-sm transition-all duration-300 relative group"
                  style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count > 0 ? "4px" : "0" }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-[#171212] text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {d.date}: {d.count}건
                  </div>
                </div>
              </div>
              {filteredDaily.length <= 30 && (
                <span className="text-[9px] text-[#856669] mt-1 rotate-45 origin-left whitespace-nowrap">
                  {formatChartDate(d.date)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Top Pages & Referrers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Pages */}
        <div className="bg-white rounded-3xl border border-[#e4dcdd] p-8">
          <h2 className="text-xl font-bold text-[#171212] mb-6">인기 페이지</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#856669] uppercase text-xs tracking-widest border-b border-[#f4f1f1]">
                  <th className="text-left pb-3">페이지</th>
                  <th className="text-right pb-3">방문수</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f8f6f6]">
                {(data.topPages ?? []).map((p) => (
                  <tr key={p.path} className="hover:bg-[#f8f6f6] transition-colors">
                    <td className="py-3 pr-4 font-medium text-[#171212] truncate max-w-[200px]">
                      {p.path || "/"}
                    </td>
                    <td className="py-3 text-right text-[#DB5461] font-bold">
                      {p.count.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {(data.topPages ?? []).length === 0 && (
                  <tr>
                    <td colSpan={2} className="py-8 text-center text-[#856669]">
                      데이터 없음
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Referrers */}
        <div className="bg-white rounded-3xl border border-[#e4dcdd] p-8">
          <h2 className="text-xl font-bold text-[#171212] mb-6">유입 경로</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#856669] uppercase text-xs tracking-widest border-b border-[#f4f1f1]">
                  <th className="text-left pb-3">유입경로</th>
                  <th className="text-right pb-3">방문수</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f8f6f6]">
                {(data.topReferrers ?? []).map((r) => (
                  <tr key={r.domain} className="hover:bg-[#f8f6f6] transition-colors">
                    <td className="py-3 pr-4 font-medium text-[#171212] truncate max-w-[200px]">
                      {r.domain}
                    </td>
                    <td className="py-3 text-right text-[#4F8EF7] font-bold">
                      {r.count.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {(data.topReferrers ?? []).length === 0 && (
                  <tr>
                    <td colSpan={2} className="py-8 text-center text-[#856669]">
                      데이터 없음
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Device / Browser / OS breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Devices */}
        <div className="bg-white rounded-3xl border border-[#e4dcdd] p-8 space-y-4">
          <h2 className="text-xl font-bold text-[#171212] mb-2">기기</h2>
          {(data.devices ?? []).map((d) => (
            <PercentBar
              key={d.device}
              label={d.device}
              count={d.count}
              total={totalDevices}
              color={deviceColors[d.device] ?? "#856669"}
            />
          ))}
          {(data.devices ?? []).length === 0 && (
            <p className="text-[#856669] text-sm text-center py-4">데이터 없음</p>
          )}
        </div>

        {/* Browsers */}
        <div className="bg-white rounded-3xl border border-[#e4dcdd] p-8 space-y-4">
          <h2 className="text-xl font-bold text-[#171212] mb-2">브라우저</h2>
          {(data.browsers ?? []).map((b, i) => (
            <PercentBar
              key={b.browser}
              label={b.browser}
              count={b.count}
              total={totalBrowsers}
              color={browserColors[i % browserColors.length]}
            />
          ))}
          {(data.browsers ?? []).length === 0 && (
            <p className="text-[#856669] text-sm text-center py-4">데이터 없음</p>
          )}
        </div>

        {/* OS */}
        <div className="bg-white rounded-3xl border border-[#e4dcdd] p-8 space-y-4">
          <h2 className="text-xl font-bold text-[#171212] mb-2">운영체제</h2>
          {(data.os ?? []).map((o, i) => (
            <PercentBar
              key={o.os}
              label={o.os}
              count={o.count}
              total={totalOS}
              color={osColors[i % osColors.length]}
            />
          ))}
          {(data.os ?? []).length === 0 && (
            <p className="text-[#856669] text-sm text-center py-4">데이터 없음</p>
          )}
        </div>
      </div>

      {/* Recent Visits */}
      <div className="bg-white rounded-3xl border border-[#e4dcdd] p-8">
        <h2 className="text-xl font-bold text-[#171212] mb-6">
          접속 로그
          {isFiltered && (
            <span className="ml-3 text-sm font-normal text-[#A78BFA]">
              ({data.recentViews?.length ?? 0}건)
            </span>
          )}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#856669] uppercase text-xs tracking-widest border-b border-[#f4f1f1]">
                <th className="text-left pb-3 pr-4 whitespace-nowrap">시간</th>
                <th className="text-left pb-3 pr-4 whitespace-nowrap">페이지</th>
                <th className="text-left pb-3 pr-4 whitespace-nowrap">유입경로</th>
                <th className="text-left pb-3 pr-4 whitespace-nowrap">기기</th>
                <th className="text-left pb-3 pr-4 whitespace-nowrap">브라우저</th>
                <th className="text-left pb-3 whitespace-nowrap">OS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f8f6f6]">
              {(data.recentViews ?? []).map((v, i) => (
                <tr key={i} className="hover:bg-[#f8f6f6] transition-colors">
                  <td className="py-3 pr-4 text-[#856669] whitespace-nowrap">
                    {formatDate(v.createdAt)}
                  </td>
                  <td className="py-3 pr-4 font-medium text-[#171212] max-w-[160px] truncate">
                    {v.path || "/"}
                  </td>
                  <td className="py-3 pr-4 text-[#856669] max-w-[140px] truncate">
                    {v.referrerDomain}
                  </td>
                  <td className="py-3 pr-4 text-[#856669]">{v.device}</td>
                  <td className="py-3 pr-4 text-[#856669]">{v.browser}</td>
                  <td className="py-3 text-[#856669]">{v.os}</td>
                </tr>
              ))}
              {(data.recentViews ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#856669]">
                    방문 기록이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
