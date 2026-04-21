"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, resolveMediaUrl } from "@/lib/api";

interface ListingItem {
  id: string;
  title: string;
  city: string;
  state: string;
  country: string;
  pricePerMonth: number;
  currency: string;
  status: string;
  viewCount: number;
  inquiryCount: number;
  photos: { thumbnailUrl: string }[];
  createdAt: string;
}

interface ListingsResponse {
  data: ListingItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export default function MyListingsPage() {
  const t = useTranslations("listing.myListings");
  const router = useRouter();
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });

  useEffect(() => {
    loadListings();
  }, []);

  async function loadListings(page = 1) {
    try {
      setLoading(true);
      const res = await api.get<ListingsResponse>(
        `/listings/my?page=${page}&limit=20`,
      );
      setListings(res.data);
      setMeta({
        total: res.meta.total,
        page: res.meta.page,
        totalPages: res.meta.totalPages,
      });
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(id: string, action: string) {
    if (action === "delete") {
      if (!confirm(t("confirmDelete"))) return;
      await api.delete(`/listings/${id}`);
    } else {
      await api.post(`/listings/${id}/${action}`);
    }
    loadListings(meta.page);
  }

  const statusColor: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    pending_review: "bg-yellow-100 text-yellow-800",
    active: "bg-green-100 text-green-800",
    paused: "bg-blue-100 text-blue-800",
    rejected: "bg-red-100 text-red-800",
    expired: "bg-gray-100 text-gray-500",
    rented: "bg-purple-100 text-purple-800",
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
          {t("title")}
        </h1>
        <Link
          href="/listings/new"
          className="rounded-lg bg-[hsl(var(--primary))] px-6 py-2.5 text-sm font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity"
        >
          {t("create")}
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-12 text-center">
          <p className="text-lg text-[hsl(var(--muted-foreground))]">
            {t("empty")}
          </p>
          <Link
            href="/listings/new"
            className="mt-4 inline-block rounded-lg bg-[hsl(var(--primary))] px-6 py-2.5 text-sm font-medium text-[hsl(var(--primary-foreground))]"
          >
            {t("createFirst")}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="flex gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm"
            >
              {/* Thumbnail */}
              <div className="h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-[hsl(var(--muted))]">
                {listing.photos[0] ? (
                  <img
                    src={resolveMediaUrl(listing.photos[0].thumbnailUrl)}
                    alt={listing.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-[hsl(var(--muted-foreground))]">
                    📷
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/listings/${listing.id}`}
                      className="font-semibold text-[hsl(var(--foreground))] hover:underline"
                    >
                      {listing.title}
                    </Link>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[listing.status] || ""}`}
                    >
                      {t(`status.${listing.status}` as any)}
                    </span>
                  </div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    {listing.city}, {listing.state} — {listing.country}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
                  <span className="font-semibold text-[hsl(var(--foreground))]">
                    {listing.currency}{" "}
                    {Number(listing.pricePerMonth).toLocaleString()}
                    {t("perMonth")}
                  </span>
                  <span>
                    {listing.viewCount} {t("views")}
                  </span>
                  <span>
                    {listing.inquiryCount} {t("inquiries")}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-shrink-0 flex-col gap-1">
                <button
                  onClick={() => router.push(`/listings/${listing.id}/edit`)}
                  className="rounded px-3 py-1 text-xs hover:bg-[hsl(var(--muted))] transition-colors"
                >
                  {t("actions.edit")}
                </button>
                {listing.status === "draft" && (
                  <button
                    onClick={() => handleAction(listing.id, "publish")}
                    className="rounded px-3 py-1 text-xs text-green-600 hover:bg-green-50 transition-colors"
                  >
                    {t("actions.publish")}
                  </button>
                )}
                {listing.status === "active" && (
                  <>
                    <button
                      onClick={() => handleAction(listing.id, "pause")}
                      className="rounded px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      {t("actions.pause")}
                    </button>
                    <button
                      onClick={() => handleAction(listing.id, "mark-rented")}
                      className="rounded px-3 py-1 text-xs text-purple-600 hover:bg-purple-50 transition-colors"
                    >
                      {t("actions.markRented")}
                    </button>
                  </>
                )}
                {listing.status === "paused" && (
                  <button
                    onClick={() => handleAction(listing.id, "resume")}
                    className="rounded px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    {t("actions.resume")}
                  </button>
                )}
                <button
                  onClick={() => handleAction(listing.id, "delete")}
                  className="rounded px-3 py-1 text-xs text-[hsl(var(--destructive))] hover:bg-red-50 transition-colors"
                >
                  {t("actions.delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
