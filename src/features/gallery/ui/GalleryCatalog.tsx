"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import {
  galleryItemMatches,
  type GalleryFilter,
} from "@/features/gallery/domain/filter-gallery";
import {
  isGalleryCategory,
  isGalleryKind,
  type GalleryCategory,
  type GalleryKind,
} from "@/features/gallery/domain/gallery-item";
import type { GalleryPlayback } from "@/features/gallery/domain/gallery-playback";
import { GalleryLightbox } from "@/features/gallery/ui/GalleryLightbox";

export type GalleryCatalogItem = {
  slug: string;
  title: string;
  alt: string;
  categoryId: GalleryCategory;
  kind: GalleryKind;
  category: string;
  imageSrc: string;
  playback: GalleryPlayback | null;
};

type FilterOption = {
  id: string;
  label: string;
};

export type GalleryFilterGroup = {
  id: "category" | "kind";
  label: string;
  options: readonly FilterOption[];
};

type GalleryCatalogProps = {
  filtersLabel: string;
  empty: string;
  viewerLabel: string;
  closeLabel: string;
  previousLabel: string;
  nextLabel: string;
  groups: readonly GalleryFilterGroup[];
  items: readonly GalleryCatalogItem[];
};

const OPEN_FILTERS: GalleryFilter = { category: "any", kind: "any" };

export function GalleryCatalog({
  filtersLabel,
  empty,
  viewerLabel,
  closeLabel,
  previousLabel,
  nextLabel,
  groups,
  items,
}: GalleryCatalogProps) {
  const [filters, setFilters] = useState(OPEN_FILTERS);
  const [active, setActive] = useState<number | null>(null);
  const visible = useMemo(
    () =>
      items.filter((item) =>
        galleryItemMatches(
          { category: item.categoryId, kind: item.kind },
          filters,
        ),
      ),
    [filters, items],
  );

  return (
    <section aria-label={filtersLabel} className="bg-white">
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-8 lg:px-[84px] lg:py-16">
        <div className="grid gap-6">
          {groups.map((group) => (
            <FilterGroup
              key={group.id}
              group={group}
              value={filters[group.id]}
              onChange={(value) => {
                setActive(null);
                setFilters((current) => nextFilter(current, group.id, value));
              }}
            />
          ))}
        </div>
        <GalleryGrid items={visible} empty={empty} onOpen={setActive} />
      </div>
      {active === null ? null : (
        <GalleryLightbox
          items={visible}
          startIndex={active}
          label={viewerLabel}
          closeLabel={closeLabel}
          previousLabel={previousLabel}
          nextLabel={nextLabel}
          onClose={() => setActive(null)}
        />
      )}
    </section>
  );
}

function nextFilter(
  current: GalleryFilter,
  id: GalleryFilterGroup["id"],
  value: string,
): GalleryFilter {
  if (id === "category") {
    return {
      ...current,
      category: isGalleryCategory(value) ? value : "any",
    };
  }

  return { ...current, kind: isGalleryKind(value) ? value : "any" };
}

function FilterGroup({
  group,
  value,
  onChange,
}: {
  group: GalleryFilterGroup;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="text-sm font-semibold tracking-[0.02em] text-black/60">
        {group.label}
      </legend>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {group.options.map((option) => (
          <FilterOption
            key={option.id}
            label={option.label}
            pressed={option.id === value}
            onSelect={() => onChange(option.id)}
          />
        ))}
      </div>
    </fieldset>
  );
}

function FilterOption({
  label,
  pressed,
  onSelect,
}: {
  label: string;
  pressed: boolean;
  onSelect: () => void;
}) {
  const tone = pressed
    ? "border-black bg-black text-white"
    : "border-black/15 bg-white text-[#030303]";

  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onSelect}
      className={`inline-flex h-11 shrink-0 items-center rounded-full border px-4 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${tone}`}
    >
      {label}
    </button>
  );
}

function GalleryGrid({
  items,
  empty,
  onOpen,
}: {
  items: readonly GalleryCatalogItem[];
  empty: string;
  onOpen: (index: number) => void;
}) {
  if (items.length === 0) {
    return (
      <p className="mt-10 text-lg" role="status">
        {empty}
      </p>
    );
  }

  return (
    <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item, index) => (
        <li key={item.slug}>
          <GalleryTile item={item} onOpen={() => onOpen(index)} />
        </li>
      ))}
    </ul>
  );
}

function GalleryTile({
  item,
  onOpen,
}: {
  item: GalleryCatalogItem;
  onOpen: () => void;
}) {
  return (
    <figure>
      <button
        type="button"
        aria-label={`${item.title}, ${item.category}`}
        onClick={onOpen}
        className="relative block aspect-[4/3] w-full overflow-hidden rounded-lg bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
      >
        <Image
          src={item.imageSrc}
          alt=""
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-cover"
        />
        {item.playback ? <PlayBadge /> : null}
      </button>
      <figcaption className="mt-2">
        <span className="block text-sm font-medium text-[#030303]">{item.title}</span>
        <span className="block text-sm text-black/55">{item.category}</span>
      </figcaption>
    </figure>
  );
}

function PlayBadge() {
  return (
    <span className="pointer-events-none absolute inset-0 grid place-items-center">
      <span className="grid size-12 place-items-center rounded-full bg-black/70 text-white">
        <Play aria-hidden className="size-5 fill-white" />
      </span>
    </span>
  );
}
