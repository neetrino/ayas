"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { fillAdmin, useAdminCopy } from "@/features/admin/ui/admin-copy";
import { ADMIN_PAGE_TITLE } from "@/features/admin/ui/admin-form-classes";
import { AdminSearchInput } from "@/features/admin/ui/AdminSearchInput";
import {
  deleteSchoolTeacherAction,
  toggleSchoolTeacherFeaturedAction,
} from "@/features/teachers/application/manage-teachers";
import type { ClassOption } from "@/features/classes/domain/class-rules";
import type { AdminTeacherListItem } from "@/features/teachers/application/queries";
import { AdminTeacherList } from "@/features/teachers/ui/AdminTeacherList";
import { TeacherDrawer } from "@/features/teachers/ui/TeacherDrawer";

type AdminTeachersViewProps = {
  locale: string;
  teachers: AdminTeacherListItem[];
  classOptions: readonly ClassOption[];
};

export function AdminTeachersView({
  locale,
  teachers,
  classOptions,
}: AdminTeachersViewProps) {
  const copy = useAdminCopy();
  const roleLabels = copy.teachers.roles;
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
  const [featuredById, setFeaturedById] = useState<Record<string, boolean>>({});

  const roster = useMemo(
    () =>
      teachers.map((teacher) =>
        featuredById[teacher.id] === undefined
          ? teacher
          : { ...teacher, isFeatured: featuredById[teacher.id] ?? false },
      ),
    [featuredById, teachers],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return roster;
    }
    return roster.filter((teacher) => {
      const haystack = `${teacher.name} ${roleLabels[teacher.role]}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [roleLabels, roster, query]);

  function toggleFeatured(teacher: AdminTeacherListItem): void {
    startTransition(async () => {
      setError(null);
      const result = await toggleSchoolTeacherFeaturedAction(locale, {
        teacherId: teacher.id,
      });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setFeaturedById((current) => ({
        ...current,
        [teacher.id]: result.value.isFeatured,
      }));
      router.refresh();
    });
  }

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
        <h1 className={ADMIN_PAGE_TITLE}>{copy.teachers.title}</h1>
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
          {copy.teachers.add}
        </Button>
      </div>

      <AdminSearchInput
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={copy.teachers.searchPlaceholder}
        wrapperClassName="mb-4"
        aria-label={copy.teachers.searchLabel}
      />

      {error ? <p className="mb-3 text-sm text-red-700">{error}</p> : null}

      <AdminTeacherList
        teachers={roster}
        roleLabels={roleLabels}
        statusLabels={copy.common}
        classesLabel={copy.teachers.classes}
        photoLabel={copy.common.photo}
        showOnHomeLabel={copy.teachers.showOnHome}
        hideFromHomeLabel={copy.teachers.hideFromHome}
        editLabel={copy.common.editNamed}
        deleteLabel={copy.common.deleteNamed}
        emptyLabel={copy.teachers.empty}
        noMatchLabel={copy.teachers.noMatch}
        filtered={filtered}
        isPending={isPending}
        onFeature={toggleFeatured}
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
          classOptions={classOptions}
        />
      ) : null}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={copy.common.delete}
        confirmLabel={copy.common.delete}
        cancelLabel={copy.common.cancel}
        description={
          pendingDelete
            ? fillAdmin(copy.common.deleteConfirm, {
                entity: copy.common.entities.teacher,
                name: pendingDelete.title,
              })
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
