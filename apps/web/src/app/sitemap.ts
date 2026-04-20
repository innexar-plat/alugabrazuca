import type { MetadataRoute } from "next";
import { locales, defaultLocale } from "@/i18n/config";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const staticRoutes = [
  "",
  "/about",
  "/terms",
  "/privacy",
  "/faq",
  "/contact",
  "/host",
  "/rooms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const route of staticRoutes) {
    const alternates: Record<string, string> = {};

    for (const locale of locales) {
      const prefix = locale === defaultLocale ? "" : `/${locale}`;
      alternates[locale] = `${BASE_URL}${prefix}${route}`;
    }

    entries.push({
      url: `${BASE_URL}${route}`,
      lastModified: new Date(),
      changeFrequency: route === "" ? "daily" : "weekly",
      priority: route === "" ? 1 : 0.8,
      alternates: { languages: alternates },
    });
  }

  return entries;
}
