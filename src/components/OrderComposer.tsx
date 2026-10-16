import { useState } from 'react';
import { Copy, Download, Send, MessageCircle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { siteConfig } from '../config/site';
import { downloadText, telegramUrl, viberUrl } from '../utils/orders';
export default function OrderComposer({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Текст скопійовано. Вставте його в чат менеджера.');
    } catch {
      toast.info('Виділіть текст нижче та скопіюйте вручну або завантажте файл.');
    }
  }
  return (
    <section className="order-composer">
      <span className="eyebrow blue-text">Наступний крок — повідомлення</span>
      <h2>Узгодьте замовлення з менеджером</h2>
      <p>Текст підготовлено у вашому браузері. Магазин ще не отримав і не підтвердив замовлення.</p>
      {!siteConfig.contacts.telegramUsername && (
        <div className="notice">
          Контакти продавця ще не налаштовані. Telegram відкриє вибір одержувача. Для реального
          замовлення власник має вказати контакт менеджера.
        </div>
      )}
      {text.length > 3500 && (
        <div className="notice">
          Запит довгий: Telegram відкриється з коротким вступом. Скопіюйте повний текст та надішліть
          його частинами або окремим .txt-файлом.
        </div>
      )}
      <label>
        Текст повідомлення
        <textarea
          className="order-text"
          readOnly
          value={text}
          rows={12}
          onFocus={(e) => e.target.select()}
        />
      </label>
      <div className="button-row">
        <button className="button primary" onClick={copy}>
          {copied ? <Check size={17} /> : <Copy size={17} />}Скопіювати текст
        </button>
        <a className="button outline" href={telegramUrl(text)} target="_blank" rel="noreferrer">
          <Send size={17} />
          {siteConfig.contacts.telegramUsername ? 'Написати у Telegram' : 'Поділитися у Telegram'}
        </a>
        {siteConfig.viberEnabled ? (
          <a
            className="button outline"
            href={viberUrl(text)}
            onClick={() => {
              void copy();
              toast.info(
                'У Viber вставте повний текст з буфера. Посилання може містити лише короткий вступ. Якщо застосунок не відкрився, збережіть .txt.'
              );
            }}
          >
            <MessageCircle size={17} />
            Відкрити Viber
          </a>
        ) : (
          <button className="button outline" disabled>
            <MessageCircle size={17} />
            Viber тимчасово недоступний
          </button>
        )}
        <button className="button quiet" onClick={() => downloadText(text)}>
          <Download size={17} />
          Завантажити .txt
        </button>
      </div>
      <small>
        {siteConfig.viberEnabled &&
          'Для Viber потрібен встановлений застосунок. Його share-посилання обмежує текст до 200 символів, тому повний запит копіюється для ручного вставлення. '}
        Після переходу перевірте одержувача й надішліть повідомлення самостійно. Не вводьте платіжні
        дані.
      </small>
    </section>
  );
}
