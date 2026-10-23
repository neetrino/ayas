"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { SideSheet } from "@/components/ui/SideSheet";
import { useAdminCopy } from "@/features/admin/ui/admin-copy";
import type { AdminGalleryListItem } from "@/features/gallery/application/queries";
import {
  createSchoolGalleryItemAction,
  updateSchoolGalleryItemAction,
} from "@/features/gallery/application/manage-gallery";
import {
  collectGalleryTranslations,
  draftsFromGalleryTranslations,
  type GalleryLocaleDraft,
} from "@/features/gallery/domain/gallery-draft";
import type {
  GalleryCategory,
  GalleryKind,
  GalleryStatus,
} from "@/features/gallery/domain/gallery-rules";
import {
  GalleryCopyFields,
  GalleryImageField,
  GalleryLocaleTabs,
  GalleryProfileFields,
} from "@/features/gallery/ui/GalleryDrawerFields";
import { locales, type Locale } from "@/lib/i18n/config";

type GalleryDrawerProps = {
  locale: string;
  open: boolean;
  onClose: () => void;
  item?: AdminGalleryListItem | null;
};

function firstLocale(item: AdminGalleryListItem | null): Locale {
  if (!item) {
    return "en";
  }
  return locales.find((locale) => item.translations[locale]?.title) ?? "en";
}

function replacePreview(current: string | null, next: string | null): string | null {
  if (current?.startsWith("blob:")) {
    URL.revokeObjectURL(current);
  }
  return next;
}

function imageForm(file: File | null, removed: boolean): FormData | undefined {
  if (!file && !removed) {
    return undefined;
  }
  const form = new FormData();
  if (file) {
    form.set("image", file);
  }
  if (removed) {
    form.set("removeImage", "1");
  }
  return form;
}

export function GalleryDrawer({
  locale,
  open,
  onClose,
  item = null,
}: GalleryDrawerProps) {
  const copy = useAdminCopy();
  const router = useRouter();
  const isEdit = item != null;
  const [activeLocale, setActiveLocale] = useState<Locale>(() => firstLocale(item));
  const [drafts, setDrafts] = useState(() =>
    draftsFromGalleryTranslations(item?.translations),
  );
  const [category, setCategory] = useState<GalleryCategory>(() => item?.category ?? "classes");
  const [kind, setKind] = useState<GalleryKind>(() => item?.kind ?? "photo");
  const [videoUrl, setVideoUrl] = useState(() => item?.videoUrl ?? "");
  const [sortOrder, setSortOrder] = useState(() => (item ? String(item.sortOrder) : "0"));
  const [status, setStatus] = useState<GalleryStatus>(() => item?.status ?? "DRAFT");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(() => item?.imageUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateDraft(patch: Partial<GalleryLocaleDraft>): void {
    setDrafts((current) => ({
      ...current,
      [activeLocale]: { ...current[activeLocale], ...patch },
    }));
  }

  function submit(): void {
    const collected = collectGalleryTranslations(drafts);
    if (!collected.ok) {
      setError(collected.message);
      return;
    }
    const parsedOrder = Number(sortOrder);
    if (!Number.isInteger(parsedOrder)) {
      setError(copy.gallery.sortWhole);
      return;
    }

    const payload = {
      status,
      category,
      kind,
      sortOrder: parsedOrder,
      videoUrl: kind === "video" ? videoUrl : "",
      translations: collected.translations,
    };
    const mediaForm = imageForm(imageFile, imageRemoved);
    startTransition(async () => {
      setError(null);
      const result =
        isEdit && item
          ? await updateSchoolGalleryItemAction(locale, item.id, payload, mediaForm)
          : await createSchoolGalleryItemAction(locale, payload, mediaForm);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      onClose();
      router.refresh();
    });
  }

  return (
    <SideSheet
      open={open}
      onClose={onClose}
      ariaLabel={isEdit ? copy.gallery.edit : copy.gallery.add}
      panelClassName="w-full md:w-1/2 md:max-w-none"
    >
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {isEdit ? copy.gallery.edit : copy.gallery.add}
        </h2>
      </div>
      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={(formEvent) => {
          formEvent.preventDefault();
          submit();
        }}
      >
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <GalleryLocaleTabs active={activeLocale} onChange={setActiveLocale} />
          <GalleryCopyFields
            draft={drafts[activeLocale]}
            disabled={isPending}
            onChange={updateDraft}
          />
          <GalleryProfileFields
            category={category}
            kind={kind}
            videoUrl={videoUrl}
            sortOrder={sortOrder}
            status={status}
            disabled={isPending}
            onCategory={setCategory}
            onKind={setKind}
            onVideoUrl={setVideoUrl}
            onSortOrder={setSortOrder}
            onStatus={setStatus}
          />
          <GalleryImageField
            preview={imagePreview}
            disabled={isPending}
            onPick={(file) => {
              setImageFile(file);
              setImageRemoved(false);
              setImagePreview((current) => replacePreview(current, URL.createObjectURL(file)));
            }}
            onRemove={() => {
              setImageFile(null);
              setImageRemoved(true);
              setImagePreview((current) => replacePreview(current, null));
            }}
          />
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
          <Button type="button" variant="secondary" disabled={isPending} onClick={onClose}>
            {copy.common.cancel}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? copy.common.saving : copy.common.save}
          </Button>
        </div>
      </form>
    </SideSheet>
  );
}
