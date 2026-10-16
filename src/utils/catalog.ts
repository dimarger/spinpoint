import type { Product } from '../types/catalog';
export const money = (value: number) =>
  new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 0,
  }).format(value);
export function filterCatalog(products: Product[], params: URLSearchParams) {
  const q = (params.get('q') || '').trim().toLocaleLowerCase('uk');
  const brands = params.getAll('brand');
  const cats = params.getAll('category');
  const min = params.get('min') ? Number(params.get('min')) : 0;
  const max = params.get('max') ? Number(params.get('max')) : Infinity;
  const result = products.filter(
    (p) =>
      (!q || `${p.name} ${p.brand}`.toLocaleLowerCase('uk').includes(q)) &&
      (!brands.length || brands.includes(p.brand)) &&
      (!cats.length || cats.includes(p.category)) &&
      p.price >= (Number.isFinite(min) ? min : 0) &&
      p.price <= (Number.isFinite(max) ? max : Infinity) &&
      (!params.get('new') || p.isNew)
  );
  return result.sort((a, b) =>
    params.get('sort') === 'price-asc'
      ? a.price - b.price
      : params.get('sort') === 'price-desc'
        ? b.price - a.price
        : params.get('sort') === 'newest'
          ? b.addedAt.localeCompare(a.addedAt)
          : Number(b.popular) - Number(a.popular)
  );
}
