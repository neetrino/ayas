"use client";

import { Pencil, Trash2 } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { fillAdmin } from "@/features/admin/ui/fill-admin";
import { ADMIN_BADGE } from "@/features/admin/ui/status-badge";
import type { AdminClassListItem } from "@/features/classes/application/queries";
import type {
  ClassAge,
  ClassDirection,
  ClassLevel,
} from "@/features/classes/domain/class-rules";

type StatusLabels = { published: string; draft: string; archived: string };

type FilterLabels = {
  directions: Record<ClassDirection, string>;
  ages: Record<ClassAge, string>;
  levels: Record<ClassLevel, string>;
};

type AdminClassListProps = {
  classes: AdminClassListItem[];
  filtered: AdminClassListItem[];
  labels: FilterLabels;
  statusLabels: StatusLabels;
  editLabel: string;
  deleteLabel: string;
  emptyLabel: string;
  noMatchLabel: string;
  isPending: boolean;
  onEdit: (schoolClass: AdminClassListItem) => void;
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

export function AdminClassList({
  classes,
  filtered,
  labels,
  statusLabels,
  editLabel,
  deleteLabel,
  emptyLabel,
  noMatchLabel,
  isPending,
  onEdit,
  onDelete,
}: AdminClassListProps) {
  if (filtered.length === 0) {
    return (
      <Card className="rounded-xl p-8">
        <p className="text-center text-sm text-gray-600">
          {classes.length === 0 ? emptyLabel : noMatchLabel}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {filtered.map((schoolClass) => (
        <Card
          key={schoolClass.id}
          className="rounded-xl border border-gray-200 p-4 shadow-sm"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                {schoolClass.title}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {labels.directions[schoolClass.direction]} · {labels.ages[schoolClass.age]} ·{" "}
                {labels.levels[schoolClass.level]}
              </p>
              <p className="mt-1 font-mono text-xs text-gray-400">{schoolClass.code}</p>
            </div>
            <div className="flex flex-wrap items-center gap-1 sm:justify-end">
              <span className={`${ADMIN_BADGE} ${statusBadgeClass(schoolClass.status)}`}>
                {statusLabel(schoolClass.status, statusLabels)}
              </span>
              <button
                type="button"
                disabled={isPending}
                onClick={() => onEdit(schoolClass)}
                className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
                aria-label={fillAdmin(editLabel, { name: schoolClass.title })}
              >
                <Pencil className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  onDelete({ id: schoolClass.id, title: schoolClass.title })
                }
                className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600 disabled:opacity-50"
                aria-label={fillAdmin(deleteLabel, { name: schoolClass.title })}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
