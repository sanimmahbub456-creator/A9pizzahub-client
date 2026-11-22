"use client";
import { ArrowLeft, ArrowRight, CalendarDays, CreditCard, Loader2, Lock, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, errorMessage } from "@/lib/api";
import type { MenuItem } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/utils";

const today = () => new Date().toISOString().slice(0, 10);
type Step = "details" | "payment" | "done";

/**
 * Order flow: 1) delivery details  2) demo checkout (no real payment - Stripe is only used
 * for vendor subscriptions, as the assignment specifies)  3) confirmation.
 */
export function OrderDialog({ item }: { item: MenuItem }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("details");
  const [paying, setPaying] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ deliveryDate: today(), deliveryAddress: "", message: "" });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.deliveryDate) e.deliveryDate = "Choose a delivery date";
    else if (form.deliveryDate < today()) e.deliveryDate = "Delivery date cannot be in the past";
    if (form.deliveryAddress.trim().length < 8) e.deliveryAddress = "Please enter a complete delivery address";
    if (form.message.length > 500) e.message = "Keep instructions under 500 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goToPayment = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (validate()) setStep("payment");
  };

  const pay = async () => {
    setPaying(true);
    try {
      // short pause so the "processing payment" state is visible, like a real checkout
      await new Promise((r) => setTimeout(r, 1200));
      const res = await api<{ message: string }>("/api/orders", { method: "POST", body: { itemId: item._id, ...form } });
      toast.success(res.message);
      setStep("done");
    } catch (e) {
      toast.error(errorMessage(e));
      // a server-side rule failed (e.g. duplicate order) - let the customer fix the details
      setStep("details");
    } finally {
      setPaying(false);
    }
  };

  const reset = (o: boolean) => {
    if (paying) return;
    setOpen(o);
    if (!o) {
      setStep("details");
      setErrors({});
    }
  };

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full sm:w-auto">Order Now</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        {step === "details" && (
          <form onSubmit={goToPayment} className="grid gap-4" noValidate>
            <DialogHeader>
              <DialogTitle>Order {item.itemName}</DialogTitle>
              <DialogDescription>
                From {item.vendor?.businessName ?? item.vendor?.name} · {formatPrice(item.price)}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="deliveryDate">Delivery Date</Label>
              <Input id="deliveryDate" type="date" min={today()} value={form.deliveryDate} aria-invalid={!!errors.deliveryDate}
                onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })} />
              {errors.deliveryDate && <p className="text-xs text-destructive">{errors.deliveryDate}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deliveryAddress">Delivery Address</Label>
              <Textarea id="deliveryAddress" rows={2} placeholder="House, road, area, city" value={form.deliveryAddress} aria-invalid={!!errors.deliveryAddress}
                onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })} />
              {errors.deliveryAddress && <p className="text-xs text-destructive">{errors.deliveryAddress}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Additional Message / Special Instructions <span className="font-normal text-muted-foreground">(optional)</span></Label>
              <Textarea id="message" rows={3} placeholder="Extra cheese, ring the bell twice…" value={form.message} aria-invalid={!!errors.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })} />
              {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => reset(false)}>Cancel</Button>
              <Button type="submit">Continue to payment <ArrowRight /></Button>
            </DialogFooter>
          </form>
        )}

        {step === "payment" && (
          <div className="grid gap-4">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground"><Lock className="size-4" /></span>
                <DialogTitle>Secure demo checkout</DialogTitle>
              </div>
              <DialogDescription className="sr-only">Demo payment for your pizza order</DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-3 rounded-xl border bg-muted/40 p-3">
              <ShieldCheck className="size-5 shrink-0 text-success" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Demo payment</p>
                <p className="text-xs text-muted-foreground">No real card or money is used</p>
              </div>
              <Badge variant="warning">Test mode</Badge>
            </div>

            <div className="flex items-center gap-3 rounded-xl border p-3">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image src={item.images[0]} alt="" fill sizes="56px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{item.itemName}</p>
                <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                  {item.vendor?.businessName ?? item.vendor?.name} · <CalendarDays className="size-3" /> {formatDate(form.deliveryDate)}
                </p>
              </div>
              <p className="font-display text-lg font-bold">{formatPrice(item.price)}</p>
            </div>

            {/* Demo card - purely visual */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#7a2a12] via-primary to-accent p-5 text-white shadow-lg">
              <div className="absolute -top-10 -right-10 size-32 rounded-full bg-white/10" />
              <div className="flex items-center justify-between text-xs font-semibold tracking-widest uppercase opacity-80">
                <span>Demo card</span>
                <CreditCard className="size-5" />
              </div>
              <p className="mt-6 font-mono text-lg tracking-[0.25em]">•••• •••• •••• 4242</p>
              <div className="mt-4 flex items-end justify-between text-xs">
                <span className="font-bold tracking-wider">VISA</span>
                <span className="opacity-80">12/30</span>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              This checkout is for demonstration only. No payment is processed and no card details are collected.
            </p>

            <Button size="lg" className="w-full" onClick={pay} disabled={paying}>
              {paying ? <><Loader2 className="animate-spin" /> Processing payment…</> : <>Pay {formatPrice(item.price)} <ArrowRight /></>}
            </Button>
            <button type="button" onClick={() => setStep("details")} disabled={paying}
              className="mx-auto flex cursor-pointer items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50">
              <ArrowLeft className="size-3.5" /> Back to order details
            </button>
          </div>
        )}

        {step === "done" && (
          <div className="py-4 text-center">
            <p className="text-5xl">🍕</p>
            <DialogTitle className="mt-3">Payment successful, order placed!</DialogTitle>
            <DialogDescription className="mt-2">
              {formatPrice(item.price)} paid (demo). The restaurant will review and accept your order shortly. You can track it from your dashboard.
            </DialogDescription>
            <div className="mt-6 flex justify-center gap-3">
              <Button asChild><Link href="/dashboard/customer/orders">Track my order</Link></Button>
              <Button variant="outline" onClick={() => reset(false)}>Keep browsing</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}