import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fromParam = searchParams.get("from"); // YYYY-MM-DD
    const toParam = searchParams.get("to");     // YYYY-MM-DD

    const now = new Date();

    // Start of today (UTC)
    const startOfToday = new Date(now);
    startOfToday.setUTCHours(0, 0, 0, 0);

    // Start of this week (Monday)
    const startOfWeek = new Date(now);
    const dayOfWeek = startOfWeek.getUTCDay(); // 0=Sun
    const diffToMonday = (dayOfWeek + 6) % 7;
    startOfWeek.setUTCDate(startOfWeek.getUTCDate() - diffToMonday);
    startOfWeek.setUTCHours(0, 0, 0, 0);

    // Start of this month
    const startOfMonth = new Date(now.getUTCFullYear(), now.getUTCMonth(), 1);

    // 30 days ago (default chart range)
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 29);
    thirtyDaysAgo.setUTCHours(0, 0, 0, 0);

    // Custom date range filter (KST → UTC: KST = UTC+9)
    let customFrom: Date | null = null;
    let customTo: Date | null = null;
    if (fromParam) {
      // fromParam is YYYY-MM-DD in KST, convert to UTC midnight
      customFrom = new Date(fromParam + "T00:00:00+09:00");
    }
    if (toParam) {
      // toParam end of day KST
      customTo = new Date(toParam + "T23:59:59+09:00");
    }
    const hasFilter = !!(customFrom || customTo);

    const rangeWhere = hasFilter
      ? {
          createdAt: {
            ...(customFrom ? { gte: customFrom } : {}),
            ...(customTo ? { lte: customTo } : {}),
          },
        }
      : {};

    // Chart range
    const chartFrom = customFrom ?? thirtyDaysAgo;
    const chartTo = customTo ?? now;

    // Run all queries in parallel
    const [
      todayCount,
      weekCount,
      monthCount,
      totalCount,
      rangeCount,
      chartViews,
      topPagesRaw,
      topReferrersRaw,
      devicesRaw,
      browsersRaw,
      osRaw,
      recentViews,
    ] = await Promise.all([
      prisma.pageView.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.pageView.count({ where: { createdAt: { gte: startOfWeek } } }),
      prisma.pageView.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.pageView.count(),
      hasFilter ? prisma.pageView.count({ where: rangeWhere }) : Promise.resolve(null),
      prisma.pageView.findMany({
        where: {
          createdAt: {
            gte: chartFrom,
            lte: chartTo,
          },
        },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.pageView.groupBy({
        by: ["path"],
        where: rangeWhere,
        _count: { path: true },
        orderBy: { _count: { path: "desc" } },
        take: 10,
      }),
      prisma.pageView.groupBy({
        by: ["referrerDomain"],
        where: rangeWhere,
        _count: { referrerDomain: true },
        orderBy: { _count: { referrerDomain: "desc" } },
        take: 10,
      }),
      prisma.pageView.groupBy({
        by: ["device"],
        where: rangeWhere,
        _count: { device: true },
        orderBy: { _count: { device: "desc" } },
      }),
      prisma.pageView.groupBy({
        by: ["browser"],
        where: rangeWhere,
        _count: { browser: true },
        orderBy: { _count: { browser: "desc" } },
      }),
      prisma.pageView.groupBy({
        by: ["os"],
        where: rangeWhere,
        _count: { os: true },
        orderBy: { _count: { os: "desc" } },
      }),
      prisma.pageView.findMany({
        where: rangeWhere,
        select: {
          path: true,
          referrerDomain: true,
          device: true,
          browser: true,
          os: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    ]);

    // Build daily chart within range
    const dailyMap: Record<string, number> = {};
    const diffDays = Math.ceil((chartTo.getTime() - chartFrom.getTime()) / (1000 * 60 * 60 * 24));
    const totalDays = Math.min(Math.max(diffDays, 1), 90);
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(chartFrom);
      d.setUTCDate(d.getUTCDate() + i);
      const key = d.toISOString().slice(0, 10);
      dailyMap[key] = 0;
    }
    // Also ensure today's date is included when no filter
    if (!hasFilter) {
      const todayKey = now.toISOString().slice(0, 10);
      if (!(todayKey in dailyMap)) dailyMap[todayKey] = 0;
    }
    for (const v of chartViews) {
      const key = v.createdAt.toISOString().slice(0, 10);
      if (key in dailyMap) {
        dailyMap[key]++;
      }
    }
    const daily = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    const topPages = topPagesRaw.map((r) => ({
      path: r.path,
      count: r._count.path,
    }));

    const topReferrers = topReferrersRaw.map((r) => ({
      domain: r.referrerDomain ?? "직접접속",
      count: r._count.referrerDomain,
    }));

    const devices = devicesRaw.map((r) => ({
      device: r.device ?? "unknown",
      count: r._count.device,
    }));

    const browsers = browsersRaw.map((r) => ({
      browser: r.browser ?? "기타",
      count: r._count.browser,
    }));

    const os = osRaw.map((r) => ({
      os: r.os ?? "기타",
      count: r._count.os,
    }));

    const formattedRecent = recentViews.map((v) => ({
      path: v.path,
      referrerDomain: v.referrerDomain ?? "직접접속",
      device: v.device ?? "-",
      browser: v.browser ?? "-",
      os: v.os ?? "-",
      createdAt: v.createdAt.toISOString(),
    }));

    return NextResponse.json({
      today: todayCount,
      thisWeek: weekCount,
      thisMonth: monthCount,
      total: totalCount,
      rangeCount,
      hasFilter,
      daily,
      topPages,
      topReferrers,
      devices,
      browsers,
      os,
      recentViews: formattedRecent,
    });
  } catch (err) {
    console.error("Analytics stats error:", err);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
