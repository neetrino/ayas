"use client";

import { ADMIN_INPUT, ADMIN_LABEL, ADMIN_TEXTAREA } from "@/features/admin/ui/admin-form-classes";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import type { TeacherLocaleDraft } from "@/features/teachers/domain/teacher-draft";
import {
  TEACHER_CLASS_IDS,
  TEACHER_ROLES,
  type TeacherRole,
  type TeacherStatus,
} from "@/features/teachers/domain/teacher-rules";
import { localeLabels, locales, type Locale } from "@/lib/i18n/config";

const ROLE_LABELS: Record<TeacherRole, string> = {
  ballet: "Classical ballet",
  contemporary: "Contemporary dance",
  traditional: "Traditional dance",
  team: "School team",
};

const CLASS_LABELS: Record<(typeof TEACHER_CLASS_IDS)[number], string> = {
  "ballet-children": "Ballet — children",
  "ballet-teens": "Ballet — teens",
  "ballet-adults": "Ballet — adults",
  contemporary: "Contemporary",
  "traditional-children": "Traditional — children",
  "traditional-adults": "Traditional — adults",
  "open-class": "Open class",
  stage: "Stage",
};

export function TeacherLocaleTabs({
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

export function TeacherCopyFields({
  draft,
  disabled,
  onChange,
}: {
  draft: TeacherLocaleDraft;
  disabled: boolean;
  onChange: (patch: Partial<TeacherLocaleDraft>) => void;
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
        <span className={ADMIN_LABEL}>Experience</span>
        <textarea
          rows={3}
          value={draft.experience}
          disabled={disabled}
          onChange={(event) => onChange({ experience: event.target.value })}
          className={ADMIN_TEXTAREA}
        />
      </label>
      <label className="block">
        <span className={ADMIN_LABEL}>Biography</span>
        <textarea
          rows={5}
          value={draft.biography}
          disabled={disabled}
          onChange={(event) => onChange({ biography: event.target.value })}
          className={ADMIN_TEXTAREA}
        />
      </label>
    </div>
  );
}

type TeacherProfileFieldsProps = {
  role: TeacherRole;
  sortOrder: string;
  status: TeacherStatus;
  classIds: readonly string[];
  disabled: boolean;
  onRole: (value: TeacherRole) => void;
  onSortOrder: (value: string) => void;
  onStatus: (value: TeacherStatus) => void;
  onToggleClass: (id: string) => void;
};

export function TeacherProfileFields({
  role,
  sortOrder,
  status,
  classIds,
  disabled,
  onRole,
  onSortOrder,
  onStatus,
  onToggleClass,
}: TeacherProfileFieldsProps) {
  return (
    <div className="space-y-4">
      <div>
        <span className={ADMIN_LABEL}>Specialization</span>
        <SelectDropdown
          ariaLabel="Specialization"
          value={role}
          options={TEACHER_ROLES.map((item) => ({
            label: ROLE_LABELS[item],
            value: item,
          }))}
          disabled={disabled}
          deferChange={false}
          className="mt-1"
          onValueChange={(next) => onRole(next as TeacherRole)}
        />
      </div>
      <label className="block">
        <span className={ADMIN_LABEL}>Sort order</span>
        <input
          inputMode="numeric"
          value={sortOrder}
          disabled={disabled}
          onChange={(event) => onSortOrder(event.target.value)}
          className={ADMIN_INPUT}
        />
      </label>
      <div>
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
          onValueChange={(next) => onStatus(next as TeacherStatus)}
        />
      </div>
      <fieldset className="space-y-2">
        <legend className={ADMIN_LABEL}>Classes</legend>
        {TEACHER_CLASS_IDS.map((id) => (
          <label key={id} className="flex items-center gap-2 text-sm text-gray-800">
            <input
              type="checkbox"
              checked={classIds.includes(id)}
              disabled={disabled}
              onChange={() => onToggleClass(id)}
            />
            {CLASS_LABELS[id]}
          </label>
        ))}
      </fieldset>
    </div>
  );
}

export function TeacherPortraitField({
  preview,
  disabled,
  onPick,
  onRemove,
}: {
  preview: string | null;
  disabled: boolean;
  onPick: (file: File) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-3">
      <span className={ADMIN_LABEL}>Portrait</span>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="h-40 w-32 rounded-lg object-cover" />
      ) : (
        <p className="text-sm text-gray-500">No portrait yet.</p>
      )}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        disabled={disabled}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onPick(file);
          }
        }}
        className="block text-sm text-gray-700"
      />
      {preview ? (
        <button
          type="button"
          disabled={disabled}
          onClick={onRemove}
          className="text-sm font-medium text-red-700"
        >
          Remove portrait
        </button>
      ) : null}
    </div>
  );
}
