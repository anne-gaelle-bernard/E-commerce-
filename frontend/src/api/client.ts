import type {
  AdminStats,
  Cart,
  CardInput,
  Category,
  Order,
  OrderStatus,
  Product,
  ProductInput,
  ProductPage,
  ShippingAddress,
  User,
} from "./types";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details: { field: string; message: string }[] = [],
  ) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    credentials: "same-origin",
    headers: options.body ? { "Content-Type": "application/json", ...options.headers } : options.headers,
  });
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(response.status, data.error ?? "Une erreur est survenue", data.details);
  }
  return data as T;
}

const json = (body: unknown) => JSON.stringify(body);

export const api = {
  // Authentification et compte
  me: () => request<User>("/auth/me"),
  login: (email: string, password: string) =>
    request<User>("/auth/login", { method: "POST", body: json({ email, password }) }),
  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    request<User>("/auth/register", { method: "POST", body: json(data) }),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  updateProfile: (data: { firstName: string; lastName: string }) =>
    request<User>("/auth/me", { method: "PATCH", body: json(data) }),
  deleteAccount: (password: string) => request<void>("/auth/me", { method: "DELETE", body: json({ password }) }),

  // Catalogue
  categories: () => request<Category[]>("/categories"),
  products: (params: URLSearchParams) => request<ProductPage>(`/products?${params}`),
  productFilters: () => request<{ sizes: string[]; colors: string[] }>("/products/filters"),
  product: (slug: string) => request<Product>(`/products/${encodeURIComponent(slug)}`),

  // Panier
  cart: () => request<Cart>("/cart"),
  addToCart: (variantId: number, quantity: number) =>
    request<Cart>("/cart/items", { method: "POST", body: json({ variantId, quantity }) }),
  updateCartItem: (variantId: number, quantity: number) =>
    request<Cart>(`/cart/items/${variantId}`, { method: "PATCH", body: json({ quantity }) }),
  removeCartItem: (variantId: number) => request<Cart>(`/cart/items/${variantId}`, { method: "DELETE" }),

  // Commandes
  createOrder: (shipping: ShippingAddress, card: CardInput) =>
    request<Order>("/orders", { method: "POST", body: json({ shipping, card }) }),
  orders: () => request<Order[]>("/orders"),
  order: (id: number) => request<Order>(`/orders/${id}`),

  // Administration
  admin: {
    stats: () => request<AdminStats>("/admin/stats"),
    orders: (status?: OrderStatus) => request<Order[]>(`/admin/orders${status ? `?status=${status}` : ""}`),
    setOrderStatus: (id: number, status: OrderStatus) =>
      request<Order>(`/admin/orders/${id}/status`, { method: "PATCH", body: json({ status }) }),
    product: (id: number) => request<Product>(`/products/id/${id}`),
    createProduct: (data: ProductInput) => request<Product>("/products", { method: "POST", body: json(data) }),
    updateProduct: (id: number, data: ProductInput) =>
      request<Product>(`/products/${id}`, { method: "PUT", body: json(data) }),
    archiveProduct: (id: number) => request<void>(`/products/${id}`, { method: "DELETE" }),
    createCategory: (name: string) => request<Category>("/categories", { method: "POST", body: json({ name }) }),
    updateCategory: (id: number, name: string) =>
      request<Category>(`/categories/${id}`, { method: "PUT", body: json({ name }) }),
    deleteCategory: (id: number) => request<void>(`/categories/${id}`, { method: "DELETE" }),
  },
};
