import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fromParam = searchParams.get("from"); // YYYY-MM-DD
    const toParam = searchParams.get("to");     // YYYY-MM-DD

    const now = new Date();
    const KST = 9 * 60 * 60 * 1000; // UTC+9 offset in ms

    // Helper: KST 자정을 UTC Date로 반환
    const kstMidnight = (d: Date): Date => {
      // d를 KST 날짜로 변환 후 그 날 0시 KST = (0시 KST - 9시간) UTC
      const kstMs = d.getTime() + KST;
      const kstDate = new Date(kstMs);
      kstDate.setUTCHours(0, 0, 0, 0); // KST 날짜의 자정 (UTC 기준으로는 이 숫자)
      return new Date(kstDate.getTime() - KST); // 다시 UTC로
    };

    // Start of today (KST 기준 오늘 0시)
    const startOfToday = kstMidnight(now);

    // Start of this week Monday (KST 기준)
    const nowKst = new Date(now.getTime() + KST);
    const dayOfWeek = nowKst.getUTCDay(); // 0=Sun
    const diffToMonday = (dayOfWeek + 6) % 7;
    const startOfWeekKst = new Date(nowKst);
    startOfWeekKst.setUTCDate(startOfWeekKst.getUTCDate() - diffToMonday);
    startOfWeekKst.setUTCHours(0, 0, 0, 0);
    const startOfWeek = new Date(startOfWeekKst.getTime() - KST);

    // Start of this month (KST 기준 1일 0시)
    const startOfMonthKst = new Date(Date.UTC(nowKst.getUTCFullYear(), nowKst.getUTCMonth(), 1));
    const startOfMonth = new Date(startOfMonthKst.getTime() - KST);

    // 30 days ago (KST 기준)
    const thirtyDaysAgoKst = new Date(nowKst);
    thirtyDaysAgoKst.setUTCDate(thirtyDaysAgoKst.getUTCDate() - 29);
    thirtyDaysAgoKst.setUTCHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(thirtyDaysAgoKst.getTime() - KST);

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

    // Helper: count distinct ipHash
    const countUnique = async (where: object) => {
      const rows = await prisma.pageView.groupBy({
        by: ["ipHash"],
        where: { ...where, ipHash: { not: null } },
      });
      return rows.length;
    };

    // Run all queries in parallel
    const [
      todayCount,
      weekCount,
      monthCount,
      totalCount,
      rangeCount,
      uniqueToday,
      uniqueWeek,
      uniqueMonth,
      uniqueTotal,
      uniqueRange,
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
      countUnique({ createdAt: { gte: startOfToday } }),
      countUnique({ createdAt: { gte: startOfWeek } }),
      countUnique({ createdAt: { gte: startOfMonth } }),
      countUnique({}),
      hasFilter ? countUnique(rangeWhere) : Promise.resolve(null),
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
      // KST 기준 날짜 key
      const key = new Date(d.getTime() + KST).toISOString().slice(0, 10);
      dailyMap[key] = 0;
    }
    // Also ensure today's date is included when no filter (KST 기준)
    if (!hasFilter) {
      const todayKey = new Date(now.getTime() + KST).toISOString().slice(0, 10);
      if (!(todayKey in dailyMap)) dailyMap[todayKey] = 0;
    }
    for (const v of chartViews) {
      // createdAt을 KST 기준 날짜로 변환
      const key = new Date(v.createdAt.getTime() + KST).toISOString().slice(0, 10);
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
      uniqueToday,
      uniqueWeek,
      uniqueMonth,
      uniqueTotal,
      uniqueRange,
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
