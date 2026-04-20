import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { CheckCircle } from "lucide-react";
import Image from "next/image";

export function ForHostsSection() {
  const t = useTranslations("home.forHosts");

  const benefits = [t("benefit1"), t("benefit2"), t("benefit3")];

  return (
    <section className="px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-8 overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-xl lg:grid-cols-2 lg:gap-0">
          {/* Left — Image */}
          <div className="relative hidden h-full min-h-[400px] lg:block">
            <Image
              src="/images/landing/cozinha.webp"
              alt={t("imageAlt")}
              fill
              className="object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/40" />
          </div>

          {/* Right — Text */}
          <div className="p-8 text-primary-foreground sm:p-12 lg:p-16">
            <h2 className="text-3xl font-bold sm:text-4xl">{t("title")}</h2>
            <p className="mt-4 text-lg opacity-90">{t("subtitle")}</p>

            <ul className="mt-8 flex flex-col gap-3">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <Link
                href="/host"
                className="inline-flex h-12 items-center rounded-lg bg-white px-8 text-base font-semibold text-primary shadow-md transition-all hover:bg-white/90 hover:shadow-lg"
              >
                {t("cta")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
