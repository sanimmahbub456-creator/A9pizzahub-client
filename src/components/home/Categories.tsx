import Link from "next/link";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { CATEGORIES } from "@/lib/constants";
import { Reveal } from "./Reveal";

export function Categories({ counts }: { counts: Record<string, number> }) {
  return (
    <section id="categories" className="scroll-mt-20 bg-secondary/50 py-20">
      <div className="container-px">
        <SectionHeading eyebrow="Pick your slice" title="Pizza Categories" description="From timeless classics to gourmet creations, find exactly what you're craving." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map(({ name, icon: Icon, blurb }, i) => (
            <Reveal key={name} delay={i * 0.05} className="h-full">
              <Link
                href={`/menu?category=${encodeURIComponent(name)}`}
                className="group flex h-full items-center gap-4 rounded-2xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-lg"
              >
                <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-7" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold">{name}</h3>
                  <p className="line-clamp-1 text-sm text-muted-foreground">{blurb}</p>
                  <p className="mt-1 text-xs font-bold text-accent">{counts[name] ?? 0} items</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
