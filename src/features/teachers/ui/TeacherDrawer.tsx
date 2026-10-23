"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { useAdminCopy } from "@/features/admin/ui/admin-copy";
import { SideSheet } from "@/components/ui/SideSheet";
import type { ClassOption } from "@/features/classes/domain/class-rules";
import type { AdminTeacherListItem } from "@/features/teachers/application/queries";
import {
  createSchoolTeacherAction,
  updateSchoolTeacherAction,
} from "@/features/teachers/application/manage-teachers";
import {
  collectTeacherTranslations,
  draftsFromTeacherTranslations,
  type TeacherLocaleDraft,
} from "@/features/teachers/domain/teacher-draft";
import type { TeacherRole, TeacherStatus } from "@/features/teachers/domain/teacher-rules";
import {
  TeacherCopyFields,
  TeacherLocaleTabs,
  TeacherPortraitField,
  TeacherProfileFields,
} from "@/features/teachers/ui/TeacherDrawerFields";
import { locales, type Locale } from "@/lib/i18n/config";

type TeacherDrawerProps = {
  locale: string;
  open: boolean;
  onClose: () => void;
  teacher?: AdminTeacherListItem | null;
  classOptions: readonly ClassOption[];
};

function classChoices(
  options: readonly ClassOption[],
  selected: readonly string[],
): ClassOption[] {
  const known = new Set(options.map((option) => option.code));
  const missing = selected
    .filter((code) => !known.has(code))
    .map((code) => ({ code, title: code }));
  return [...options, ...missing];
}

function firstLocale(teacher: AdminTeacherListItem | null): Locale {
  if (!teacher) {
    return "en";
  }
  return locales.find((locale) => teacher.translations[locale]?.name) ?? "en";
}

function replacePreview(current: string | null, next: string | null): string | null {
  if (current?.startsWith("blob:")) {
    URL.revokeObjectURL(current);
  }
  return next;
}

function portraitForm(file: File | null, removed: boolean): FormData | undefined {
  if (!file && !removed) {
    return undefined;
  }
  const form = new FormData();
  if (file) {
    form.set("portrait", file);
  }
  if (removed) {
    form.set("removePortrait", "1");
  }
  return form;
}

export function TeacherDrawer({
  locale,
  open,
  onClose,
  teacher = null,
  classOptions,
}: TeacherDrawerProps) {
  const copy = useAdminCopy();
  const router = useRouter();
  const isEdit = teacher != null;
  const [activeLocale, setActiveLocale] = useState<Locale>(() => firstLocale(teacher));
  const [drafts, setDrafts] = useState(() =>
    draftsFromTeacherTranslations(teacher?.translations),
  );
  const [role, setRole] = useState<TeacherRole>(() => teacher?.role ?? "ballet");
  const [classIds, setClassIds] = useState<string[]>(() => teacher?.classIds ?? []);
  const [sortOrder, setSortOrder] = useState(() =>
    teacher ? String(teacher.sortOrder) : "0",
  );
  const [status, setStatus] = useState<TeacherStatus>(() => teacher?.status ?? "DRAFT");
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  const [portraitRemoved, setPortraitRemoved] = useState(false);
  const [portraitPreview, setPortraitPreview] = useState<string | null>(
    () => teacher?.portraitUrl ?? null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateDraft(patch: Partial<TeacherLocaleDraft>): void {
    setDrafts((current) => ({
      ...current,
      [activeLocale]: { ...current[activeLocale], ...patch },
    }));
  }

  function toggleClass(id: string): void {
    setClassIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function submit(): void {
    const collected = collectTeacherTranslations(drafts);
    if (!collected.ok) {
      setError(collected.message);
      return;
    }
    const parsedOrder = Number(sortOrder);
    if (!Number.isInteger(parsedOrder)) {
      setError(copy.teachers.sortWhole);
      return;
    }

    const mediaForm = portraitForm(portraitFile, portraitRemoved);
    startTransition(async () => {
      setError(null);
      const payload = {
        status,
        role,
        classIds,
        sortOrder: parsedOrder,
        translations: collected.translations,
      };
      const result =
        isEdit && teacher
          ? await updateSchoolTeacherAction(locale, teacher.id, payload, mediaForm)
          : await createSchoolTeacherAction(locale, payload, mediaForm);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      onClose();
      router.refresh();
    });
  }

  return (
    <SideSheet
      open={open}
      onClose={onClose}
      ariaLabel={isEdit ? copy.teachers.edit : copy.teachers.add}
      panelClassName="w-full md:w-1/2 md:max-w-none"
    >
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {isEdit ? copy.teachers.edit : copy.teachers.add}
        </h2>
      </div>
      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={(formEvent) => {
          formEvent.preventDefault();
          submit();
        }}
      >
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <TeacherLocaleTabs active={activeLocale} onChange={setActiveLocale} />
          <TeacherCopyFields
            draft={drafts[activeLocale]}
            disabled={isPending}
            onChange={updateDraft}
          />
          <TeacherProfileFields
            role={role}
            sortOrder={sortOrder}
            status={status}
            classIds={classIds}
            classOptions={classChoices(classOptions, classIds)}
            disabled={isPending}
            onRole={setRole}
            onSortOrder={setSortOrder}
            onStatus={setStatus}
            onToggleClass={toggleClass}
          />
          <TeacherPortraitField
            preview={portraitPreview}
            disabled={isPending}
            onPick={(file) => {
              setPortraitFile(file);
              setPortraitRemoved(false);
              setPortraitPreview((current) =>
                replacePreview(current, URL.createObjectURL(file)),
              );
            }}
            onRemove={() => {
              setPortraitFile(null);
              setPortraitRemoved(true);
              setPortraitPreview((current) => replacePreview(current, null));
            }}
          />
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
          <Button type="button" variant="secondary" disabled={isPending} onClick={onClose}>
            {copy.common.cancel}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? copy.common.saving : copy.common.save}
          </Button>
        </div>
      </form>
    </SideSheet>
  );
}
