import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <section className="px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          {t("description")}
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground">
              {t("mission")}
            </h2>
            <p className="mt-3 text-muted-foreground">{t("missionText")}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground">
              {t("vision")}
            </h2>
            <p className="mt-3 text-muted-foreground">{t("visionText")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
