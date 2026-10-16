import { Link } from 'react-router-dom';
import { ArrowRight, Heart, ShoppingBag, Plus, Minus, PackageOpen, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '../types/catalog';
import { useShop, useCatalog } from '../stores/shop';
import { money } from '../utils/catalog';
import { statusLabels, siteConfig } from '../config/site';
import { ProductImage } from './ProductArt';
export function ProductCard({ product: p, list = false }: { product: Product; list?: boolean }) {
  const toggle = useShop((s) => s.toggleFavorite);
  const favorite = useShop((s) => s.favorites.includes(p.id));
  const add = useShop((s) => s.add);
  return (
    <article className={`product-card ${list ? 'list-card' : ''}`}>
      <div className="product-visual">
        <Link to={`/product/${p.id}`} aria-label={`${p.brand} ${p.name}`}>
          <ProductImage product={p} />
        </Link>
        {!p.image && <span className="art-label">Ілюстрація категорії</span>}
      </div>
      <div className="product-info">
        <div className="product-heading">
          <span className="eyebrow muted">{p.brand}</span>
          <button
            className={`icon-button card-favorite ${favorite ? 'selected' : ''}`}
            onClick={() => toggle(p.id)}
            aria-label={`${favorite ? 'Видалити з' : 'Додати до'} обраного: ${p.name}`}
            aria-pressed={favorite}
          >
            <Heart size={19} fill={favorite ? 'currentColor' : 'none'} />
          </button>
        </div>
        <Link className="product-name" to={`/product/${p.id}`}>
          {p.name}
        </Link>
        <span className={`stock ${p.status === 'unavailable' ? 'unavailable' : ''}`}>
          <i />
          {statusLabels[p.status]}
        </span>
        <div className="price-row">
          <div>
            <strong>{money(p.price)}</strong>
            {p.demo && <small>тестова ціна</small>}
            {p.priceEstimated && <small>орієнтовна ціна</small>}
          </div>
          <button
            className="add-button"
            disabled={p.status === 'unavailable'}
            aria-label={`Додати ${p.name} у кошик`}
            onClick={() => {
              add(p.id, p.variants[0]);
              toast.success('Товар додано до кошика', {
                description: 'Варіант можна змінити в кошику.',
              });
            }}
          >
            <Plus size={21} />
          </button>
        </div>
      </div>
    </article>
  );
}
export function SectionTitle({
  eyebrow,
  title,
  to,
  link = 'Переглянути всі',
}: {
  eyebrow?: string;
  title: string;
  to?: string;
  link?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <span className="eyebrow blue-text">{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      {to && (
        <Link className="text-link" to={to}>
          {link}
          <ArrowRight size={18} />
        </Link>
      )}
    </div>
  );
}
export function Quantity({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="quantity">
      <button
        aria-label="Зменшити кількість"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Minus size={15} />
      </button>
      <span aria-live="polite">{value}</span>
      <button
        aria-label="Збільшити кількість"
        disabled={value >= 99}
        onClick={() => onChange(value + 1)}
      >
        <Plus size={15} />
      </button>
    </div>
  );
}
export function EmptyState({
  title,
  text,
  to = '/catalog',
  link = 'Перейти до каталогу',
}: {
  title: string;
  text: string;
  to?: string;
  link?: string;
}) {
  return (
    <div className="empty-state">
      <PackageOpen size={54} strokeWidth={1} />
      <h2>{title}</h2>
      <p>{text}</p>
      <Link className="button primary" to={to}>
        {link}
        <ArrowRight size={18} />
      </Link>
    </div>
  );
}
export function DemoNotice() {
  const catalog = useCatalog();
  if (!siteConfig.demo && !catalog.some((p) => p.demo)) return null;
  return (
    <div className="demo-notice">
      <Check size={15} />
      <span>
        {catalog.some((p) => p.demo || p.priceEstimated) ? 'Ціни орієнтовні. ' : ''}
        Наявність, варіант і строк доставки підтверджуємо перед оплатою.
      </span>
    </div>
  );
}
export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Хлібні крихти">
      <Link to="/">Головна</Link>
      {items.map((x, i) => (
        <span key={i}>
          <span aria-hidden="true">/</span>
          {x.to ? <Link to={x.to}>{x.label}</Link> : <span aria-current="page">{x.label}</span>}
        </span>
      ))}
    </nav>
  );
}
export function CartLink() {
  const count = useShop((s) => s.cart.reduce((n, i) => n + i.quantity, 0));
  return (
    <Link className="icon-button cart-link" to="/cart" aria-label={`Кошик: ${count} товарів`}>
      <ShoppingBag size={22} />
      {count > 0 && <span className="count">{count}</span>}
    </Link>
  );
}
