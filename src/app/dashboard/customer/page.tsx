"use client";
import { ArrowRight, CheckCircle2, Clock, ShoppingBag, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ChartCard, StatusPie } from "@/components/dashboard/Charts";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { StatCard, StatGridSkeleton } from "@/components/dashboard/StatCard";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { api, errorMessage } from "@/lib/api";
import type { Order } from "@/lib/types";
import { useFetch } from "@/lib/useFetch";
import { formatDate, formatPrice } from "@/lib/utils";

type Stats = { total: number; pending: number; accepted: number; rejected: number; cancelled: number };

export default function CustomerOverview() {
  const { data, loading, error, reload } = useFetch<Stats>("/api/orders/stats");
  const orders = useFetch<Order[]>("/api/orders/my");
  const [toCancel, setToCancel] = useState<Order | null>(null);

  const cancel = async () => {
    if (!toCancel) return;
    try {
      const r = await api<{ message: string }>(`/api/orders/${toCancel._id}/cancel`, { method: "PATCH" });
      toast.success(r.message);
    } catch (e) {
      toast.error(errorMessage(e));
    }
    orders.reload();
    reload();
  };

  return (
    <>
      <PageHeader title="My Overview" description="Your pizza nights, all in one place." />
      {loading ? <StatGridSkeleton /> : error || !data ? (
        <EmptyState title="Couldn't load stats" description={error ?? ""} action={<Button onClick={reload}>Retry</Button>} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Orders" value={data.total} icon={ShoppingBag} />
            <StatCard label="Pending" value={data.pending} icon={Clock} tone="amber" />
            <StatCard label="Accepted" value={data.accepted} icon={CheckCircle2} tone="green" />
            <StatCard label="Rejected" value={data.rejected} icon={XCircle} tone="brown" />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-5">
            {/* Your orders */}
            <div className="rounded-2xl border bg-card shadow-sm lg:col-span-3">
              <div className="flex items-center justify-between gap-3 border-b p-5">
                <div>
                  <h3 className="font-display text-lg font-semibold">Your orders</h3>
                  <p className="text-sm text-muted-foreground">Everything you&apos;ve ordered recently.</p>
                </div>
                <Button asChild size="sm"><Link href="/menu">Find a pizza <ArrowRight /></Link></Button>
              </div>
              {!orders.data?.length ? (
                <p className="p-10 text-center text-sm text-muted-foreground">No orders yet. Your first pizza is a click away!</p>
              ) : (
                <ul className="divide-y">
                  {orders.data.slice(0, 5).map((o) => (
                    <li key={o._id} className="flex items-center gap-4 p-4">
                      <Link href={`/dashboard/customer/orders/${o._id}`} className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                        {o.item?.images?.[0] && <Image src={o.item.images[0]} alt="" fill sizes="56px" className="object-cover" />}
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link href={`/dashboard/customer/orders/${o._id}`} className="block truncate font-semibold hover:text-primary">
                          {o.item?.itemName ?? "Deleted item"}
                        </Link>
                        <p className="truncate text-xs text-muted-foreground">
                          {o.vendor?.businessName ?? o.vendor?.name} · delivery {formatDate(o.deliveryDate)}
                          {o.item ? ` · ${formatPrice(o.item.price)}` : ""}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{o.deliveryAddress}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <StatusBadge status={o.status} />
                        {o.status === "pending" && (
                          <Button size="sm" variant="outline" onClick={() => setToCancel(o)}>Cancel</Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {orders.data && orders.data.length > 5 && (
                <div className="border-t p-3 text-center">
                  <Link href="/dashboard/customer/orders" className="text-sm font-semibold text-primary hover:underline">View all orders</Link>
                </div>
              )}
            </div>

            <ChartCard title="Orders by status" className="lg:col-span-2">
              <StatusPie data={(["pending", "accepted", "rejected", "cancelled"] as const).map((s) => ({ status: s, count: data[s] }))} />
            </ChartCard>
          </div>
        </>
      )}
      <ConfirmDialog open={!!toCancel} onOpenChange={(o) => !o && setToCancel(null)} title="Cancel this order?"
        description="The restaurant will be notified. This can't be undone." confirmLabel="Cancel order" variant="destructive" onConfirm={cancel} />
    </>
  );
}
