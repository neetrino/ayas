"use client";

import { useAdminCopy } from "@/features/admin/ui/admin-copy";
import { ADMIN_INPUT, ADMIN_LABEL } from "@/features/admin/ui/admin-form-classes";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import type { GalleryLocaleDraft } from "@/features/gallery/domain/gallery-draft";
import { GALLERY_CATEGORIES, GALLERY_KINDS } from "@/features/gallery/domain/gallery-item";
import type {
  GalleryCategory,
  GalleryKind,
  GalleryStatus,
} from "@/features/gallery/domain/gallery-rules";
import { localeLabels, locales, type Locale } from "@/lib/i18n/config";

export function GalleryLocaleTabs({
  active,
  onChange,
}: {
  active: Locale;
  onChange: (locale: Locale) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => onChange(locale)}
          className={`rounded-xl px-3 py-1.5 text-sm font-medium ${
            locale === active
              ? "bg-gray-900 text-white"
              : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          {localeLabels[locale]}
        </button>
      ))}
    </div>
  );
}

export function GalleryCopyFields({
  draft,
  disabled,
  onChange,
}: {
  draft: GalleryLocaleDraft;
  disabled: boolean;
  onChange: (patch: Partial<GalleryLocaleDraft>) => void;
}) {
  const copy = useAdminCopy();
  return (
    <div className="space-y-4">
      <label className="block">
        <span className={ADMIN_LABEL}>{copy.common.title}</span>
        <input
          value={draft.title}
          disabled={disabled}
          onChange={(event) => onChange({ title: event.target.value })}
          className={ADMIN_INPUT}
        />
      </label>
      <label className="block">
        <span className={ADMIN_LABEL}>{copy.gallery.alt}</span>
        <input
          value={draft.alt}
          disabled={disabled}
          onChange={(event) => onChange({ alt: event.target.value })}
          className={ADMIN_INPUT}
        />
      </label>
    </div>
  );
}

type GalleryProfileFieldsProps = {
  category: GalleryCategory;
  kind: GalleryKind;
  videoUrl: string;
  sortOrder: string;
  status: GalleryStatus;
  disabled: boolean;
  onCategory: (value: GalleryCategory) => void;
  onKind: (value: GalleryKind) => void;
  onVideoUrl: (value: string) => void;
  onSortOrder: (value: string) => void;
  onStatus: (value: GalleryStatus) => void;
};

export function GalleryProfileFields({
  category,
  kind,
  videoUrl,
  sortOrder,
  status,
  disabled,
  onCategory,
  onKind,
  onVideoUrl,
  onSortOrder,
  onStatus,
}: GalleryProfileFieldsProps) {
  const copy = useAdminCopy();
  return (
    <div className="space-y-4">
      <div>
        <span className={ADMIN_LABEL}>{copy.gallery.category}</span>
        <SelectDropdown
          ariaLabel={copy.gallery.category}
          value={category}
          options={GALLERY_CATEGORIES.map((item) => ({
            label: copy.gallery.categories[item],
            value: item,
          }))}
          disabled={disabled}
          deferChange={false}
          className="mt-1"
          onValueChange={(next) => onCategory(next as GalleryCategory)}
        />
      </div>
      <div>
        <span className={ADMIN_LABEL}>{copy.gallery.kind}</span>
        <SelectDropdown
          ariaLabel={copy.gallery.kind}
          value={kind}
          options={GALLERY_KINDS.map((item) => ({
            label: copy.gallery.kinds[item],
            value: item,
          }))}
          disabled={disabled}
          deferChange={false}
          className="mt-1"
          onValueChange={(next) => onKind(next as GalleryKind)}
        />
      </div>
      {kind === "video" ? (
        <label className="block">
          <span className={ADMIN_LABEL}>{copy.gallery.videoUrl}</span>
          <input
            value={videoUrl}
            disabled={disabled}
            placeholder={copy.gallery.videoHelp}
            onChange={(event) => onVideoUrl(event.target.value)}
            className={ADMIN_INPUT}
          />
          <span className="mt-1 block text-xs text-gray-500">{copy.gallery.videoHelp}</span>
        </label>
      ) : null}
      <label className="block">
        <span className={ADMIN_LABEL}>{copy.common.sortOrder}</span>
        <input
          inputMode="numeric"
          value={sortOrder}
          disabled={disabled}
          onChange={(event) => onSortOrder(event.target.value)}
          className={ADMIN_INPUT}
        />
      </label>
      <div>
        <span className={ADMIN_LABEL}>{copy.common.status}</span>
        <SelectDropdown
          ariaLabel={copy.common.status}
          value={status}
          options={[
            { label: copy.common.draft, value: "DRAFT" },
            { label: copy.common.published, value: "PUBLISHED" },
            { label: copy.common.archived, value: "ARCHIVED" },
          ]}
          disabled={disabled}
          deferChange={false}
          className="mt-1"
          onValueChange={(next) => onStatus(next as GalleryStatus)}
        />
      </div>
    </div>
  );
}

export function GalleryImageField({
  preview,
  disabled,
  onPick,
  onRemove,
}: {
  preview: string | null;
  disabled: boolean;
  onPick: (file: File) => void;
  onRemove: () => void;
}) {
  const copy = useAdminCopy();
  return (
    <div className="space-y-3">
      <span className={ADMIN_LABEL}>{copy.gallery.image}</span>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="h-40 w-56 rounded-lg object-cover" />
      ) : (
        <p className="text-sm text-gray-500">{copy.gallery.noImage}</p>
      )}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        disabled={disabled}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onPick(file);
          }
        }}
        className="block text-sm text-gray-700"
      />
      {preview ? (
        <button
          type="button"
          disabled={disabled}
          onClick={onRemove}
          className="text-sm font-medium text-red-700"
        >
          {copy.common.remove}
        </button>
      ) : null}
    </div>
  );
}
