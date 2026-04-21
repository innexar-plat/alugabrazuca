"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Home, MapPin, Users, Star } from "lucide-react";

interface Stats {
  activeListings: number;
  totalCities: number;
  totalUsers: number;
  totalReviews: number;
}

interface StatsSectionProps {
  stats: Stats;
}

function AnimatedCounter({
  end,
  duration = 2000,
}: {
  end: number;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <div ref={ref}>{count.toLocaleString()}</div>;
}

export function StatsSection({ stats }: StatsSectionProps) {
  const t = useTranslations("home.stats");

  const items = [
    { icon: Home, label: t("activeListings"), value: stats.activeListings },
    { icon: MapPin, label: t("totalCities"), value: stats.totalCities },
    { icon: Users, label: t("totalUsers"), value: stats.totalUsers },
    { icon: Star, label: t("totalReviews"), value: stats.totalReviews },
  ];

  return (
    <section className="px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold text-foreground">
          {t("title")}
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center rounded-xl bg-card p-8 text-center shadow-sm"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <item.icon className="h-7 w-7 text-primary" />
              </div>
              <div className="mt-4 text-4xl font-bold text-foreground">
                <AnimatedCounter end={item.value} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
