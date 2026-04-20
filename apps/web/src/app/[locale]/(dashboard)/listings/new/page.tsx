"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Bed,
  Bath,
  Sofa,
  DollarSign,
  ShieldCheck,
  Home,
  Camera,
  Sparkles,
  Trees,
  Users,
  CheckCircle,
  RotateCcw,
} from "lucide-react";
import { api } from "@/lib/api";
import { WizardProgress } from "@/components/listings/wizard/wizard-progress";
import { PhotoUpload, type UploadedPhoto } from "@/components/listings/wizard/photo-upload";
import {
  FieldInput,
  FieldTextarea,
  FieldSelect,
  FieldToggle,
  SectionHeader,
  ChipSelect,
  ComboboxField,
} from "@/components/listings/wizard/field-helpers";
import { STEPS, INITIAL_FORM, type ListingFormData } from "@/components/listings/wizard/types";
import { COUNTRIES, getRegionOptions } from "@/components/listings/wizard/location-data";

const DRAFT_KEY = "listing_wizard_draft";

function saveDraft(form: ListingFormData, step: number) {
  try {
    const draft = { form: { ...form, photos: [] }, step, savedAt: Date.now() };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // localStorage unavailable
  }
}

function loadDraft(): { form: ListingFormData; step: number; savedAt: number } | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
}

