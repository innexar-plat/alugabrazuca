import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { CheckCircle } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "host" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function HostPage() {
  const t = useTranslations("host");

  const benefits = [
    { title: t("benefit1Title"), desc: t("benefit1Desc") },
    { title: t("benefit2Title"), desc: t("benefit2Desc") },
    { title: t("benefit3Title"), desc: t("benefit3Desc") },
    { title: t("benefit4Title"), desc: t("benefit4Desc") },
  ];

  const steps = [t("step1"), t("step2"), t("step3"), t("step4")];

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold text-foreground sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{t("subtitle")}</p>
          <div className="mt-8">
            <Link
              href="/listings/new"
              className="inline-flex h-12 items-center rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
            >
              {t("cta")}
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center shadow-sm"
              >
                <CheckCircle className="h-10 w-10 text-primary" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {b.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/50 px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold text-foreground">
            {t("howItWorksTitle")}
          </h2>
          <div className="mt-12 space-y-6">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <p className="pt-2 text-foreground">{step}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/listings/new"
              className="inline-flex h-12 items-center rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
            >
              {t("cta")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
