import { useTranslations } from "next-intl";
import { Search, Home, MessageCircle } from "lucide-react";

export function HowItWorksSection() {
  const t = useTranslations("home.howItWorks");

  const steps = [
    {
      icon: Search,
      title: t("step1Title"),
      description: t("step1Desc"),
    },
    {
      icon: Home,
      title: t("step2Title"),
      description: t("step2Desc"),
    },
    {
      icon: MessageCircle,
      title: t("step3Title"),
      description: t("step3Desc"),
    },
  ];

  return (
    <section className="bg-muted/50 px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold text-foreground">
          {t("title")}
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex flex-col items-center rounded-xl bg-card p-8 text-center shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <step.icon className="h-8 w-8 text-primary" />
              </div>
              <span className="mt-4 text-sm font-bold text-primary">
                {i + 1}
              </span>
              <h3 className="mt-2 text-xl font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
