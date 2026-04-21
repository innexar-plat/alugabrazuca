"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { api, resolveMediaUrl } from "@/lib/api";

interface InquiryItem {
  id: string;
  type: string;
  status: string;
  message: string;
  createdAt: string;
  listing: {
    id: string;
    title: string;
    city: string;
    state: string;
    country: string;
    pricePerMonth: number;
    currency: string;
    photos: { thumbnailUrl: string }[];
  };
  host: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

interface InquiriesResponse {
  data: InquiryItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-500",
  cancelled: "bg-gray-100 text-gray-500",
  completed: "bg-blue-100 text-blue-800",
};

export default function MyInquiriesPage() {
  const t = useTranslations("inquiry");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });

  useEffect(() => {
    loadInquiries();
  }, []);

  async function loadInquiries(page = 1) {
    try {
      setLoading(true);
      const res = await api.get<InquiriesResponse>(
        `/inquiries/sent?page=${page}&limit=20`,
      );
      if (page === 1) {
        setInquiries(res.data);
      } else {
        setInquiries((prev) => [...prev, ...res.data]);
      }
      setMeta({
        total: res.meta.total,
        page: res.meta.page,
        totalPages: res.meta.totalPages,
      });
    } catch {
      router.push(`/${locale}/login`);
    } finally {
      setLoading(false);
    }
  }

  if (loading && inquiries.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
            {t("sentTitle")}
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            {meta.total} {t("title").toLowerCase()}
          </p>
        </div>
      </div>

      {inquiries.length === 0 ? (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-12 text-center">
          <p className="text-[hsl(var(--muted-foreground))]">
            {t("emptySent")}
          </p>
          <Link
            href={`/${locale}/rooms`}
            className="mt-4 inline-block rounded-lg bg-[hsl(var(--primary))] px-6 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity"
          >
            Browse rooms
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm"
            >
              <div className="flex gap-4 p-4">
                {/* Listing thumbnail */}
                <div className="h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-[hsl(var(--muted))]">
                  {inquiry.listing.photos[0] ? (
                    <img
                      src={resolveMediaUrl(
                        inquiry.listing.photos[0].thumbnailUrl,
                      )}
                      alt={inquiry.listing.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl">
                      🏠
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href={`/${locale}/listings/${inquiry.listing.id}`}
                        className="block truncate font-semibold text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))]"
                      >
                        {inquiry.listing.title}
                      </Link>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {inquiry.listing.city}, {inquiry.listing.state} ·{" "}
                        {inquiry.listing.currency}{" "}
                        {Number(inquiry.listing.pricePerMonth).toLocaleString()}
                        /mo
                      </p>
                    </div>
                    <span
                      className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[inquiry.status] || "bg-gray-100 text-gray-700"}`}
                    >
                      {t(`status.${inquiry.status}`)}
                    </span>
                  </div>

                  <p className="line-clamp-2 text-sm text-[hsl(var(--muted-foreground))]">
                    {inquiry.message}
                  </p>

                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      {t("type." + inquiry.type)} · {t("sentAt")}{" "}
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </span>
                    <Link
                      href={`/${locale}/inquiries/${inquiry.id}`}
                      className="text-xs font-medium text-[hsl(var(--primary))] hover:underline"
                    >
                      {t("viewDetail")} →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {meta.page < meta.totalPages && (
            <div className="text-center pt-4">
              <button
                onClick={() => loadInquiries(meta.page + 1)}
                disabled={loading}
                className="rounded-lg border border-[hsl(var(--border))] px-6 py-2 text-sm font-medium hover:bg-[hsl(var(--muted))] transition-colors disabled:opacity-50"
              >
                {loading ? t("loading", { ns: "common" }) : t("loadMore")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
