"use client";

import { Pencil, Trash2 } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { fillAdmin } from "@/features/admin/ui/fill-admin";
import { ADMIN_BADGE } from "@/features/admin/ui/status-badge";
import type { AdminGalleryListItem } from "@/features/gallery/application/queries";
import type { GalleryCategory, GalleryKind } from "@/features/gallery/domain/gallery-rules";

type StatusLabels = { published: string; draft: string; archived: string };

type AdminGalleryListProps = {
  items: AdminGalleryListItem[];
  filtered: AdminGalleryListItem[];
  categoryLabels: Record<GalleryCategory, string>;
  kindLabels: Record<GalleryKind, string>;
  statusLabels: StatusLabels;
  photoLabel: string;
  editLabel: string;
  deleteLabel: string;
  emptyLabel: string;
  noMatchLabel: string;
  isPending: boolean;
  onEdit: (item: AdminGalleryListItem) => void;
  onDelete: (target: { id: string; title: string }) => void;
};

function statusBadgeClass(status: string): string {
  if (status === "PUBLISHED") return "bg-green-100 text-green-800";
  if (status === "DRAFT") return "bg-yellow-100 text-yellow-800";
  if (status === "ARCHIVED") return "bg-gray-100 text-gray-800";
  return "bg-gray-100 text-gray-800";
}

function statusLabel(status: string, labels: StatusLabels): string {
  if (status === "PUBLISHED") return labels.published;
  if (status === "DRAFT") return labels.draft;
  if (status === "ARCHIVED") return labels.archived;
  return status;
}

export function AdminGalleryList({
  items,
  filtered,
  categoryLabels,
  kindLabels,
  statusLabels,
  photoLabel,
  editLabel,
  deleteLabel,
  emptyLabel,
  noMatchLabel,
  isPending,
  onEdit,
  onDelete,
}: AdminGalleryListProps) {
  if (filtered.length === 0) {
    return (
      <Card className="rounded-xl p-8">
        <p className="text-center text-sm text-gray-600">
          {items.length === 0 ? emptyLabel : noMatchLabel}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {filtered.map((item) => (
        <Card key={item.id} className="rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-gray-400">
                    {photoLabel}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">{item.title}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {categoryLabels[item.category]} · {kindLabels[item.kind]}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1 sm:justify-end">
              <span className={`${ADMIN_BADGE} ${statusBadgeClass(item.status)}`}>
                {statusLabel(item.status, statusLabels)}
              </span>
              <button
                type="button"
                disabled={isPending}
                onClick={() => onEdit(item)}
                className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
                aria-label={fillAdmin(editLabel, { name: item.title })}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => onDelete({ id: item.id, title: item.title })}
                className="rounded p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
                aria-label={fillAdmin(deleteLabel, { name: item.title })}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
