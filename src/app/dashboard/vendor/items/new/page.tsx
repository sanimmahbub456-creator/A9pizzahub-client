"use client";
import { Crown } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { ItemForm } from "@/components/dashboard/ItemForm";
import { PageLoader } from "@/components/shared/Loader";
import { Button } from "@/components/ui/button";
import { FREE_ITEM_LIMIT } from "@/lib/constants";
import { useFetch } from "@/lib/useFetch";

export default function AddMenuItemPage() {
  const { data, loading } = useFetch<{ activeItems: number; subscriptionPlan: string }>("/api/vendor/stats");
  if (loading) return <PageLoader />;
  const limited = data && data.subscriptionPlan !== "premium" && data.activeItems >= FREE_ITEM_LIMIT;

  return (
    <>
      <PageHeader title="Add Menu Item" description="New items are reviewed by an admin before customers can see them." />
      {limited ? (
        <div className="max-w-xl rounded-2xl border bg-card p-8 text-center">
          <Crown className="mx-auto size-12 text-accent" />
          <h2 className="mt-3 text-2xl font-bold">You&apos;ve reached the Free plan limit</h2>
          <p className="mt-2 text-muted-foreground">Free vendors can have {FREE_ITEM_LIMIT} active items. Upgrade to Premium for unlimited items, or deactivate an existing item.</p>
          <div className="mt-5 flex justify-center gap-3">
            <Button asChild><Link href="/dashboard/vendor/subscription">Upgrade to Premium</Link></Button>
            <Button asChild variant="outline"><Link href="/dashboard/vendor/items">Manage items</Link></Button>
          </div>
        </div>
      ) : (
        <ItemForm />
      )}
    </>
  );
}
