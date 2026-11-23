import { Pizza } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { BrowseMenu } from "@/components/menu/BrowseMenu";
import { PageLoader } from "@/components/shared/Loader";

export const metadata: Metadata = { title: "Browse Menu" };

export default function MenuPage() {
  return (
    <div className="container-px pt-8 pb-20">
      {/* Banner */}
      <section className="relative mb-8 overflow-hidden rounded-3xl bg-secondary/70 px-6 py-10 sm:px-10">
        <div className="relative z-10 max-w-xl">
          <p className="mb-2 text-xs font-bold tracking-[0.2em] text-primary uppercase">Browse menu</p>
          <h1 className="text-4xl font-bold sm:text-5xl">
            Find your <span className="text-primary italic">perfect slice.</span>
          </h1>
          <p className="mt-3 text-muted-foreground">Fresh from the ovens of independent pizzerias near you.</p>
        </div>
        <div className="absolute top-1/2 -right-6 hidden size-44 -translate-y-1/2 place-items-center rounded-full bg-primary/10 sm:grid">
          <Pizza className="size-20 text-primary" strokeWidth={1.5} />
        </div>
      </section>

      <Suspense fallback={<PageLoader label="Loading menu…" />}>
        <BrowseMenu />
      </Suspense>
    </div>
  );
}
