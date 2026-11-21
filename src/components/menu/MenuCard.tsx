import { Crown, MapPin, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MenuItem } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

/** Equal-height menu card used on Home, Browse Menu and dashboards */
export function MenuCard({ item }: { item: MenuItem }) {
  const premium = item.vendor?.subscriptionPlan === "premium";
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={item.images[0]}
          alt={item.itemName}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <Badge variant="secondary" className="absolute top-3 left-3 bg-background/90 backdrop-blur">{item.category}</Badge>
        {premium && (
          <Badge variant="premium" className="absolute top-3 right-3"><Crown /> Featured</Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 text-lg font-semibold">{item.itemName}</h3>
          <span className="shrink-0 font-display text-lg font-bold text-primary">{formatPrice(item.price)}</span>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0 text-accent" />
          <span className="line-clamp-1">{item.location}</span>
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Store className="size-3.5 shrink-0 text-accent" />
          <span className="line-clamp-1">{item.vendor?.businessName ?? item.vendor?.name ?? "Local pizzeria"}</span>
        </p>
        <Button asChild className="mt-auto w-full translate-y-0" variant="outline">
          <Link href={`/menu/${item._id}`} className="mt-4">View Details</Link>
        </Button>
      </div>
    </article>
  );
}

export function MenuCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card">
      <div className="aspect-[4/3] animate-pulse bg-muted" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-10 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  );
}
