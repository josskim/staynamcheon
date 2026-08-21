import { MetadataRoute } from "next";
import prisma from "@/lib/db";
import { SITE_URL } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fallbackDate = new Date("2026-08-21T00:00:00+09:00");
  const pages = [
    { path: "", page: "home", changeFrequency: "weekly", priority: 1 },
    { path: "/group", page: "group", changeFrequency: "monthly", priority: 0.95 },
    { path: "/pension", page: "pension", changeFrequency: "monthly", priority: 0.9 },
    { path: "/military-visit", page: "military-visit", changeFrequency: "monthly", priority: 0.9 },
    { path: "/campnic", page: "campnic", changeFrequency: "monthly", priority: 0.9 },
    { path: "/cafe", page: "cafe", changeFrequency: "monthly", priority: 0.6 },
    { path: "/other", page: "other", changeFrequency: "monthly", priority: 0.6 },
    { path: "/gallery", page: "gallery", changeFrequency: "weekly", priority: 0.7 },
    { path: "/reservation", page: "reservation", changeFrequency: "monthly", priority: 0.8 },
    { path: "/story", page: "story", changeFrequency: "weekly", priority: 0.7 },
  ] as const;

  try {
    const [contentDates, stories] = await Promise.all([
      prisma.stayPageContent.groupBy({ by: ["page"], _max: { updatedAt: true } }),
      prisma.stayStory.findMany({ where: { isVisible: true }, select: { id: true, updatedAt: true } }),
    ]);
    const updatedByPage = new Map(contentDates.map(({ page, _max }) => [page, _max.updatedAt || fallbackDate]));

    return [
      ...pages.map(({ path, page, changeFrequency, priority }) => ({
        url: `${SITE_URL}${path}`,
        lastModified: updatedByPage.get(page) || fallbackDate,
        changeFrequency,
        priority,
      })),
      ...stories.map((story) => ({
        url: `${SITE_URL}/story/${story.id}`,
        lastModified: story.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ];
  } catch {
    return pages.map(({ path, changeFrequency, priority }) => ({
      url: `${SITE_URL}${path}`,
      lastModified: fallbackDate,
      changeFrequency,
      priority,
    }));
  }
}
