"use client";
import { ChevronLeft, ChevronRight, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, errorMessage } from "@/lib/api";
import { CATEGORIES } from "@/lib/constants";
import type { MenuItem } from "@/lib/types";
import { MenuCard, MenuCardSkeleton } from "./MenuCard";

type Resp = { data: MenuItem[]; meta: { total: number; page: number; pages: number } };
const ALL = "all";

export function BrowseMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [search, setSearch] = useState(params.get("search") ?? "");
  const [minPrice, setMinPrice] = useState(params.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") ?? "");
  const [locations, setLocations] = useState<string[]>([]);
  const [result, setResult] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const category = params.get("category") ?? ALL;
  const location = params.get("location") ?? ALL;
  const sort = params.get("sort") ?? "newest";
  const page = Number(params.get("page") ?? 1);

  const setParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (!v || v === ALL) next.delete(k);
      else next.set(k, v);
    }
    if (!("page" in updates)) next.delete("page");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  // debounce text/price inputs into the URL
  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== (params.get("search") ?? "") || minPrice !== (params.get("minPrice") ?? "") || maxPrice !== (params.get("maxPrice") ?? "")) {
        setParams({ search: search.trim() || null, minPrice: minPrice || null, maxPrice: maxPrice || null });
      }
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, minPrice, maxPrice]);

  useEffect(() => {
    api<{ data: { locations: string[] } }>("/api/menu/filters", { auth: false })
      .then((r) => setLocations(r.data.locations))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const q = new URLSearchParams(params.toString());
    q.set("limit", "12");
    api<Resp>(`/api/menu?${q.toString()}`, { auth: false })
      .then((r) => !cancelled && setResult(r))
      .catch((e) => !cancelled && setError(errorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [params, reloadKey]);

  const reset = () => {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="relative">
            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search pizzas, sides, drinks…" className="pl-10" aria-label="Search menu" />
          </div>
          <Select value={category} onValueChange={(v) => setParams({ category: v })}>
            <SelectTrigger aria-label="Category"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All categories</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={location} onValueChange={(v) => setParams({ location: v })}>
            <SelectTrigger aria-label="Location"><SelectValue placeholder="Location" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All locations</SelectItem>
              {locations.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setParams({ sort: v })}>
            <SelectTrigger aria-label="Sort"><SelectValue placeholder="Sort" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="name_asc">Name: A to Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
            <SlidersHorizontal className="size-4" /> Price
          </span>
          <Input type="number" min={0} value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min $" className="h-9 w-24" aria-label="Minimum price" />
          <span className="text-muted-foreground">to</span>
          <Input type="number" min={0} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max $" className="h-9 w-24" aria-label="Maximum price" />
          <Button variant="ghost" size="sm" onClick={reset} className="ml-auto"><RotateCcw /> Reset filters</Button>
        </div>
      </div>

      {!loading && result && (
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{result.data.length}</span> of {result.meta.total} items
        </p>
      )}

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <MenuCardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <EmptyState title="Couldn't load the menu" description={error} action={<Button onClick={() => setReloadKey((k) => k + 1)}>Retry</Button>} />
      ) : !result || result.data.length === 0 ? (
        <EmptyState title="No items match your filters" description="Try a different search term, category or price range." action={<Button variant="outline" onClick={reset}>Clear filters</Button>} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {result.data.map((item) => <MenuCard key={item._id} item={item} />)}
        </div>
      )}

      {result && result.meta.pages > 1 && !loading && (
        <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
          <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setParams({ page: String(page - 1) })} aria-label="Previous page"><ChevronLeft /></Button>
          {Array.from({ length: result.meta.pages }).map((_, i) => (
            <Button key={i} size="icon" variant={page === i + 1 ? "default" : "ghost"} onClick={() => setParams({ page: String(i + 1) })}>{i + 1}</Button>
          ))}
          <Button variant="outline" size="icon" disabled={page >= result.meta.pages} onClick={() => setParams({ page: String(page + 1) })} aria-label="Next page"><ChevronRight /></Button>
        </nav>
      )}
    </div>
  );
}
