"use client";

import { useMemo, useState, useTransition, type Dispatch, type SetStateAction } from "react";
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
  type EventLocaleDraft,
} from "@/features/events/domain/event-draft";
import {
  EVENT_GALLERY_LIMIT,
  type SchoolEventStatus,
} from "@/features/events/domain/event-rules";
import { CopyFields, LocaleTabs, ScheduleFields } from "@/features/events/ui/EventDrawerFields";
import { EventDrawerMedia } from "@/features/events/ui/EventDrawerMedia";
import { locales, type Locale } from "@/lib/i18n/config";

type PendingImage = {
  key: string;
  file: File;
  url: string;
};

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
    const collected = collectEventTranslations(drafts);
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

function buildMediaForm(input: {
  posterFile: File | null;
  posterRemoved: boolean;
  seatingFile: File | null;
  seatingRemoved: boolean;
  pendingGallery: readonly PendingImage[];
  removedGallery: readonly { key: string }[];
}): FormData {
  const mediaForm = new FormData();
  if (input.posterFile) {
    mediaForm.set("poster", input.posterFile);
  }
  if (input.posterRemoved) {
    mediaForm.set("removePoster", "1");
  }
  if (input.seatingFile) {
    mediaForm.set("seating", input.seatingFile);
  }
  if (input.seatingRemoved) {
    mediaForm.set("removeSeating", "1");
  }
  for (const item of input.pendingGallery) {
    mediaForm.append("gallery", item.file);
  }
  for (const item of input.removedGallery) {
    mediaForm.append("removeGallery", item.key);
  }
  return mediaForm;
}

function addGallery(
  files: File[],
  currentCount: number,
  setPendingGallery: Dispatch<SetStateAction<PendingImage[]>>,
): void {
  const room = EVENT_GALLERY_LIMIT - currentCount;
  const next = files.slice(0, Math.max(room, 0)).map((file) => ({
    key: `${file.name}-${file.size}-${crypto.randomUUID()}`,
    file,
    url: URL.createObjectURL(file),
  }));
  setPendingGallery((current) => [...current, ...next]);
}

function removeGallery(
  key: string,
  setGallery: Dispatch<SetStateAction<AdminEventListItem["gallery"]>>,
  setPendingGallery: Dispatch<SetStateAction<PendingImage[]>>,
): void {
  setPendingGallery((current) => {
    const removed = current.find((item) => item.key === key);
    if (removed) {
      URL.revokeObjectURL(removed.url);
    }
    return current.filter((item) => item.key !== key);
  });
  setGallery((current) => current.filter((item) => item.key !== key));
}
