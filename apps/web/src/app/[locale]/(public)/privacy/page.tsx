import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function PrivacyPage() {
  const t = useTranslations("privacy");

  return (
    <section className="px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("lastUpdated")}: 2025-01-01
        </p>
        <div className="mt-8 space-y-6 text-muted-foreground leading-relaxed">
          <p>{t("content")}</p>
        </div>
      </div>
    </section>
  );
}
