"use client";
import { ArrowLeft, Crown, Info, MapPin, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/Loader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApiError, api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import type { MenuItem } from "@/lib/types";
import { cn, formatPrice, initials } from "@/lib/utils";
import { OrderDialog } from "./OrderDialog";

export function ItemDetails({ id }: { id: string }) {
  const { data: session } = useSession();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    api<{ data: MenuItem }>(`/api/menu/${id}`)
      .then((r) => setItem(r.data))
      .catch((e) => setError({ status: e instanceof ApiError ? e.status : 0, message: e.message }));
  }, [id]);

  if (error) {
    return (
      <div className="container-px py-16">
        <EmptyState
          title={error.status === 404 || error.status === 400 ? "Menu item not found" : "Couldn't load this item"}
          description={error.status === 400 ? "That item ID is not valid." : error.message}
          action={<Button asChild><Link href="/menu">Back to menu</Link></Button>}
        />
      </div>
    );
  }
  if (!item) return <PageLoader label="Loading item…" />;

  const role = session?.user?.role as string | undefined;
  const isOwner = session?.user?.id === String(item.vendorId);
  const premium = item.vendor?.subscriptionPlan === "premium";

  return (
    <div className="container-px py-10">
      <Button asChild variant="ghost" size="sm" className="mb-6"><Link href="/menu"><ArrowLeft /> Back to menu</Link></Button>
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border bg-muted">
            <Image src={item.images[active]} alt={item.itemName} fill priority sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
          </div>
          {item.images.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-3">
              {item.images.map((src, i) => (
                <button key={src + i} onClick={() => setActive(i)} aria-label={`Show image ${i + 1}`}
                  className={cn("relative aspect-square cursor-pointer overflow-hidden rounded-xl border-2 transition", i === active ? "border-primary" : "border-transparent opacity-70 hover:opacity-100")}>
                  <Image src={src} alt="" fill sizes="120px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{item.category}</Badge>
            {item.status !== "approved" && <StatusBadge status={item.status} />}
          </div>
          <h1 className="mt-3 text-4xl font-bold">{item.itemName}</h1>
          <p className="mt-3 font-display text-3xl font-bold text-primary">{formatPrice(item.price)}</p>
          <p className="mt-5 leading-relaxed whitespace-pre-line text-muted-foreground">{item.description}</p>
          <p className="mt-5 flex items-center gap-2 text-sm"><MapPin className="size-4 text-accent" /> {item.location}</p>

          <div className="mt-6 flex items-center gap-3 rounded-2xl border bg-card p-4">
            <Avatar className="size-12">
              <AvatarImage src={item.vendor?.image ?? undefined} />
              <AvatarFallback>{initials(item.vendor?.businessName ?? item.vendor?.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-semibold">
                <Store className="size-4 text-accent" /> {item.vendor?.businessName ?? "Local pizzeria"}
              </p>
              <p className="text-sm text-muted-foreground">Run by {item.vendor?.name}</p>
            </div>
            {premium && <Badge variant="premium"><Crown /> Premium</Badge>}
          </div>

          <div className="mt-8">
            {item.canOrder ? (
              <OrderDialog item={item} />
            ) : (
              <div className="flex items-start gap-3 rounded-2xl bg-secondary/60 p-4 text-sm">
                <Info className="mt-0.5 size-4 shrink-0 text-secondary-foreground" />
                <p>
                  {isOwner
                    ? "This is your own menu item. Vendors can't order their own items."
                    : role === "admin"
                      ? "Admins can't place customer orders."
                      : role === "vendor"
                        ? "Vendor accounts can't place orders. Sign in with a customer account to order."
                        : "This item is not available for ordering right now."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
