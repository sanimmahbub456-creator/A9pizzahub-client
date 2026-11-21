"use client";
import { Ban, Crown, Eye, Search, ShieldCheck, Unlock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/Loader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, errorMessage } from "@/lib/api";
import type { AppUser } from "@/lib/types";
import { useFetch } from "@/lib/useFetch";
import { formatDate, initials } from "@/lib/utils";

export default function ManageUsersPage() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [role, setRole] = useState("all");
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const qs = new URLSearchParams({ ...(debounced && { search: debounced }), ...(role !== "all" && { role }) }).toString();
  const { data, loading, error, reload } = useFetch<AppUser[]>(`/api/admin/users${qs ? `?${qs}` : ""}`);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const details = useFetch<AppUser>(detailsId ? `/api/admin/users/${detailsId}` : null);
  const [blockTarget, setBlockTarget] = useState<AppUser | null>(null);

  const toggleBlock = async () => {
    if (!blockTarget) return;
    try {
      const r = await api<{ message: string }>(`/api/admin/users/${blockTarget._id}/block`, { method: "PATCH", body: { isBlocked: !blockTarget.isBlocked } });
      toast.success(r.message);
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  return (
    <>
      <PageHeader title="Manage Users" description="View, search and block or unblock vendors and customers." />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email" className="pl-10" />
        </div>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="vendor">Vendors</SelectItem>
            <SelectItem value="customer">Customers</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {loading ? <PageLoader label="Loading users…" /> : error ? (
        <EmptyState title="Couldn't load users" description={error} action={<Button onClick={reload}>Retry</Button>} />
      ) : !data?.length ? <EmptyState title="No users found" description="Try another search or role filter." /> : (
        <Table>
          <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Plan</TableHead><TableHead>Status</TableHead><TableHead>Joined</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.map((u) => (
              <TableRow key={u._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar><AvatarImage src={u.image ?? undefined} /><AvatarFallback>{initials(u.name)}</AvatarFallback></Avatar>
                    <div className="min-w-0"><p className="font-semibold">{u.name}</p><p className="max-w-[220px] truncate text-xs text-muted-foreground">{u.email}</p></div>
                  </div>
                </TableCell>
                <TableCell><Badge variant={u.role === "admin" ? "default" : "secondary"} className="capitalize">{u.role === "admin" && <ShieldCheck />}{u.role}</Badge></TableCell>
                <TableCell>{u.role === "vendor" ? (u.subscriptionPlan === "premium" ? <Badge variant="premium"><Crown /> Premium</Badge> : <Badge variant="muted">Free</Badge>) : "-"}</TableCell>
                <TableCell>{u.isBlocked ? <Badge variant="danger">Blocked</Badge> : <Badge variant="success">Active</Badge>}</TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">{u.createdAt ? formatDate(u.createdAt) : "-"}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button size="icon-sm" variant="ghost" title="View details" onClick={() => setDetailsId(u._id)}><Eye /></Button>
                    {u.role !== "admin" && (
                      <Button size="sm" variant={u.isBlocked ? "outline" : "ghost"} className={u.isBlocked ? "" : "text-destructive"} onClick={() => setBlockTarget(u)}>
                        {u.isBlocked ? <><Unlock /> Unblock</> : <><Ban /> Block</>}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={!!detailsId} onOpenChange={(o) => !o && setDetailsId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>User details</DialogTitle></DialogHeader>
          {details.loading || !details.data ? <PageLoader className="min-h-40" label="Loading…" /> : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="size-16"><AvatarImage src={details.data.image ?? undefined} /><AvatarFallback>{initials(details.data.name)}</AvatarFallback></Avatar>
                <div><p className="text-lg font-semibold">{details.data.name}</p><p className="text-sm text-muted-foreground">{details.data.email}</p></div>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Role", details.data.role],
                  ["Status", details.data.isBlocked ? "Blocked" : "Active"],
                  ["Business", details.data.businessName ?? "-"],
                  ["Plan", details.data.role === "vendor" ? (details.data.subscriptionPlan ?? "free") : "-"],
                  ["Phone", details.data.phone ?? "-"],
                  ["Joined", details.data.createdAt ? formatDate(details.data.createdAt) : "-"],
                  ["Menu items", details.data.stats?.items ?? 0],
                  [details.data.role === "vendor" ? "Orders received" : "Orders placed", details.data.role === "vendor" ? details.data.stats?.ordersReceived : details.data.stats?.ordersPlaced],
                ].map(([k, v]) => (
                  <div key={String(k)} className="rounded-xl bg-muted p-3"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-semibold capitalize">{String(v ?? 0)}</dd></div>
                ))}
              </dl>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!blockTarget} onOpenChange={(o) => !o && setBlockTarget(null)}
        title={blockTarget?.isBlocked ? `Unblock ${blockTarget?.name}?` : `Block ${blockTarget?.name}?`}
        description={blockTarget?.isBlocked ? "They will be able to sign in and use PizzaHub again." : "They will be signed out and lose access to all protected features."}
        confirmLabel={blockTarget?.isBlocked ? "Unblock" : "Block user"} variant={blockTarget?.isBlocked ? "default" : "destructive"} onConfirm={toggleBlock} />
    </>
  );
}
