"use client";
import { Eye, Pencil, Plus, Power, PowerOff, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/Loader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, errorMessage } from "@/lib/api";
import type { MenuItem } from "@/lib/types";
import { useFetch } from "@/lib/useFetch";
import { formatDate, formatPrice } from "@/lib/utils";

export default function MyMenuItemsPage() {
  const { data, loading, error, reload } = useFetch<MenuItem[]>("/api/vendor/items");
  const [toDelete, setToDelete] = useState<MenuItem | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const toggle = async (item: MenuItem) => {
    setBusy(item._id);
    try {
      const r = await api<{ message: string }>(`/api/vendor/items/${item._id}/availability`, { method: "PATCH", body: { active: item.status === "inactive" } });
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
      const r = await api<{ message: string }>(`/api/vendor/items/${toDelete._id}`, { method: "DELETE" });
      toast.success(r.message);
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  return (
    <>
      <PageHeader title="My Menu Items" description="Only you can see items that are pending, rejected or inactive."
        action={<Button asChild><Link href="/dashboard/vendor/items/new"><Plus /> Add Menu Item</Link></Button>} />
      {loading ? <PageLoader label="Loading your menu…" /> : error ? (
        <EmptyState title="Couldn't load items" description={error} action={<Button onClick={reload}>Retry</Button>} />
      ) : !data?.length ? (
        <EmptyState title="No menu items yet" description="Add your first pizza and it'll go live once an admin approves it."
          action={<Button asChild><Link href="/dashboard/vendor/items/new">Add your first item</Link></Button>} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead>Added</TableHead><TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted"><Image src={item.images[0]} alt="" fill sizes="48px" className="object-cover" /></div>
                    <div className="min-w-0"><p className="max-w-[200px] truncate font-semibold">{item.itemName}</p><p className="text-xs text-muted-foreground">{item.location}</p></div>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">{item.category}</TableCell>
                <TableCell className="font-semibold">{formatPrice(item.price)}</TableCell>
                <TableCell>
                  <StatusBadge status={item.status} />
                  {item.deactivatedBy === "admin" && <p className="mt-1 text-[11px] text-muted-foreground">by admin</p>}
                  {item.deactivatedBy === "system" && <p className="mt-1 text-[11px] text-muted-foreground">plan limit</p>}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button asChild size="icon-sm" variant="ghost" title="View details"><Link href={`/menu/${item._id}`}><Eye /></Link></Button>
                    <Button asChild size="icon-sm" variant="ghost" title="Edit"><Link href={`/dashboard/vendor/items/${item._id}/edit`}><Pencil /></Link></Button>
                    {item.status !== "rejected" && item.deactivatedBy !== "admin" && (
                      <Button size="icon-sm" variant="ghost" disabled={busy === item._id} onClick={() => toggle(item)}
                        title={item.status === "inactive" ? "Make available" : "Make unavailable"}>
                        {item.status === "inactive" ? <Power className="text-success" /> : <PowerOff className="text-warning" />}
                      </Button>
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
        description={`"${toDelete?.itemName}" will be permanently removed.`} confirmLabel="Delete" variant="destructive" onConfirm={remove} />
    </>
  );
}
