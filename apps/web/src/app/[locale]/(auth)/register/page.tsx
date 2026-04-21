"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    acceptTerms: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register", {
        ...form,
        phone: form.phone || undefined,
      });
      router.push("/login?registered=true");
    } catch (err: unknown) {
      const apiErr = err as { status?: number };
      if (apiErr.status === 409) setError(t("emailInUse"));
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

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-[hsl(var(--destructive)/0.1)] p-3 text-sm text-[hsl(var(--destructive))]">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="firstName"
              className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]"
            >
              {t("firstName")}
            </label>
            <input
              id="firstName"
              type="text"
              required
              minLength={2}
              maxLength={50}
              value={form.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              className="w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] outline-none ring-[hsl(var(--ring))] focus:ring-2"
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]"
            >
              {t("lastName")}
            </label>
            <input
              id="lastName"
              type="text"
              required
              minLength={2}
              maxLength={50}
              value={form.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              className="w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] outline-none ring-[hsl(var(--ring))] focus:ring-2"
            />
          </div>
        </div>

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
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] outline-none ring-[hsl(var(--ring))] focus:ring-2"
          />
        </div>

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
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] outline-none ring-[hsl(var(--ring))] focus:ring-2"
          />
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            {t("passwordHint")}
          </p>
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
            value={form.confirmPassword}
            onChange={(e) => updateField("confirmPassword", e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] outline-none ring-[hsl(var(--ring))] focus:ring-2"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]"
          >
            {t("phone")}
          </label>
          <input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder="+1234567890"
            className="w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] outline-none ring-[hsl(var(--ring))] focus:ring-2"
          />
        </div>

        <label className="flex items-start gap-2 text-sm text-[hsl(var(--foreground))]">
          <input
            type="checkbox"
            required
            checked={form.acceptTerms}
            onChange={(e) => updateField("acceptTerms", e.target.checked)}
            className="mt-0.5"
          />
          <span>
            {t("acceptTerms")}{" "}
            <Link
              href="/terms"
              className="text-[hsl(var(--primary))] underline"
            >
              {t("termsLink")}
            </Link>{" "}
            {t("and")}{" "}
            <Link
              href="/privacy"
              className="text-[hsl(var(--primary))] underline"
            >
              {t("privacyLink")}
            </Link>
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "..." : t("submit")}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
        {t("hasAccount")}{" "}
        <Link
          href="/login"
          className="font-medium text-[hsl(var(--primary))] hover:underline"
        >
          {t("loginLink")}
        </Link>
      </div>
    </div>
  );
}
