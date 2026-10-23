"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { fillAdmin, useAdminCopy } from "@/features/admin/ui/admin-copy";
import { ADMIN_PAGE_TITLE } from "@/features/admin/ui/admin-form-classes";
import { AdminSearchInput } from "@/features/admin/ui/AdminSearchInput";
import { deleteSchoolGalleryItemAction } from "@/features/gallery/application/manage-gallery";
import type { AdminGalleryListItem } from "@/features/gallery/application/queries";
import { AdminGalleryList } from "@/features/gallery/ui/AdminGalleryList";
import { GalleryDrawer } from "@/features/gallery/ui/GalleryDrawer";

type AdminGalleryViewProps = {
  locale: string;
  items: AdminGalleryListItem[];
};

export function AdminGalleryView({ locale, items }: AdminGalleryViewProps) {
  const copy = useAdminCopy();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<AdminGalleryListItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return items;
    }
    return items.filter((item) => {
      const haystack = `${item.title} ${copy.gallery.categories[item.category]}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [copy.gallery.categories, items, query]);

  function confirmDelete(): void {
    if (!pendingDelete) {
      return;
    }
    const galleryItemId = pendingDelete.id;
    startTransition(async () => {
      setError(null);
      const result = await deleteSchoolGalleryItemAction(locale, { galleryItemId });
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
        <h1 className={ADMIN_PAGE_TITLE}>{copy.gallery.title}</h1>
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
          {copy.gallery.add}
        </Button>
      </div>

      <AdminSearchInput
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={copy.gallery.searchPlaceholder}
        wrapperClassName="mb-4"
        aria-label={copy.gallery.searchLabel}
      />

      {error ? <p className="mb-3 text-sm text-red-700">{error}</p> : null}

      <AdminGalleryList
        items={items}
        filtered={filtered}
        categoryLabels={copy.gallery.categories}
        kindLabels={copy.gallery.kinds}
        statusLabels={copy.common}
        photoLabel={copy.common.photo}
        editLabel={copy.common.editNamed}
        deleteLabel={copy.common.deleteNamed}
        emptyLabel={copy.gallery.empty}
        noMatchLabel={copy.gallery.noMatch}
        isPending={isPending}
        onEdit={(item) => {
          setEditing(item);
          setDrawerOpen(true);
        }}
        onDelete={setPendingDelete}
      />

      {drawerOpen ? (
        <GalleryDrawer
          key={editing?.id ?? "new"}
          locale={locale}
          open
          onClose={() => {
            setDrawerOpen(false);
            setEditing(null);
          }}
          item={editing}
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
                entity: copy.common.entities.galleryItem,
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
