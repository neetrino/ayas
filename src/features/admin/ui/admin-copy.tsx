"use client";

import { createContext, useContext, type ReactNode } from "react";

import { fillAdmin } from "@/features/admin/ui/fill-admin";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

export { fillAdmin };

export type AdminCopy = Dictionary["admin"];

const AdminCopyContext = createContext<AdminCopy | null>(null);

type AdminCopyProviderProps = {
  copy: AdminCopy;
  children: ReactNode;
};

export function AdminCopyProvider({ copy, children }: AdminCopyProviderProps) {
  return (
    <AdminCopyContext.Provider value={copy}>{children}</AdminCopyContext.Provider>
  );
}

/** Admin chrome for the active locale. Requires the admin layout provider. */
export function useAdminCopy(): AdminCopy {
  const copy = useContext(AdminCopyContext);
  if (!copy) {
    throw new Error("useAdminCopy must be used within AdminCopyProvider");
  }
  return copy;
}
