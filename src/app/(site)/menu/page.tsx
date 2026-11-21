import type { Metadata } from "next";
import { Suspense } from "react";
import { BrowseMenu } from "@/components/menu/BrowseMenu";
import { PageLoader } from "@/components/shared/Loader";

export const metadata: Metadata = { title: "Browse Menu" };

export default function MenuPage() {
  return (
    <>
      <section className="bg-checker">
        <div className="bg-gradient-to-b from-background/80 to-background py-12">
          <div className="container-px text-center">
            <p className="mb-2 text-xs font-bold tracking-[0.2em] text-primary uppercase">The full spread</p>
            <h1 className="text-4xl font-bold sm:text-5xl">Browse Menu</h1>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Every approved pizza, side and drink from our partner pizzerias. Search, filter and sort to find your next favourite.</p>
          </div>
        </div>
      </section>
      <div className="container-px pb-20">
        <Suspense fallback={<PageLoader label="Loading menu…" />}>
          <BrowseMenu />
        </Suspense>
      </div>
    </>
  );
}
