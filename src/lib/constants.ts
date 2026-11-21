import { Beef, CakeSlice, Crown, Leaf, Pizza, Salad, type LucideIcon } from "lucide-react";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000").replace(/\/$/, "");

export const CATEGORIES: { name: string; slug: string; icon: LucideIcon; blurb: string }[] = [
  { name: "Classic Pizzas", slug: "classic", icon: Pizza, blurb: "Margherita, pepperoni & the timeless originals" },
  { name: "Vegetarian Pizzas", slug: "vegetarian", icon: Leaf, blurb: "Garden-fresh toppings, zero compromise" },
  { name: "Meat Lovers", slug: "meat", icon: Beef, blurb: "Loaded with sausage, bacon & smoky beef" },
  { name: "Specialty / Gourmet Pizzas", slug: "gourmet", icon: Crown, blurb: "Truffle, burrata & chef's creations" },
  { name: "Sides & Appetizers", slug: "sides", icon: Salad, blurb: "Garlic knots, wings & crispy sides" },
  { name: "Beverages & Desserts", slug: "drinks", icon: CakeSlice, blurb: "Cold drinks & sweet endings" },
];

export const FREE_ITEM_LIMIT = 3;
export const PREMIUM_PRICE = 9.99;
