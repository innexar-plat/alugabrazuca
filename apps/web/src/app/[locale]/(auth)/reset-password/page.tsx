"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function ResetPasswordPage() {
  const t = useTranslations("auth.resetPassword");
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/reset-password", {
        token,
        password,
        confirmPassword,
      });
      setSuccess(true);
    } catch (err: unknown) {
      const apiErr = err as { status?: number };
      if (apiErr.status === 400) setError(t("invalidToken"));
      else setError((err as Error).message);
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

      {success ? (
        <div className="space-y-4">
          <div className="rounded-lg bg-[hsl(var(--success)/0.1)] p-3 text-sm text-[hsl(var(--success))]">
            {t("success")}
          </div>
          <Link
            href="/login"
            className="block text-center text-sm font-medium text-[hsl(var(--primary))] hover:underline"
          >
            {t("submit")}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-[hsl(var(--destructive)/0.1)] p-3 text-sm text-[hsl(var(--destructive))]">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]"
            >
              {t("password")}
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] outline-none ring-[hsl(var(--ring))] focus:ring-2"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]"
            >
              {t("confirmPassword")}
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
        </form>
      )}
    </div>
  );
}
