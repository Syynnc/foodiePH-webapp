"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
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
  promoCode: string;
  setPromoCode: (code: string) => void;
  promoDiscount: number;
  applyPromo: (code: string) => boolean;
  clearPromo: () => void;
};

const STORAGE_KEY = "foodie_cart_v1";

// ── Promo codes ─────────────────────────────────────────────────────────────
// Each entry: [discountType, value]
// "pct" = percentage off subtotal, "flat" = fixed peso off
const PROMO_CODES: Record<string, { type: "pct" | "flat"; value: number; label: string }> = {
  FIRSTFOODIE: { type: "flat", value: 0,   label: "Free delivery on your first order" },
  CORPFOODIE:  { type: "flat", value: 500, label: "₱500 off corporate order" },
  SAVE20:      { type: "pct",  value: 20,  label: "20% off your order" },
  FOODIE10:    { type: "pct",  value: 10,  label: "10% off your order" },
};

function calcPromoDiscount(code: string, subtotal: number): number {
  const promo = PROMO_CODES[code.toUpperCase()];
  if (!promo) return 0;
  if (promo.type === "flat") return promo.value;
  return Math.round(subtotal * (promo.value / 100));
}

// ── DB sync helpers ─────────────────────────────────────────────────────────

const syncTimeouts = new Map<string, NodeJS.Timeout>();

function syncUpsert(menuItemId: string, quantity: number) {
  if (syncTimeouts.has(menuItemId)) clearTimeout(syncTimeouts.get(menuItemId)!);
  const t = setTimeout(() => {
    fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menuItemId, quantity }),
    }).catch(console.error);
    syncTimeouts.delete(menuItemId);
  }, 500);
  syncTimeouts.set(menuItemId, t);
}

function syncDelete(menuItemId: string) {
  fetch(`/api/cart?menuItemId=${menuItemId}`, { method: "DELETE" }).catch(console.error);
}

function syncClear(ids: string[]) {
  ids.forEach(syncDelete);
}

// ── localStorage helpers ────────────────────────────────────────────────────

function readLocalCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as CartItem[];
  } catch {
    return [];
  }
}

function writeLocalCart(cart: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch { /* quota exceeded or private mode — silently skip */ }
}

// ── Provider ────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  // Seed state from localStorage immediately so there's no empty-cart flash
  const [cart, setCartRaw] = useState<CartItem[]>(() => readLocalCart());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const dbLoaded = useRef(false);

  // Wrapped setter that always keeps localStorage in sync
  const setCart = (updater: CartItem[] | ((prev: CartItem[]) => CartItem[])) => {
    setCartRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      writeLocalCart(next);
      return next;
    });
  };

  // Load authoritative cart from DB on mount; overwrites the localStorage seed
  useEffect(() => {
    let mounted = true;
    fetch("/api/cart")
      .then((r) => (r.ok ? r.json() : null))
      .then((rows) => {
        if (!mounted || !Array.isArray(rows)) return;
        const dbCart = rows
          .filter((r: { menuItemId: string; quantity: number; name: string | null; price: number | null }) => r.name && r.price)
          .reduce((acc: CartItem[], r: any) => {
            const existing = acc.find(i => i.id === r.menuItemId);
            if (existing) {
              existing.qty += r.quantity;
            } else {
              acc.push({
                id: r.menuItemId,
                name: r.name,
                price: r.price,
                qty: r.quantity,
                image: r.imageUrl ?? "",
                restaurant: "",
                restaurantId: r.restaurantId ?? "",
              });
            }
            return acc;
          }, []);
        setCartRaw(dbCart);      // use raw setter — DB is authoritative
        writeLocalCart(dbCart);  // keep localStorage in sync with DB
        dbLoaded.current = true;
      })
      .catch(() => { dbLoaded.current = true; });
    return () => { mounted = false; };
  }, []);

  // Re-compute promo discount whenever cart or promo code changes
  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  useEffect(() => {
    if (!promoCode) { setPromoDiscount(0); return; }
    setPromoDiscount(calcPromoDiscount(promoCode, cartTotal));
  }, [promoCode, cartTotal]);

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

  const applyPromo = (code: string): boolean => {
    const upper = code.trim().toUpperCase();
    if (!PROMO_CODES[upper]) return false;
    setPromoCode(upper);
    toast.success(`Promo "${upper}" applied — ${PROMO_CODES[upper].label}`);
    return true;
  };

  const clearPromo = () => {
    setPromoCode("");
    setPromoDiscount(0);
  };

  return (
    <CartContext.Provider
      value={{
        cart, addToCart, updateQty, clearCart,
        isCartOpen, setIsCartOpen, cartTotal,
        promoCode, setPromoCode, promoDiscount, applyPromo, clearPromo,
      }}
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
