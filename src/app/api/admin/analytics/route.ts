import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
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

    // 30 days ago
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 29);
    thirtyDaysAgo.setUTCHours(0, 0, 0, 0);

    // Run all queries in parallel
    const [
      todayCount,
      weekCount,
      monthCount,
      totalCount,
      last30Views,
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
      prisma.pageView.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.pageView.groupBy({
        by: ["path"],
        _count: { path: true },
        orderBy: { _count: { path: "desc" } },
        take: 10,
      }),
      prisma.pageView.groupBy({
        by: ["referrerDomain"],
        _count: { referrerDomain: true },
        orderBy: { _count: { referrerDomain: "desc" } },
        take: 10,
      }),
      prisma.pageView.groupBy({
        by: ["device"],
        _count: { device: true },
        orderBy: { _count: { device: "desc" } },
      }),
      prisma.pageView.groupBy({
        by: ["browser"],
        _count: { browser: true },
        orderBy: { _count: { browser: "desc" } },
      }),
      prisma.pageView.groupBy({
        by: ["os"],
        _count: { os: true },
        orderBy: { _count: { os: "desc" } },
      }),
      prisma.pageView.findMany({
        select: {
          path: true,
          referrerDomain: true,
          device: true,
          browser: true,
          os: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    // Build daily chart: last 30 days
    const dailyMap: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo);
      d.setUTCDate(d.getUTCDate() + i);
      const key = d.toISOString().slice(0, 10);
      dailyMap[key] = 0;
    }
    for (const v of last30Views) {
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
