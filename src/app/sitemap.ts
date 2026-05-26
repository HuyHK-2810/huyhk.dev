import type { MetadataRoute } from "next";
import { getAllPostsAsync, getAllTagsAsync } from "@/features/blog/lib/posts-db";
import { caseStudies } from "@/features/work/lib/work";

const BASE = "https://huyhk.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE}/writing`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/writing?lang=vi`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/work`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/cv`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/pricing/xnkminhphuc`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    ...caseStudies.map((c) => ({
      url: `${BASE}/work/${c.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.75,
    })),
  ];

  const [enPosts, viPosts, enTags, viTags] = await Promise.all([
    getAllPostsAsync("en"),
    getAllPostsAsync("vi"),
    getAllTagsAsync("en"),
    getAllTagsAsync("vi"),
  ]);

  const postRoutes: MetadataRoute.Sitemap = [
    ...enPosts.map((p) => ({
      url: `${BASE}/writing/${p.slug}`,
      lastModified: p.date ? new Date(p.date) : now,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
    ...viPosts
      .filter((p) => p.locale === "vi")
      .map((p) => ({
        url: `${BASE}/writing/${p.slug}?lang=vi`,
        lastModified: p.date ? new Date(p.date) : now,
        changeFrequency: "yearly" as const,
        priority: 0.6,
      })),
  ];

  const tagRoutes: MetadataRoute.Sitemap = Array.from(
    new Set([...enTags.map((t) => t.tag), ...viTags.map((t) => t.tag)]),
  ).map((tag) => ({
    url: `${BASE}/writing/tags/${encodeURIComponent(tag)}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...postRoutes, ...tagRoutes];
}
