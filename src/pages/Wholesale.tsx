import { useState } from 'react';
import { ArrowRight, Boxes, Layers, MessagesSquare } from 'lucide-react';
import { Breadcrumbs } from '../components/Common';
import OrderComposer from '../components/OrderComposer';
import { siteConfig } from '../config/site';
import { useMeta } from '../hooks/useMeta';
export default function Wholesale() {
  useMeta('Співпраця для магазинів');
  const [message, setMessage] = useState('');
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
          Інвентар для настільного тенісу для магазинів і клубів. Обговоримо невеликі партії та
          індивідуальну вартість.
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
            text: 'Вкажіть потрібні моделі й кількість. Мінімальну партію підтвердить менеджер.',
          },
          {
            icon: Layers,
            title: 'Повний асортимент',
            text: 'Накладки, основи, ракетки, м’ячі, чохли, очищувачі й аксесуари.',
          },
          {
            icon: MessagesSquare,
            title: 'Індивідуальний розрахунок',
            text: 'Ціна, знижки та строки — після уточнення запиту й доступності у постачальника.',
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
            Оптову ціну, доступні моделі та строк доставки розраховуємо для конкретної партії.
            Остаточні умови узгоджуємо перед оплатою.
          </div>
        </div>
        <form
          onChange={() => setMessage('')}
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            setMessage(
              `Вітаю! Цікавить співпраця з ${siteConfig.name}.\n\nМагазин: ${f.get('store')}\nКонтактна особа: ${f.get('person')}\nЗв’язок: ${f.get('contact')}\nТовари: ${f.get('products')}\nКількість: ${f.get('quantity')}\nКоментар: ${f.get('comment') || '—'}\n\nПрошу розрахувати комерційну пропозицію та уточнити строки й умови постачання. Це запит, а не підтверджене замовлення.`
            );
          }}
        >
          <div className="form-grid">
            <label>
              Назва магазину
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
                required
                placeholder="Наприклад, 10 накладок"
                maxLength={120}
              />
            </label>
            <label className="span-two">
              Товари, що цікавлять
              <textarea name="products" rows={3} required maxLength={2000} />
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
          <button className="button primary">
            Підготувати запит <ArrowRight size={17} />
          </button>
        </form>
      </div>
      {message && <OrderComposer text={message} />}
    </div>
  );
}
