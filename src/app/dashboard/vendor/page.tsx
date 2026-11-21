"use client";
import { CheckCircle2, Clock, Crown, ListChecks, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { ChartCard, StatusPie, TrendChart, lastNDays } from "@/components/dashboard/Charts";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { StatCard, StatGridSkeleton } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { FREE_ITEM_LIMIT } from "@/lib/constants";
import { useFetch } from "@/lib/useFetch";
import { formatDate } from "@/lib/utils";

type Stats = {
  totalItems: number; activeItems: number; approvedItems: number; pendingItems: number; pendingOrders: number; acceptedOrders: number;
  orderStatus: { status: string; count: number }[]; ordersByDay: { _id: string; count: number }[];
  subscriptionPlan: string; subscriptionExpiresAt: string | null;
};

export default function VendorOverview() {
  const { data, loading, error, reload } = useFetch<Stats>("/api/vendor/stats");

  return (
    <>
      <PageHeader title="Vendor Overview" description="How your pizzeria is doing at a glance." action={<Button asChild><Link href="/dashboard/vendor/items/new">Add Menu Item</Link></Button>} />
      {loading ? <StatGridSkeleton n={5} /> : error || !data ? (
        <EmptyState title="Couldn't load your stats" description={error ?? ""} action={<Button onClick={reload}>Retry</Button>} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Total Menu Items" value={data.totalItems} icon={UtensilsCrossed} />
            <StatCard label="Active Menu Items" value={data.activeItems} icon={ListChecks} tone="green"
              hint={data.subscriptionPlan === "premium" ? "Unlimited" : `${data.activeItems}/${FREE_ITEM_LIMIT} on Free plan`} />
            <StatCard label="Pending Orders" value={data.pendingOrders} icon={Clock} tone="amber" />
            <StatCard label="Accepted Orders" value={data.acceptedOrders} icon={CheckCircle2} tone="orange" />
            <StatCard label="Current Plan" value={data.subscriptionPlan} icon={Crown} tone="brown"
              hint={data.subscriptionExpiresAt ? `Renews ${formatDate(data.subscriptionExpiresAt)}` : undefined} />
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <ChartCard title="Orders received (last 14 days)" className="lg:col-span-2"><TrendChart data={lastNDays(data.ordersByDay)} label="Orders" /></ChartCard>
            <ChartCard title="Orders by status"><StatusPie data={data.orderStatus} /></ChartCard>
          </div>
          {data.subscriptionPlan !== "premium" && (
            <div className="mt-6 flex flex-col items-start gap-4 rounded-2xl bg-gradient-to-r from-primary to-accent p-6 text-primary-foreground sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-bold">Unlock unlimited menu items</h3>
                <p className="text-sm opacity-90">Premium vendors get a badge and featured placement on the homepage.</p>
              </div>
              <Button asChild variant="secondary"><Link href="/dashboard/vendor/subscription"><Crown /> Upgrade to Premium</Link></Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
