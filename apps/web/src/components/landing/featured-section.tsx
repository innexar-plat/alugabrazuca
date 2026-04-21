import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { MapPin, Star } from "lucide-react";
import { resolveMediaUrl } from "@/lib/api";

interface Listing {
  id: string;
  title: string;
  country: string;
  state: string;
  city: string;
  pricePerMonth: number | string;
  currency: string;
  listingType: string;
  roomSize: string;
  isFurnished: boolean;
  utilitiesIncluded: boolean;
  availableFrom: string;
  createdAt: string;
  photos: { url: string; thumbnailUrl: string }[];
  host: { id: string; firstName: string; isVerified: boolean };
}

interface FeaturedSectionProps {
  listings: Listing[];
}

export function FeaturedSection({ listings }: FeaturedSectionProps) {
  const t = useTranslations("home.featured");

  if (!listings || listings.length === 0) return null;

  return (
    <section className="px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground">{t("title")}</h2>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {listings.slice(0, 8).map((listing) => (
            <Link
              key={listing.id}
              href={`/listings/${listing.id}`}
              className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                {listing.photos?.[0] ? (
                  <img
                    src={resolveMediaUrl(
                      listing.photos[0].thumbnailUrl || listing.photos[0].url,
                    )}
                    alt={listing.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <MapPin className="h-8 w-8" />
                  </div>
                )}
                {listing.host?.isVerified && (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary/90 px-2 py-0.5 text-xs font-medium text-primary-foreground">
                    <Star className="h-3 w-3" />
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="line-clamp-1 text-sm font-semibold text-foreground">
                  {listing.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {listing.city}, {listing.state}
                </p>
                <p className="mt-2 text-lg font-bold text-primary">
                  {listing.currency === "USD" ? "$" : "€"}
                  {Number(listing.pricePerMonth).toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground">
                    {t("perMonth")}
                  </span>
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/rooms"
            className="inline-flex h-12 items-center rounded-lg border border-primary bg-transparent px-8 text-base font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            {t("viewAll")}
          </Link>
        </div>
      </div>
    </section>
  );
}
