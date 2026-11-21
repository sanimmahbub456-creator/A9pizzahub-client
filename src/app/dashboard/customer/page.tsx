"use client";
import { CheckCircle2, Clock, ShoppingBag, XCircle } from "lucide-react";
import Link from "next/link";
import { ChartCard, StatusPie } from "@/components/dashboard/Charts";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { StatCard, StatGridSkeleton } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import type { Order } from "@/lib/types";
import { useFetch } from "@/lib/useFetch";
import { formatDate } from "@/lib/utils";

type Stats = { total: number; pending: number; accepted: number; rejected: number; cancelled: number };

export default function CustomerOverview() {
  const { data, loading, error, reload } = useFetch<Stats>("/api/orders/stats");
  const recent = useFetch<Order[]>("/api/orders/my");

  return (
    <>
      <PageHeader title="My Overview" description="All your pizza orders in one place." action={<Button asChild><Link href="/menu">Order more pizza</Link></Button>} />
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
            <ChartCard title="Orders by status" className="lg:col-span-2">
              <StatusPie data={(["pending", "accepted", "rejected", "cancelled"] as const).map((s) => ({ status: s, count: data[s] }))} />
            </ChartCard>
            <div className="rounded-2xl border bg-card p-5 shadow-sm lg:col-span-3">
              <div className="mb-4 flex items-center justify-between"><h3 className="font-semibold">Recent orders</h3><Link href="/dashboard/customer/orders" className="text-sm font-semibold text-primary hover:underline">View all</Link></div>
              {!recent.data?.length ? <p className="py-10 text-center text-sm text-muted-foreground">No orders yet. Go find a pizza!</p> : (
                <ul className="divide-y">
                  {recent.data.slice(0, 5).map((o) => (
                    <li key={o._id} className="flex items-center justify-between gap-3 py-3">
                      <Link href={`/dashboard/customer/orders/${o._id}`} className="min-w-0 hover:text-primary">
                        <p className="truncate font-semibold">{o.item?.itemName ?? "Deleted item"}</p>
                        <p className="text-xs text-muted-foreground">Delivery {formatDate(o.deliveryDate)}</p>
                      </Link>
                      <StatusBadge status={o.status} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
