"use client";

import Link from "next/link";

import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { useAdminCopy } from "@/features/admin/ui/admin-copy";
import { useAdminSidebarCollapse } from "@/features/admin/ui/AdminSidebarCollapseContext";
import type { Locale } from "@/lib/i18n/config";

type AdminSidebarBrandProps = {
  locale: Locale;
  languageLabel: string;
};

export function AdminSidebarBrand({
  locale,
  languageLabel,
}: AdminSidebarBrandProps) {
  const copy = useAdminCopy();
  const { collapsed, toggleCollapsed } = useAdminSidebarCollapse();

  return (
    <div
      className={`flex shrink-0 border-b border-gray-200 pb-3 pt-2 ${
        collapsed
          ? "flex-col items-center gap-2 px-1"
          : "items-center gap-1 px-2"
      }`}
    >
      {collapsed ? (
        <Link
          href={`/${locale}`}
          className="flex h-9 w-9 items-center justify-center rounded-md text-sm font-bold text-gray-900 hover:bg-gray-50"
          title={copy.shell.homeTitle}
        >
          W
        </Link>
      ) : (
        <Link
          href={`/${locale}`}
          className="min-w-0 flex-1 rounded-md px-2 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
        >
          {copy.shell.brand}
        </Link>
      )}
      <button
        type="button"
        onClick={toggleCollapsed}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
        aria-expanded={!collapsed}
        aria-label={
          collapsed ? copy.shell.expandSidebar : copy.shell.collapseSidebar
        }
        title={collapsed ? copy.shell.expandSidebar : copy.shell.collapseSidebar}
      >
        {collapsed ? (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        ) : (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        )}
      </button>
      <LocaleSwitcher
        locale={locale}
        label={languageLabel}
        compact
        triggerClassName="inline-flex items-center gap-1 px-2 text-xs font-medium text-gray-700"
      />
    </div>
  );
}
