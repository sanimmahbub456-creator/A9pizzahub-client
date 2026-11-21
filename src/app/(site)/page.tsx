import { Categories } from "@/components/home/Categories";
import { FeaturedItems } from "@/components/home/FeaturedItems";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { VendorCta } from "@/components/home/VendorCta";
import { WhyChoose } from "@/components/home/WhyChoose";
import { API_URL } from "@/lib/constants";
import type { MenuItem } from "@/lib/types";

export const revalidate = 60;

async function getHomeData() {
  try {
    const [featured, filters] = await Promise.all([
      fetch(`${API_URL}/api/menu/featured`, { next: { revalidate: 60 } }).then((r) => (r.ok ? r.json() : Promise.reject())),
      fetch(`${API_URL}/api/menu/filters`, { next: { revalidate: 60 } }).then((r) => (r.ok ? r.json() : Promise.reject())),
    ]);
    const counts: Record<string, number> = Object.fromEntries(
      (filters.data.categories as { name: string; count: number }[]).map((c) => [c.name, c.count]),
    );
    return { items: featured.data as MenuItem[], counts, error: false };
  } catch {
    return { items: [] as MenuItem[], counts: {}, error: true };
  }
}

export default async function HomePage() {
  const { items, counts, error } = await getHomeData();
  return (
    <>
      <Hero />
      <FeaturedItems items={items} error={error} />
      <Categories counts={counts} />
      <WhyChoose />
      <HowItWorks />
      <VendorCta />
    </>
  );
}
