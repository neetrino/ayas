"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { fillAdmin, useAdminCopy } from "@/features/admin/ui/admin-copy";
import { ADMIN_PAGE_TITLE } from "@/features/admin/ui/admin-form-classes";
import { AdminSearchInput } from "@/features/admin/ui/AdminSearchInput";
import { deleteSchoolClassAction } from "@/features/classes/application/manage-classes";
import type { AdminClassListItem } from "@/features/classes/application/queries";
import { AdminClassList } from "@/features/classes/ui/AdminClassList";
import { ClassDrawer } from "@/features/classes/ui/ClassDrawer";

type AdminClassesViewProps = {
  locale: string;
  classes: AdminClassListItem[];
};

export function AdminClassesView({ locale, classes }: AdminClassesViewProps) {
  const copy = useAdminCopy();
  const labels = copy.classes;
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<AdminClassListItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return classes;
    }
    return classes.filter((schoolClass) => {
      const haystack = `${schoolClass.title} ${schoolClass.code}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [classes, query]);

  function confirmDelete(): void {
    if (!pendingDelete) {
      return;
    }
    const classId = pendingDelete.id;
    startTransition(async () => {
      setError(null);
      const result = await deleteSchoolClassAction(locale, { classId });
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
        <h1 className={ADMIN_PAGE_TITLE}>{labels.title}</h1>
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
          {labels.add}
        </Button>
      </div>

      <AdminSearchInput
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={labels.searchPlaceholder}
        wrapperClassName="mb-4"
        aria-label={labels.searchLabel}
      />

      {error ? <p className="mb-3 text-sm text-red-700">{error}</p> : null}

      <AdminClassList
        classes={classes}
        filtered={filtered}
        labels={labels}
        statusLabels={copy.common}
        editLabel={copy.common.editNamed}
        deleteLabel={copy.common.deleteNamed}
        emptyLabel={labels.empty}
        noMatchLabel={labels.noMatch}
        isPending={isPending}
        onEdit={(schoolClass) => {
          setEditing(schoolClass);
          setDrawerOpen(true);
        }}
        onDelete={setPendingDelete}
      />

      {drawerOpen ? (
        <ClassDrawer
          key={editing?.id ?? "new"}
          locale={locale}
          open
          onClose={() => {
            setDrawerOpen(false);
            setEditing(null);
          }}
          schoolClass={editing}
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
                entity: copy.common.entities.class,
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
