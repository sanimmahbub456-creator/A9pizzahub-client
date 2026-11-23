import { ArrowRight, Crown, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { MenuItem } from "@/lib/types";
import { formatPrice, initials } from "@/lib/utils";

/** Equal-height menu card used on Home, Browse Menu and dashboards */
export function MenuCard({ item }: { item: MenuItem }) {
  const premium = item.vendor?.subscriptionPlan === "premium";
  const vendorName = item.vendor?.businessName ?? item.vendor?.name ?? "Local pizzeria";
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
      <Link href={`/menu/${item._id}`} className="relative block aspect-[4/3] overflow-hidden bg-muted" aria-label={`View ${item.itemName}`}>
        <Image
          src={item.images[0]}
          alt={item.itemName}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {premium && (
          <Badge variant="premium" className="absolute top-3 right-3"><Crown /> Featured</Badge>
        )}
        <Badge variant="secondary" className="absolute bottom-3 left-3 bg-background/90 backdrop-blur">{item.category}</Badge>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 text-lg font-semibold">{item.itemName}</h3>
          <span className="shrink-0 font-display text-lg font-bold text-primary">{formatPrice(item.price)}</span>
        </div>

        <div className="mt-3 flex items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
            {initials(vendorName)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{vendorName}</p>
            <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0 text-accent" /> {item.location}
            </p>
          </div>
        </div>

        <div className="mt-auto pt-4">
          <Link
            href={`/menu/${item._id}`}
            className="flex items-center justify-between border-t pt-3 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            View details
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
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
        <div className="flex items-center gap-2">
          <div className="size-8 animate-pulse rounded-full bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-px bg-muted" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
