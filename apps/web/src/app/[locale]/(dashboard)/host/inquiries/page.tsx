"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { api, resolveMediaUrl } from "@/lib/api";

interface InquiryReceived {
  id: string;
  type: string;
  status: string;
  message: string;
  createdAt: string;
  occupants: number;
  hasPets: boolean;
  listing: {
    id: string;
    title: string;
    city: string;
    state: string;
    photos: { thumbnailUrl: string }[];
  };
  tenant: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

interface InquiriesResponse {
  data: InquiryReceived[];
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

export default function HostInquiriesPage() {
  const t = useTranslations("inquiry");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [inquiries, setInquiries] = useState<InquiryReceived[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadInquiries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadInquiries(page = 1) {
    try {
      setLoading(true);
      const res = await api.get<InquiriesResponse>(
        `/inquiries/received?page=${page}&limit=20`,
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

  const filtered =
    filter === "all" ? inquiries : inquiries.filter((i) => i.status === filter);

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
          {t("receivedTitle")}
        </h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          {meta.total} {t("title").toLowerCase()}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {["all", "pending", "accepted", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === status
                ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                : "border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
            }`}
          >
            {status === "all" ? "All" : t(`status.${status}`)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-12 text-center">
          <p className="text-[hsl(var(--muted-foreground))]">
            {t("emptyReceived")}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((inquiry) => (
            <div
              key={inquiry.id}
              className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm"
            >
              <div className="flex gap-4 p-4">
                {/* Tenant avatar */}
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-lg overflow-hidden">
                  {inquiry.tenant.avatarUrl ? (
                    <img
                      src={resolveMediaUrl(inquiry.tenant.avatarUrl)}
                      alt={inquiry.tenant.firstName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{inquiry.tenant.firstName[0]}</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-semibold text-[hsl(var(--foreground))]">
                        {inquiry.tenant.firstName} {inquiry.tenant.lastName}
                      </span>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                        {inquiry.listing.title} · {inquiry.listing.city},{" "}
                        {inquiry.listing.state}
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
                      {t("type." + inquiry.type)} ·{" "}
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                      {inquiry.hasPets && " · 🐾 pets"}
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
                {loading ? "..." : t("loadMore")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
