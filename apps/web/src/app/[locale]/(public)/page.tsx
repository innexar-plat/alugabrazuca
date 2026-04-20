import { getTranslations } from "next-intl/server";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { GallerySection } from "@/components/landing/gallery-section";
import { FeaturedSection } from "@/components/landing/featured-section";
import { CitiesSection } from "@/components/landing/cities-section";
import { StatsSection } from "@/components/landing/stats-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { ForHostsSection } from "@/components/landing/for-hosts-section";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/json-ld";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

async function fetchLandingData() {
  try {
    const [featuredRes, citiesRes, statsRes, testimonialsRes] =
      await Promise.allSettled([
        fetch(`${API_BASE}/landing/featured`, { next: { revalidate: 300 } }),
        fetch(`${API_BASE}/landing/cities`, { next: { revalidate: 300 } }),
        fetch(`${API_BASE}/landing/stats`, { next: { revalidate: 600 } }),
        fetch(`${API_BASE}/landing/testimonials`, { next: { revalidate: 3600 } }),
      ]);

    const featured =
      featuredRes.status === "fulfilled" && featuredRes.value.ok
        ? (await featuredRes.value.json()).data
        : [];
    const cities =
      citiesRes.status === "fulfilled" && citiesRes.value.ok
        ? (await citiesRes.value.json()).data
        : [];
    const stats =
      statsRes.status === "fulfilled" && statsRes.value.ok
        ? (await statsRes.value.json()).data
        : { activeListings: 0, totalCities: 0, totalUsers: 0, totalReviews: 0 };
    const testimonials =
      testimonialsRes.status === "fulfilled" && testimonialsRes.value.ok
        ? (await testimonialsRes.value.json()).data
        : [];

    return { featured, cities, stats, testimonials };
  } catch {
    return {
      featured: [],
      cities: [],
      stats: { activeListings: 0, totalCities: 0, totalUsers: 0, totalReviews: 0 },
      testimonials: [],
    };
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "AlugaBrazuca";

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      siteName: appName,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function HomePage() {
  const { featured, cities, stats, testimonials } = await fetchLandingData();

  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <HeroSection />
      <HowItWorksSection />
      <GallerySection />
      <FeaturedSection listings={featured} />
      <CitiesSection cities={cities} />
      <StatsSection stats={stats} />
      <TestimonialsSection testimonials={testimonials} />
      <ForHostsSection />
    </>
  );
}
