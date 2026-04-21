"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";

export function ContactForm() {
  const t = useTranslations("contact");
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      await api.post("/landing/contact", {
        name: data.get("name"),
        email: data.get("email"),
        subject: data.get("subject"),
        message: data.get("message"),
      });
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      {status === "success" && (
        <div className="rounded-lg border border-green-300 bg-green-50 p-4 text-green-800 dark:border-green-700 dark:bg-green-900/20 dark:text-green-300">
          {t("success")}
        </div>
      )}

      {status === "error" && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
          {t("error")}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground">
            {t("name")}
          </label>
          <input
            name="name"
            type="text"
            required
            maxLength={100}
            className="mt-1 w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">
            {t("email")}
          </label>
          <input
            name="email"
            type="email"
            required
            maxLength={255}
            className="mt-1 w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">
            {t("subject")}
          </label>
          <input
            name="subject"
            type="text"
            required
            maxLength={200}
            className="mt-1 w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">
            {t("message")}
          </label>
          <textarea
            name="message"
            required
            rows={5}
            maxLength={5000}
            className="mt-1 w-full resize-none rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex h-12 items-center rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground shadow-md transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {status === "sending" ? t("sending") : t("submit")}
        </button>
      </form>
    </>
  );
}
