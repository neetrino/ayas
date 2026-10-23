"use client";

import { useRef } from "react";

import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { ADMIN_INPUT, ADMIN_LABEL } from "@/features/admin/ui/admin-form-classes";
import {
  BLOG_CATEGORIES,
  BLOG_CATEGORY_ADMIN_LABELS,
  BLOG_GALLERY_LIMIT,
  BLOG_RELATED_LIMIT,
  isBlogCategory,
  type BlogCategory,
} from "@/features/blog/domain/blog-article";
import type { BlogGalleryItem } from "@/features/blog/application/queries";

type RelatedOption = {
  id: string;
  title: string;
};

type PendingGallery = {
  key: string;
  url: string;
};

type BlogPostExtrasProps = {
  disabled: boolean;
  category: BlogCategory;
  onCategoryChange: (category: BlogCategory) => void;
  videoUrl: string;
  onVideoUrlChange: (value: string) => void;
  relatedPostIds: string[];
  relatedOptions: readonly RelatedOption[];
  onToggleRelated: (id: string) => void;
  gallery: readonly BlogGalleryItem[];
  pendingGallery: readonly PendingGallery[];
  onAddGallery: (files: File[]) => void;
  onRemoveGallery: (id: string) => void;
  onRemovePending: (key: string) => void;
};

export function BlogPostExtras({
  disabled,
  category,
  onCategoryChange,
  videoUrl,
  onVideoUrlChange,
  relatedPostIds,
  relatedOptions,
  onToggleRelated,
  gallery,
  pendingGallery,
  onAddGallery,
  onRemoveGallery,
  onRemovePending,
}: BlogPostExtrasProps) {
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const galleryCount = gallery.length + pendingGallery.length;

  return (
    <>
      <div>
        <span className={ADMIN_LABEL}>Category</span>
        <SelectDropdown
          ariaLabel="Category"
          value={category}
          options={BLOG_CATEGORIES.map((value) => ({
            value,
            label: BLOG_CATEGORY_ADMIN_LABELS[value],
          }))}
          disabled={disabled}
          deferChange={false}
          className="mt-1"
          onValueChange={(next) => {
            if (isBlogCategory(next)) {
              onCategoryChange(next);
            }
          }}
        />
      </div>

      <label className="block">
        <span className={ADMIN_LABEL}>Video</span>
        <input
          value={videoUrl}
          onChange={(event) => onVideoUrlChange(event.target.value)}
          placeholder="https://www.youtube.com/watch?v=…"
          className={ADMIN_INPUT}
          disabled={disabled}
        />
        <span className="mt-1 block text-xs text-gray-500">
          YouTube or Vimeo link. Leave empty if this post has no video.
        </span>
      </label>

      <div>
        <span className={ADMIN_LABEL}>Gallery</span>
        <div className="mt-1">
          <button
            type="button"
            disabled={disabled || galleryCount >= BLOG_GALLERY_LIMIT}
            onClick={() => galleryInputRef.current?.click()}
            className="inline-flex items-center rounded-xl border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50"
          >
            + Add images
          </button>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            disabled={disabled}
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              event.target.value = "";
              onAddGallery(files);
            }}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Up to {BLOG_GALLERY_LIMIT} images, 5MB each.
        </p>
        <GalleryPreviews
          gallery={gallery}
          pendingGallery={pendingGallery}
          disabled={disabled}
          onRemoveGallery={onRemoveGallery}
          onRemovePending={onRemovePending}
        />
      </div>

      <fieldset>
        <legend className={ADMIN_LABEL}>Related articles</legend>
        {relatedOptions.length === 0 ? (
          <p className="mt-1 text-xs text-gray-500">
            Save another post first, then you can relate it here.
          </p>
        ) : (
          <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto">
            {relatedOptions.map((option) => {
              const checked = relatedPostIds.includes(option.id);
              const locked =
                !checked && relatedPostIds.length >= BLOG_RELATED_LIMIT;
              return (
                <li key={option.id}>
                  <label className="flex items-start gap-2 text-sm text-gray-800">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled || locked}
                      onChange={() => onToggleRelated(option.id)}
                    />
                    <span>{option.title}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Choose up to {BLOG_RELATED_LIMIT}. If none are chosen, the public page
          shows other posts from the same category.
        </p>
      </fieldset>
    </>
  );
}

function GalleryPreviews({
  gallery,
  pendingGallery,
  disabled,
  onRemoveGallery,
  onRemovePending,
}: Pick<
  BlogPostExtrasProps,
  | "gallery"
  | "pendingGallery"
  | "disabled"
  | "onRemoveGallery"
  | "onRemovePending"
>) {
  if (gallery.length === 0 && pendingGallery.length === 0) {
    return null;
  }

  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {gallery.map((item) => (
        <li key={item.id} className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
          <img
            src={item.url}
            alt=""
            className="h-16 w-16 rounded-lg object-cover"
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => onRemoveGallery(item.id)}
            className="absolute -top-1 -right-1 rounded-full bg-white px-1 text-xs text-red-600"
          >
            ×
          </button>
        </li>
      ))}
      {pendingGallery.map((item) => (
        <li key={item.key} className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
          <img
            src={item.url}
            alt=""
            className="h-16 w-16 rounded-lg object-cover"
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => onRemovePending(item.key)}
            className="absolute -top-1 -right-1 rounded-full bg-white px-1 text-xs text-red-600"
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  );
}
