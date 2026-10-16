import { initialCatalog } from '../../data/catalog';
import type { Product } from '../../types/catalog';
/** Public read model. A future Supabase adapter must return only public columns. */
export interface CatalogRepository {
  list(): Promise<Product[]>;
  find(id: string): Promise<Product | undefined>;
}
export const staticCatalogRepository: CatalogRepository = {
  list: async () => initialCatalog,
  find: async (id) => initialCatalog.find((p) => p.id === id),
};
export interface OrderDraft {
  text: string;
  createdAt: string;
}
/** Persisting accepted orders requires an authenticated backend; messenger drafts are never accepted orders. */
export interface OrderRepository {
  submitRequest(draft: OrderDraft): Promise<{ requestId: string; status: 'pending_confirmation' }>;
}
