import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, Product } from '../types/catalog';
import { initialCatalog } from '../data/catalog';
import { catalogSchema } from '../types/catalog';
interface ShopState {
  cart: CartItem[];
  favorites: string[];
  theme: 'light' | 'dark';
  catalog: Product[] | null;
  assembly: boolean;
  add: (productId: string, variant: string, quantity?: number, group?: string) => void;
  addBuild: (items: Omit<CartItem, 'key'>[], assembly: boolean) => void;
  remove: (key: string) => void;
  quantity: (key: string, n: number) => void;
  variant: (key: string, v: string) => void;
  toggleFavorite: (id: string) => void;
  toggleTheme: () => void;
  clear: () => void;
  setCatalog: (p: Product[] | null) => void;
  setAssembly: (b: boolean) => void;
}
const safeStorage = {
  getItem: (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  setItem: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* UI remains usable if browser storage is unavailable. */
    }
  },
  removeItem: (k: string) => {
    try {
      localStorage.removeItem(k);
    } catch {
      /* Optional persistence. */
    }
  },
};
export const useShop = create<ShopState>()(
  persist(
    (set) => ({
      cart: [],
      favorites: [],
      theme: 'light',
      catalog: null,
      assembly: false,
      add: (productId, variant, quantity = 1, group) =>
        set((s) => {
          const count = Math.max(1, Math.min(99, Math.floor(quantity) || 1));
          const old = s.cart.find(
            (i) => i.productId === productId && i.variant === variant && i.group === group
          );
          return {
            cart: old
              ? s.cart.map((i) =>
                  i.key === old.key ? { ...i, quantity: Math.min(99, i.quantity + count) } : i
                )
              : [
                  ...s.cart,
                  { key: crypto.randomUUID(), productId, variant, quantity: count, group },
                ],
          };
        }),
      addBuild: (items, assembly) =>
        set((s) => ({
          cart: [...s.cart, ...items.map((i) => ({ ...i, key: crypto.randomUUID() }))],
          assembly: s.assembly || assembly,
        })),
      remove: (key) => set((s) => ({ cart: s.cart.filter((i) => i.key !== key) })),
      quantity: (key, n) =>
        set((s) => ({
          cart: s.cart.map((i) =>
            i.key === key ? { ...i, quantity: Math.max(1, Math.min(99, Math.floor(n) || 1)) } : i
          ),
        })),
      variant: (key, v) =>
        set((s) => ({ cart: s.cart.map((i) => (i.key === key ? { ...i, variant: v } : i)) })),
      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((x) => x !== id)
            : [...s.favorites, id],
        })),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
      clear: () => set({ cart: [], assembly: false }),
      setCatalog: (catalog) => set({ catalog }),
      setAssembly: (assembly) => set({ assembly }),
    }),
    {
      name: 'spinpoint-shop-v1',
      version: 2,
      storage: createJSONStorage(() => safeStorage),
      migrate: (persisted, version) => {
        if (version >= 2 || !persisted || typeof persisted !== 'object') return persisted;
        const previous = persisted as Partial<ShopState>;
        const catalog = catalogSchema.safeParse(previous.catalog);
        if (!catalog.success) return persisted;
        const prices = new Map(initialCatalog.map((p) => [p.id, p]));
        return {
          ...previous,
          catalog: catalog.data.map((p) => {
            const updated = prices.get(p.id);
            return updated
              ? { ...p, price: updated.price, priceEstimated: updated.priceEstimated }
              : p;
          }),
        };
      },
      merge: (persisted, current) => {
        const p = persisted as Partial<ShopState> | undefined;
        if (!p) return current;
        const cat = p.catalog ? catalogSchema.safeParse(p.catalog) : null;
        return {
          ...current,
          theme: p.theme === 'dark' ? 'dark' : 'light',
          favorites: Array.isArray(p.favorites)
            ? p.favorites.filter((v): v is string => typeof v === 'string')
            : [],
          catalog: cat?.success ? cat.data : null,
          assembly: p.assembly === true,
          cart: Array.isArray(p.cart)
            ? p.cart.filter(
                (i) =>
                  typeof i?.key === 'string' &&
                  typeof i.productId === 'string' &&
                  typeof i.variant === 'string' &&
                  Number.isInteger(i.quantity) &&
                  i.quantity > 0 &&
                  i.quantity <= 99
              )
            : [],
        };
      },
    }
  )
);
export const useCatalog = () => useShop((s) => s.catalog) || initialCatalog;
