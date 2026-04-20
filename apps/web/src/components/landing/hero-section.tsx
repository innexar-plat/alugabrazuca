"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Link } from "@/i18n/routing";
import Image from "next/image";

export function HeroSection() {
  const t = useTranslations("home.hero");
  const tNav = useTranslations("nav");
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/rooms?query=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/rooms");
    }
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left — Text + Search */}
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl xl:text-7xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl lg:mx-0">
            {t("subtitle")}
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="mx-auto mt-8 flex max-w-lg items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-lg lg:mx-0"
          >
            <div className="flex flex-1 items-center gap-2 px-3">
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full bg-transparent py-2 text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-11 shrink-0 items-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
            >
              {t("cta")}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
            <Link
              href="/rooms"
              className="inline-flex h-12 items-center rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
            >
              {t("cta")}
            </Link>
            <Link
              href="/host"
              className="inline-flex h-12 items-center rounded-lg border border-border bg-card px-8 text-base font-semibold text-foreground transition-colors hover:bg-muted"
            >
              {tNav("advertise")}
            </Link>
          </div>
        </div>

        {/* Right — Image Mosaic */}
        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div className="grid grid-cols-6 grid-rows-4 gap-3">
            {/* Large main image */}
            <div className="col-span-4 row-span-4 overflow-hidden rounded-2xl shadow-xl">
              <Image
                src="/images/landing/quarto01.jpg"
                alt={t("imageAltRoom")}
                width={600}
                height={500}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            {/* Top-right */}
            <div className="col-span-2 row-span-2 overflow-hidden rounded-2xl shadow-lg">
              <Image
                src="/images/landing/varanda.jpg"
                alt={t("imageAltBalcony")}
                width={280}
                height={240}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            {/* Bottom-right */}
            <div className="col-span-2 row-span-2 overflow-hidden rounded-2xl shadow-lg">
              <Image
                src="/images/landing/cozinha.webp"
                alt={t("imageAltKitchen")}
                width={280}
                height={240}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          </div>

          {/* Decorative floating badge */}
          <div className="absolute -bottom-4 -left-4 rounded-xl bg-primary px-4 py-3 text-primary-foreground shadow-lg sm:-bottom-6 sm:-left-6">
            <p className="text-2xl font-bold">100+</p>
            <p className="text-xs opacity-90">{t("badgeRooms")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
