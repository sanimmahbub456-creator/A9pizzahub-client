"use client";
import { Banknote, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, errorMessage } from "@/lib/api";
import type { MenuItem } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

const today = () => new Date().toISOString().slice(0, 10);

export function OrderDialog({ item }: { item: MenuItem }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ deliveryDate: today(), deliveryAddress: "", message: "" });
  const [placed, setPlaced] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.deliveryDate) e.deliveryDate = "Choose a delivery date";
    else if (form.deliveryDate < today()) e.deliveryDate = "Delivery date cannot be in the past";
    if (form.deliveryAddress.trim().length < 8) e.deliveryAddress = "Please enter a complete delivery address";
    if (form.message.length > 500) e.message = "Keep instructions under 500 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await api<{ message: string }>("/api/orders", { method: "POST", body: { itemId: item._id, ...form } });
      toast.success(res.message);
      setPlaced(true);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setPlaced(false);
      }}
    >
      <DialogTrigger asChild>
        <Button size="lg" className="w-full sm:w-auto">Order Now</Button>
      </DialogTrigger>
      <DialogContent>
        {placed ? (
          <div className="py-4 text-center">
            <p className="text-5xl">🍕</p>
            <DialogTitle className="mt-3">Order placed!</DialogTitle>
            <DialogDescription className="mt-2">The restaurant will review and accept your order shortly. You can track it from your dashboard.</DialogDescription>
            <div className="mt-6 flex justify-center gap-3">
              <Button asChild><Link href="/dashboard/customer/orders">Track my order</Link></Button>
              <Button variant="outline" onClick={() => setOpen(false)}>Keep browsing</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-4" noValidate>
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
            <div className="flex items-center gap-3 rounded-xl bg-secondary/60 p-3 text-sm">
              <Banknote className="size-5 shrink-0 text-success" />
              <span>Payment: <b>Cash on Delivery</b>. You pay {formatPrice(item.price)} when your pizza arrives.</span>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="animate-spin" />} {submitting ? "Placing order…" : "Confirm Order"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
