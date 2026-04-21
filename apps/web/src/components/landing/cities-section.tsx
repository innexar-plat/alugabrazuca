import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { MapPin } from "lucide-react";

interface City {
  country: string;
  state: string;
  city: string;
  count: number;
}

interface CitiesSectionProps {
  cities: City[];
}

const CITY_IMAGES: Record<string, string> = {
  orlando:
    "https://images.unsplash.com/photo-1575089976121-8ed774c2a52c?w=400&h=300&fit=crop",
  miami:
    "https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?w=400&h=300&fit=crop",
  newark:
    "https://images.unsplash.com/photo-1496588152823-86ff7695e68f?w=400&h=300&fit=crop",
  boston:
    "https://images.unsplash.com/photo-1501979376754-2ff867a4f659?w=400&h=300&fit=crop",
  lisboa:
    "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=400&h=300&fit=crop",
  lisbon:
    "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=400&h=300&fit=crop",
  dublin:
    "https://images.unsplash.com/photo-1549918864-48ac978761a4?w=400&h=300&fit=crop",
  london:
    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop",
  londres:
    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop",
  madrid:
    "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&h=300&fit=crop",
};

export function CitiesSection({ cities }: CitiesSectionProps) {
  const t = useTranslations("home.cities");

  if (!cities || cities.length === 0) return null;

  return (
    <section className="bg-muted/50 px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground">{t("title")}</h2>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cities.slice(0, 8).map((city) => {
            const key = city.city
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "");
            const imageUrl = CITY_IMAGES[key];

            return (
              <Link
                key={`${city.country}-${city.state}-${city.city}`}
                href={`/rooms?city=${encodeURIComponent(city.city)}&country=${encodeURIComponent(city.country)}`}
                className="group relative overflow-hidden rounded-xl shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] bg-muted">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={city.city}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-primary/10">
                      <MapPin className="h-12 w-12 text-primary/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-lg font-bold">{city.city}</h3>
                    <p className="text-sm opacity-90">
                      {city.state}, {city.country}
                    </p>
                    <p className="mt-1 text-sm font-medium text-accent">
                      {city.count} {t("rooms")}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
