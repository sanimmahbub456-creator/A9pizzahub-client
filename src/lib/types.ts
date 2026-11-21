export type Role = "vendor" | "customer" | "admin";
export type ItemStatus = "pending" | "approved" | "rejected" | "inactive";
export type OrderStatus = "pending" | "accepted" | "rejected" | "cancelled";

export interface VendorInfo {
  _id: string;
  name: string;
  image?: string | null;
  businessName?: string | null;
  subscriptionPlan?: "free" | "premium";
  email?: string;
}

export interface MenuItem {
  _id: string;
  vendorId: string;
  itemName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  status: ItemStatus;
  deactivatedBy?: "vendor" | "admin" | "system" | null;
  createdAt: string;
  vendor?: VendorInfo;
  canOrder?: boolean;
}

export interface Order {
  _id: string;
  itemId: string;
  vendorId: string;
  customerId: string;
  deliveryDate: string;
  deliveryAddress: string;
  message: string;
  status: OrderStatus;
  statusHistory: { status: OrderStatus; at: string }[];
  createdAt: string;
  item?: Pick<MenuItem, "_id" | "itemName" | "images" | "price" | "category" | "location">;
  vendor?: VendorInfo;
  customer?: { _id: string; name: string; email: string; image?: string | null; phone?: string | null };
}

export interface AppUser {
  _id: string;
  name: string;
  email: string;
  image?: string | null;
  role: Role;
  isBlocked?: boolean;
  businessName?: string | null;
  phone?: string | null;
  address?: string | null;
  subscriptionPlan?: "free" | "premium";
  subscriptionExpiresAt?: string | null;
  createdAt?: string;
  stats?: { items: number; ordersPlaced: number; ordersReceived: number };
}

export interface Transaction {
  _id: string;
  vendorId: string;
  plan: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "expired" | "cancelled";
  createdAt: string;
  reference?: string;
  vendor?: VendorInfo;
}
