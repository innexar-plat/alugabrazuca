"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { Upload, X, Star, GripVertical, ImagePlus, AlertCircle } from "lucide-react";

export interface UploadedPhoto {
  id: string;
  url: string;
  thumbnailUrl: string;
  filename: string;
  caption: string;
  isUploading?: boolean;
  progress?: number;
  error?: string;
}

interface PhotoUploadProps {
  photos: UploadedPhoto[];
  coverIndex: number;
  onChange: (photos: UploadedPhoto[] | ((prev: UploadedPhoto[]) => UploadedPhoto[])) => void;
  onCoverChange: (index: number) => void;
  maxPhotos?: number;
  minPhotos?: number;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function PhotoUpload({
  photos,
  coverIndex,
  onChange,
  onCoverChange,
  maxPhotos = 20,
  minPhotos = 3,
}: PhotoUploadProps) {
  const t = useTranslations("listing.create.photos");
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File): Promise<UploadedPhoto | null> => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        return {
          id: crypto.randomUUID(),
          url: "",
          thumbnailUrl: "",
          filename: file.name,
          caption: "",
          error: t("invalidType"),
        };
      }
      if (file.size > MAX_FILE_SIZE) {
        return {
          id: crypto.randomUUID(),
          url: "",
          thumbnailUrl: "",
          filename: file.name,
          caption: "",
          error: t("tooLarge"),
        };
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const data = await api.upload<{ url: string; thumbnailUrl: string; filename: string }>(
          "/listings/upload",
          formData,
        );

        return {
          id: crypto.randomUUID(),
          url: data.url,
          thumbnailUrl: data.thumbnailUrl,
          filename: data.filename,
          caption: "",
        };
      } catch (err) {
        return {
          id: crypto.randomUUID(),
          url: "",
          thumbnailUrl: "",
          filename: file.name,
          caption: "",
          error: (err as Error).message,
        };
      }
    },
    [t],
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remaining = maxPhotos - photos.length;
      const toUpload = fileArray.slice(0, remaining);

      if (toUpload.length === 0) return;

      // Add placeholders
      const placeholders: UploadedPhoto[] = toUpload.map((f) => ({
        id: crypto.randomUUID(),
        url: "",
        thumbnailUrl: "",
        filename: f.name,
        caption: "",
        isUploading: true,
      }));

      const updated = [...photos, ...placeholders];
      onChange(updated);

      // Upload all files
      const results = await Promise.all(toUpload.map((f) => uploadFile(f)));

      onChange((prev: UploadedPhoto[]) => {
        const newPhotos = [...prev];
        results.forEach((result, i) => {
          if (!result) return;
          const placeholderIndex = prev.findIndex((p) => p.id === placeholders[i].id);
          if (placeholderIndex !== -1) {
            newPhotos[placeholderIndex] = result;
          }
        });
        return newPhotos.filter((p) => !p.isUploading);
      });
    },
    [photos, maxPhotos, onChange, uploadFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles],
  );

  const handleRemove = useCallback(
    (index: number) => {
      const newPhotos = photos.filter((_, i) => i !== index);
      onChange(newPhotos);
      if (coverIndex >= newPhotos.length) {
        onCoverChange(Math.max(0, newPhotos.length - 1));
      } else if (index < coverIndex) {
        onCoverChange(coverIndex - 1);
      }
    },
    [photos, coverIndex, onChange, onCoverChange],
  );

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    const newPhotos = [...photos];
    const dragged = newPhotos[dragIndex];
    newPhotos.splice(dragIndex, 1);
    newPhotos.splice(index, 0, dragged);

    // Adjust cover index
    if (coverIndex === dragIndex) {
      onCoverChange(index);
    } else if (dragIndex < coverIndex && index >= coverIndex) {
      onCoverChange(coverIndex - 1);
    } else if (dragIndex > coverIndex && index <= coverIndex) {
      onCoverChange(coverIndex + 1);
    }

    setDragIndex(index);
    onChange(newPhotos);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
  const baseUrl = apiUrl.replace("/api/v1", "");

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all ${
          dragOver
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50"
        } ${photos.length >= maxPhotos ? "opacity-50 pointer-events-none" : ""}`}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-3">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">{t("dragDrop")}</p>
        <p className="text-xs text-muted-foreground">{t("formats")}</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Info bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {photos.filter((p) => !p.error).length}/{maxPhotos} {t("uploaded")}
        </span>
        {photos.filter((p) => !p.error).length < minPhotos && (
          <span className="flex items-center gap-1 text-amber-600">
            <AlertCircle className="h-3.5 w-3.5" />
            {t("minRequired", { min: minPhotos })}
          </span>
        )}
      </div>

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              draggable={!photo.isUploading && !photo.error}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`group relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                photo.isUploading
                  ? "border-muted animate-pulse"
                  : photo.error
                    ? "border-destructive/50"
                    : index === coverIndex
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-transparent hover:border-muted-foreground/30"
              } ${dragIndex === index ? "opacity-50 scale-95" : ""}`}
            >
              {photo.isUploading ? (
                <div className="flex h-full items-center justify-center bg-muted">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : photo.error ? (
                <div className="flex h-full flex-col items-center justify-center bg-destructive/5 p-2 text-center">
                  <AlertCircle className="h-5 w-5 text-destructive mb-1" />
                  <p className="text-[10px] text-destructive leading-tight">{photo.error}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate w-full">
                    {photo.filename}
                  </p>
                </div>
              ) : (
                <>
                  <img
                    src={`${baseUrl}${photo.url}`}
                    alt={photo.caption || photo.filename}
                    className="h-full w-full object-cover"
                  />
                  {/* Cover badge */}
                  {index === coverIndex && (
                    <div className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-full bg-primary px-2 py-0.5">
                      <Star className="h-3 w-3 text-primary-foreground fill-primary-foreground" />
                      <span className="text-[10px] font-semibold text-primary-foreground">
                        {t("cover")}
                      </span>
                    </div>
                  )}
                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors">
                    <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {index !== coverIndex && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCoverChange(index);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-amber-600 hover:bg-white shadow-sm"
                          title={t("setCover")}
                        >
                          <Star className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(index);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-destructive hover:bg-white shadow-sm"
                        title={t("remove")}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {/* Drag handle */}
                    <div className="absolute bottom-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-muted-foreground cursor-grab">
                        <GripVertical className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Add more button */}
          {photos.length < maxPhotos && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-[4/3] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
            >
              <ImagePlus className="h-6 w-6 mb-1" />
              <span className="text-xs">{t("addMore")}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
