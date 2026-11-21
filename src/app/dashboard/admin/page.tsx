"use client";
import { Clock, DollarSign, Pizza, Receipt, ShoppingBag, Store, Users } from "lucide-react";
import Link from "next/link";
import { ChartCard, SimpleBar, StatusPie, TrendChart, lastNDays } from "@/components/dashboard/Charts";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { StatCard, StatGridSkeleton } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { useFetch } from "@/lib/useFetch";
import { formatPrice } from "@/lib/utils";

type Stats = {
  totalUsers: number; totalVendors: number; totalCustomers: number; totalItems: number; pendingItems: number; totalTransactions: number; totalRevenue: number;
  itemStatus: { status: string; count: number }[]; revenueByMonth: { _id: string; amount: number }[]; signupsByDay: { _id: string; count: number }[];
};

export default function AdminOverview() {
  const { data, loading, error, reload } = useFetch<Stats>("/api/admin/stats");
  return (
    <>
      <PageHeader title="Admin Overview" description="Platform health at a glance."
        action={data?.pendingItems ? <Button asChild><Link href="/dashboard/admin/items?status=pending">Review {data.pendingItems} pending</Link></Button> : undefined} />
      {loading ? <StatGridSkeleton n={8} /> : error || !data ? (
        <EmptyState title="Couldn't load stats" description={error ?? ""} action={<Button onClick={reload}>Retry</Button>} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Registered Users" value={data.totalUsers} icon={Users} />
            <StatCard label="Total Vendors" value={data.totalVendors} icon={Store} tone="orange" />
            <StatCard label="Total Customers" value={data.totalCustomers} icon={ShoppingBag} tone="green" />
            <StatCard label="Total Menu Items" value={data.totalItems} icon={Pizza} tone="brown" />
            <StatCard label="Pending Menu Items" value={data.pendingItems} icon={Clock} tone="amber" />
            <StatCard label="Total Transactions" value={data.totalTransactions} icon={Receipt} />
            <StatCard label="Subscription Revenue" value={formatPrice(data.totalRevenue)} icon={DollarSign} tone="green" />
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <ChartCard title="New sign-ups (last 14 days)"><TrendChart data={lastNDays(data.signupsByDay)} label="Sign-ups" /></ChartCard>
            <ChartCard title="Menu items by status"><StatusPie data={data.itemStatus} /></ChartCard>
            <ChartCard title="Revenue by month (USD)" className="lg:col-span-2">
              <SimpleBar data={data.revenueByMonth.map((r) => ({ month: r._id, amount: Number(r.amount.toFixed(2)) }))} xKey="month" yKey="amount" label="Revenue" />
            </ChartCard>
          </div>
        </>
      )}
    </>
  );
}
