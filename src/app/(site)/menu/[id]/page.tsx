import { ItemDetails } from "@/components/menu/ItemDetails";

export default async function ItemDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ItemDetails id={id} />;
}
