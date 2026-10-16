import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Send, Truck, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { useCatalog, useShop } from '../stores/shop';
import { ProductImage } from '../components/ProductArt';
import {
  Breadcrumbs,
  Quantity,
  ProductCard,
  SectionTitle,
  EmptyState,
  DemoNotice,
} from '../components/Common';
import { categoryLabels, statusLabels } from '../config/site';
import { money } from '../utils/catalog';
import { formatOrder } from '../utils/orders';
import OrderComposer from '../components/OrderComposer';
import { useMeta } from '../hooks/useMeta';
import WholesalePrices from '../components/WholesalePrices';
import { productPrice } from '../utils/pricing';
export default function ProductPage() {
  const { id } = useParams();
  return <ProductDetails key={id} id={id} />;
}
function ProductDetails({ id }: { id?: string }) {
  const products = useCatalog();
  const p = products.find((x) => x.id === id);
  const [variant, setVariant] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [order, setOrder] = useState(false);
  const [color, setColor] = useState('red');
  const [image, setImage] = useState('');
  const add = useShop((s) => s.add);
  const toggle = useShop((s) => s.toggleFavorite);
  const favorite = useShop((s) => s.favorites.includes(id || ''));
  const wholesale = useShop((s) => s.wholesale);
  const setWholesale = useShop((s) => s.setWholesale);
  useMeta(p ? `${p.brand} ${p.name}` : 'Товар не знайдено');
  if (!p)
    return (
      <EmptyState
        title="Товар не знайдено"
        text="Можливо, його вилучено з каталогу. Обери іншу модель."
      />
    );
  const selected = p.variants.includes(variant) ? variant : p.variants[0];
  const quote = productPrice(p, quantity, wholesale);
  return (
    <div className="container page">
      <Breadcrumbs
        items={[
          { label: 'Каталог', to: '/catalog' },
          { label: categoryLabels[p.category], to: `/catalog?category=${p.category}` },
          { label: p.name },
        ]}
      />
      <div className="product-detail">
        <div>
          <div className="detail-visual">
            <ProductImage key={p.id + image} product={image ? { ...p, image } : p} color={color} />
            {!p.image && <span className="art-label">Ілюстрація категорії, не фото моделі</span>}
          </div>
          <div className="gallery-thumbs">
            {[p.image, ...(p.gallery || [])].filter(Boolean).map((src, i) => (
              <button
                key={src}
                className={(image || p.image) === src ? 'active' : ''}
                aria-label={`Фото ${i + 1}`}
                onClick={() => setImage(src)}
              >
                <ProductImage product={{ ...p, image: src }} />
              </button>
            ))}
            {!p.image && (
              <>
                <button
                  className={color === 'red' ? 'active' : ''}
                  aria-label="Основний вигляд ілюстрації"
                  onClick={() => setColor('red')}
                >
                  <ProductImage product={p} color="red" />
                </button>
                {p.category === 'rubbers' && (
                  <button
                    className={color === 'black' ? 'active' : ''}
                    aria-label="Ілюстрація чорної накладки"
                    onClick={() => setColor('black')}
                  >
                    <ProductImage product={p} color="black" />
                  </button>
                )}
              </>
            )}
            <p>
              {p.image
                ? 'Вигляд упаковки та оформлення можуть змінюватися між партіями. Комплектацію уточнюйте перед оплатою.'
                : 'Фотографії конкретної моделі додасть власник каталогу. Ілюстрація не підтверджує комплектацію.'}
            </p>
          </div>
        </div>
        <div className="detail-info">
          <span className="eyebrow blue-text">
            {p.brand} / {categoryLabels[p.category]}
          </span>
          <h1>{p.name}</h1>
          <div className="detail-status">
            <span className={`stock ${p.status === 'unavailable' ? 'unavailable' : ''}`}>
              <i />
              {statusLabels[p.status]}
            </span>
            <small>Код: {p.id}</small>
          </div>
          <div className="detail-price">
            <small className="muted">Роздріб / шт. </small>
            {money(p.price)}
            {p.demo && <span>тестова ціна</span>}
            {p.priceEstimated && <span>орієнтовна ціна</span>}
          </div>
          <WholesalePrices product={p} />
          <label className="checkbox-label wholesale-note">
            <input
              type="checkbox"
              checked={wholesale}
              onChange={(e) => setWholesale(e.target.checked)}
            />
            Малий опт
          </label>
          {wholesale && (
            <p className="muted small">
              Для {quantity} шт.:{' '}
              {quote.unitPrice === null ? 'Ціна за запитом' : `${money(quote.unitPrice)} / шт.`}. До
              3 шт. — роздріб. У кошику різні варіанти цієї моделі підсумовуються.
            </p>
          )}
          <DemoNotice />
          <label className="field-label">
            Варіант
            <select value={selected} onChange={(e) => setVariant(e.target.value)}>
              {p.variants.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          {p.demo && (
            <small className="muted">
              Варіанти наведені для тестування. Доступні кольори, товщину та рукоятку підтверджує
              менеджер.
            </small>
          )}
          <div className="detail-buy">
            <Quantity value={quantity} onChange={setQuantity} />
            <button
              className="button primary"
              disabled={p.status === 'unavailable'}
              onClick={() => {
                add(p.id, selected, quantity);
                toast.success(`${p.name} додано до кошика`);
              }}
            >
              <ShoppingBag size={18} />
              До кошика
            </button>
            <button
              className={`icon-button outlined ${favorite ? 'selected' : ''}`}
              aria-pressed={favorite}
              aria-label={favorite ? 'Видалити з обраного' : 'Додати до обраного'}
              onClick={() => toggle(p.id)}
            >
              <Heart fill={favorite ? 'currentColor' : 'none'} size={21} />
            </button>
          </div>
          <button
            className="button outline full-width"
            disabled={p.status === 'unavailable'}
            onClick={() => setOrder(!order)}
          >
            <Send size={17} />
            Замовити через месенджер
          </button>
          <div className="detail-promises">
            <span>
              <Truck size={19} />
              <span>
                {p.status === 'preorder' ? 'Орієнтовний строк' : 'Строк відправлення'}
                <small>
                  {p.status === 'unavailable' ? 'Уточніть доступність у менеджера' : p.leadTime}
                </small>
              </span>
            </span>
            <span>
              <ShieldCheck size={19} />
              <span>
                Спочатку — підтвердження
                <small>Остаточні строки, ціна й умови узгоджуються до оплати</small>
              </span>
            </span>
          </div>
          <Link className="text-link" to="/builder">
            Додай модель у власну збірку <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
      {order && (
        <OrderComposer
          text={formatOrder(
            [{ key: p.id, productId: p.id, variant: selected, quantity }],
            products,
            undefined,
            false,
            wholesale
          )}
        />
      )}
      <div className="product-description">
        <section>
          <h2>Про модель</h2>
          <p>{p.description}</p>
        </section>
        <section>
          <h2>Характеристики</h2>
          <dl>
            {Object.entries(p.specs).map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <p className="muted small">
            Непідтверджені швидкість, обертання, контроль, жорсткість, вага й матеріали не
            вказуються.
          </p>
        </section>
      </div>
      <section className="section">
        <SectionTitle title="Ще в цій категорії" to={`/catalog?category=${p.category}`} />
        <div className="product-grid">
          {products
            .filter((x) => x.category === p.category && x.id !== p.id)
            .slice(0, 4)
            .map((x) => (
              <ProductCard key={x.id} product={x} />
            ))}
        </div>
      </section>
    </div>
  );
}
