import { BadgeCheck, CalendarClock, Flame, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "./Reveal";

const perks = [
  { icon: Flame, title: "Oven-to-door freshness", text: "Every order is fired after you confirm, never pre-baked and left waiting." },
  { icon: BadgeCheck, title: "Admin-verified menus", text: "Each menu item is reviewed by our team before it goes live, so what you see is what you get." },
  { icon: CalendarClock, title: "Schedule ahead", text: "Pick a delivery date for parties, office lunches, or a lazy Sunday night in." },
  { icon: ShieldCheck, title: "Track every slice", text: "Follow your order from pending to accepted with a clear status timeline." },
];

export function WhyChoose() {
  return (
    <section className="container-px py-20">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.3fr]">
        <Reveal>
          <SectionHeading
            align="left"
            eyebrow="Why PizzaHub?"
            title="Why Choose PizzaHub?"
            description="We partner with local pizzerias that care about dough, sauce and timing, then make ordering from them effortless."
            className="mb-6"
          />
          <div className="rounded-2xl bg-primary p-6 text-primary-foreground shadow-xl shadow-primary/20">
            <p className="font-display text-4xl font-bold">100%</p>
            <p className="mt-1 text-sm opacity-90">of listed items are reviewed by an admin before customers can order them.</p>
          </div>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2">
          {perks.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.08} className="h-full">
              <div className="h-full rounded-2xl border bg-card p-6">
                <div className="mb-4 grid size-12 place-items-center rounded-xl bg-accent/15 text-accent">
                  <Icon className="size-6" />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
