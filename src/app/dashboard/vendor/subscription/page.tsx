"use client";
import { ArrowRight, Check, Crown, Loader2, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PageLoader } from "@/components/shared/Loader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, errorMessage } from "@/lib/api";
import { FREE_ITEM_LIMIT, PREMIUM_PRICE } from "@/lib/constants";
import type { Transaction } from "@/lib/types";
import { useFetch } from "@/lib/useFetch";
import { cn, formatDate, formatPrice } from "@/lib/utils";

const freeFeatures = [`Up to ${FREE_ITEM_LIMIT} active menu items`, "Vendor dashboard", "Order management"];
const premiumFeatures = ["Unlimited active menu items", "Premium vendor badge", "Featured placement on the homepage", "Everything in Free"];

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
  const isPremium = stats.data?.subscriptionPlan === "premium";

  return (
    <>
      {/* Heading */}
      <div className="mb-10 text-center">
        <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">Plans for every pizzeria</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          Fire up <span className="text-primary italic">more ovens.</span>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          Start free, upgrade when you&apos;re ready. Secure checkout by Stripe (test mode).
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl items-stretch gap-6 md:grid-cols-2">
        {/* Free */}
        <div className="flex flex-col rounded-3xl border bg-card p-7 shadow-sm">
          <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">The starter</p>
          <h2 className="mt-1 text-2xl font-bold">Free</h2>
          <p className="mt-3">
            <span className="font-display text-4xl font-bold">{formatPrice(0)}</span>
            <span className="text-sm text-muted-foreground"> / forever</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">For pizzerias just getting started.</p>
          <ul className="mt-6 flex-1 space-y-3">
            {freeFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm"><Check className="size-4 text-success" /> {f}</li>
            ))}
          </ul>
          <Button variant="outline" className="mt-7 w-full" disabled>
            {isPremium ? "Included in Premium" : "Current plan"}
          </Button>
        </div>

        {/* Premium */}
        <div className="relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[#9f1d16] p-7 text-primary-foreground shadow-xl shadow-primary/25">
          <div className="absolute -top-16 -right-16 size-48 rounded-full bg-white/10" />
          <div className="flex items-start justify-between">
            <p className="text-xs font-bold tracking-widest uppercase opacity-80">The full oven</p>
            <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
              <Crown className="size-3.5" /> {isPremium ? "Your plan" : "Most popular"}
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-bold">Premium</h2>
          <p className="mt-3">
            <span className="font-display text-4xl font-bold">{formatPrice(PREMIUM_PRICE)}</span>
            <span className="text-sm opacity-80"> / month</span>
          </p>
          <p className="mt-1 text-sm opacity-80">For pizzerias ready to serve more.</p>
          <ul className="mt-6 flex-1 space-y-3">
            {premiumFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm"><Check className="size-4" /> {f}</li>
            ))}
          </ul>

          {isPremium ? (
            <div className="mt-7 space-y-3">
              {stats.data?.subscriptionExpiresAt && (
                <p className="text-sm opacity-90">Active until {formatDate(stats.data.subscriptionExpiresAt)} · renews automatically</p>
              )}
              <Button variant="secondary" className="w-full" onClick={() => setConfirmCancel(true)}>Cancel subscription</Button>
            </div>
          ) : (
            <>
              <Button size="lg" variant="secondary" className="mt-7 w-full" onClick={upgrade} disabled={redirecting}>
                {redirecting ? <Loader2 className="animate-spin" /> : <Crown />}
                {redirecting ? "Redirecting to Stripe…" : "Upgrade to Premium"}
                {!redirecting && <ArrowRight />}
              </Button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs opacity-80">
                <Lock className="size-3" /> Test mode: use card 4242 4242 4242 4242
              </p>
            </>
          )}
        </div>
      </div>

      {/* History */}
      <div className="mx-auto mt-12 max-w-4xl">
        <h2 className="mb-4 text-2xl font-bold">Payment history</h2>
        {tx.loading ? <PageLoader className="min-h-40" /> : !tx.data?.length ? (
          <p className="rounded-2xl border border-dashed bg-card/50 p-6 text-center text-sm text-muted-foreground">No payments yet.</p>
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
                  <TableCell className={cn("font-mono text-xs text-muted-foreground")}>…{t.reference}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <ConfirmDialog open={confirmCancel} onOpenChange={setConfirmCancel} title="Cancel Premium?"
        description="You'll keep Premium until the end of the current billing period. After that, only your 3 newest items stay active."
        confirmLabel="Cancel subscription" variant="destructive" onConfirm={cancel} />
    </>
  );
}
