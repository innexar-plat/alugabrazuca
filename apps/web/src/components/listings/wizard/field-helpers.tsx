"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, Check } from "lucide-react";

/* ── Text Input ── */
interface FieldInputProps {
  field: string;
  value: string | number;
  onChange: (field: string, value: string | number) => void;
  type?: string;
  required?: boolean;
  min?: number;
  max?: number;
  hint?: string;
  placeholder?: string;
}

export function FieldInput({
  field,
  value,
  onChange,
  type = "text",
  required,
  min,
  max,
  hint,
  placeholder,
}: FieldInputProps) {
  const f = useTranslations("listing.create.fields");
  return (
    <div>
      <label htmlFor={field} className="mb-1.5 block text-sm font-medium text-foreground">
        {f(field as never)}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <input
        id={field}
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(field, type === "number" ? Number(e.target.value) : e.target.value)}
        min={min}
        max={max}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/* ── Textarea ── */
interface FieldTextareaProps {
  field: string;
  value: string;
  onChange: (field: string, value: string) => void;
  rows?: number;
  required?: boolean;
  hint?: string;
  minLength?: number;
  maxLength?: number;
}

export function FieldTextarea({
  field,
  value,
  onChange,
  rows = 4,
  required,
  hint,
  minLength,
  maxLength,
}: FieldTextareaProps) {
  const f = useTranslations("listing.create.fields");
  const len = (value ?? "").length;
  const tooShort = minLength !== undefined && len > 0 && len < minLength;
  const atMin = minLength !== undefined && len >= minLength;
  return (
    <div>
      <label htmlFor={field} className="mb-1.5 block text-sm font-medium text-foreground">
        {f(field as never)}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <textarea
        id={field}
        rows={rows}
        value={value ?? ""}
        maxLength={maxLength}
        onChange={(e) => onChange(field, e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
      />
      <div className="mt-1 flex items-center justify-between gap-2">
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        <p className={`ml-auto text-xs tabular-nums ${
          tooShort ? "text-destructive" : atMin ? "text-emerald-600" : "text-muted-foreground"
        }`}>
          {len}{maxLength ? `/${maxLength}` : ""}{minLength && !atMin ? ` / ${minLength} mín.` : ""}
        </p>
      </div>
    </div>
  );
}

/* ── Select ── */
interface SelectOption {
  value: string;
  label: string;
}

interface FieldSelectProps {
  field: string;
  value: string;
  onChange: (field: string, value: string) => void;
  options: SelectOption[];
  required?: boolean;
}

export function FieldSelect({ field, value, onChange, options, required }: FieldSelectProps) {
  const f = useTranslations("listing.create.fields");
  return (
    <div>
      <label htmlFor={field} className="mb-1.5 block text-sm font-medium text-foreground">
        {f(field as never)}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <select
        id={field}
        value={value ?? ""}
        onChange={(e) => onChange(field, e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
      >
        <option value="">—</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ── Toggle Switch ── */
interface FieldToggleProps {
  field: string;
  checked: boolean;
  onChange: (field: string, value: boolean) => void;
  label?: string;
}

export function FieldToggle({ field, checked, onChange, label }: FieldToggleProps) {
  const f = useTranslations("listing.create.fields");
  const displayLabel = label || f(field as never);
  return (
    <label
      htmlFor={field}
      className="flex items-center justify-between rounded-lg border border-border bg-background px-3.5 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
    >
      <span className="text-sm text-foreground">{displayLabel}</span>
      <button
        id={field}
        role="switch"
        type="button"
        aria-checked={checked}
        onClick={() => onChange(field, !checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-muted-foreground/30"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          } mt-0.5`}
        />
      </button>
    </label>
  );
}

/* ── Section Header ── */
interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function SectionHeader({ icon, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

/* ── Amenity/Chip Select ── */
interface ChipSelectProps {
  options: SelectOption[];
  selected: string[];
  onChange: (values: string[]) => void;
}

export function ChipSelect({ options, selected, onChange }: ChipSelectProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() =>
              onChange(
                isSelected
                  ? selected.filter((v) => v !== opt.value)
                  : [...selected, opt.value],
              )
            }
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
              isSelected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Combobox (Autocomplete) ── */
interface ComboboxFieldProps {
  field: string;
  value: string;
  onChange: (field: string, value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  hint?: string;
  placeholder?: string;
  /** Allow typing custom values not in the list */
  allowCustom?: boolean;
}

export function ComboboxField({
  field,
  value,
  onChange,
  options,
  required,
  hint,
  placeholder,
  allowCustom = false,
}: ComboboxFieldProps) {
  const f = useTranslations("listing.create.fields");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Display label of current value
  const selectedLabel = options.find((o) => o.value === value)?.label ?? value;

  // Filter options by query
  const filtered = query.trim()
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(query.toLowerCase()) ||
          o.value.toLowerCase().includes(query.toLowerCase()),
      )
    : options;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(opt: { value: string; label: string }) {
    onChange(field, opt.value);
    setOpen(false);
    setQuery("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setOpen(true);
        setHighlighted(0);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlighted]) {
        handleSelect(filtered[highlighted]);
      } else if (allowCustom && query.trim()) {
        onChange(field, query.trim());
        setOpen(false);
        setQuery("");
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={field} className="mb-1.5 block text-sm font-medium text-foreground">
        {f(field as never)}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={field}
          type="text"
          value={open ? query : selectedLabel}
          placeholder={placeholder || "—"}
          autoComplete="off"
          onFocus={() => {
            setOpen(true);
            setQuery("");
            setHighlighted(0);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlighted(0);
            if (allowCustom) onChange(field, e.target.value);
          }}
          onKeyDown={handleKeyDown}
          className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 pr-9 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <ChevronDown
          className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}

      {open && filtered.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-border bg-background py-1 shadow-lg"
        >
          {filtered.map((opt, idx) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(opt);
              }}
              onMouseEnter={() => setHighlighted(idx)}
              className={`flex cursor-pointer items-center gap-2 px-3.5 py-2 text-sm ${
                idx === highlighted
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-muted/50"
              }`}
            >
              <span className="flex-1">{opt.label}</span>
              {opt.value === value && <Check className="h-4 w-4 shrink-0 text-primary" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
