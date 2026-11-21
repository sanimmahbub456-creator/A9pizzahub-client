"use client";
import { ArrowRight, Bike, Clock, Star } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PizzaIllustration } from "./PizzaIllustration";

export function Hero() {
  const reduce = useReducedMotion();
  return (
    <section className="relative overflow-hidden bg-checker">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-secondary/80" />
      <div className="container-px relative grid items-center gap-10 py-14 md:py-20 lg:grid-cols-2">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center lg:text-left"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-4 py-1.5 text-xs font-bold text-primary shadow-sm">
            <span className="size-2 animate-pulse rounded-full bg-primary" /> Ovens are hot near you
          </span>
          <h1 className="mt-5 text-4xl leading-[1.05] font-bold sm:text-5xl xl:text-6xl">
            Hot &amp; Fresh Pizza <span className="text-primary italic">Delivered</span> to Your Door
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0">
            Discover neighbourhood pizzerias, compare menus, and schedule your delivery in a few taps. Real ovens, real cheese, real fast.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Button asChild size="lg">
              <Link href="/menu">Explore Pizza Menu <ArrowRight /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/signup">Become a Vendor</Link>
            </Button>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 text-left mx-auto lg:mx-0">
            {[
              { icon: Clock, k: "30 min", v: "avg. delivery" },
              { icon: Star, k: "4.8/5", v: "happy eaters" },
              { icon: Bike, k: "Free", v: "over $25" },
            ].map(({ icon: Icon, k, v }) => (
              <div key={v} className="rounded-2xl bg-card/80 p-3 shadow-sm">
                <Icon className="mb-1 size-4 text-accent" />
                <dt className="font-display text-lg font-bold">{k}</dt>
                <dd className="text-xs text-muted-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <motion.div
          className="relative mx-auto w-full max-w-md lg:max-w-lg"
          initial={reduce ? false : { opacity: 0, scale: 0.85, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="absolute inset-6 rounded-full bg-primary/25 blur-3xl" />
          <motion.div
            animate={reduce ? undefined : { rotate: 360 }}
            transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          >
            <PizzaIllustration className="relative w-full drop-shadow-2xl" />
          </motion.div>
          <div className="absolute -bottom-2 -left-2 rounded-2xl border bg-card px-4 py-3 shadow-lg sm:left-0">
            <p className="text-xs text-muted-foreground">Today&apos;s favourite</p>
            <p className="font-display font-bold">Pepperoni Inferno 🔥</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
