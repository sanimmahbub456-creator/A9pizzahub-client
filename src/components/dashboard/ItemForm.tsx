"use client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api, errorMessage } from "@/lib/api";
import { CATEGORIES } from "@/lib/constants";
import type { MenuItem } from "@/lib/types";

type FormState = { itemName: string; category: string; description: string; price: string; location: string; images: string[] };

/** Shared create / edit form for menu items */
export function ItemForm({ item }: { item?: MenuItem }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    itemName: item?.itemName ?? "",
    category: item?.category ?? "",
    description: item?.description ?? "",
    price: item ? String(item.price) : "",
    location: item?.location ?? "",
    images: item?.images ?? [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const set = (k: keyof FormState, v: string | string[]) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.itemName.trim().length < 3) e.itemName = "Item name must be at least 3 characters";
    if (!form.category) e.category = "Choose a category";
    if (form.description.trim().length < 20) e.description = "Description must be at least 20 characters";
    const p = Number(form.price);
    if (!form.price || Number.isNaN(p) || p <= 0) e.price = "Enter a valid price greater than 0";
    else if (p > 1000) e.price = "Price looks too high";
    if (form.location.trim().length < 2) e.location = "Location is required";
    if (form.images.length === 0) e.images = "Upload at least one image";
    setErrors(e);
    if (Object.keys(e).length) toast.error("Please fix the highlighted fields");
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const body = { ...form, itemName: form.itemName.trim(), description: form.description.trim(), location: form.location.trim(), price: Number(form.price) };
    try {
      const res = item
        ? await api<{ message: string }>(`/api/vendor/items/${item._id}`, { method: "PATCH", body })
        : await api<{ message: string }>("/api/vendor/items", { method: "POST", body });
      toast.success(res.message);
      router.push("/dashboard/vendor/items");
    } catch (e) {
      toast.error(errorMessage(e));
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="grid max-w-3xl gap-5 rounded-2xl border bg-card p-6 shadow-sm">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="itemName">Item Name</Label>
          <Input id="itemName" value={form.itemName} onChange={(e) => set("itemName", e.target.value)} aria-invalid={!!errors.itemName} placeholder="Smoky BBQ Chicken" />
          {errors.itemName && <p className="text-xs text-destructive">{errors.itemName}</p>}
        </div>
        <div className="grid gap-2">
          <Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => set("category", v)}>
            <SelectTrigger aria-invalid={!!errors.category}><SelectValue placeholder="Choose a category" /></SelectTrigger>
            <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
          {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="price">Price (USD)</Label>
          <Input id="price" type="number" step="0.01" min="0" value={form.price} onChange={(e) => set("price", e.target.value)} aria-invalid={!!errors.price} placeholder="12.99" />
          {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="location">Location (area / city)</Label>
          <Input id="location" value={form.location} onChange={(e) => set("location", e.target.value)} aria-invalid={!!errors.location} placeholder="Gulshan, Dhaka" />
          {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} aria-invalid={!!errors.description} placeholder="Hand-stretched dough, smoky BBQ sauce, grilled chicken, red onion and mozzarella…" />
        <p className={errors.description ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>{errors.description ?? `${form.description.trim().length}/1000 characters`}</p>
      </div>
      <div className="grid gap-2">
        <Label>Item Images <span className="font-normal text-muted-foreground">(required, up to 5, first image is the cover)</span></Label>
        <ImageUploader value={form.images} onChange={(v) => set("images", v)} max={5} invalid={!!errors.images} />
        {errors.images && <p className="text-xs text-destructive">{errors.images}</p>}
      </div>
      {item && item.status === "approved" && (
        <p className="rounded-xl bg-warning/10 p-3 text-sm text-warning">Saving changes will send this item back to admin review before it&apos;s visible again.</p>
      )}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="animate-spin" />} {item ? "Save Changes" : "Submit for Review"}
        </Button>
      </div>
    </form>
  );
}
