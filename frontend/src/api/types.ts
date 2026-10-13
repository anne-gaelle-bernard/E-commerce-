export type Role = "CUSTOMER" | "ADMIN";
export type Gender = "FEMME" | "HOMME" | "UNISEXE";
export type OrderStatus = "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  _count?: { products: number };
}

export interface Variant {
  id: number;
  size: string;
  color: string;
  stock: number;
  productId: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  gender: Gender;
  isActive: boolean;
  createdAt: string;
  categoryId: number;
  category: Category;
  variants: Variant[];
}

export interface ProductPage {
  items: Product[];
  total: number;
  page: number;
  pages: number;
}

export interface CartItem {
  id: number;
  quantity: number;
  variantId: number;
  variant: Variant & { product: Product };
}

export interface Cart {
  items: CartItem[];
  totalCents: number;
  count: number;
}

export interface OrderItem {
  id: number;
  productName: string;
  size: string;
  color: string;
  unitPriceCents: number;
  quantity: number;
}

export interface Order {
  id: number;
  status: OrderStatus;
  shippingCents: number;
  totalCents: number;
  paymentBrand: string | null;
  paymentLast4: string | null;
  shippingFullName: string;
  shippingStreet: string;
  shippingPostal: string;
  shippingCity: string;
  shippingCountry: string;
  createdAt: string;
  items: OrderItem[];
  user?: Pick<User, "id" | "email" | "firstName" | "lastName"> | null;
}

export interface ShippingAddress {
  fullName: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface CardInput {
  holder: string;
  number: string;
  expMonth: number;
  expYear: number;
  cvc: string;
}

export interface ProductInput {
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  gender: Gender;
  categoryId: number;
  isActive: boolean;
  variants: { size: string; color: string; stock: number }[];
}

export interface AdminStats {
  ordersByStatus: Partial<Record<OrderStatus, number>>;
  revenueCents: number;
  customers: number;
  lowStock: (Variant & { product: { id: number; name: string } })[];
}
