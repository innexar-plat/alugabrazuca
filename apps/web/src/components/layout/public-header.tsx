"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { LanguageSelector } from "@/components/shared/language-selector";
import { UserMenu } from "@/components/layout/user-menu";
import { useAuth } from "@/components/providers/auth-provider";
import Image from "next/image";

export function PublicHeader() {
  const t = useTranslations("common");
  const tNav = useTranslations("nav");
  const { isAuthenticated, isLoading } = useAuth();
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "AlugaBrazuca";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/logo.png"
            alt={appName}
            width={260}
            height={68}
            className="h-16 w-auto"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/rooms"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {tNav("rooms")}
          </Link>
          <Link
            href={isAuthenticated ? "/listings/new" : "/host"}
            className="text-sm font-medium text-accent-foreground bg-accent/10 rounded-md px-3 py-1.5 transition-colors hover:bg-accent/20"
          >
            {tNav("advertise")}
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <LanguageSelector />
          {isLoading ? (
            <div className="h-9 w-20 animate-pulse rounded-lg bg-muted" />
          ) : isAuthenticated ? (
            <UserMenu />
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              >
                {t("login")}
              </Link>
              <Link
                href="/register"
                className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {t("register")}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
