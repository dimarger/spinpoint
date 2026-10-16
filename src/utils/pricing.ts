import type { CartItem, Product } from '../types/catalog';
import { wholesaleThresholds } from '../types/catalog';
import { siteConfig } from '../config/site';

export function assemblyFee(subtotal: number) {
  return siteConfig.assembly.enabled && subtotal >= siteConfig.assembly.freeFrom
    ? 0
    : siteConfig.assembly.fee;
}

export function productPrice(product: Product, quantity: number, wholesale = false) {
  const threshold = wholesale
    ? [...wholesaleThresholds].reverse().find((min) => quantity >= min)
    : undefined;
  return {
    threshold,
    unitPrice: threshold ? (product.wholesalePrices[threshold] ?? null) : product.price,
  };
}

/** Thresholds apply per product ID across variants, never across unrelated models. */
export function quoteCart(
  items: CartItem[],
  products: Product[],
  wholesale = false,
  assembly = false
) {
  const byId = new Map(products.map((p) => [p.id, p]));
  const quantities = new Map<string, number>();
  for (const item of items)
    quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
  const lines = items.map((item) => {
    const product = byId.get(item.productId);
    const price = product
      ? productPrice(product, quantities.get(item.productId)!, wholesale)
      : { unitPrice: null, threshold: undefined };
    return {
      item,
      product,
      ...price,
      total:
        price.unitPrice === null ? null : (Math.round(price.unitPrice * 100) * item.quantity) / 100,
      invalid:
        !product || product.status === 'unavailable' || !product.variants.includes(item.variant),
    };
  });
  const knownSubtotal =
    lines.reduce((sum, line) => sum + Math.round((line.total ?? 0) * 100), 0) / 100;
  const unknownLines = lines.filter((line) => line.unitPrice === null).length;
  const subtotal = unknownLines ? null : knownSubtotal;
  // An incomplete quote cannot establish eligibility for free assembly.
  const fee = !assembly ? 0 : subtotal === null ? null : assemblyFee(subtotal);
  return {
    lines,
    knownSubtotal,
    unknownLines,
    subtotal,
    fee,
    total: subtotal === null || fee === null ? null : subtotal + fee,
  };
}
