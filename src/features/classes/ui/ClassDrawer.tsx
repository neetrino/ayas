"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { SideSheet } from "@/components/ui/SideSheet";
import { useAdminCopy } from "@/features/admin/ui/admin-copy";
import {
  createSchoolClassAction,
  updateSchoolClassAction,
} from "@/features/classes/application/manage-classes";
import type { AdminClassListItem } from "@/features/classes/application/queries";
import {
  collectClassTranslations,
  draftsFromClassTranslations,
  type ClassLocaleDraft,
} from "@/features/classes/domain/class-draft";
import {
  classCodeFromTitle,
  isClassCode,
  type ClassAge,
  type ClassDirection,
  type ClassLevel,
  type ClassStatus,
} from "@/features/classes/domain/class-rules";
import {
  ClassCopyFields,
  ClassLocaleTabs,
  ClassProfileFields,
} from "@/features/classes/ui/ClassDrawerFields";
import { locales, type Locale } from "@/lib/i18n/config";

type ClassDrawerProps = {
  locale: string;
  open: boolean;
  onClose: () => void;
  schoolClass?: AdminClassListItem | null;
};

function firstLocale(schoolClass: AdminClassListItem | null): Locale {
  if (!schoolClass) {
    return "en";
  }
  return locales.find((locale) => schoolClass.translations[locale]?.title) ?? "en";
}

export function ClassDrawer({
  locale,
  open,
  onClose,
  schoolClass = null,
}: ClassDrawerProps) {
  const copy = useAdminCopy();
  const router = useRouter();
  const isEdit = schoolClass != null;
  const [activeLocale, setActiveLocale] = useState<Locale>(() => firstLocale(schoolClass));
  const [drafts, setDrafts] = useState(() =>
    draftsFromClassTranslations(schoolClass?.translations),
  );
  const [code, setCode] = useState(() => schoolClass?.code ?? "");
  const [codeTouched, setCodeTouched] = useState(isEdit);
  const [direction, setDirection] = useState<ClassDirection>(
    () => schoolClass?.direction ?? "ballet",
  );
  const [age, setAge] = useState<ClassAge>(() => schoolClass?.age ?? "children");
  const [level, setLevel] = useState<ClassLevel>(() => schoolClass?.level ?? "beginner");
  const [sortOrder, setSortOrder] = useState(() =>
    schoolClass ? String(schoolClass.sortOrder) : "0",
  );
  const [status, setStatus] = useState<ClassStatus>(() => schoolClass?.status ?? "DRAFT");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateDraft(patch: Partial<ClassLocaleDraft>): void {
    setDrafts((current) => {
      const nextDraft = { ...current[activeLocale], ...patch };
      return { ...current, [activeLocale]: nextDraft };
    });
    if (!isEdit && !codeTouched && patch.title !== undefined && activeLocale === "en") {
      const nextCode = classCodeFromTitle(patch.title);
      if (nextCode) {
        setCode(nextCode);
      }
    }
  }

  function submit(): void {
    const collected = collectClassTranslations(drafts);
    if (!collected.ok) {
      setError(collected.message);
      return;
    }
    const parsedOrder = Number(sortOrder);
    if (!Number.isInteger(parsedOrder)) {
      setError(copy.classes.sortWhole);
      return;
    }
    if (!isEdit && !isClassCode(code.trim())) {
      setError(copy.classes.codeInvalid);
      return;
    }

    const fields = {
      status,
      direction,
      age,
      level,
      sortOrder: parsedOrder,
      translations: collected.translations,
    };
    startTransition(async () => {
      setError(null);
      const result =
        isEdit && schoolClass
          ? await updateSchoolClassAction(locale, schoolClass.id, fields)
          : await createSchoolClassAction(locale, { ...fields, code: code.trim() });
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
      ariaLabel={isEdit ? copy.classes.edit : copy.classes.add}
      panelClassName="w-full md:w-1/2 md:max-w-none"
    >
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {isEdit ? copy.classes.edit : copy.classes.add}
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
          <ClassLocaleTabs active={activeLocale} onChange={setActiveLocale} />
          <ClassCopyFields
            draft={drafts[activeLocale]}
            disabled={isPending}
            onChange={updateDraft}
          />
          <ClassProfileFields
            code={code}
            codeLocked={isEdit}
            sortOrder={sortOrder}
            status={status}
            direction={direction}
            age={age}
            level={level}
            disabled={isPending}
            onCode={(value) => {
              setCodeTouched(true);
              setCode(value);
            }}
            onSortOrder={setSortOrder}
            onStatus={setStatus}
            onDirection={setDirection}
            onAge={setAge}
            onLevel={setLevel}
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
