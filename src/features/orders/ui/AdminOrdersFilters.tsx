"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";

import { Card } from "@/components/ui/Card";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { fillAdmin, useAdminCopy } from "@/features/admin/ui/admin-copy";
import { AdminSearchInput } from "@/features/admin/ui/AdminSearchInput";
import type { OrderStatus } from "@/features/orders/domain/order-status";
import type { PaymentStatus } from "@/features/orders/domain/payment-status";

const ORDER_STATUS_VALUES = [
  "PENDING",
  "PROCESSING",
  "DELIVERED",
  "CANCELLED",
] as const satisfies readonly OrderStatus[];

const PAYMENT_STATUS_VALUES = [
  "CAPTURED",
  "PENDING",
  "FAILED",
] as const satisfies readonly PaymentStatus[];

type AdminOrdersFiltersProps = {
  total: number;
  status?: OrderStatus;
  paymentStatus?: string;
  q?: string;
};

export function AdminOrdersFilters({
  total,
  status,
  paymentStatus,
  q,
}: AdminOrdersFiltersProps) {
  const copy = useAdminCopy();
  const formRef = useRef<HTMLFormElement>(null);
  const orderStatusOptions = [
    { label: copy.common.pending, value: ORDER_STATUS_VALUES[0] },
    { label: copy.common.processing, value: ORDER_STATUS_VALUES[1] },
    { label: copy.common.completed, value: ORDER_STATUS_VALUES[2] },
    { label: copy.common.cancelled, value: ORDER_STATUS_VALUES[3] },
  ];
  const paymentStatusOptions = [
    { label: copy.common.paid, value: PAYMENT_STATUS_VALUES[0] },
    { label: copy.common.pending, value: PAYMENT_STATUS_VALUES[1] },
    { label: copy.common.failed, value: PAYMENT_STATUS_VALUES[2] },
  ];
  const [statusValue, setStatusValue] = useState(status ?? "");
  const [paymentValue, setPaymentValue] = useState(paymentStatus ?? "");

  function applyStatus(next: string): void {
    flushSync(() => setStatusValue(next));
    formRef.current?.requestSubmit();
  }

  function applyPayment(next: string): void {
    flushSync(() => setPaymentValue(next));
    formRef.current?.requestSubmit();
  }

  return (
    <Card className="mb-6 overflow-visible">
      <form
        ref={formRef}
        method="get"
        className="flex flex-nowrap items-center gap-3 p-4"
      >
        <SelectDropdown
          name="status"
          ariaLabel={copy.orders.orderStatus}
          value={statusValue}
          allLabel={copy.orders.allStatuses}
          options={orderStatusOptions}
          className="w-[180px] shrink-0"
          onValueChange={applyStatus}
        />
        <SelectDropdown
          name="paymentStatus"
          ariaLabel={copy.orders.paymentStatus}
          value={paymentValue}
          allLabel={copy.orders.allPaymentStatuses}
          options={paymentStatusOptions}
          className="w-[200px] shrink-0"
          onValueChange={applyPayment}
        />
        <AdminSearchInput
          name="q"
          defaultValue={q ?? ""}
          placeholder={copy.orders.searchPlaceholder}
          wrapperClassName="min-w-0 flex-1"
          aria-label={copy.orders.searchLabel}
        />
      </form>
      <div className="border-t border-gray-200 px-4 py-3">
        <p className="text-sm text-gray-600">
          {fillAdmin(copy.orders.total, { count: total })}
        </p>
      </div>
    </Card>
  );
}
