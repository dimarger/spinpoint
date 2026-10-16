import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Trash2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useCatalog, useShop } from '../stores/shop';
import { Breadcrumbs, EmptyState, Quantity, DemoNotice } from '../components/Common';
import { ProductImage } from '../components/ProductArt';
import { assemblyFee, cartTotal, formatOrder } from '../utils/orders';
import { money } from '../utils/catalog';
import { useMeta } from '../hooks/useMeta';
import { siteConfig } from '../config/site';
import OrderComposer from '../components/OrderComposer';
import type { CheckoutDetails } from '../types/catalog';
export default function Cart() {
  const shop = useShop();
  const products = useCatalog();
  const [checkout, setCheckout] = useState(false);
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState<CheckoutDetails>({
    name: '',
    contact: '',
    city: '',
    delivery: siteConfig.deliveryOptions[0],
    comment: '',
  });
  useMeta('Кошик');
  const subtotal = cartTotal(shop.cart, products);
  const fee = shop.assembly ? assemblyFee(subtotal) : 0;
  const invalid = shop.cart.some((i) => {
    const p = products.find((p) => p.id === i.productId);
    return !p || p.status === 'unavailable' || !p.variants.includes(i.variant);
  });
  function field(k: keyof CheckoutDetails, value: string) {
    setDetails((s) => ({ ...s, [k]: value }));
    setMessage('');
  }
  if (!shop.cart.length)
    return (
      <div className="container page">
        <Breadcrumbs items={[{ label: 'Кошик' }]} />
        <h1 className="sr-only">Твій кошик</h1>
        <EmptyState
          title="Поки що тут порожньо"
          text="Вдала гра починається з вибору. Знайди свою наступну накладку, основу чи аксесуари."
        />
      </div>
    );
  return (
    <div className="container page">
      <Breadcrumbs items={[{ label: 'Кошик' }]} />
      <div className="page-title">
        <span className="eyebrow blue-text">МАЙЖЕ НА СТАРТІ</span>
        <h1>
          Твій кошик
          <span className="title-count">{shop.cart.reduce((s, i) => s + i.quantity, 0)}</span>
        </h1>
        <p>Перевір комплектацію. Остаточну ціну й строк підтвердить менеджер.</p>
      </div>
      <DemoNotice />
      <div className="cart-layout">
        <div>
          <div className="cart-items">
            {shop.cart.map((item) => {
              const p = products.find((p) => p.id === item.productId);
              return (
                <article className="cart-item" key={item.key}>
                  <Link className="cart-image" to={p ? `/product/${p.id}` : '/catalog'}>
                    {p && (
                      <ProductImage
                        product={p}
                        color={item.variant.startsWith('Чорний') ? 'black' : 'red'}
                      />
                    )}
                  </Link>
                  <div className="cart-item-info">
                    <span className="eyebrow muted">
                      {p?.brand || 'Каталог змінено'}
                      {item.group ? ' · ЗБІРКА' : ''}
                    </span>
                    <Link className="product-name" to={p ? `/product/${p.id}` : '/catalog'}>
                      {p?.name || 'Товар видалено'}
                    </Link>
                    {p && (
                      <label>
                        <span className="sr-only">Варіант {p.name}</span>
                        <select
                          aria-label={`Варіант ${p.name}`}
                          value={item.variant}
                          onChange={(e) => {
                            shop.variant(item.key, e.target.value);
                            setMessage('');
                          }}
                        >
                          {!p.variants.includes(item.variant) && (
                            <option value={item.variant}>{item.variant} — недоступний</option>
                          )}
                          {p.variants.map((v) => (
                            <option key={v}>{v}</option>
                          ))}
                        </select>
                      </label>
                    )}
                    {(!p || p.status === 'unavailable' || !p.variants.includes(item.variant)) && (
                      <p className="error-text">
                        Видали недоступний товар або обери актуальний варіант.
                      </p>
                    )}
                    <small className="muted">{p ? `${money(p.price)} / шт.` : ''}</small>
                  </div>
                  <div className="cart-item-controls">
                    <strong>{money((p?.price || 0) * item.quantity)}</strong>
                    <Quantity
                      value={item.quantity}
                      onChange={(n) => {
                        shop.quantity(item.key, n);
                        setMessage('');
                      }}
                    />
                    <button
                      className="text-button"
                      aria-label={`Видалити ${p?.name || 'товар'}`}
                      onClick={() => {
                        shop.remove(item.key);
                        setMessage('');
                      }}
                    >
                      <Trash2 size={15} />
                      Видалити
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
          <Link className="text-link back-to-shop" to="/catalog">
            <ArrowLeft size={16} />
            Продовжити покупки
          </Link>
        </div>
        <aside className="cart-summary">
          <span className="eyebrow">ТВОЄ ЗАМОВЛЕННЯ</span>
          <h2>Разом</h2>
          <div>
            <span>Товари</span>
            <strong>{money(subtotal)}</strong>
          </div>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={shop.assembly}
              onChange={(e) => {
                shop.setAssembly(e.target.checked);
                setMessage('');
              }}
            />
            Послуга збірки замовлення
          </label>
          {shop.assembly && (
            <div>
              <span>Збірка</span>
              <strong>{fee ? money(fee) : 'Безкоштовно'}</strong>
            </div>
          )}
          <small className="muted">
            Тестові умови: {siteConfig.assembly.label.toLowerCase()}. Обсяг робіт і остаточна
            вартість — після погодження.
          </small>
          <div>
            <span>Доставка</span>
            <span>За тарифом перевізника</span>
          </div>
          <div className="summary-total">
            <span>Орієнтовна сума</span>
            <strong>{money(subtotal + fee)}</strong>
          </div>
          <button
            className="button primary full-width"
            disabled={invalid}
            onClick={() => {
              setCheckout(true);
              requestAnimationFrame(() => {
                document
                  .getElementById('checkout')
                  ?.scrollIntoView({ block: 'start', behavior: 'instant' });
                document
                  .querySelector<HTMLInputElement>('#checkout input[name="name"]')
                  ?.focus({ preventScroll: true });
              });
            }}
          >
            Перейти до оформлення <ArrowRight size={18} />
          </button>
          <small>
            <ShieldCheck size={15} />
            Без списання коштів на сайті
          </small>
          {invalid && <p className="error-text">Онови недоступні позиції для продовження.</p>}
        </aside>
      </div>
      {checkout && (
        <section className="checkout-section" id="checkout">
          <span className="eyebrow blue-text">ОФОРМЛЕННЯ ЗАПИТУ</span>
          <h2>Як з тобою зв’язатися?</h2>
          <p>
            Дані використовуються лише для тексту повідомлення. Сайт їх не надсилає і не зберігає
            між сеансами.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setMessage(formatOrder(shop.cart, products, details, shop.assembly));
            }}
          >
            <div className="form-grid">
              <label>
                Ім’я
                <input
                  name="name"
                  autoComplete="given-name"
                  required
                  maxLength={80}
                  value={details.name}
                  onChange={(e) => field('name', e.target.value)}
                />
              </label>
              <label>
                Телефон або Telegram
                <input
                  name="contact"
                  autoComplete="tel"
                  required
                  minLength={3}
                  maxLength={100}
                  placeholder="+380… або @username"
                  value={details.contact}
                  onChange={(e) => field('contact', e.target.value)}
                />
              </label>
              <label>
                Місто
                <input
                  name="city"
                  autoComplete="address-level2"
                  required
                  maxLength={120}
                  value={details.city}
                  onChange={(e) => field('city', e.target.value)}
                />
              </label>
              <label>
                Спосіб доставки
                <select
                  value={details.delivery}
                  onChange={(e) => field('delivery', e.target.value)}
                >
                  {siteConfig.deliveryOptions.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
              <label className="span-two">
                Коментар
                <textarea
                  maxLength={1500}
                  rows={3}
                  value={details.comment}
                  onChange={(e) => field('comment', e.target.value)}
                  placeholder="Відділення, побажання до комплектації чи питання"
                />
              </label>
            </div>
            <label className="checkbox-label consent">
              <input type="checkbox" required />Я ознайомився(-лась) з{' '}
              <Link to="/info/privacy" target="_blank">
                інформацією про приватність
              </Link>{' '}
              і розумію, що повідомлення потрібно надіслати самостійно.
            </label>
            <button className="button primary" disabled={invalid} type="submit">
              Сформувати повідомлення <ArrowRight size={17} />
            </button>
          </form>
          {message && <OrderComposer text={message} />}
        </section>
      )}
    </div>
  );
}
