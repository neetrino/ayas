"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type RefObject,
  type SetStateAction,
} from "react";

import {
  galleryEmbedAutoplay,
  type GalleryPlayback,
} from "@/features/gallery/domain/gallery-playback";

export type GalleryLightboxItem = {
  slug: string;
  title: string;
  alt: string;
  imageSrc: string;
  playback: GalleryPlayback | null;
};

type GalleryLightboxProps = {
  items: readonly GalleryLightboxItem[];
  startIndex: number;
  label: string;
  closeLabel: string;
  previousLabel: string;
  nextLabel: string;
  onClose: () => void;
};

export function GalleryLightbox({
  items,
  startIndex,
  label,
  closeLabel,
  previousLabel,
  nextLabel,
  onClose,
}: GalleryLightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(startIndex);
  const item = items[index];

  useLightboxDialog(dialogRef);
  useLightboxKeys(items.length, setIndex);

  if (!item) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label={label}
      className="m-0 h-dvh max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-black/80"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div
        className="flex h-full w-full items-center justify-center p-4"
        onClick={onClose}
      >
        <LightboxStage
          item={item}
          closeLabel={closeLabel}
          previousLabel={previousLabel}
          nextLabel={nextLabel}
          showNav={items.length > 1}
          onClose={onClose}
          onPrevious={() => setIndex((current) => neighbor(current, -1, items.length))}
          onNext={() => setIndex((current) => neighbor(current, 1, items.length))}
        />
      </div>
    </dialog>
  );
}

function useLightboxDialog(dialogRef: RefObject<HTMLDialogElement | null>) {
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) {
      return;
    }
    dialog.showModal();
    return () => {
      if (dialog.open) {
        dialog.close();
      }
    };
  }, [dialogRef]);
}

function useLightboxKeys(
  length: number,
  setIndex: Dispatch<SetStateAction<number>>,
) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (length < 2) {
        return;
      }
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
        return;
      }
      event.preventDefault();
      const step = event.key === "ArrowRight" ? 1 : -1;
      setIndex((current) => neighbor(current, step, length));
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [length, setIndex]);
}

function LightboxStage({
  item,
  closeLabel,
  previousLabel,
  nextLabel,
  showNav,
  onClose,
  onPrevious,
  onNext,
}: {
  item: GalleryLightboxItem;
  closeLabel: string;
  previousLabel: string;
  nextLabel: string;
  showNav: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div
      className="relative w-full max-w-5xl"
      onClick={(event) => event.stopPropagation()}
    >
      <IconButton label={closeLabel} className="absolute top-2 right-2 z-10" onClick={onClose}>
        <X aria-hidden className="size-5" />
      </IconButton>
      <LightboxFrame item={item} />
      <p aria-live="polite" className="mt-3 text-center text-base text-white">
        {item.title}
      </p>
      {showNav ? (
        <IconButton
          label={previousLabel}
          className="absolute top-1/2 left-2 -translate-y-1/2"
          onClick={onPrevious}
        >
          <ChevronLeft aria-hidden className="size-5" />
        </IconButton>
      ) : null}
      {showNav ? (
        <IconButton
          label={nextLabel}
          className="absolute top-1/2 right-2 -translate-y-1/2"
          onClick={onNext}
        >
          <ChevronRight aria-hidden className="size-5" />
        </IconButton>
      ) : null}
    </div>
  );
}

function LightboxFrame({ item }: { item: GalleryLightboxItem }) {
  if (item.playback?.kind === "file") {
    return (
      <video
        key={item.slug}
        src={item.playback.src}
        poster={item.imageSrc}
        controls
        autoPlay
        playsInline
        className="max-h-[78vh] w-full bg-black"
      />
    );
  }

  if (item.playback?.kind === "embed") {
    return (
      <iframe
        key={item.slug}
        src={galleryEmbedAutoplay(item.playback.src)}
        title={item.title}
        className="aspect-video w-full bg-black"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  }

  return (
    <div className="relative h-[min(78vh,760px)] w-full bg-black">
      <Image
        src={item.imageSrc}
        alt={item.alt}
        fill
        sizes="90vw"
        className="object-contain"
      />
    </div>
  );
}

function IconButton({
  label,
  className,
  onClick,
  children,
}: {
  label: string;
  className: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`grid size-11 place-items-center rounded-full bg-black/70 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${className}`}
    >
      {children}
    </button>
  );
}

function neighbor(index: number, step: number, length: number): number {
  return (index + step + length) % length;
}
