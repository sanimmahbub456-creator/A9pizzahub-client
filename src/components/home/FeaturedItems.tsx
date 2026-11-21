import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { MenuCard } from "@/components/menu/MenuCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/button";
import type { MenuItem } from "@/lib/types";
import { Reveal } from "./Reveal";

export function FeaturedItems({ items, error }: { items: MenuItem[]; error?: boolean }) {
  return (
    <section className="container-px py-20">
      <SectionHeading
        eyebrow="Fresh out of the oven"
        title="Featured Menu Items"
        description="Hand-picked favourites from our Premium partner pizzerias and the newest approved additions."
      />
      {items.length === 0 ? (
        <EmptyState
          title={error ? "Menu is taking a quick break" : "No pizzas yet"}
          description={error ? "We couldn't load the menu right now. Please refresh in a moment." : "Vendors are adding their first items. Check back soon!"}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item, i) => (
            <Reveal key={item._id} delay={(i % 4) * 0.06} className="h-full">
              <MenuCard item={item} />
            </Reveal>
          ))}
        </div>
      )}
      <div className="mt-10 text-center">
        <Button asChild variant="outline" size="lg">
          <Link href="/menu">See the full menu <ArrowRight /></Link>
        </Button>
      </div>
    </section>
  );
}
