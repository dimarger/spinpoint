import type { Product } from '../types/catalog';
import { wholesaleThresholds } from '../types/catalog';
import { money } from '../utils/catalog';

export default function WholesalePrices({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const hasPrices = wholesaleThresholds.some((min) => product.wholesalePrices[min] != null);
  if (compact && !hasPrices)
    return (
      <small className="muted wholesale-note">Малий опт 3 / 5 / 10 шт. — Ціна за запитом</small>
    );
  return (
    <div className="wholesale-prices" aria-label="Оптові ціни за одиницю">
      {wholesaleThresholds.map((min) => (
        <div key={min}>
          <span>Від {min} шт.</span>
          <strong>
            {product.wholesalePrices[min] == null
              ? 'Ціна за запитом'
              : `${money(product.wholesalePrices[min])} / шт.`}
          </strong>
        </div>
      ))}
    </div>
  );
}

export function ProductAvailability({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  if (product.status !== 'preorder') return null;
  return (
    <small className="muted delivery-note">
      Орієнтовно {product.leadTime}.{' '}
      {compact ? 'Узгодимо до оплати.' : 'Остаточний строк узгоджуємо перед оплатою.'}
    </small>
  );
}
