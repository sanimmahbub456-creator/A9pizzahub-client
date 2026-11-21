"use client";
import { Check, Crown, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PageLoader } from "@/components/shared/Loader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, errorMessage } from "@/lib/api";
import { FREE_ITEM_LIMIT, PREMIUM_PRICE } from "@/lib/constants";
import type { Transaction } from "@/lib/types";
import { useFetch } from "@/lib/useFetch";
import { cn, formatDate, formatPrice } from "@/lib/utils";

const plans = [
  { id: "free", name: "Free", price: 0, features: [`Max ${FREE_ITEM_LIMIT} active menu items`, "Basic vendor dashboard", "Order management"] },
  { id: "premium", name: "Premium", price: PREMIUM_PRICE, features: ["Unlimited active items", "Premium vendor badge", "Featured menu placement", "All Free features"] },
];

export default function SubscriptionPage() {
  const stats = useFetch<{ subscriptionPlan: string; subscriptionExpiresAt: string | null; activeItems: number }>("/api/vendor/stats");
  const tx = useFetch<Transaction[]>("/api/payments/my-transactions");
  const [redirecting, setRedirecting] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const upgrade = async () => {
    setRedirecting(true);
    try {
      const r = await api<{ data: { url: string } }>("/api/payments/create-checkout-session", { method: "POST" });
      window.location.href = r.data.url;
    } catch (e) {
      toast.error(errorMessage(e));
      setRedirecting(false);
    }
  };

  const cancel = async () => {
    try {
      const r = await api<{ message: string }>("/api/payments/cancel-subscription", { method: "POST" });
      toast.success(r.message);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  if (stats.loading) return <PageLoader />;
  const current = stats.data?.subscriptionPlan ?? "free";

  return (
    <>
      <PageHeader title="Subscription" description="Choose the plan that fits your pizzeria." />
      <div className="grid max-w-4xl gap-6 md:grid-cols-2">
        {plans.map((p) => {
          const isCurrent = current === p.id;
          const premium = p.id === "premium";
          return (
            <div key={p.id} className={cn("relative flex flex-col rounded-3xl border-2 bg-card p-7 shadow-sm", premium ? "border-primary" : "border-border")}>
              {premium && <Badge variant="premium" className="absolute -top-3 left-7"><Crown /> Most popular</Badge>}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{p.name}</h2>
                {isCurrent && <Badge variant="success">Current plan</Badge>}
              </div>
              <p className="mt-3"><span className="font-display text-4xl font-bold">{formatPrice(p.price)}</span><span className="text-muted-foreground">/month</span></p>
              <ul className="mt-6 flex-1 space-y-3">
                {p.features.map((f) => <li key={f} className="flex items-center gap-2 text-sm"><Check className="size-4 text-success" /> {f}</li>)}
              </ul>
              {premium && (
                <div className="mt-7">
                  {isCurrent ? (
                    <div className="space-y-3">
                      {stats.data?.subscriptionExpiresAt && <p className="text-sm text-muted-foreground">Active until {formatDate(stats.data.subscriptionExpiresAt)} (auto-renews)</p>}
                      <Button variant="outline" className="w-full" onClick={() => setConfirmCancel(true)}>Cancel subscription</Button>
                    </div>
                  ) : (
                    <Button size="lg" className="w-full" onClick={upgrade} disabled={redirecting}>
                      {redirecting ? <Loader2 className="animate-spin" /> : <Crown />} {redirecting ? "Redirecting to Stripe…" : "Upgrade to Premium"}
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <h2 className="mt-12 mb-4 text-2xl font-bold">Payment history</h2>
      {tx.loading ? <PageLoader className="min-h-40" /> : !tx.data?.length ? (
        <p className="text-sm text-muted-foreground">No payments yet.</p>
      ) : (
        <Table>
          <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Plan</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Reference</TableHead></TableRow></TableHeader>
          <TableBody>
            {tx.data.map((t) => (
              <TableRow key={t._id}>
                <TableCell>{formatDate(t.createdAt, true)}</TableCell>
                <TableCell className="capitalize">{t.plan}</TableCell>
                <TableCell>{formatPrice(t.amount, t.currency)}</TableCell>
                <TableCell><StatusBadge status={t.status} /></TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">…{t.reference}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <ConfirmDialog open={confirmCancel} onOpenChange={setConfirmCancel} title="Cancel Premium?"
        description="You'll keep Premium until the end of the current billing period. After that, only your 3 newest items stay active."
        confirmLabel="Cancel subscription" variant="destructive" onConfirm={cancel} />
    </>
  );
}
