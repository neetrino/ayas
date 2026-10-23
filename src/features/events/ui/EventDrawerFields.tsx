"use client";

import { ADMIN_INPUT, ADMIN_LABEL, ADMIN_TEXTAREA } from "@/features/admin/ui/admin-form-classes";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import type { EventLocaleDraft } from "@/features/events/domain/event-draft";
import type { SchoolEventStatus } from "@/features/events/domain/event-rules";
import { localeLabels, locales, type Locale } from "@/lib/i18n/config";

export function LocaleTabs({
  active,
  onChange,
}: {
  active: Locale;
  onChange: (locale: Locale) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => onChange(locale)}
          className={`rounded-xl px-3 py-1.5 text-sm font-medium ${
            locale === active
              ? "bg-gray-900 text-white"
              : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          {localeLabels[locale]}
        </button>
      ))}
    </div>
  );
}

export function CopyFields({
  draft,
  disabled,
  onChange,
}: {
  draft: EventLocaleDraft;
  disabled: boolean;
  onChange: (patch: Partial<EventLocaleDraft>) => void;
}) {
  return (
    <div className="space-y-4">
      <label className="block">
        <span className={ADMIN_LABEL}>Name</span>
        <input
          value={draft.name}
          disabled={disabled}
          onChange={(event) => onChange({ name: event.target.value })}
          className={ADMIN_INPUT}
        />
      </label>
      <label className="block">
        <span className={ADMIN_LABEL}>Slug</span>
        <input
          value={draft.slug}
          disabled={disabled}
          onChange={(event) =>
            onChange({ slug: event.target.value, slugTouched: true })
          }
          className={ADMIN_INPUT}
          placeholder="Filled from the name when left empty"
        />
      </label>
      <label className="block">
        <span className={ADMIN_LABEL}>Description</span>
        <textarea
          rows={5}
          value={draft.description}
          disabled={disabled}
          onChange={(event) => onChange({ description: event.target.value })}
          className={ADMIN_TEXTAREA}
        />
      </label>
      <label className="block">
        <span className={ADMIN_LABEL}>Venue</span>
        <input
          value={draft.venue}
          disabled={disabled}
          onChange={(event) => onChange({ venue: event.target.value })}
          className={ADMIN_INPUT}
        />
      </label>
      <label className="block">
        <span className={ADMIN_LABEL}>Address</span>
        <input
          value={draft.address}
          disabled={disabled}
          onChange={(event) => onChange({ address: event.target.value })}
          className={ADMIN_INPUT}
        />
      </label>
    </div>
  );
}

type ScheduleFieldsProps = {
  date: string;
  startTime: string;
  duration: string;
  price: string;
  age: string;
  status: SchoolEventStatus;
  disabled: boolean;
  onDate: (value: string) => void;
  onStartTime: (value: string) => void;
  onDuration: (value: string) => void;
  onPrice: (value: string) => void;
  onAge: (value: string) => void;
  onStatus: (value: SchoolEventStatus) => void;
};

export function ScheduleFields({
  date,
  startTime,
  duration,
  price,
  age,
  status,
  disabled,
  onDate,
  onStartTime,
  onDuration,
  onPrice,
  onAge,
  onStatus,
}: ScheduleFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block">
        <span className={ADMIN_LABEL}>Date</span>
        <input
          required
          type="date"
          value={date}
          disabled={disabled}
          onChange={(event) => onDate(event.target.value)}
          className={ADMIN_INPUT}
        />
      </label>
      <label className="block">
        <span className={ADMIN_LABEL}>Start time</span>
        <input
          required
          type="time"
          value={startTime}
          disabled={disabled}
          onChange={(event) => onStartTime(event.target.value)}
          className={ADMIN_INPUT}
        />
      </label>
      <label className="block">
        <span className={ADMIN_LABEL}>Duration (minutes)</span>
        <input
          required
          inputMode="numeric"
          value={duration}
          disabled={disabled}
          onChange={(event) => onDuration(event.target.value)}
          className={ADMIN_INPUT}
        />
      </label>
      <label className="block">
        <span className={ADMIN_LABEL}>Ticket price (AMD)</span>
        <input
          required
          inputMode="numeric"
          value={price}
          disabled={disabled}
          onChange={(event) => onPrice(event.target.value)}
          className={ADMIN_INPUT}
        />
      </label>
      <label className="block sm:col-span-2">
        <span className={ADMIN_LABEL}>Age restriction</span>
        <input
          value={age}
          disabled={disabled}
          onChange={(event) => onAge(event.target.value)}
          className={ADMIN_INPUT}
          placeholder="Leave empty when there is none"
        />
      </label>
      <div className="sm:col-span-2">
        <span className={ADMIN_LABEL}>Status</span>
        <SelectDropdown
          ariaLabel="Status"
          value={status}
          options={[
            { label: "Draft", value: "DRAFT" },
            { label: "Published", value: "PUBLISHED" },
            { label: "Archived", value: "ARCHIVED" },
          ]}
          disabled={disabled}
          deferChange={false}
          className="mt-1"
          onValueChange={(next) => onStatus(next as SchoolEventStatus)}
        />
      </div>
    </div>
  );
}
