"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  ConfirmDialog,
  deleteConfirmDescription,
} from "@/components/ui/ConfirmDialog";
import { ADMIN_PAGE_TITLE } from "@/features/admin/ui/admin-form-classes";
import { AdminSearchInput } from "@/features/admin/ui/AdminSearchInput";
import { ADMIN_BADGE } from "@/features/admin/ui/status-badge";
import { deleteSchoolTeacherAction } from "@/features/teachers/application/manage-teachers";
import type { AdminTeacherListItem } from "@/features/teachers/application/queries";
import type { TeacherRole } from "@/features/teachers/domain/teacher-rules";
import { TeacherDrawer } from "@/features/teachers/ui/TeacherDrawer";

type AdminTeachersViewProps = {
  locale: string;
  teachers: AdminTeacherListItem[];
};

const ROLE_LABELS: Record<TeacherRole, string> = {
  ballet: "Classical ballet",
  contemporary: "Contemporary dance",
  traditional: "Traditional dance",
  team: "School team",
};

function statusBadgeClass(status: string): string {
  if (status === "PUBLISHED") return "bg-green-100 text-green-800";
  if (status === "DRAFT") return "bg-yellow-100 text-yellow-800";
  if (status === "ARCHIVED") return "bg-gray-100 text-gray-800";
  return "bg-gray-100 text-gray-800";
}

function statusLabel(status: string): string {
  if (status === "PUBLISHED") return "Published";
  if (status === "DRAFT") return "Draft";
  if (status === "ARCHIVED") return "Archived";
  return status;
}

export function AdminTeachersView({ locale, teachers }: AdminTeachersViewProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<AdminTeacherListItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return teachers;
    }
    return teachers.filter((teacher) => {
      const haystack = `${teacher.name} ${ROLE_LABELS[teacher.role]}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [teachers, query]);

  function confirmDelete(): void {
    if (!pendingDelete) {
      return;
    }
    const teacherId = pendingDelete.id;
    startTransition(async () => {
      setError(null);
      const result = await deleteSchoolTeacherAction(locale, { teacherId });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setPendingDelete(null);
      router.refresh();
    });
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className={ADMIN_PAGE_TITLE}>Teachers</h1>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            setEditing(null);
            setDrawerOpen(true);
          }}
          className="inline-flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add Teacher
        </Button>
      </div>

      <AdminSearchInput
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by name or specialization"
        wrapperClassName="mb-4"
        aria-label="Search teachers"
      />

      {error ? <p className="mb-3 text-sm text-red-700">{error}</p> : null}

      <TeacherList
        teachers={teachers}
        filtered={filtered}
        isPending={isPending}
        onEdit={(teacher) => {
          setEditing(teacher);
          setDrawerOpen(true);
        }}
        onDelete={setPendingDelete}
      />

      {drawerOpen ? (
        <TeacherDrawer
          key={editing?.id ?? "new"}
          locale={locale}
          open
          onClose={() => {
            setDrawerOpen(false);
            setEditing(null);
          }}
          teacher={editing}
        />
      ) : null}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete"
        description={
          pendingDelete
            ? deleteConfirmDescription("teacher", pendingDelete.title)
            : ""
        }
        isPending={isPending}
        onClose={() => {
          if (!isPending) {
            setPendingDelete(null);
          }
        }}
        onConfirm={confirmDelete}
      />
    </section>
  );
}

function TeacherList({
  teachers,
  filtered,
  isPending,
  onEdit,
  onDelete,
}: {
  teachers: AdminTeacherListItem[];
  filtered: AdminTeacherListItem[];
  isPending: boolean;
  onEdit: (teacher: AdminTeacherListItem) => void;
  onDelete: (target: { id: string; title: string }) => void;
}) {
  if (filtered.length === 0) {
    return (
      <Card className="rounded-xl p-8">
        <p className="text-center text-sm text-gray-600">
          {teachers.length === 0 ? "No teachers yet." : "No teachers match this search."}
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
                    Photo
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {teacher.name}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {ROLE_LABELS[teacher.role]} · {teacher.classIds.length} classes
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1 sm:justify-end">
              <span className={`${ADMIN_BADGE} ${statusBadgeClass(teacher.status)}`}>
                {statusLabel(teacher.status)}
              </span>
              <button
                type="button"
                disabled={isPending}
                onClick={() => onEdit(teacher)}
                className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
                aria-label={`Edit ${teacher.name}`}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => onDelete({ id: teacher.id, title: teacher.name })}
                className="rounded p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
                aria-label={`Delete ${teacher.name}`}
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
