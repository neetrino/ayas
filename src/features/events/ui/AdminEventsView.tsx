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
import { deleteSchoolEventAction } from "@/features/events/application/manage-events";
import type { AdminEventListItem } from "@/features/events/application/queries";
import { EventDrawer } from "@/features/events/ui/EventDrawer";

type AdminEventsViewProps = {
  locale: string;
  events: AdminEventListItem[];
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

export function AdminEventsView({ locale, events }: AdminEventsViewProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<AdminEventListItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return events;
    }
    return events.filter((event) => {
      const haystack = `${event.title} ${event.slug} ${event.venue}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [events, query]);

  function confirmDelete(): void {
    if (!pendingDelete) {
      return;
    }
    const eventId = pendingDelete.id;
    startTransition(async () => {
      setError(null);
      const result = await deleteSchoolEventAction(locale, { eventId });
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
        <h1 className={ADMIN_PAGE_TITLE}>Events</h1>
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
          Add Event
        </Button>
      </div>

      <AdminSearchInput
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by name or slug"
        wrapperClassName="mb-4"
        aria-label="Search events"
      />

      {error ? <p className="mb-3 text-sm text-red-700">{error}</p> : null}

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="rounded-xl p-8">
            <p className="text-center text-sm text-gray-600">
              {events.length === 0
                ? "No events yet."
                : "No events match this search."}
            </p>
          </Card>
        ) : (
          filtered.map((event) => (
            <Card
              key={event.id}
              className="rounded-xl border border-gray-200 p-4 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {event.posterUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={event.posterUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-gray-400">
                        Event
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {event.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {event.date} · {event.startTime}
                      {event.venue ? ` · ${event.venue}` : ""}
                      {` · ${event.priceAmount} AMD`}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1 sm:justify-end">
                  <span className={`${ADMIN_BADGE} ${statusBadgeClass(event.status)}`}>
                    {statusLabel(event.status)}
                  </span>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      setEditing(event);
                      setDrawerOpen(true);
                    }}
                    className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
                    aria-label={`Edit ${event.title}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      setPendingDelete({ id: event.id, title: event.title })
                    }
                    className="rounded p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
                    aria-label={`Delete ${event.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {drawerOpen ? (
        <EventDrawer
          key={editing?.id ?? "new"}
          locale={locale}
          open
          onClose={() => {
            setDrawerOpen(false);
            setEditing(null);
          }}
          event={editing}
        />
      ) : null}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete"
        description={
          pendingDelete
            ? deleteConfirmDescription("event", pendingDelete.title)
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
