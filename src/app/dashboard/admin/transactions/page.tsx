"use client";
import { Lock } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/Loader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Transaction } from "@/lib/types";
import { useFetch } from "@/lib/useFetch";
import { formatDate, formatPrice } from "@/lib/utils";

/** Read-only by design: payment records can only be changed by verified Stripe webhooks */
export default function TransactionsPage() {
  const [status, setStatus] = useState("all");
  const { data, loading, error, reload } = useFetch<Transaction[]>(`/api/admin/transactions${status === "all" ? "" : `?status=${status}`}`);

  return (
    <>
      <PageHeader title="Transactions" description="All vendor subscription payments."
        action={
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {["paid", "pending", "failed", "expired", "cancelled"].map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
            </SelectContent>
          </Select>
        } />
      <p className="mb-4 flex items-center gap-2 text-sm text-muted-foreground"><Lock className="size-4" /> Payment records are read-only and updated only by verified Stripe webhooks.</p>
      {loading ? <PageLoader label="Loading transactions…" /> : error ? (
        <EmptyState title="Couldn't load transactions" description={error} action={<Button onClick={reload}>Retry</Button>} />
      ) : !data?.length ? <EmptyState title="No transactions yet" description="Vendor upgrades will be listed here." /> : (
        <Table>
          <TableHeader><TableRow><TableHead>Vendor</TableHead><TableHead>Plan</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.map((t) => (
              <TableRow key={t._id}>
                <TableCell><p className="font-semibold">{t.vendor?.businessName ?? t.vendor?.name ?? "Deleted vendor"}</p><p className="text-xs text-muted-foreground">{t.vendor?.email}</p></TableCell>
                <TableCell className="capitalize">{t.plan}</TableCell>
                <TableCell className="font-semibold">{formatPrice(t.amount, t.currency)}</TableCell>
                <TableCell><StatusBadge status={t.status} /></TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(t.createdAt, true)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}
