"use client";

import type { ReactNode } from "react";

import {
  AdminCopyProvider,
  type AdminCopy,
} from "@/features/admin/ui/admin-copy";
import { AdminSidebar } from "@/features/admin/ui/AdminSidebar";
import { AdminSidebarCollapseProvider } from "@/features/admin/ui/AdminSidebarCollapseContext";
import {
  ADMIN_MAIN_COLUMN,
  ADMIN_MAIN_INNER,
  ADMIN_PAGE_SHELL,
} from "@/features/admin/ui/admin-shell-classes";
import type { Locale } from "@/lib/i18n/config";

type AdminShellProps = {
  locale: Locale;
  copy: AdminCopy;
  languageLabel: string;
  children: ReactNode;
};

export function AdminShell({
  locale,
  copy,
  languageLabel,
  children,
}: AdminShellProps) {
  return (
    <AdminCopyProvider copy={copy}>
      <AdminSidebarCollapseProvider>
        <div className={ADMIN_PAGE_SHELL}>
          <AdminSidebar locale={locale} languageLabel={languageLabel} />
          <div className={ADMIN_MAIN_COLUMN}>
            <div className={ADMIN_MAIN_INNER}>{children}</div>
          </div>
        </div>
      </AdminSidebarCollapseProvider>
    </AdminCopyProvider>
  );
}
