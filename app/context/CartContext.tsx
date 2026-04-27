"use client";

import { createContext, useContext, useState, ReactNode } from "react";

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

// Fire-and-forget DB sync helpers
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

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

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
    setIsCartOpen(true);
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) => {
      const updated = prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0);

      const item = prev.find((i) => i.id === id);
      if (item) {
        const newQty = item.qty + delta;
        if (newQty <= 0) {
          syncDelete(id);
        } else {
          syncUpsert(id, newQty);
        }
      }
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
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