export default function CreateListingPage() {
  const t = useTranslations("listing.create");
  const o = useTranslations("listing.create.options");
  const f = useTranslations("listing.create.fields");
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<ListingFormData>(INITIAL_FORM);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [showRestoreBanner, setShowRestoreBanner] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<{ form: ListingFormData; step: number } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  // Check for saved draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft && draft.savedAt) {
      // Only show restore if it was saved within the last 7 days
      const age = Date.now() - draft.savedAt;
      if (age < 7 * 24 * 60 * 60 * 1000) {
        setPendingDraft({ form: draft.form, step: draft.step });
        setShowRestoreBanner(true);
      }
    }
  }, []);

  // Auto-save with 800ms debounce on every form/step change (skip first render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setSaveStatus("saving");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveDraft(form, step);
      setSaveStatus("saved");
    }, 800);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [form, step]);

  const set = useCallback((field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Auto-fill city/state from US ZIP code
  const handleZipChange = useCallback(
    async (field: string, value: unknown) => {
      const zip = String(value ?? "").trim();
      setForm((prev) => ({ ...prev, zipCode: zip }));
      if (/^\d{5}$/.test(zip) && (form.country === "US" || form.country === "")) {
        try {
          const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
          if (res.ok) {
            const data = await res.json();
            const place = data.places?.[0];
            if (place) {
              setForm((prev) => ({
                ...prev,
                city: prev.city || place["place name"] || prev.city,
                state: prev.state || place["state abbreviation"] || prev.state,
              }));
            }
          }
        } catch {
          // silently fail — user can fill manually
        }
      }
    },
    [form.country],
  );

  const stepLabels = STEPS.map((s) => t(`steps.${s}` as never));

  // ── Validation ──

  function validateStep(s: number): string[] {
    const v = (key: string) => t(`validation.${key}` as never);
    const errors: string[] = [];

    switch (s) {
      case 0: // Location
        if (!form.title || form.title.length < 10) errors.push(v("titleMin"));
        if (!form.description || form.description.length < 50) errors.push(v("descriptionMin"));
        if (!form.propertyType) errors.push(v("propertyType"));
        if (!form.listingType) errors.push(v("listingType"));
        if (!form.country) errors.push(v("country"));
        if (!form.state) errors.push(v("state"));
        if (!form.city) errors.push(v("city"));
        if (!form.zipCode) errors.push(v("zipCode"));
        if (!form.streetAddress) errors.push(v("streetAddress"));
        break;
      case 1: // Room
        if (!form.roomSize) errors.push(v("roomSize"));
        if (!form.bedType) errors.push(v("bedType"));
        break;
      case 2: // Bathroom
        if (!form.bathroomType) errors.push(v("bathroomType"));
        break;
      case 3: // Common areas
        if (!form.kitchenAccess) errors.push(v("kitchenAccess"));
        if (!form.laundryAccess) errors.push(v("laundryAccess"));
        if (!form.parkingType) errors.push(v("parkingType"));
        break;
      case 4: // Price
        if (!form.pricePerMonth || form.pricePerMonth <= 0) errors.push(v("pricePerMonth"));
        if (!form.availableFrom) errors.push(v("availableFrom"));
        break;
      case 5: // Rules
        if (!form.allowsPets) errors.push(v("allowsPets"));
        if (!form.allowsSmoking) errors.push(v("allowsSmoking"));
        if (!form.allowsVisitors) errors.push(v("allowsVisitors"));
        break;
      case 6: // Housing
        if (!form.totalRooms || form.totalRooms <= 0) errors.push(v("totalRooms"));
        if (!form.totalBathrooms || form.totalBathrooms <= 0) errors.push(v("totalBathrooms"));
        if (form.currentOccupants === null || form.currentOccupants === undefined) errors.push(v("currentOccupants"));
        break;
      case 7: // Photos
        {
          const validPhotos = form.photos.filter((p) => p.url && !p.error);
          if (validPhotos.length < 3) errors.push(v("photos"));
        }
        break;
    }

    return errors;
  }

  function validateForm(): string[] {
    const errors: string[] = [];
    for (let s = 0; s < STEPS.length - 1; s++) {
      errors.push(...validateStep(s));
    }
    return errors;
  }

  function handleNext() {
    const errors = validateStep(step);
    if (errors.length > 0) {
      setError(t("validation.requiredFields" as never) + "\n• " + errors.join("\n• "));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setError("");
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  // ── Submit handlers ──

  function buildPayload(data: ListingFormData): Record<string, unknown> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { photos, ...rest } = data;
    const payload: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(rest)) {
      if (value === null || value === undefined) continue;
      if (typeof value === "string" && value === "") continue;
      if (Array.isArray(value) && value.length === 0) continue;
      payload[key] = value;
    }
    return payload;
  }

  async function handleSubmit(publish: boolean) {
    setLoading(true);
    setError("");

    // Validate before publishing (drafts skip validation)
    if (publish) {
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        setError(t("validation.requiredFields" as never) + "\n• " + validationErrors.join("\n• "));
        setLoading(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    try {
      const payload = buildPayload(form);
      const res = await api.post<{ data: { id: string } }>("/listings", payload);
      const listingId = res.data.id;

      // Upload photos to listing
      const validPhotos = form.photos.filter((p) => p.url && !p.error);
      for (const photo of validPhotos) {
        await api.post(`/listings/${listingId}/photos`, {
          url: photo.url,
          thumbnailUrl: photo.thumbnailUrl,
          caption: photo.caption || undefined,
        });
      }

      if (publish) {
        await api.post(`/listings/${listingId}/publish`);
      }

      clearDraft();
      router.push("/my-listings");
    } catch (err: unknown) {
      const e = err as Error & { body?: { message?: string | string[] } };
      const msg = e.body?.message;
      if (Array.isArray(msg)) {
        setError(msg.join("\n• "));
      } else {
        setError(msg || e.message || "Error");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  }

  // ── Option arrays (translated) ──

  const propertyTypes = [
    { value: "house", label: o("propertyType.house") },
    { value: "apartment", label: o("propertyType.apartment") },
    { value: "condo", label: o("propertyType.condo") },
    { value: "townhouse", label: o("propertyType.townhouse") },
    { value: "studio", label: o("propertyType.studio") },
    { value: "other", label: o("propertyType.other") },
  ];

  const listingTypes = [
    { value: "private_room", label: o("listingType.privateRoom") },
    { value: "shared_room", label: o("listingType.sharedRoom") },
    { value: "entire_place", label: o("listingType.entirePlace") },
  ];

  const roomSizes = [
    { value: "small", label: o("roomSize.small") },
    { value: "medium", label: o("roomSize.medium") },
    { value: "large", label: o("roomSize.large") },
    { value: "extra_large", label: o("roomSize.extraLarge") },
  ];

  const bedTypes = [
    { value: "single", label: o("bedType.single") },
    { value: "double", label: o("bedType.double") },
    { value: "queen", label: o("bedType.queen") },
    { value: "king", label: o("bedType.king") },
    { value: "bunk_bed", label: o("bedType.bunkBed") },
    { value: "sofa_bed", label: o("bedType.sofaBed") },
    { value: "mattress_only", label: o("bedType.mattressOnly") },
    { value: "no_bed", label: o("bedType.noBed") },
  ];

  const bathroomTypes = [
    { value: "private_ensuite", label: o("bathroomType.privateEnsuite") },
    { value: "private_not_ensuite", label: o("bathroomType.privateNotEnsuite") },
    { value: "shared", label: o("bathroomType.shared") },
  ];

  const kitchenOptions = [
    { value: "full", label: o("kitchenAccess.full") },
    { value: "limited", label: o("kitchenAccess.limited") },
    { value: "scheduled", label: o("kitchenAccess.scheduled") },
    { value: "none", label: o("kitchenAccess.none") },
  ];

  const laundryOptions = [
    { value: "in_unit", label: o("laundryAccess.inUnit") },
    { value: "in_building", label: o("laundryAccess.inBuilding") },
    { value: "nearby", label: o("laundryAccess.nearby") },
    { value: "none", label: o("laundryAccess.none") },
  ];

  const parkingOptions = [
    { value: "included", label: o("parkingType.included") },
    { value: "available_paid", label: o("parkingType.availablePaid") },
    { value: "street", label: o("parkingType.street") },
    { value: "none", label: o("parkingType.none") },
  ];

  const petOptions = [
    { value: "yes", label: o("allowsPets.yes") },
    { value: "small_only", label: o("allowsPets.smallOnly") },
    { value: "cats_only", label: o("allowsPets.catsOnly") },
    { value: "dogs_only", label: o("allowsPets.dogsOnly") },
    { value: "no", label: o("allowsPets.no") },
  ];

  const smokingOptions = [
    { value: "yes", label: o("allowsSmoking.yes") },
    { value: "outside_only", label: o("allowsSmoking.outsideOnly") },
    { value: "no", label: o("allowsSmoking.no") },
  ];

  const visitorOptions = [
    { value: "anytime", label: o("allowsVisitors.anytime") },
    { value: "daytime_only", label: o("allowsVisitors.daytimeOnly") },
    { value: "with_notice", label: o("allowsVisitors.withNotice") },
    { value: "no_overnight", label: o("allowsVisitors.noOvernight") },
    { value: "no", label: o("allowsVisitors.no") },
  ];

  const amenityOptions = [
    { value: "wifi", label: o("amenities.wifi") },
    { value: "cable_tv", label: o("amenities.cableTv") },
    { value: "ac", label: o("amenities.ac") },
    { value: "heating", label: o("amenities.heating") },
    { value: "elevator", label: o("amenities.elevator") },
    { value: "security_camera", label: o("amenities.securityCamera") },
    { value: "doorman", label: o("amenities.doorman") },
    { value: "gym", label: o("amenities.gym") },
    { value: "intercom", label: o("amenities.intercom") },
  ];

  const paymentOptions = [
    { value: "cash", label: o("paymentMethods.cash") },
    { value: "zelle", label: o("paymentMethods.zelle") },
    { value: "venmo", label: o("paymentMethods.venmo") },
    { value: "cashapp", label: o("paymentMethods.cashapp") },
    { value: "bank_transfer", label: o("paymentMethods.bankTransfer") },
    { value: "pix", label: o("paymentMethods.pix") },
    { value: "credit_card", label: o("paymentMethods.creditCard") },
  ];

  const hotWaterOptions = [
    { value: "gas", label: o("hotWater.gas") },
    { value: "electric", label: o("hotWater.electric") },
    { value: "solar", label: o("hotWater.solar") },
    { value: "none", label: o("hotWater.none") },
  ];

  // ── Steps ──

  function renderStep() {
    switch (step) {
      case 0:
        return (
          <div className="space-y-5">
            <SectionHeader icon={<MapPin className="h-5 w-5" />} title={t("sections.basicInfo")} subtitle={t("sections.basicInfoDesc")} />
            <FieldInput field="title" value={form.title} onChange={set} required hint={t("fields.titleHint" as never)} />
            <FieldTextarea field="description" value={form.description} onChange={set} required hint={t("fields.descriptionHint" as never)} minLength={50} maxLength={2000} rows={5} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldSelect field="propertyType" value={form.propertyType} onChange={set} options={propertyTypes} required />
              <FieldSelect field="listingType" value={form.listingType} onChange={set} options={listingTypes} required />
            </div>
            <div className="mt-2 border-t border-border pt-5">
              <SectionHeader icon={<MapPin className="h-5 w-5" />} title={t("sections.address")} subtitle={t("sections.addressDesc")} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ComboboxField
                field="country"
                value={form.country}
                onChange={(f, v) => {
                  set(f, v);
                  // Reset state when country changes
                  if (v !== form.country) set("state", "");
                }}
                options={COUNTRIES}
                required
              />
              {getRegionOptions(form.country) ? (
                <ComboboxField
                  field="state"
                  value={form.state}
                  onChange={set}
                  options={getRegionOptions(form.country)!}
                  required
                />
              ) : (
                <FieldInput field="state" value={form.state} onChange={set} required />
              )}
              <FieldInput field="city" value={form.city} onChange={set} required />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldInput field="zipCode" value={form.zipCode} onChange={handleZipChange} required hint={t("fields.zipHint" as never)} />
              <FieldInput field="neighborhood" value={form.neighborhood} onChange={set} />
            </div>
            <FieldInput field="streetAddress" value={form.streetAddress} onChange={set} required hint={t("fields.streetAddressHint" as never)} />
          </div>
        );

      case 1:
        return (
          <div className="space-y-5">
            <SectionHeader icon={<Bed className="h-5 w-5" />} title={t("steps.room")} subtitle={t("sections.roomDesc")} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldSelect field="roomSize" value={form.roomSize} onChange={set} options={roomSizes} required />
              <FieldSelect field="bedType" value={form.bedType} onChange={set} options={bedTypes} required />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldInput field="bedCount" value={form.bedCount} onChange={set} type="number" min={1} max={4} />
              <FieldInput field="floorLevel" value={form.floorLevel ?? ""} onChange={set} type="number" min={0} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FieldToggle field="hasWindow" checked={form.hasWindow} onChange={set} />
              <FieldToggle field="hasCloset" checked={form.hasCloset} onChange={set} />
              <FieldToggle field="hasLock" checked={form.hasLock} onChange={set} />
              <FieldToggle field="isFurnished" checked={form.isFurnished} onChange={set} />
              <FieldToggle field="bedsheetsProvided" checked={form.bedsheetsProvided} onChange={set} />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <SectionHeader icon={<Bath className="h-5 w-5" />} title={t("steps.bathroom")} subtitle={t("sections.bathroomDesc")} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldSelect field="bathroomType" value={form.bathroomType} onChange={set} options={bathroomTypes} required />
              <FieldInput field="bathroomCount" value={form.bathroomCount} onChange={set} type="number" min={1} max={5} />
            </div>
            <FieldSelect field="hotWater" value={form.hotWater ?? ""} onChange={set} options={hotWaterOptions} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FieldToggle field="hasBathtub" checked={form.hasBathtub} onChange={set} />
              <FieldToggle field="hasShower" checked={form.hasShower} onChange={set} />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <SectionHeader icon={<Sofa className="h-5 w-5" />} title={t("steps.common")} subtitle={t("sections.commonDesc")} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FieldSelect field="kitchenAccess" value={form.kitchenAccess} onChange={set} options={kitchenOptions} required />
              <FieldSelect field="laundryAccess" value={form.laundryAccess} onChange={set} options={laundryOptions} required />
              <FieldSelect field="parkingType" value={form.parkingType} onChange={set} options={parkingOptions} required />
            </div>
            <FieldToggle field="livingRoomAccess" checked={form.livingRoomAccess} onChange={set} />

            <div className="mt-2 border-t border-border pt-5">
              <SectionHeader icon={<Trees className="h-5 w-5" />} title={t("sections.outdoor")} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FieldToggle field="hasBackyard" checked={form.hasBackyard} onChange={set} />
              <FieldToggle field="hasPatio" checked={form.hasPatio} onChange={set} />
              <FieldToggle field="hasBalcony" checked={form.hasBalcony} onChange={set} />
              <FieldToggle field="hasPool" checked={form.hasPool} onChange={set} />
              <FieldToggle field="hasBBQArea" checked={form.hasBBQArea} onChange={set} />
            </div>

            <div className="mt-2 border-t border-border pt-5">
              <SectionHeader icon={<Sparkles className="h-5 w-5" />} title={t("sections.amenities")} />
            </div>
            <ChipSelect
              options={amenityOptions}
              selected={form.amenities}
              onChange={(v) => set("amenities", v)}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-5">
            <SectionHeader icon={<DollarSign className="h-5 w-5" />} title={t("steps.price")} subtitle={t("sections.priceDesc")} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldInput field="pricePerMonth" value={form.pricePerMonth ?? ""} onChange={set} type="number" min={1} required />
              <FieldSelect field="currency" value={form.currency} onChange={set} options={[
                { value: "USD", label: "USD ($)" },
                { value: "EUR", label: "EUR (€)" },
                { value: "GBP", label: "GBP (£)" },
              ]} required />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldInput field="securityDeposit" value={form.securityDeposit ?? ""} onChange={set} type="number" min={0} />
              <FieldInput field="utilitiesEstimate" value={form.utilitiesEstimate ?? ""} onChange={set} type="number" min={0} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FieldToggle field="utilitiesIncluded" checked={form.utilitiesIncluded} onChange={set} />
              <FieldToggle field="internetIncluded" checked={form.internetIncluded} onChange={set} />
              <FieldToggle field="priceNegotiable" checked={form.priceNegotiable} onChange={set} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldInput field="minimumStay" value={form.minimumStay} onChange={set} type="number" min={1} max={12} required />
              <FieldInput field="availableFrom" value={form.availableFrom} onChange={set} type="date" required />
            </div>

            <div className="mt-2 border-t border-border pt-5">
              <SectionHeader icon={<DollarSign className="h-5 w-5" />} title={t("sections.payment")} />
            </div>
            <ChipSelect
              options={paymentOptions}
              selected={form.paymentMethods}
              onChange={(v) => set("paymentMethods", v)}
            />
          </div>
        );

      case 5:
        return (
          <div className="space-y-5">
            <SectionHeader icon={<ShieldCheck className="h-5 w-5" />} title={t("steps.rules")} subtitle={t("sections.rulesDesc")} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldSelect field="allowsPets" value={form.allowsPets} onChange={set} options={petOptions} required />
              <FieldSelect field="allowsSmoking" value={form.allowsSmoking} onChange={set} options={smokingOptions} required />
            </div>
            <FieldSelect field="allowsVisitors" value={form.allowsVisitors} onChange={set} options={visitorOptions} required />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FieldToggle field="allowsCouples" checked={form.allowsCouples} onChange={set} />
              <FieldToggle field="allowsChildren" checked={form.allowsChildren} onChange={set} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldInput field="maxOccupants" value={form.maxOccupants} onChange={set} type="number" min={1} max={6} required />
              <FieldInput field="quietHours" value={form.quietHours} onChange={set} placeholder="22:00 - 08:00" />
            </div>
            <FieldTextarea field="additionalRules" value={form.additionalRules} onChange={set} rows={3} />
          </div>
        );

      case 6:
        return (
          <div className="space-y-5">
            <SectionHeader icon={<Home className="h-5 w-5" />} title={t("steps.housing")} subtitle={t("sections.housingDesc")} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FieldInput field="totalRooms" value={form.totalRooms ?? ""} onChange={set} type="number" min={1} required />
              <FieldInput field="totalBathrooms" value={form.totalBathrooms ?? ""} onChange={set} type="number" min={1} required />
              <FieldInput field="currentOccupants" value={form.currentOccupants ?? ""} onChange={set} type="number" min={0} required />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FieldToggle field="hostLivesIn" checked={form.hostLivesIn} onChange={set} />
              <FieldToggle field="hasContract" checked={form.hasContract} onChange={set} />
            </div>

            <div className="mt-2 border-t border-border pt-5">
              <SectionHeader icon={<Users className="h-5 w-5" />} title={t("sections.preferences")} subtitle={t("sections.preferencesDesc")} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FieldToggle field="lgbtFriendly" checked={form.lgbtFriendly} onChange={set} />
              <FieldToggle field="prefersBrazilian" checked={form.prefersBrazilian} onChange={set} />
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-5">
            <SectionHeader icon={<Camera className="h-5 w-5" />} title={t("steps.photos")} subtitle={t("sections.photosDesc")} />
            <PhotoUpload
              photos={form.photos}
              coverIndex={form.coverPhotoIndex}
              onChange={(photos) => {
                if (typeof photos === "function") {
                  setForm((prev) => ({ ...prev, photos: (photos as Function)(prev.photos) }));
                } else {
                  set("photos", photos);
                }
              }}
              onCoverChange={(i) => set("coverPhotoIndex", i)}
            />
          </div>
        );

      case 8:
        return renderReview();

      default:
        return null;
    }
  }

  function renderReview() {
    const validPhotos = form.photos.filter((p) => p.url && !p.error);
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1").replace("/api/v1", "");

    // Helper to resolve option label from value
    const optLabel = (options: { value: string; label: string }[], value: string) =>
      options.find((o) => o.value === value)?.label || value;

    // Helper to format boolean as Sim/Não
    const yesNo = (val: boolean) => (val ? "✓" : "—");

    type ReviewItem = { label: string; value: string | number | boolean | undefined | null };

    const sections: { title: string; icon: React.ReactNode; items: ReviewItem[] }[] = [
      {
        title: t("steps.location"),
        icon: <MapPin className="h-4 w-4" />,
        items: [
          { label: f("propertyType"), value: form.propertyType && optLabel(propertyTypes, form.propertyType) },
          { label: f("listingType"), value: form.listingType && optLabel(listingTypes, form.listingType) },
          { label: f("city"), value: form.city ? `${form.city}, ${form.state}` : undefined },
          { label: f("country"), value: form.country },
          { label: f("neighborhood"), value: form.neighborhood },
          { label: f("zipCode"), value: form.zipCode },
        ],
      },
      {
        title: t("steps.room"),
        icon: <Bed className="h-4 w-4" />,
        items: [
          { label: f("roomSize"), value: form.roomSize && optLabel(roomSizes, form.roomSize) },
          { label: f("bedType"), value: form.bedType && optLabel(bedTypes, form.bedType) },
          { label: f("bedCount"), value: form.bedCount },
          { label: f("floorLevel"), value: form.floorLevel },
          { label: f("bedsheetsProvided"), value: form.bedsheetsProvided ? yesNo(form.bedsheetsProvided) : undefined },
        ],
      },
      {
        title: t("steps.bathroom"),
        icon: <Bath className="h-4 w-4" />,
        items: [
          { label: f("bathroomType"), value: form.bathroomType && optLabel(bathroomTypes, form.bathroomType) },
          { label: f("bathroomCount"), value: form.bathroomCount },
          { label: f("hasBathtub"), value: form.hasBathtub ? yesNo(form.hasBathtub) : undefined },
          { label: f("hasShower"), value: form.hasShower ? yesNo(form.hasShower) : undefined },
          { label: f("hotWater"), value: form.hotWater && optLabel(hotWaterOptions, form.hotWater) },
        ],
      },
      {
        title: t("steps.common"),
        icon: <Sofa className="h-4 w-4" />,
        items: [
          { label: f("kitchenAccess"), value: form.kitchenAccess && optLabel(kitchenOptions, form.kitchenAccess) },
          { label: f("laundryAccess"), value: form.laundryAccess && optLabel(laundryOptions, form.laundryAccess) },
          { label: f("parkingType"), value: form.parkingType && optLabel(parkingOptions, form.parkingType) },
          { label: f("livingRoomAccess"), value: form.livingRoomAccess ? yesNo(form.livingRoomAccess) : undefined },
        ],
      },
      {
        title: t("steps.price"),
        icon: <DollarSign className="h-4 w-4" />,
        items: [
          { label: f("pricePerMonth"), value: form.pricePerMonth ? `${form.currency} ${form.pricePerMonth}` : undefined },
          { label: f("securityDeposit"), value: form.securityDeposit ? `${form.currency} ${form.securityDeposit}` : undefined },
          { label: f("utilitiesIncluded"), value: yesNo(form.utilitiesIncluded) },
          { label: f("utilitiesEstimate"), value: form.utilitiesEstimate ? `${form.currency} ${form.utilitiesEstimate}` : undefined },
          { label: f("internetIncluded"), value: yesNo(form.internetIncluded) },
          { label: f("priceNegotiable"), value: form.priceNegotiable ? yesNo(form.priceNegotiable) : undefined },
          { label: f("availableFrom"), value: form.availableFrom },
          { label: f("minimumStay"), value: form.minimumStay || undefined },
        ],
      },
      {
        title: t("steps.rules"),
        icon: <ShieldCheck className="h-4 w-4" />,
        items: [
          { label: f("allowsPets"), value: form.allowsPets && optLabel(petOptions, form.allowsPets) },
          { label: f("allowsSmoking"), value: form.allowsSmoking && optLabel(smokingOptions, form.allowsSmoking) },
          { label: f("allowsCouples"), value: yesNo(form.allowsCouples) },
          { label: f("allowsChildren"), value: yesNo(form.allowsChildren) },
          { label: f("allowsVisitors"), value: form.allowsVisitors && optLabel(visitorOptions, form.allowsVisitors) },
          { label: f("quietHours"), value: form.quietHours || undefined },
          { label: f("maxOccupants"), value: form.maxOccupants || undefined },
        ],
      },
      {
        title: t("steps.housing"),
        icon: <Home className="h-4 w-4" />,
        items: [
          { label: f("totalRooms"), value: form.totalRooms },
          { label: f("totalBathrooms"), value: form.totalBathrooms },
          { label: f("currentOccupants"), value: form.currentOccupants },
          { label: f("hostLivesIn"), value: yesNo(form.hostLivesIn) },
          { label: f("hasContract"), value: yesNo(form.hasContract) },
          { label: f("lgbtFriendly"), value: form.lgbtFriendly ? yesNo(form.lgbtFriendly) : undefined },
          { label: f("prefersBrazilian"), value: form.prefersBrazilian ? yesNo(form.prefersBrazilian) : undefined },
        ],
      },
    ];

    // Outdoor features
    const outdoorFeatures = [
      form.hasBackyard && f("hasBackyard"),
      form.hasPatio && f("hasPatio"),
      form.hasBalcony && f("hasBalcony"),
      form.hasPool && f("hasPool"),
      form.hasBBQArea && f("hasBBQArea"),
    ].filter(Boolean) as string[];

    // Room features
    const roomFeatures = [
      form.hasWindow && f("hasWindow"),
      form.hasCloset && f("hasCloset"),
      form.hasLock && f("hasLock"),
      form.isFurnished && f("isFurnished"),
    ].filter(Boolean) as string[];

    // Amenity labels
    const amenityLabels = form.amenities
      .map((v) => amenityOptions.find((o) => o.value === v)?.label)
      .filter(Boolean) as string[];

    // Payment method labels
    const paymentLabels = form.paymentMethods
      .map((v) => paymentOptions.find((o) => o.value === v)?.label)
      .filter(Boolean) as string[];

    return (
      <div className="space-y-6">
        <SectionHeader icon={<Sparkles className="h-5 w-5" />} title={t("sections.reviewTitle")} subtitle={t("sections.reviewDesc")} />

        {/* Photo preview */}
        {validPhotos.length > 0 && (
          <div className="grid grid-cols-4 gap-2 rounded-xl overflow-hidden">
            {validPhotos.slice(0, 5).map((photo, i) => (
              <div key={photo.id} className={`relative ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
                <img
                  src={`${apiBase}${photo.url}`}
                  alt=""
                  className="h-full w-full object-cover aspect-[4/3]"
                />
                {i === 0 && (
                  <span className="absolute bottom-2 left-2 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold text-primary-foreground shadow-sm">
                    {t("sections.coverPhoto")}
                  </span>
                )}
              </div>
            ))}
            {validPhotos.length > 5 && (
              <div className="flex items-center justify-center bg-muted text-sm font-medium text-muted-foreground">
                +{validPhotos.length - 5}
              </div>
            )}
          </div>
        )}

        {/* Title & Description */}
        {(form.title || form.description) && (
          <div className="rounded-xl border border-border bg-background p-5">
            {form.title && <h3 className="text-base font-semibold text-foreground">{form.title}</h3>}
            {form.description && (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {form.description}
              </p>
            )}
          </div>
        )}

        {/* Data sections — 2-column grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {sections.map((section) => {
            const filledItems = section.items.filter(
              (item) => item.value !== undefined && item.value !== null && item.value !== "",
            );
            if (filledItems.length === 0) return null;
            return (
              <div key={section.title} className="rounded-xl border border-border bg-background p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-primary">{section.icon}</span>
                  <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                </div>
                <dl className="space-y-2">
                  {filledItems.map((item) => (
                    <div key={item.label} className="flex items-start justify-between gap-3 text-sm">
                      <dt className="shrink-0 text-muted-foreground">{item.label}</dt>
                      <dd className="font-medium text-foreground text-right break-words">
                        {String(item.value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            );
          })}
        </div>

        {/* Additional rules */}
        {form.additionalRules && (
          <div className="rounded-xl border border-border bg-background p-5">
            <h3 className="mb-2 text-sm font-semibold text-foreground">{f("additionalRules")}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{form.additionalRules}</p>
          </div>
        )}

        {/* Chips sections: room features, outdoor, amenities, payment */}
        {roomFeatures.length > 0 && (
          <div className="rounded-xl border border-border bg-background p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">{t("steps.room")} — {t("sections.features")}</h3>
            <div className="flex flex-wrap gap-2">
              {roomFeatures.map((label) => <Chip key={label} label={label} />)}
            </div>
          </div>
        )}

        {outdoorFeatures.length > 0 && (
          <div className="rounded-xl border border-border bg-background p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">{t("sections.outdoor")}</h3>
            <div className="flex flex-wrap gap-2">
              {outdoorFeatures.map((label) => <Chip key={label} label={label} />)}
            </div>
          </div>
        )}

        {amenityLabels.length > 0 && (
          <div className="rounded-xl border border-border bg-background p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">{t("sections.amenities")}</h3>
            <div className="flex flex-wrap gap-2">
              {amenityLabels.map((label) => <Chip key={label} label={label} />)}
            </div>
          </div>
        )}

        {paymentLabels.length > 0 && (
          <div className="rounded-xl border border-border bg-background p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">{t("sections.payment")}</h3>
            <div className="flex flex-wrap gap-2">
              {paymentLabels.map((label) => <Chip key={label} label={label} />)}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">{t("title")}</h1>
      <p className="mb-8 text-sm text-muted-foreground">{t("subtitle")}</p>

      {/* Restore draft banner */}
      {showRestoreBanner && pendingDraft && (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <RotateCcw className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Rascunho salvo encontrado</p>
              <p className="text-xs text-blue-700 mt-1">
                Você tem um rascunho do passo {pendingDraft.step + 1}. Deseja continuar de onde parou?
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => {
                setForm(pendingDraft.form);
                setStep(pendingDraft.step);
                setShowRestoreBanner(false);
              }}
              className="rounded px-3 py-1.5 text-xs font-medium text-blue-900 bg-blue-100 hover:bg-blue-200 transition-colors"
            >
              Continuar
            </button>
            <button
              onClick={() => {
                clearDraft();
                setShowRestoreBanner(false);
              }}
              className="rounded px-3 py-1.5 text-xs font-medium text-blue-700 hover:text-blue-900 transition-colors"
            >
              Limpar
            </button>
          </div>
        </div>
      )}

      {/* Save status indicator */}
      {saveStatus !== "idle" && (
        <div className="mb-6 flex items-center justify-end gap-2 text-xs text-muted-foreground">
          {saveStatus === "saving" && (
            <>
              <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
              Salvando...
            </>
          )}
          {saveStatus === "saved" && (
            <>
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span className="text-emerald-600 font-medium">Rascunho salvo</span>
            </>
          )}
        </div>
      )}

      <WizardProgress
        steps={STEPS}
        labels={stepLabels}
        current={step}
        onStepClick={(target) => {
          // Only allow going back; forward requires passing through handleNext
          if (target < step) {
            setError("");
            setStep(target);
          }
        }}
      />

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive whitespace-pre-line">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => { setError(""); setStep((s) => Math.max(0, s - 1)); }}
          disabled={step === 0}
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t("previous")}
        </button>

        <div className="flex gap-3">
          {step === STEPS.length - 1 ? (
            <>
              <button
                onClick={() => handleSubmit(false)}
                disabled={loading}
                className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                {t("saveDraft")}
              </button>
              <button
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "..." : t("publish")}
              </button>
            </>
          ) : (
            <button
              onClick={handleNext}
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              {t("next")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
      {label}
    </span>
  );
}
