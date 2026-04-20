"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  city: string;
  avatarUrl: string | null;
  text: string;
  rating: number;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const t = useTranslations("home.testimonials");
  const [current, setCurrent] = useState(0);

  if (!testimonials || testimonials.length === 0) return null;

  function prev() {
    setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1));
  }

  function next() {
    setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1));
  }

  return (
    <section className="bg-muted/50 px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground">{t("title")}</h2>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="relative mt-12">
          <div className="overflow-hidden rounded-2xl bg-card p-8 shadow-md sm:p-12">
            <Quote className="mb-4 h-10 w-10 text-primary/30" />
            <blockquote className="text-lg text-foreground sm:text-xl">
              {t(testimonials[current].text)}
            </blockquote>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {testimonials[current].name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {testimonials[current].name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {testimonials[current].city}
                </p>
              </div>
            </div>
          </div>

          {testimonials.length > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                onClick={prev}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-muted"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      i === current ? "bg-primary" : "bg-border"
                    }`}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={next}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-muted"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
