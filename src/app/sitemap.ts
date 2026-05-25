import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";

const BASE = "https://huyhk.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE}/writing`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/cv`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/pricing/xnkminhphuc`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const postRoutes: MetadataRoute.Sitemap = getAllPosts().map((p) => ({
    url: `${BASE}/writing/${p.slug}`,
    lastModified: p.date ? new Date(p.date) : now,
    changeFrequency: "yearly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...postRoutes];
}
