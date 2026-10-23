import { notFound } from "next/navigation";

import { ADMIN_PAGE_TITLE } from "@/features/admin/ui/admin-form-classes";
import { listAdminOrders } from "@/features/orders/application/queries";
import type { OrderStatus } from "@/features/orders/domain/order-status";
import { adminOrdersFilterSchema } from "@/features/orders/schemas/change-status";
import { AdminOrdersFilters } from "@/features/orders/ui/AdminOrdersFilters";
import { AdminPager } from "@/features/admin/ui/AdminPager";
import { AdminOrdersView } from "@/features/orders/ui/AdminOrdersView";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type AdminOrdersPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function buildOrdersQuery(
  filters: {
    q?: string;
    status?: OrderStatus;
    paymentStatus?: string;
    page: number;
  },
  page: number,
): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.paymentStatus) params.set("paymentStatus", filters.paymentStatus);
  params.set("page", String(page));
  return params.toString();
}

export default async function AdminOrdersPage({
  params,
  searchParams,
}: AdminOrdersPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const raw = await searchParams;
  const parsed = adminOrdersFilterSchema.safeParse({
    status: firstParam(raw.status) || undefined,
    paymentStatus: firstParam(raw.paymentStatus) || undefined,
    archived: "active",
    q: firstParam(raw.q) || undefined,
    page: firstParam(raw.page) ?? "1",
  });

  const filters = parsed.success
    ? parsed.data
    : {
        page: 1 as const,
        archived: "active" as const,
        status: undefined,
        paymentStatus: undefined,
        dateFrom: undefined,
        dateTo: undefined,
        q: undefined,
      };

  const { rows, total, pageSize } = await listAdminOrders(filters);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <section>
      <div className="mb-6">
        <h1 className={ADMIN_PAGE_TITLE}>{getDictionary(locale).admin.nav.orders}</h1>
      </div>

      <AdminOrdersFilters
        total={total}
        status={filters.status}
        paymentStatus={filters.paymentStatus}
        q={filters.q}
      />

      <AdminOrdersView locale={locale} orders={rows} />

      <AdminPager
        locale={locale}
        page={filters.page}
        totalPages={totalPages}
        hrefFor={(page) =>
          `/${locale}/admin/orders?${buildOrdersQuery(filters, page)}`
        }
      />
    </section>
  );
}
