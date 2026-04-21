"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function VerifyEmailPage() {
  const t = useTranslations("auth.verifyEmail");
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying",
  );

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    api
      .get(`/auth/verify-email/${encodeURIComponent(token)}`)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-lg text-center">
      <h1 className="mb-4 text-2xl font-bold text-[hsl(var(--foreground))]">
        {t("title")}
      </h1>

      {status === "verifying" && (
        <p className="text-[hsl(var(--muted-foreground))]">{t("verifying")}</p>
      )}

      {status === "success" && (
        <div className="space-y-4">
          <div className="rounded-lg bg-[hsl(var(--success)/0.1)] p-3 text-sm text-[hsl(var(--success))]">
            {t("success")}
          </div>
          <Link
            href="/login"
            className="inline-block text-sm font-medium text-[hsl(var(--primary))] hover:underline"
          >
            {t("loginLink")}
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-4">
          <div className="rounded-lg bg-[hsl(var(--destructive)/0.1)] p-3 text-sm text-[hsl(var(--destructive))]">
            {t("error")}
          </div>
          <Link
            href="/login"
            className="inline-block text-sm font-medium text-[hsl(var(--primary))] hover:underline"
          >
            {t("loginLink")}
          </Link>
        </div>
      )}
    </div>
  );
}
