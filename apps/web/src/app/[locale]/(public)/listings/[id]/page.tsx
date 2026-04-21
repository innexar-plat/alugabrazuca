"use client";

import { useState, useEffect, use } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { api, resolveMediaUrl } from "@/lib/api";
import { InquiryForm } from "@/components/inquiry/inquiry-form";

interface ListingDetail {
  id: string;
  title: string;
  description: string;
  propertyType: string;
  listingType: string;
  status: string;
  country: string;
  state: string;
  city: string;
  neighborhood?: string;
  pricePerMonth: number;
  currency: string;
  securityDeposit?: number;
  utilitiesIncluded: boolean;
  internetIncluded: boolean;
  minimumStay: number;
  availableFrom: string;
  roomSize: string;
  bedType: string;
  bedCount: number;
  hasWindow: boolean;
  hasCloset: boolean;
  hasLock: boolean;
  isFurnished: boolean;
  bathroomType: string;
  kitchenAccess: string;
  laundryAccess: string;
  parkingType: string;
  allowsPets: string;
  allowsSmoking: string;
  allowsCouples: boolean;
  allowsChildren: boolean;
  allowsVisitors: string;
  totalRooms: number;
  totalBathrooms: number;
  currentOccupants: number;
  hostLivesIn: boolean;
  hasContract: boolean;
  amenities: string[];
  viewCount: number;
  photos: { id: string; url: string; thumbnailUrl: string; caption?: string }[];
  host: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    currentCity?: string;
    currentCountry?: string;
    isVerified: boolean;
    createdAt: string;
  };
}

export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = use(params);
  const t = useTranslations("listing.detail");
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [showInquiryForm, setShowInquiryForm] = useState(false);

  useEffect(() => {
    api
      .get<{ data: ListingDetail }>(`/listings/${id}`)
      .then((res) => setListing(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 text-center">
        <p className="text-lg text-[hsl(var(--muted-foreground))]">
          Listing not found
        </p>
      </div>
    );
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Photos */}
      {listing.photos.length > 0 && (
        <div className="mb-8">
          <div className="overflow-hidden rounded-xl bg-[hsl(var(--muted))]">
            <img
              src={resolveMediaUrl(listing.photos[selectedPhoto]?.url)}
              alt={listing.title}
              className="h-[400px] w-full object-cover"
            />
          </div>
          {listing.photos.length > 1 && (
            <div className="mt-2 flex gap-2 overflow-x-auto">
              {listing.photos.map((photo, i) => (
                <button
                  key={photo.id}
                  onClick={() => setSelectedPhoto(i)}
                  className={`h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                    i === selectedPhoto
                      ? "border-[hsl(var(--primary))]"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={resolveMediaUrl(photo.thumbnailUrl)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              {listing.title}
            </h1>
            <p className="mt-1 text-[hsl(var(--muted-foreground))]">
              {listing.city}, {listing.state} — {listing.country}
            </p>
          </div>

          <p className="whitespace-pre-wrap text-[hsl(var(--foreground))]">
            {listing.description}
          </p>

          {/* Room details */}
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <h2 className="mb-3 text-lg font-semibold">{t("aboutRoom")}</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                🛏️ {listing.bedType} × {listing.bedCount}
              </div>
              <div>📐 {listing.roomSize}</div>
              {listing.hasWindow && <div>🪟 Window</div>}
              {listing.hasCloset && <div>🗄️ Closet</div>}
              {listing.hasLock && <div>🔒 Lock</div>}
              {listing.isFurnished && <div>🪑 Furnished</div>}
            </div>
          </div>

          {/* Bathroom */}
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <h2 className="mb-3 text-lg font-semibold">{t("bathroom")}</h2>
            <p className="text-sm">{listing.bathroomType.replace(/_/g, " ")}</p>
          </div>

          {/* Rules */}
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <h2 className="mb-3 text-lg font-semibold">{t("houseRules")}</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>🐾 Pets: {listing.allowsPets.replace(/_/g, " ")}</div>
              <div>🚬 Smoking: {listing.allowsSmoking.replace(/_/g, " ")}</div>
              <div>💑 Couples: {listing.allowsCouples ? "✅" : "❌"}</div>
              <div>👶 Children: {listing.allowsChildren ? "✅" : "❌"}</div>
              <div>
                👥 Visitors: {listing.allowsVisitors.replace(/_/g, " ")}
              </div>
            </div>
          </div>

          {/* Housing */}
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <h2 className="mb-3 text-lg font-semibold">{t("aboutHousing")}</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                🏠 {listing.totalRooms} rooms, {listing.totalBathrooms}{" "}
                bathrooms
              </div>
              <div>👥 {listing.currentOccupants} current occupants</div>
              <div>📝 Contract: {listing.hasContract ? "✅" : "❌"}</div>
              <div>🏡 Host lives in: {listing.hostLivesIn ? "✅" : "❌"}</div>
            </div>
          </div>

          {/* Location */}
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <h2 className="mb-3 text-lg font-semibold">{t("location")}</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {t("approximateArea")}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="sticky top-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-lg">
            <div className="mb-4 text-center">
              <span className="text-3xl font-bold text-[hsl(var(--foreground))]">
                {listing.currency}{" "}
                {Number(listing.pricePerMonth).toLocaleString()}
              </span>
              <span className="text-[hsl(var(--muted-foreground))]">
                {t("perMonth")}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">
                  {t("available")}
                </span>
                <span>{formatDate(listing.availableFrom)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">
                  {t("minimumStay")}
                </span>
                <span>
                  {listing.minimumStay} {t("months")}
                </span>
              </div>
              {listing.securityDeposit && (
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">
                    {t("deposit")}
                  </span>
                  <span>
                    {listing.currency}{" "}
                    {Number(listing.securityDeposit).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">
                  {t("utilities")}
                </span>
                <span>
                  {listing.utilitiesIncluded ? t("included") : t("notIncluded")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">
                  {t("internet")}
                </span>
                <span>
                  {listing.internetIncluded ? t("included") : t("notIncluded")}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowInquiryForm(true)}
              className="mt-6 w-full rounded-lg bg-[hsl(var(--primary))] py-3 text-sm font-semibold text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity"
            >
              {t("contact")}
            </button>
          </div>

          {/* Host card */}
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <h3 className="mb-3 text-sm font-semibold">{t("aboutHost")}</h3>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-lg">
                {listing.host.avatarUrl ? (
                  <img
                    src={listing.host.avatarUrl}
                    alt=""
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  listing.host.firstName[0]
                )}
              </div>
              <div>
                <p className="font-medium">
                  {listing.host.firstName} {listing.host.lastName[0]}.
                  {listing.host.isVerified && (
                    <span className="ml-1 text-xs text-green-600">
                      ✓ {t("verified")}
                    </span>
                  )}
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {t("memberSince")}{" "}
                  {new Date(listing.host.createdAt).getFullYear()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry form modal */}
      {showInquiryForm && listing && (
        <InquiryForm
          listingId={listing.id}
          listingTitle={listing.title}
          locale={locale}
          onClose={() => setShowInquiryForm(false)}
        />
      )}
    </div>
  );
}
