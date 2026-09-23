"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type PersonnelPhotoInputProps = {
  name?: string;
  initialPhotoUrl: string | null;
  alt: string;
  initials: string;
};

function getInitials(value: string): string {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function PersonnelPhotoInput({
  name = "photo",
  initialPhotoUrl,
  alt,
  initials,
}: PersonnelPhotoInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPhotoUrl);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  function openFilePicker() {
    inputRef.current?.click();
  }

  function clearObjectUrl() {
    if (!objectUrlRef.current) return;
    URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    clearObjectUrl();

    const nextUrl = URL.createObjectURL(file);
    objectUrlRef.current = nextUrl;
    setPreviewUrl(nextUrl);
    setSelectedFileName(file.name);
    setRemovePhoto(false);
  }

  function handleRemovePhoto() {
    clearObjectUrl();

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    setPreviewUrl(null);
    setSelectedFileName("");
    setRemovePhoto(true);
  }

  function handleRestorePhoto() {
    if (!initialPhotoUrl) return;
    setPreviewUrl(initialPhotoUrl);
    setRemovePhoto(false);
  }

  const hasPhoto = Boolean(previewUrl);
  const canRestore = Boolean(initialPhotoUrl && removePhoto);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={openFilePicker}
        className="group relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm outline-none transition hover:border-red-300 focus-visible:ring-4 focus-visible:ring-red-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-red-800 dark:focus-visible:ring-red-950/50"
        aria-label={hasPhoto ? "Cambiar fotografía" : "Agregar fotografía"}
      >
        {hasPhoto && previewUrl ? (
          <Image
            src={previewUrl}
            alt={alt}
            fill
            sizes="112px"
            unoptimized
            className="object-cover"
          />
        ) : (
          <span className="flex h-full w-full flex-col items-center justify-center gap-1.5 px-2 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-200">
              {getInitials(initials)}
            </span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Agregar foto
            </span>
          </span>
        )}

        <span className="absolute inset-0 flex items-end bg-gradient-to-t from-black/65 via-black/5 to-transparent opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="w-full px-2 py-2 text-center text-[11px] font-bold text-white">
            {hasPhoto ? "Cambiar foto" : "Agregar foto"}
          </span>
        </span>
      </button>

      <div className="min-w-0 flex-1">
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Fotografía del expediente
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            Haz clic sobre el cuadro para agregar o reemplazar la fotografía. PNG, JPG o WebP; máximo 5 MB.
          </p>
          {selectedFileName ? (
            <p className="mt-1 truncate text-xs font-medium text-slate-600 dark:text-slate-300">
              Seleccionada: {selectedFileName}
            </p>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openFilePicker}
            className="rounded-lg bg-red-700 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-red-800"
          >
            {hasPhoto ? "Cambiar foto" : "Agregar foto"}
          </button>

          {hasPhoto ? (
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Quitar foto
            </button>
          ) : null}

          {canRestore ? (
            <button
              type="button"
              onClick={handleRestorePhoto}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Restaurar foto actual
            </button>
          ) : null}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/png,image/jpeg,image/webp"
        onChange={handlePhotoChange}
        className="sr-only"
        tabIndex={-1}
      />
      <input type="hidden" name="removePhoto" value={removePhoto ? "true" : "false"} />
    </div>
  );
}
