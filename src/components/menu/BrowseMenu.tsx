"use client";
import { ChevronLeft, ChevronRight, MapPin, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, errorMessage } from "@/lib/api";
import { CATEGORIES } from "@/lib/constants";
import type { MenuItem } from "@/lib/types";
import { cn } from "@/lib/utils";
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
  const [showPrice, setShowPrice] = useState(!!(params.get("minPrice") || params.get("maxPrice")));
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

  const total = result?.meta.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Search + location + sort */}
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search pizzas, sides, desserts…" className="pl-10" aria-label="Search menu" />
        </div>
        <Select value={location} onValueChange={(v) => setParams({ location: v })}>
          <SelectTrigger aria-label="Location" className="md:w-52">
            <span className="flex items-center gap-2 truncate">
              <MapPin className="size-4 shrink-0 text-accent" />
              <SelectValue placeholder="Location" />
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All locations</SelectItem>
            {locations.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setParams({ sort: v })}>
          <SelectTrigger aria-label="Sort" className="md:w-52"><SelectValue placeholder="Sort" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="price_asc">Price: low to high</SelectItem>
            <SelectItem value="price_desc">Price: high to low</SelectItem>
            <SelectItem value="name_asc">Name: A to Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category chips */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Categories">
        {[{ name: ALL, label: "All" }, ...CATEGORIES.map((c) => ({ name: c.name, label: c.name }))].map((c) => {
          const active = category === c.name;
          return (
            <button
              key={c.name}
              role="tab"
              aria-selected={active}
              onClick={() => setParams({ category: c.name })}
              className={cn(
                "shrink-0 cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors",
                active ? "border-foreground bg-foreground text-background" : "bg-card hover:border-primary hover:text-primary",
              )}
            >
              {c.label}
            </button>
          );
        })}
        <button
          onClick={() => setShowPrice((s) => !s)}
          className={cn(
            "flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors",
            showPrice ? "border-primary text-primary" : "bg-card hover:border-primary hover:text-primary",
          )}
        >
          <SlidersHorizontal className="size-4" /> Price
        </button>
      </div>

      {showPrice && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-3">
          <span className="text-sm font-semibold text-muted-foreground">Price range</span>
          <Input type="number" min={0} value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min $" className="h-9 w-24" aria-label="Minimum price" />
          <span className="text-muted-foreground">to</span>
          <Input type="number" min={0} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max $" className="h-9 w-24" aria-label="Maximum price" />
        </div>
      )}

      {/* Result count */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold">
          {loading ? "Looking for pizzas…" : `${total} ${total === 1 ? "delicious find" : "delicious finds"}`}
        </h2>
        <Button variant="ghost" size="sm" onClick={reset}><RotateCcw /> Reset</Button>
      </div>

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
