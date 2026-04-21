"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgotPassword");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-lg">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          {t("subtitle")}
        </p>
      </div>

      {sent ? (
        <div className="space-y-4">
          <div className="rounded-lg bg-[hsl(var(--success)/0.1)] p-3 text-sm text-[hsl(var(--success))]">
            {t("success")}
          </div>
          <Link
            href="/login"
            className="block text-center text-sm font-medium text-[hsl(var(--primary))] hover:underline"
          >
            {t("backToLogin")}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]"
            >
              {t("email")}
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] outline-none ring-[hsl(var(--ring))] focus:ring-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "..." : t("submit")}
          </button>

          <Link
            href="/login"
            className="block text-center text-sm text-[hsl(var(--muted-foreground))] hover:underline"
          >
            {t("backToLogin")}
          </Link>
        </form>
      )}
    </div>
  );
}
