import { Crown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "./Reveal";

export function VendorCta() {
  return (
    <section className="container-px py-20">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[#e2531f] px-6 py-12 text-center text-primary-foreground sm:px-12">
          <div className="absolute -top-16 -right-16 size-56 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 -left-10 size-56 rounded-full bg-white/10" />
          <Crown className="mx-auto mb-4 size-10" />
          <h2 className="text-3xl font-bold sm:text-4xl">Own a pizzeria? Grow with PizzaHub.</h2>
          <p className="mx-auto mt-3 max-w-xl opacity-90">
            List up to 3 items free. Go Premium for unlimited items, a Premium badge and featured placement on our homepage.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-7">
            <Link href="/signup">Register your restaurant</Link>
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
