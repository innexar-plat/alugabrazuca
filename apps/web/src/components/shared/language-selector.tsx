"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { locales, type Locale } from "@/i18n/config";
import { Globe } from "lucide-react";

const localeLabels: Record<Locale, string> = {
  pt: "PT",
  en: "EN",
  es: "ES",
};

export function LanguageSelector() {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(newLocale: Locale) {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div className="relative inline-flex items-center">
      <Globe className="mr-1 h-4 w-4 text-muted-foreground" />
      <select
        value={locale}
        onChange={(e) => handleChange(e.target.value as Locale)}
        className="appearance-none bg-transparent pr-6 text-sm font-medium text-muted-foreground outline-none hover:text-foreground cursor-pointer"
        aria-label={t("language")}
      >
        {locales.map((l) => (
          <option key={l} value={l}>
            {localeLabels[l]}
          </option>
        ))}
      </select>
    </div>
  );
}
