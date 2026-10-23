import type { Dispatch, SetStateAction } from "react";

import type { AdminEventListItem } from "@/features/events/application/queries";
import { EVENT_GALLERY_LIMIT } from "@/features/events/domain/event-rules";

export type PendingImage = {
  key: string;
  file: File;
  url: string;
};

export function buildMediaForm(input: {
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

export function addGallery(
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

export function removeGallery(
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
