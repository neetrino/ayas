"use client";

import { useAdminCopy } from "@/features/admin/ui/admin-copy";
import {
  ADMIN_INPUT,
  ADMIN_LABEL,
  ADMIN_TEXTAREA,
} from "@/features/admin/ui/admin-form-classes";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import type { ClassLocaleDraft } from "@/features/classes/domain/class-draft";
import {
  CLASS_AGES,
  CLASS_DIRECTIONS,
  CLASS_LEVELS,
  type ClassAge,
  type ClassDirection,
  type ClassLevel,
  type ClassStatus,
} from "@/features/classes/domain/class-rules";
import { localeLabels, locales, type Locale } from "@/lib/i18n/config";

export function ClassLocaleTabs({
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

export function ClassCopyFields({
  draft,
  disabled,
  onChange,
}: {
  draft: ClassLocaleDraft;
  disabled: boolean;
  onChange: (patch: Partial<ClassLocaleDraft>) => void;
}) {
  const copy = useAdminCopy();
  return (
    <div className="space-y-4">
      <label className="block">
        <span className={ADMIN_LABEL}>{copy.classes.titleLabel}</span>
        <input
          value={draft.title}
          disabled={disabled}
          onChange={(event) => onChange({ title: event.target.value })}
          className={ADMIN_INPUT}
        />
      </label>
      <label className="block">
        <span className={ADMIN_LABEL}>{copy.classes.summary}</span>
        <textarea
          rows={4}
          value={draft.summary}
          disabled={disabled}
          onChange={(event) => onChange({ summary: event.target.value })}
          className={ADMIN_TEXTAREA}
        />
      </label>
    </div>
  );
}

type ClassProfileFieldsProps = {
  code: string;
  codeLocked: boolean;
  sortOrder: string;
  status: ClassStatus;
  direction: ClassDirection;
  age: ClassAge;
  level: ClassLevel;
  disabled: boolean;
  onCode: (value: string) => void;
  onSortOrder: (value: string) => void;
  onStatus: (value: ClassStatus) => void;
  onDirection: (value: ClassDirection) => void;
  onAge: (value: ClassAge) => void;
  onLevel: (value: ClassLevel) => void;
};

export function ClassProfileFields({
  code,
  codeLocked,
  sortOrder,
  status,
  direction,
  age,
  level,
  disabled,
  onCode,
  onSortOrder,
  onStatus,
  onDirection,
  onAge,
  onLevel,
}: ClassProfileFieldsProps) {
  const copy = useAdminCopy();
  const labels = copy.classes;
  return (
    <div className="space-y-4">
      <label className="block">
        <span className={ADMIN_LABEL}>{labels.code}</span>
        <input
          value={code}
          disabled={disabled || codeLocked}
          onChange={(event) => onCode(event.target.value)}
          className={ADMIN_INPUT}
          spellCheck={false}
        />
        <span className="mt-1 block text-xs text-gray-500">{labels.codeHint}</span>
      </label>
      <FilterSelect
        label={labels.direction}
        value={direction}
        options={CLASS_DIRECTIONS.map((item) => ({
          label: labels.directions[item],
          value: item,
        }))}
        disabled={disabled}
        onChange={(next) => onDirection(next as ClassDirection)}
      />
      <FilterSelect
        label={labels.age}
        value={age}
        options={CLASS_AGES.map((item) => ({
          label: labels.ages[item],
          value: item,
        }))}
        disabled={disabled}
        onChange={(next) => onAge(next as ClassAge)}
      />
      <FilterSelect
        label={labels.level}
        value={level}
        options={CLASS_LEVELS.map((item) => ({
          label: labels.levels[item],
          value: item,
        }))}
        disabled={disabled}
        onChange={(next) => onLevel(next as ClassLevel)}
      />
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
      <FilterSelect
        label={copy.common.status}
        value={status}
        options={[
          { label: copy.common.draft, value: "DRAFT" },
          { label: copy.common.published, value: "PUBLISHED" },
          { label: copy.common.archived, value: "ARCHIVED" },
        ]}
        disabled={disabled}
        onChange={(next) => onStatus(next as ClassStatus)}
      />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <span className={ADMIN_LABEL}>{label}</span>
      <SelectDropdown
        ariaLabel={label}
        value={value}
        options={options}
        disabled={disabled}
        deferChange={false}
        className="mt-1"
        onValueChange={onChange}
      />
    </div>
  );
}
