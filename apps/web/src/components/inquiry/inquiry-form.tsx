"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface InquiryFormProps {
  listingId: string;
  listingTitle: string;
  locale: string;
  onClose: () => void;
}

const INQUIRY_TYPES = ["visit", "info", "apply"] as const;

export function InquiryForm({
  listingId,
  listingTitle,
  locale,
  onClose,
}: InquiryFormProps) {
  const t = useTranslations("inquiry");
  const router = useRouter();

  const [type, setType] = useState<"visit" | "info" | "apply">("info");
  const [message, setMessage] = useState("");
  const [moveInDate, setMoveInDate] = useState("");
  const [stayDuration, setStayDuration] = useState("");
  const [occupants, setOccupants] = useState("1");
  const [hasPets, setHasPets] = useState(false);
  const [petDetails, setPetDetails] = useState("");
  const [occupation, setOccupation] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || message.length < 20) {
      setError("Message must be at least 20 characters.");
      return;
    }

    const isAuthenticated = !!localStorage.getItem("accessToken");
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/inquiries", {
        listingId,
        type,
        message: message.trim(),
        moveInDate: moveInDate || undefined,
        stayDuration: stayDuration ? Number(stayDuration) : undefined,
        occupants: Number(occupants),
        hasPets,
        petDetails: petDetails || undefined,
        occupation: occupation || undefined,
        aboutMe: aboutMe || undefined,
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send inquiry.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-lg overflow-y-auto rounded-t-2xl bg-[hsl(var(--background))] p-6 shadow-2xl sm:rounded-2xl sm:max-h-[90vh]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="mb-1 text-lg font-bold text-[hsl(var(--foreground))]">
          {t("sendInquiry")}
        </h2>
        <p className="mb-5 text-sm text-[hsl(var(--muted-foreground))] truncate">
          {listingTitle}
        </p>

        {success ? (
          <div className="py-8 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="font-semibold text-[hsl(var(--foreground))]">
              {t("success")}
            </p>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              The host will respond within 7 days.
            </p>
            <button
              onClick={() => router.push(`/${locale}/my-inquiries`)}
              className="mt-5 rounded-lg bg-[hsl(var(--primary))] px-6 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] hover:opacity-90"
            >
              {t("sentTitle")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Type */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[hsl(var(--foreground))]">
                {t("form.type")}
              </label>
              <div className="flex gap-2">
                {INQUIRY_TYPES.map((t_) => (
                  <button
                    key={t_}
                    type="button"
                    onClick={() => setType(t_)}
                    className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                      type === t_
                        ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                        : "border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
                    }`}
                  >
                    {t(`type.${t_}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[hsl(var(--foreground))]">
                {t("form.message")} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("form.messagePlaceholder")}
                rows={4}
                minLength={20}
                maxLength={1000}
                className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
              />
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                {message.length}/1000
              </p>
            </div>

            {/* Move-in date & stay duration */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[hsl(var(--foreground))]">
                  {t("form.moveInDate")}
                </label>
                <input
                  type="date"
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[hsl(var(--foreground))]">
                  {t("form.stayDuration")}
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={stayDuration}
                  onChange={(e) => setStayDuration(e.target.value)}
                  placeholder="months"
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                />
              </div>
            </div>

            {/* Occupants */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[hsl(var(--foreground))]">
                {t("form.occupants")}
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={occupants}
                onChange={(e) => setOccupants(e.target.value)}
                className="w-24 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
              />
            </div>

            {/* Pets */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hasPets"
                checked={hasPets}
                onChange={(e) => setHasPets(e.target.checked)}
                className="h-4 w-4 rounded border-[hsl(var(--border))] accent-[hsl(var(--primary))]"
              />
              <label
                htmlFor="hasPets"
                className="text-sm text-[hsl(var(--foreground))]"
              >
                {t("form.hasPets")}
              </label>
            </div>
            {hasPets && (
              <input
                type="text"
                value={petDetails}
                onChange={(e) => setPetDetails(e.target.value)}
                placeholder={t("form.petDetails")}
                maxLength={255}
                className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
              />
            )}

            {/* Occupation */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[hsl(var(--foreground))]">
                {t("form.occupation")}
              </label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                maxLength={100}
                className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
              />
            </div>

            {/* About me */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[hsl(var(--foreground))]">
                {t("form.aboutMe")}
              </label>
              <textarea
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[hsl(var(--primary))] py-3 text-sm font-semibold text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? t("sending") : t("sendInquiry")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
