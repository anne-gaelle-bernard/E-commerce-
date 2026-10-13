import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../api/client";
import type { Cart } from "../api/types";
import { useAuth } from "./AuthContext";

const EMPTY_CART: Cart = { items: [], totalCents: 0, count: 0 };

interface CartContextValue {
  cart: Cart;
  loaded: boolean;
  refresh: () => Promise<void>;
  add: (variantId: number, quantity: number) => Promise<void>;
  update: (variantId: number, quantity: number) => Promise<void>;
  remove: (variantId: number) => Promise<void>;
  reset: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState<Cart>(EMPTY_CART);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    setCart(user ? await api.cart() : EMPTY_CART);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    refresh()
      .catch(() => setCart(EMPTY_CART))
      .finally(() => setLoaded(true));
  }, [refresh, authLoading]);

  const value: CartContextValue = {
    cart,
    loaded,
    refresh,
    add: async (variantId, quantity) => setCart(await api.addToCart(variantId, quantity)),
    update: async (variantId, quantity) => setCart(await api.updateCartItem(variantId, quantity)),
    remove: async (variantId) => setCart(await api.removeCartItem(variantId)),
    reset: () => setCart(EMPTY_CART),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart doit être utilisé dans un CartProvider");
  return context;
}
