import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { FaqPageJsonLd } from "@/components/seo/json-ld";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function FaqPage() {
  const t = useTranslations("faq");

  const faqs = [
    { q: t("q1"), a: t("a1") },
    { q: t("q2"), a: t("a2") },
    { q: t("q3"), a: t("a3") },
    { q: t("q4"), a: t("a4") },
    { q: t("q5"), a: t("a5") },
  ];

  return (
    <section className="px-4 py-16 sm:py-24">
      <FaqPageJsonLd faqs={faqs.map((f) => ({ question: f.q, answer: f.a }))} />
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>

        <div className="mt-12 space-y-6">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group rounded-xl border border-border bg-card shadow-sm"
            >
              <summary className="flex cursor-pointer items-center justify-between p-6 text-foreground font-semibold">
                {faq.q}
                <span className="ml-4 text-muted-foreground transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="border-t border-border px-6 pb-6 pt-4 text-muted-foreground">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
