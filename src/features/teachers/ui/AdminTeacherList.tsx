"use client";

import { Pencil, Star, Trash2 } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { fillAdmin } from "@/features/admin/ui/fill-admin";
import { ADMIN_BADGE } from "@/features/admin/ui/status-badge";
import type { AdminTeacherListItem } from "@/features/teachers/application/queries";
import type { TeacherRole } from "@/features/teachers/domain/teacher-rules";

type StatusLabels = { published: string; draft: string; archived: string };

type AdminTeacherListProps = {
  teachers: AdminTeacherListItem[];
  filtered: AdminTeacherListItem[];
  roleLabels: Record<TeacherRole, string>;
  statusLabels: StatusLabels;
  classesLabel: string;
  photoLabel: string;
  showOnHomeLabel: string;
  hideFromHomeLabel: string;
  editLabel: string;
  deleteLabel: string;
  emptyLabel: string;
  noMatchLabel: string;
  isPending: boolean;
  onFeature: (teacher: AdminTeacherListItem) => void;
  onEdit: (teacher: AdminTeacherListItem) => void;
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

export function AdminTeacherList({
  teachers,
  filtered,
  roleLabels,
  statusLabels,
  classesLabel,
  photoLabel,
  showOnHomeLabel,
  hideFromHomeLabel,
  editLabel,
  deleteLabel,
  emptyLabel,
  noMatchLabel,
  isPending,
  onFeature,
  onEdit,
  onDelete,
}: AdminTeacherListProps) {
  if (filtered.length === 0) {
    return (
      <Card className="rounded-xl p-8">
        <p className="text-center text-sm text-gray-600">
          {teachers.length === 0 ? emptyLabel : noMatchLabel}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {filtered.map((teacher) => (
        <Card
          key={teacher.id}
          className="rounded-xl border border-gray-200 p-4 shadow-sm"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {teacher.portraitUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={teacher.portraitUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-gray-400">
                    {photoLabel}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {teacher.name}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {roleLabels[teacher.role]} ·{" "}
                  {fillAdmin(classesLabel, { count: teacher.classIds.length })}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1 sm:justify-end">
              <span className={`${ADMIN_BADGE} ${statusBadgeClass(teacher.status)}`}>
                {statusLabel(teacher.status, statusLabels)}
              </span>
              <button
                type="button"
                disabled={isPending}
                aria-pressed={teacher.isFeatured}
                onClick={() => onFeature(teacher)}
                className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-amber-500 disabled:opacity-50"
                aria-label={fillAdmin(
                  teacher.isFeatured ? hideFromHomeLabel : showOnHomeLabel,
                  { name: teacher.name },
                )}
              >
                <Star
                  className={`h-4 w-4 ${teacher.isFeatured ? "fill-amber-400 text-amber-400" : ""}`}
                  aria-hidden
                />
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => onEdit(teacher)}
                className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
                aria-label={fillAdmin(editLabel, { name: teacher.name })}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => onDelete({ id: teacher.id, title: teacher.name })}
                className="rounded p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
                aria-label={fillAdmin(deleteLabel, { name: teacher.name })}
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
