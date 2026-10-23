"use client";

import { EVENT_GALLERY_LIMIT } from "@/features/events/domain/event-rules";
import { ADMIN_LABEL } from "@/features/admin/ui/admin-form-classes";

type Preview = {
  key: string;
  url: string;
};

type EventDrawerMediaProps = {
  disabled: boolean;
  posterUrl: string | null;
  seatingUrl: string | null;
  gallery: readonly Preview[];
  onPoster: (file: File | null) => void;
  onRemovePoster: () => void;
  onSeating: (file: File | null) => void;
  onRemoveSeating: () => void;
  onAddGallery: (files: File[]) => void;
  onRemoveGallery: (key: string) => void;
};

function ImageField({
  label,
  url,
  disabled,
  onFile,
  onRemove,
}: {
  label: string;
  url: string | null;
  disabled: boolean;
  onFile: (file: File | null) => void;
  onRemove: () => void;
}) {
  return (
    <div>
      <span className={ADMIN_LABEL}>{label}</span>
      <div className="mt-1 flex items-center gap-3">
        <div className="h-16 w-16 overflow-hidden rounded-lg bg-gray-100">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <label className="inline-flex cursor-pointer items-center rounded-xl border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50">
          Choose image
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={disabled}
            onChange={(event) => {
              onFile(event.target.files?.[0] ?? null);
              event.target.value = "";
            }}
          />
        </label>
        {url ? (
          <button
            type="button"
            disabled={disabled}
            onClick={onRemove}
            className="text-sm text-red-600 hover:underline disabled:opacity-50"
          >
            Remove
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function EventDrawerMedia({
  disabled,
  posterUrl,
  seatingUrl,
  gallery,
  onPoster,
  onRemovePoster,
  onSeating,
  onRemoveSeating,
  onAddGallery,
  onRemoveGallery,
}: EventDrawerMediaProps) {
  return (
    <div className="space-y-4">
      <ImageField
        label="Poster"
        url={posterUrl}
        disabled={disabled}
        onFile={onPoster}
        onRemove={onRemovePoster}
      />
      <ImageField
        label="Seating plan"
        url={seatingUrl}
        disabled={disabled}
        onFile={onSeating}
        onRemove={onRemoveSeating}
      />
      <div>
        <span className={ADMIN_LABEL}>Gallery</span>
        <ul className="mt-2 flex flex-wrap gap-2">
          {gallery.map((item) => (
            <li key={item.key} className="relative h-16 w-16">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt=""
                className="h-full w-full rounded-lg object-cover"
              />
              <button
                type="button"
                disabled={disabled}
                onClick={() => onRemoveGallery(item.key)}
                className="absolute -top-1 -right-1 rounded-full bg-white px-1.5 text-xs text-red-600 shadow"
                aria-label="Remove gallery image"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <label className="mt-2 inline-flex cursor-pointer items-center rounded-xl border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50">
          Add photos
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="sr-only"
            disabled={disabled || gallery.length >= EVENT_GALLERY_LIMIT}
            onChange={(event) => {
              onAddGallery([...(event.target.files ?? [])]);
              event.target.value = "";
            }}
          />
        </label>
        <span className="mt-1 block text-xs text-gray-500">
          Up to {EVENT_GALLERY_LIMIT} images.
        </span>
      </div>
    </div>
  );
}
