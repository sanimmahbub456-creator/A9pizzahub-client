"use client";
import { CheckCircle2, Clock, Crown } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PageLoader, PizzaSpinner } from "@/components/shared/Loader";
import { Button } from "@/components/ui/button";
import { api, errorMessage } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { formatDate, formatPrice } from "@/lib/utils";

type Info = { status: string; amount: number; currency: string; subscriptionPlan: string; subscriptionExpiresAt: string | null; createdAt: string };

/**
 * The redirect alone never activates Premium. This page only *reads* the transaction,
 * polling until the verified Stripe webhook has marked it paid.
 */
export function PaymentSuccess() {
  const sessionId = useSearchParams().get("session_id");
  const [info, setInfo] = useState<Info | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!sessionId) return setError("Missing payment session.");
    let tries = 0;
    let stop = false;
    const poll = async () => {
      try {
        const r = await api<{ data: Info }>(`/api/payments/session/${sessionId}`);
        if (stop) return;
        setInfo(r.data);
        if (r.data.status === "paid" && r.data.subscriptionPlan === "premium") {
          authClient.getSession({ query: { disableCookieCache: true } });
          return;
        }
      } catch (e) {
        if (!stop) setError(errorMessage(e));
        return;
      }
      if (++tries < 15) setTimeout(poll, 2000);
      else setTimedOut(true);
    };
    poll();
    return () => {
      stop = true;
    };
  }, [sessionId]);

  if (error) {
    return (
      <Card>
        <h1 className="text-2xl font-bold">We couldn&apos;t verify this payment</h1>
        <p className="mt-2 text-muted-foreground">{error}</p>
        <Button asChild className="mt-6"><Link href="/dashboard/vendor/subscription">Go to Subscription</Link></Button>
      </Card>
    );
  }
  if (!info) return <PageLoader label="Processing payment…" />;

  const confirmed = info.status === "paid" && info.subscriptionPlan === "premium";
  return (
    <Card>
      {confirmed ? (
        <>
          <CheckCircle2 className="mx-auto size-16 text-success" />
          <h1 className="mt-4 text-3xl font-bold">You&apos;re Premium! 👑</h1>
          <p className="mt-2 text-muted-foreground">Payment confirmed by Stripe. Unlimited menu items, your Premium badge and featured placement are now active.</p>
          <dl className="mt-6 grid grid-cols-2 gap-3 text-left text-sm">
            <div className="rounded-xl bg-muted p-3"><dt className="text-muted-foreground">Amount</dt><dd className="font-semibold">{formatPrice(info.amount, info.currency)}/month</dd></div>
            <div className="rounded-xl bg-muted p-3"><dt className="text-muted-foreground">Renews</dt><dd className="font-semibold">{info.subscriptionExpiresAt ? formatDate(info.subscriptionExpiresAt) : "Monthly"}</dd></div>
          </dl>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild><Link href="/dashboard/vendor/items/new"><Crown /> Add menu items</Link></Button>
            <Button asChild variant="outline"><Link href="/dashboard/vendor">Go to dashboard</Link></Button>
          </div>
        </>
      ) : (
        <>
          {timedOut ? <Clock className="mx-auto size-14 text-warning" /> : <PizzaSpinner className="mx-auto" />}
          <h1 className="mt-4 text-2xl font-bold">{timedOut ? "Payment is still being confirmed" : "Confirming your payment…"}</h1>
          <p className="mt-2 text-muted-foreground">
            {timedOut
              ? "Stripe hasn't confirmed this payment yet. Premium activates automatically as soon as it does. Check your Subscription page in a minute."
              : "We're waiting for Stripe's secure confirmation. This usually takes a few seconds."}
          </p>
          {timedOut && <Button asChild className="mt-6"><Link href="/dashboard/vendor/subscription">Go to Subscription</Link></Button>}
        </>
      )}
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto my-16 max-w-lg rounded-3xl border bg-card p-8 text-center shadow-lg">{children}</div>;
}
