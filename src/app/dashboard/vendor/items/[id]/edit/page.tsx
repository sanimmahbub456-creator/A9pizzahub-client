"use client";
import Link from "next/link";
import { use } from "react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { ItemForm } from "@/components/dashboard/ItemForm";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/Loader";
import { Button } from "@/components/ui/button";
import type { MenuItem } from "@/lib/types";
import { useFetch } from "@/lib/useFetch";

export default function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, loading, error } = useFetch<MenuItem>(`/api/vendor/items/${id}`);
  if (loading) return <PageLoader />;
  if (error || !data) return <EmptyState title="Item not found" description={error ?? ""} action={<Button asChild><Link href="/dashboard/vendor/items">Back to items</Link></Button>} />;
  return (
    <>
      <PageHeader title="Edit Menu Item" description={data.itemName} />
      <ItemForm item={data} />
    </>
  );
}
