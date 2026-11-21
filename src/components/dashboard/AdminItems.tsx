"use client";
import { Check, Eye, PauseCircle, PlayCircle, Search, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/Loader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, errorMessage } from "@/lib/api";
import { CATEGORIES } from "@/lib/constants";
import type { ItemStatus, MenuItem } from "@/lib/types";
import { useFetch } from "@/lib/useFetch";
import { formatDate, formatPrice } from "@/lib/utils";

export function AdminItems() {
  const params = useSearchParams();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState(params.get("status") ?? "all");
  const [category, setCategory] = useState("all");
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const qs = new URLSearchParams({
    ...(debounced && { search: debounced }),
    ...(status !== "all" && { status }),
    ...(category !== "all" && { category }),
  }).toString();
  const { data, loading, error, reload } = useFetch<MenuItem[]>(`/api/admin/items${qs ? `?${qs}` : ""}`);
  const [toDelete, setToDelete] = useState<MenuItem | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const setItemStatus = async (item: MenuItem, next: ItemStatus) => {
    setBusy(item._id);
    try {
      const r = await api<{ message: string }>(`/api/admin/items/${item._id}/status`, { method: "PATCH", body: { status: next } });
      toast.success(r.message);
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    try {
      const r = await api<{ message: string }>(`/api/admin/items/${toDelete._id}`, { method: "DELETE" });
      toast.success(r.message);
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  return (
    <>
      <PageHeader title="Manage Menu Items" description="Review submissions, approve or reject, and moderate published items. Only approved items appear on Browse Menu." />
      <div className="mb-5 grid gap-3 md:grid-cols-[2fr_1fr_1fr]">
        <div className="relative">
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by item name or location" className="pl-10" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {["pending", "approved", "rejected", "inactive"].map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? <PageLoader label="Loading items…" /> : error ? (
        <EmptyState title="Couldn't load items" description={error} action={<Button onClick={reload}>Retry</Button>} />
      ) : !data?.length ? <EmptyState title="No items found" description="Nothing matches these filters." /> : (
        <Table>
          <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Vendor</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead>Submitted</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted"><Image src={item.images[0]} alt="" fill sizes="48px" className="object-cover" /></div>
                    <div className="min-w-0"><p className="max-w-[200px] truncate font-semibold">{item.itemName}</p><p className="text-xs text-muted-foreground">{item.category} · {item.location}</p></div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-medium">{item.vendor?.businessName ?? item.vendor?.name}</p>
                  {item.vendor?.subscriptionPlan === "premium" && <Badge variant="premium" className="mt-1">Premium</Badge>}
                </TableCell>
                <TableCell className="font-semibold">{formatPrice(item.price)}</TableCell>
                <TableCell><StatusBadge status={item.status} /></TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button asChild size="icon-sm" variant="ghost" title="View"><Link href={`/menu/${item._id}`}><Eye /></Link></Button>
                    {item.status === "pending" && (
                      <>
                        <Button size="sm" variant="success" disabled={busy === item._id} onClick={() => setItemStatus(item, "approved")}><Check /> Approve</Button>
                        <Button size="sm" variant="ghost" className="text-destructive" disabled={busy === item._id} onClick={() => setItemStatus(item, "rejected")}><X /> Reject</Button>
                      </>
                    )}
                    {item.status === "approved" && (
                      <Button size="sm" variant="ghost" disabled={busy === item._id} onClick={() => setItemStatus(item, "inactive")} title="Unpublish"><PauseCircle /> Deactivate</Button>
                    )}
                    {(item.status === "inactive" || item.status === "rejected") && (
                      <Button size="sm" variant="ghost" disabled={busy === item._id} onClick={() => setItemStatus(item, "approved")}><PlayCircle /> Approve</Button>
                    )}
                    <Button size="icon-sm" variant="ghost" title="Delete" onClick={() => setToDelete(item)}><Trash2 className="text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <ConfirmDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)} title="Delete this item?"
        description={`"${toDelete?.itemName}" will be removed permanently and any pending orders for it will be cancelled.`}
        confirmLabel="Delete" variant="destructive" onConfirm={remove} />
    </>
  );
}
