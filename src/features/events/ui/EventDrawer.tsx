"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { SideSheet } from "@/components/ui/SideSheet";
import type { AdminEventListItem } from "@/features/events/application/queries";
import {
  createSchoolEventAction,
  updateSchoolEventAction,
} from "@/features/events/application/manage-events";
import {
  collectEventTranslations,
  draftsFromTranslations,
  sharedEventSlug,
  suggestedEventSlug,
  type EventLocaleDraft,
} from "@/features/events/domain/event-draft";
import type { SchoolEventStatus } from "@/features/events/domain/event-rules";
import {
  CopyFields,
  LocaleTabs,
  ScheduleFields,
  SlugField,
} from "@/features/events/ui/EventDrawerFields";
import { EventDrawerMedia } from "@/features/events/ui/EventDrawerMedia";
import {
  addGallery,
  buildMediaForm,
  removeGallery,
  type PendingImage,
} from "@/features/events/ui/event-drawer-media";
import { locales, type Locale } from "@/lib/i18n/config";

type EventDrawerProps = {
  locale: string;
  open: boolean;
  onClose: () => void;
  event?: AdminEventListItem | null;
};

function firstLocale(event: AdminEventListItem | null): Locale {
  if (!event) {
    return "en";
  }
  return locales.find((locale) => event.translations[locale]?.name) ?? "en";
}

function replacePreview(current: string | null, next: string | null): string | null {
  if (current?.startsWith("blob:")) {
    URL.revokeObjectURL(current);
  }
  return next;
}

export function EventDrawer({
  locale,
  open,
  onClose,
  event = null,
}: EventDrawerProps) {
  const router = useRouter();
  const isEdit = event != null;
  const [activeLocale, setActiveLocale] = useState<Locale>(() => firstLocale(event));
  const [drafts, setDrafts] = useState(() => draftsFromTranslations(event?.translations));
  const [slug, setSlug] = useState(() => sharedEventSlug(event?.translations));
  const [slugTouched, setSlugTouched] = useState(
    () => sharedEventSlug(event?.translations).length > 0,
  );
  const [status, setStatus] = useState<SchoolEventStatus>(() => event?.status ?? "DRAFT");
  const [date, setDate] = useState(() => event?.date ?? "");
  const [startTime, setStartTime] = useState(() => event?.startTime ?? "");
  const [duration, setDuration] = useState(() => (event ? String(event.durationMinutes) : "90"));
  const [price, setPrice] = useState(() => (event ? String(event.priceAmount) : ""));
  const [age, setAge] = useState(() => event?.ageRestriction ?? "");
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterRemoved, setPosterRemoved] = useState(false);
  const [posterPreview, setPosterPreview] = useState<string | null>(
    () => event?.posterUrl ?? null,
  );
  const [seatingFile, setSeatingFile] = useState<File | null>(null);
  const [seatingRemoved, setSeatingRemoved] = useState(false);
  const [seatingPreview, setSeatingPreview] = useState<string | null>(
    () => event?.seatingPlanUrl ?? null,
  );
  const [gallery, setGallery] = useState(() => event?.gallery ?? []);
  const [pendingGallery, setPendingGallery] = useState<PendingImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const slugValue = slugTouched ? slug : suggestedEventSlug(drafts);
  const galleryPreview = useMemo(
    () => [
      ...gallery.map((item) => ({ key: item.key, url: item.url })),
      ...pendingGallery.map((item) => ({ key: item.key, url: item.url })),
    ],
    [gallery, pendingGallery],
  );

  function updateDraft(patch: Partial<EventLocaleDraft>): void {
    setDrafts((current) => ({
      ...current,
      [activeLocale]: { ...current[activeLocale], ...patch },
    }));
  }

  function submit(): void {
    const collected = collectEventTranslations(drafts, slugValue);
    if (!collected.ok) {
      setError(collected.message);
      return;
    }
    const durationMinutes = Number(duration);
    const priceAmount = Number(price);
    if (!Number.isInteger(durationMinutes) || !Number.isInteger(priceAmount)) {
      setError("Duration and price must be whole numbers.");
      return;
    }

    const mediaForm = buildMediaForm({
      posterFile,
      posterRemoved,
      seatingFile,
      seatingRemoved,
      pendingGallery,
      removedGallery: (event?.gallery ?? []).filter(
        (item) => !gallery.some((current) => current.key === item.key),
      ),
    });

    startTransition(async () => {
      setError(null);
      const payload = {
        status,
        date,
        startTime,
        durationMinutes,
        priceAmount,
        slug: slugValue,
        ageRestriction: age,
        translations: collected.translations,
      };
      const result =
        isEdit && event
          ? await updateSchoolEventAction(locale, event.id, payload, mediaForm)
          : await createSchoolEventAction(locale, payload, mediaForm);
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
      ariaLabel={isEdit ? "Edit event" : "Add event"}
      panelClassName="w-full md:w-1/2 md:max-w-none"
    >
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {isEdit ? "Edit event" : "Add event"}
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
          <LocaleTabs active={activeLocale} onChange={setActiveLocale} />
          <CopyFields draft={drafts[activeLocale]} disabled={isPending} onChange={updateDraft} />
          <SlugField
            value={slugValue}
            disabled={isPending}
            onChange={(value) => {
              setSlugTouched(true);
              setSlug(value);
            }}
          />
          <ScheduleFields
            date={date}
            startTime={startTime}
            duration={duration}
            price={price}
            age={age}
            status={status}
            disabled={isPending}
            onDate={setDate}
            onStartTime={setStartTime}
            onDuration={setDuration}
            onPrice={setPrice}
            onAge={setAge}
            onStatus={setStatus}
          />
          <EventDrawerMedia
            disabled={isPending}
            posterUrl={posterPreview}
            seatingUrl={seatingPreview}
            gallery={galleryPreview}
            onPoster={(file) => {
              setPosterFile(file);
              setPosterRemoved(false);
              setPosterPreview((current) =>
                replacePreview(current, file ? URL.createObjectURL(file) : (event?.posterUrl ?? null)),
              );
            }}
            onRemovePoster={() => {
              setPosterFile(null);
              setPosterRemoved(true);
              setPosterPreview((current) => replacePreview(current, null));
            }}
            onSeating={(file) => {
              setSeatingFile(file);
              setSeatingRemoved(false);
              setSeatingPreview((current) =>
                replacePreview(
                  current,
                  file ? URL.createObjectURL(file) : (event?.seatingPlanUrl ?? null),
                ),
              );
            }}
            onRemoveSeating={() => {
              setSeatingFile(null);
              setSeatingRemoved(true);
              setSeatingPreview((current) => replacePreview(current, null));
            }}
            onAddGallery={(files) => addGallery(files, galleryPreview.length, setPendingGallery)}
            onRemoveGallery={(key) => removeGallery(key, setGallery, setPendingGallery)}
          />
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </SideSheet>
  );
}
