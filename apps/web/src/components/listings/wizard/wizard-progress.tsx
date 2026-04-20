"use client";

import {
  MapPin,
  Bed,
  Bath,
  Sofa,
  DollarSign,
  ShieldCheck,
  Home,
  Camera,
  ClipboardCheck,
  Check,
} from "lucide-react";

const STEP_ICONS = [MapPin, Bed, Bath, Sofa, DollarSign, ShieldCheck, Home, Camera, ClipboardCheck];

interface WizardProgressProps {
  steps: readonly string[];
  labels: string[];
  current: number;
  onStepClick: (index: number) => void;
}

export function WizardProgress({ steps, labels, current, onStepClick }: WizardProgressProps) {
  return (
    <div className="mb-10">
      {/* Desktop progress */}
      <div className="hidden lg:block relative">
        {/* Connecting line behind circles */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-muted-foreground/20">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${(current / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Step circles + labels */}
        <div
          className="relative grid"
          style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}
        >
          {steps.map((_, i) => {
            const Icon = STEP_ICONS[i] ?? ClipboardCheck;
            const isCompleted = i < current;
            const isCurrent = i === current;

            return (
              <button
                key={i}
                onClick={() => onStepClick(i)}
                className="group flex flex-col items-center gap-1.5"
              >
                <div
                  className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                    isCompleted
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : isCurrent
                        ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "border-muted-foreground/30 bg-card text-muted-foreground group-hover:border-muted-foreground/50"
                  }`}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                </div>
                <span
                  className={`text-[11px] font-medium leading-tight text-center ${
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {labels[i]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile progress */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-foreground">
            {labels[current]}
          </span>
          <span className="text-xs text-muted-foreground">
            {current + 1}/{steps.length}
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${((current + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
