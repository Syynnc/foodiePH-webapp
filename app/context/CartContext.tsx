"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

export type CartItem = {
  id: string;        // menuItemId
  name: string;
  price: number;
  qty: number;
  image: string;
  restaurant: string;
  restaurantId: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "qty">) => void;
  updateQty: (id: string, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartTotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function syncUpsert(menuItemId: string, quantity: number) {
  fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ menuItemId, quantity }),
  }).catch(console.error);
}

function syncDelete(menuItemId: string) {
  fetch(`/api/cart?menuItemId=${menuItemId}`, { method: "DELETE" }).catch(console.error);
}

function syncClear(ids: string[]) {
  ids.forEach(syncDelete);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from DB on mount
  useEffect(() => {
    let mounted = true;
    fetch("/api/cart")
      .then((r) => (r.ok ? r.json() : null))
      .then((rows) => {
        if (!mounted || !Array.isArray(rows)) return;
        setCart(
          rows
            .filter((r: { menuItemId: string; quantity: number; name: string | null; price: number | null }) => r.name && r.price)
            .map((r: { menuItemId: string; quantity: number; name: string; price: number; imageUrl: string | null; restaurantId: string | null }) => ({
              id: r.menuItemId,
              name: r.name,
              price: r.price,
              qty: r.quantity,
              image: r.imageUrl ?? "",
              restaurant: "",
              restaurantId: r.restaurantId ?? "",
            }))
        );
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const addToCart = (item: Omit<CartItem, "qty">) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        const newQty = existing.qty + 1;
        syncUpsert(item.id, newQty);
        return prev.map((i) => (i.id === item.id ? { ...i, qty: newQty } : i));
      }
      syncUpsert(item.id, 1);
      return [...prev, { ...item, qty: 1 }];
    });
    toast.success(`${item.name} added to cart`);
    setIsCartOpen(true);
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) => {
      const updated = prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0);

      // Derive the new qty from the updated array, not from prev (fixes stale-closure race)
      const next = updated.find((i) => i.id === id);
      if (next) {
        syncUpsert(id, next.qty);
      } else {
        syncDelete(id);
      }

      return updated;
    });
  };

  const clearCart = () => {
    setCart((prev) => {
      syncClear(prev.map((i) => i.id));
      return [];
    });
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQty, clearCart, isCartOpen, setIsCartOpen, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
