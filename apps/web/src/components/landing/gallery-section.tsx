import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Image from "next/image";

const GALLERY_ITEMS = [
  {
    src: "/images/landing/quarto01.jpg",
    altKey: "room" as const,
    className: "col-span-2 row-span-2",
  },
  {
    src: "/images/landing/quarto04.webp",
    altKey: "pool" as const,
    className: "col-span-2 row-span-1",
  },
  {
    src: "/images/landing/varanda.jpg",
    altKey: "balcony" as const,
    className: "col-span-1 row-span-1",
  },
  {
    src: "/images/landing/quarto06.jpg",
    altKey: "bedroom" as const,
    className: "col-span-1 row-span-1",
  },
  {
    src: "/images/landing/cozinha.webp",
    altKey: "kitchen" as const,
    className: "col-span-2 row-span-1",
  },
  {
    src: "/images/landing/quarto02.jpg",
    altKey: "themed" as const,
    className: "col-span-1 row-span-1",
  },
  {
    src: "/images/landing/varanda2.jpeg",
    altKey: "view" as const,
    className: "col-span-1 row-span-1",
  },
];

export function GallerySection() {
  const t = useTranslations("home.gallery");

  return (
    <section className="px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground">{t("title")}</h2>
          <p className="mt-2 text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="mt-12 grid grid-cols-4 grid-rows-3 gap-3 sm:gap-4">
          {GALLERY_ITEMS.map((item) => (
            <div
              key={item.src}
              className={`${item.className} group relative overflow-hidden rounded-xl shadow-sm transition-all hover:shadow-lg`}
            >
              <Image
                src={item.src}
                alt={t(item.altKey)}
                width={600}
                height={400}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/rooms"
            className="inline-flex h-12 items-center rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
          >
            {t("cta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
