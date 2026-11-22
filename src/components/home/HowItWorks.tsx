import { ClipboardList, PackageCheck, Search, Truck } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "./Reveal";

const steps = [
  { icon: Search, title: "Browse & filter", text: "Search by name, category, location or price." },
  { icon: ClipboardList, title: "Place your order", text: "Choose a delivery date, address and any special notes." },
  { icon: PackageCheck, title: "Vendor confirms", text: "The pizzeria accepts your order and starts the oven." },
  { icon: Truck, title: "Enjoy it hot", text: "Your pizza arrives on the date you picked. Pay securely at checkout." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-sidebar py-20 text-sidebar-foreground">
      <div className="container-px">
        <SectionHeading
          eyebrow="Simple as 1-2-3-4"
          title="How PizzaHub Works"
          description="From craving to first bite in four easy steps."
          className="[&_p:last-child]:text-sidebar-foreground/70 [&_p:first-child]:text-accent"
        />
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.1} className="h-full">
              <li className="relative h-full rounded-2xl border border-white/10 bg-white/5 p-6">
                <span className="absolute top-4 right-5 font-display text-5xl font-bold text-white/10">0{i + 1}</span>
                <div className="mb-4 grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <Icon className="size-6" />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-sidebar-foreground/70">{text}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}