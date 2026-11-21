"use client";
import { Crown, Loader2, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { PageLoader } from "@/components/shared/Loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, errorMessage } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import type { AppUser } from "@/lib/types";
import { useFetch } from "@/lib/useFetch";
import { formatDate } from "@/lib/utils";

export default function ProfileSettingsPage() {
  const { data: me, loading, setData } = useFetch<AppUser>("/api/users/me");
  const [form, setForm] = useState({ name: "", phone: "", address: "", businessName: "" });
  const [image, setImage] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!me) return;
    setForm({ name: me.name, phone: me.phone ?? "", address: me.address ?? "", businessName: me.businessName ?? "" });
    setImage(me.image ? [me.image] : []);
  }, [me]);

  if (loading || !me) return <PageLoader />;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 2) errs.name = "Name must be at least 2 characters";
    if (me.role === "vendor" && form.businessName.trim().length < 2) errs.businessName = "Business name is required";
    if (form.phone && !/^[+\d][\d\s-]{5,19}$/.test(form.phone)) errs.phone = "Enter a valid phone number";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      const body: Record<string, unknown> = { name: form.name.trim(), phone: form.phone.trim(), address: form.address.trim(), image: image[0] ?? "" };
      if (me.role === "vendor") body.businessName = form.businessName.trim();
      const r = await api<{ message: string; data: AppUser }>("/api/users/me", { method: "PATCH", body });
      setData(r.data);
      await authClient.getSession({ query: { disableCookieCache: true } }); // refresh navbar / sidebar
      toast.success(r.message);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="Profile Settings" description="Update your personal information." />
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="h-fit rounded-2xl border bg-card p-6 text-center shadow-sm">
          <div className="flex justify-center"><ImageUploader value={image} onChange={setImage} shape="circle" /></div>
          <h2 className="mt-4 text-xl font-semibold">{me.name}</h2>
          <p className="text-sm text-muted-foreground">{me.email}</p>
          <div className="mt-3 flex justify-center gap-2">
            <Badge variant="secondary" className="capitalize">{me.role}</Badge>
            {me.role === "vendor" && (me.subscriptionPlan === "premium" ? <Badge variant="premium"><Crown /> Premium</Badge> : <Badge variant="muted">Free plan</Badge>)}
          </div>
          {me.createdAt && <p className="mt-4 text-xs text-muted-foreground">Member since {formatDate(me.createdAt)}</p>}
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><Lock className="size-3" /> Role and plan can&apos;t be changed here</p>
        </div>
        <form onSubmit={save} noValidate className="grid gap-5 rounded-2xl border bg-card p-6 shadow-sm">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-invalid={!!errors.name} />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={me.email} disabled />
            </div>
            {me.role === "vendor" && (
              <div className="grid gap-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input id="businessName" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} aria-invalid={!!errors.businessName} />
                {errors.businessName && <p className="text-xs text-destructive">{errors.businessName}</p>}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} aria-invalid={!!errors.phone} placeholder="+880 1700-000000" />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">{me.role === "vendor" ? "Restaurant Address" : "Default Delivery Address"}</Label>
            <Textarea id="address" rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>{saving && <Loader2 className="animate-spin" />} Save Changes</Button>
          </div>
        </form>
      </div>
    </>
  );
}
