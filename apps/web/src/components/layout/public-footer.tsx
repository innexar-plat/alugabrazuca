import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Image from "next/image";

export function PublicFooter() {
  const t = useTranslations("footer");
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "AlugaBrazuca";
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block">
              <Image
                src="/images/logo.png"
                alt={appName}
                width={220}
                height={56}
                className="h-14"
                style={{ width: 'auto' }}
                loading="lazy"
              />
            </Link>
          </div>

          {/* Links */}
          <div>
            <nav className="flex flex-col gap-2">
              <Link
                href="/about"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {t("about")}
              </Link>
              <Link
                href="/faq"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {t("faq")}
              </Link>
              <Link
                href="/contact"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {t("contact")}
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <nav className="flex flex-col gap-2">
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {t("terms")}
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {t("privacy")}
              </Link>
            </nav>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © {year} {appName}. {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
