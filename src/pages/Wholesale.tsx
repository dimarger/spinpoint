import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowRight, Boxes, Layers, MessagesSquare } from 'lucide-react';
import { Breadcrumbs } from '../components/Common';
import OrderComposer from '../components/OrderComposer';
import { siteConfig, statusLabels } from '../config/site';
import { useCatalog, useShop } from '../stores/shop';
import { productPrice, quoteCart } from '../utils/pricing';
import { formatOrder } from '../utils/orders';
import { money } from '../utils/catalog';
import WholesalePrices, { ProductAvailability } from '../components/WholesalePrices';
import { useMeta } from '../hooks/useMeta';
export default function Wholesale() {
  useMeta('Співпраця для магазинів');
  const products = useCatalog();
  const shop = useShop();
  const [productId, setProductId] = useState('');
  const [variant, setVariant] = useState('');
  const [quantity, setQuantity] = useState(3);
  const [request, setRequest] = useState<Record<string, string> | null>(null);
  const product =
    products.find((p) => p.id === productId) ||
    products.find((p) => p.status !== 'unavailable') ||
    products[0];
  const selectedVariant = product.variants.includes(variant) ? variant : product.variants[0];
  const price = productPrice(product, quantity, true);
  const quote = quoteCart(shop.cart, products, true, shop.assembly);
  const invalid = quote.lines.some((line) => line.invalid);
  const intro = request
    ? `Вітаю! Цікавить співпраця з ${siteConfig.name}.\n\nМагазин / профіль: ${request.store}\nКонтактна особа: ${request.person}\nЗв’язок: ${request.contact}\nДодатковий запит: ${request.products || '—'}\nКількість у додатковому запиті: ${request.quantity || '—'}\nКоментар: ${request.comment || '—'}`
    : '';
  const message = request
    ? shop.cart.length
      ? `${intro}\n\n${formatOrder(shop.cart, products, { name: request.person, contact: request.contact, city: 'Узгодити', delivery: 'Нова пошта — узгодити відділення', comment: request.comment }, shop.assembly, true)}`
      : `${intro}\n\nПрошу розрахувати комерційну пропозицію. Ціна за запитом. Остаточні строки узгоджуємо перед оплатою. Це заявка, а не підтверджене замовлення.`
    : '';
  return (
    <div className="container page">
      <Breadcrumbs items={[{ label: 'Співпраця' }]} />
      <div className="wholesale-hero">
        <span className="eyebrow">{siteConfig.name.toUpperCase()} / B2B</span>
        <h1>
          Розвивай свій магазин.
          <br />
          <span>Грай у команді.</span>
        </h1>
        <p>
          Малий опт для продавців Prom.ua, OLX, приватних перепродавців і невеликих
          інтернет-магазинів. Почніть з невеликої партії та обговоріть вартість напряму з
          менеджером.
        </p>
        <button
          className="button white"
          onClick={() => {
            document
              .getElementById('wholesale-form')
              ?.scrollIntoView({ block: 'start', behavior: 'instant' });
            document
              .querySelector<HTMLInputElement>('#wholesale-form input')
              ?.focus({ preventScroll: true });
          }}
        >
          Обговорити співпрацю <ArrowRight size={18} />
        </button>
      </div>
      <div className="steps-grid section">
        {[
          {
            icon: Boxes,
            title: 'Невеликі партії',
            text: 'Індивідуальні ціни від 3, 5 і 10 одиниць однієї моделі. Можна поєднувати різні кольори та варіанти.',
          },
          {
            icon: Layers,
            title: 'Повний асортимент',
            text: '80 позицій: накладки, основи, м’ячі, чохли, очищувачі й аксесуари. Збирайте змішані партії.',
          },
          {
            icon: MessagesSquare,
            title: 'Індивідуальний розрахунок',
            text: 'Ціна без автоматичних знижок. Якщо її не вказано — Ціна за запитом. Узгодьте умови напряму в Telegram.',
          },
        ].map((x) => (
          <div key={x.title}>
            <x.icon size={30} strokeWidth={1.4} />
            <h3>{x.title}</h3>
            <p>{x.text}</p>
          </div>
        ))}
      </div>
      <div className="wholesale-form-layout" id="wholesale-form">
        <div>
          <span className="eyebrow blue-text">ПОЧНЕМО ЗІ ЗНАЙОМСТВА</span>
          <h2>Запит на комерційну пропозицію</h2>
          <p>
            Залиште лише дані, потрібні для розмови. Форма підготує повідомлення; ви самостійно
            надішлете його менеджеру.
          </p>
          <div className="notice">
            Для товарів під замовлення орієнтир — 20–30 днів. Наявність та остаточні строки
            узгоджуємо з менеджером перед оплатою. До 3 шт. однієї моделі діє роздрібна ціна.
          </div>
          <div className="b2b-picker">
            <h3>Додати товари до заявки</h3>
            <div className="form-grid">
              <label className="span-two">
                Товар
                <select
                  value={product.id}
                  onChange={(e) => {
                    setProductId(e.target.value);
                    setVariant('');
                    setRequest(null);
                  }}
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.brand} {p.name} — {statusLabels[p.status]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Варіант
                <select value={selectedVariant} onChange={(e) => setVariant(e.target.value)}>
                  {product.variants.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
              <label>
                Кількість
                <input
                  type="number"
                  min="1"
                  max="99"
                  step="1"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Math.min(99, Math.floor(e.target.valueAsNumber) || 1)))
                  }
                />
              </label>
            </div>
            <p className="muted small">
              Роздріб: {money(product.price)} / шт. · {statusLabels[product.status]}
            </p>
            <ProductAvailability product={product} />
            <WholesalePrices product={product} />
            <p>
              Для {quantity} шт.:{' '}
              <strong>
                {price.unitPrice === null ? 'Ціна за запитом' : `${money(price.unitPrice)} / шт.`}
              </strong>
            </p>
            <button
              type="button"
              className="button primary"
              disabled={product.status === 'unavailable'}
              onClick={() => {
                shop.add(product.id, selectedVariant, quantity);
                shop.setWholesale(true);
                setRequest(null);
                toast.success('Додано до оптової заявки');
              }}
            >
              Додати до заявки
            </button>
          </div>
          <div className="b2b-picker" aria-live="polite">
            <h3>Ваша партія — {shop.cart.reduce((n, i) => n + i.quantity, 0)} шт.</h3>
            <p className="muted small">
              До заявки входить увесь поточний кошик. Пороги рахуються окремо для кожної моделі,
              разом для її варіантів.
            </p>
            <ul className="b2b-request-lines">
              {quote.lines.map((line) => (
                <li key={line.item.key}>
                  {line.product ? `${line.product.brand} ${line.product.name}` : 'Товар видалено'} ·{' '}
                  {line.item.variant} · {line.item.quantity} шт. —{' '}
                  {line.total === null ? 'Ціна за запитом' : money(line.total)}
                </li>
              ))}
            </ul>
            {shop.cart.length > 0 && (
              <>
                <p>
                  Попередня сума:{' '}
                  <strong>{quote.total === null ? 'Ціна за запитом' : money(quote.total)}</strong>
                </p>
                {quote.unknownLines > 0 && (
                  <p className="muted small">
                    Відома частина товарів: {money(quote.knownSubtotal)}; це не повна сума.
                  </p>
                )}
                <Link className="text-link" to="/cart" onClick={() => shop.setWholesale(true)}>
                  Змінити кількість у кошику <ArrowRight size={17} />
                </Link>
              </>
            )}
            {invalid && (
              <p className="error-text">
                У кошику є недоступний товар або варіант. Оновіть його перед формуванням заявки.
              </p>
            )}
          </div>
        </div>
        <form
          onChange={() => setRequest(null)}
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            if (invalid) return;
            setRequest(
              Object.fromEntries([...f.entries()].map(([key, value]) => [key, String(value)]))
            );
          }}
        >
          <div className="form-grid">
            <label>
              Магазин, профіль Prom.ua / OLX або ім’я продавця
              <input name="store" required maxLength={120} />
            </label>
            <label>
              Контактна особа
              <input name="person" required maxLength={80} />
            </label>
            <label>
              Telegram або телефон
              <input name="contact" required minLength={3} maxLength={100} />
            </label>
            <label>
              Орієнтовна кількість
              <input
                name="quantity"
                required={!shop.cart.length}
                placeholder="Наприклад, 10 накладок"
                maxLength={120}
              />
            </label>
            <label className="span-two">
              {shop.cart.length ? 'Додаткові товари та побажання' : 'Товари, що цікавлять'}
              <textarea name="products" rows={3} required={!shop.cart.length} maxLength={2000} />
            </label>
            <label className="span-two">
              Коментар
              <textarea name="comment" rows={3} maxLength={1500} />
            </label>
          </div>
          <label className="checkbox-label consent">
            <input type="checkbox" required />
            Розумію, що дані потрібно самостійно надіслати у месенджері.
          </label>
          <button className="button primary" disabled={invalid}>
            Підготувати запит <ArrowRight size={17} />
          </button>
        </form>
      </div>
      {message && <OrderComposer text={message} />}
    </div>
  );
}
