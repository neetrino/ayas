"use client";

import { useAdminCopy } from "@/features/admin/ui/admin-copy";
import { ADMIN_INPUT, ADMIN_LABEL, ADMIN_TEXTAREA } from "@/features/admin/ui/admin-form-classes";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import type { ClassOption } from "@/features/classes/domain/class-rules";
import type { TeacherLocaleDraft } from "@/features/teachers/domain/teacher-draft";
import {
  TEACHER_ROLES,
  type TeacherRole,
  type TeacherStatus,
} from "@/features/teachers/domain/teacher-rules";
import { localeLabels, locales, type Locale } from "@/lib/i18n/config";


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
  const copy = useAdminCopy();
  return (
    <div className="space-y-4">
      <label className="block">
        <span className={ADMIN_LABEL}>{copy.common.name}</span>
        <input
          value={draft.name}
          disabled={disabled}
          onChange={(event) => onChange({ name: event.target.value })}
          className={ADMIN_INPUT}
        />
      </label>
      <label className="block">
        <span className={ADMIN_LABEL}>{copy.teachers.experience}</span>
        <textarea
          rows={3}
          value={draft.experience}
          disabled={disabled}
          onChange={(event) => onChange({ experience: event.target.value })}
          className={ADMIN_TEXTAREA}
        />
      </label>
      <label className="block">
        <span className={ADMIN_LABEL}>{copy.teachers.biography}</span>
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
  classOptions: readonly ClassOption[];
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
  classOptions,
  disabled,
  onRole,
  onSortOrder,
  onStatus,
  onToggleClass,
}: TeacherProfileFieldsProps) {
  const copy = useAdminCopy();
  return (
    <div className="space-y-4">
      <div>
        <span className={ADMIN_LABEL}>{copy.teachers.specialization}</span>
        <SelectDropdown
          ariaLabel={copy.teachers.specialization}
          value={role}
          options={TEACHER_ROLES.map((item) => ({
            label: copy.teachers.roles[item],
            value: item,
          }))}
          disabled={disabled}
          deferChange={false}
          className="mt-1"
          onValueChange={(next) => onRole(next as TeacherRole)}
        />
      </div>
      <label className="block">
        <span className={ADMIN_LABEL}>{copy.common.sortOrder}</span>
        <input
          inputMode="numeric"
          value={sortOrder}
          disabled={disabled}
          onChange={(event) => onSortOrder(event.target.value)}
          className={ADMIN_INPUT}
        />
      </label>
      <div>
        <span className={ADMIN_LABEL}>{copy.common.status}</span>
        <SelectDropdown
          ariaLabel={copy.common.status}
          value={status}
          options={[
            { label: copy.common.draft, value: "DRAFT" },
            { label: copy.common.published, value: "PUBLISHED" },
            { label: copy.common.archived, value: "ARCHIVED" },
          ]}
          disabled={disabled}
          deferChange={false}
          className="mt-1"
          onValueChange={(next) => onStatus(next as TeacherStatus)}
        />
      </div>
      <fieldset className="space-y-2">
        <legend className={ADMIN_LABEL}>{copy.teachers.classesLabel}</legend>
        {classOptions.map((option) => (
          <label key={option.code} className="flex items-center gap-2 text-sm text-gray-800">
            <input
              type="checkbox"
              checked={classIds.includes(option.code)}
              disabled={disabled}
              onChange={() => onToggleClass(option.code)}
            />
            {option.title}
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
  const copy = useAdminCopy();
  return (
    <div className="space-y-3">
      <span className={ADMIN_LABEL}>{copy.teachers.portrait}</span>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="h-40 w-32 rounded-lg object-cover" />
      ) : (
        <p className="text-sm text-gray-500">{copy.teachers.noPortrait}</p>
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
          {copy.common.remove}
        </button>
      ) : null}
    </div>
  );
}
