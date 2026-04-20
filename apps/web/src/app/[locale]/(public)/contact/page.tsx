import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";
import { ContactForm } from "@/components/landing/contact-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function ContactPage() {
  const t = useTranslations("contact");
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@alugabrazuca.com";

  return (
    <section className="px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>

        <ContactForm />

        <div className="mt-10 flex items-center gap-2 text-muted-foreground">
          <Mail className="h-5 w-5" />
          <span>{t("emailDirect")}: </span>
          <a
            href={`mailto:${contactEmail}`}
            className="font-medium text-primary hover:underline"
          >
            {contactEmail}
          </a>
        </div>
      </div>
    </section>
  );
}
