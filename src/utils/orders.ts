import type { CartItem, CheckoutDetails, Product } from '../types/catalog';
import { money } from './catalog';
import { siteConfig, statusLabels } from '../config/site';
import { quoteCart } from './pricing';
export { assemblyFee } from './pricing';
export function cartTotal(items: CartItem[], products: Product[]) {
  return items.reduce(
    (sum, i) => sum + (products.find((p) => p.id === i.productId)?.price ?? 0) * i.quantity,
    0
  );
}
export function formatOrder(
  items: CartItem[],
  products: Product[],
  details?: CheckoutDetails,
  assembly = false,
  wholesale = false
) {
  const quote = quoteCart(items, products, wholesale, assembly);
  const lines = quote.lines.map(({ item: i, product: p, unitPrice, total, threshold }, index) => {
    return `${index + 1}. ${p ? `${p.brand} ${p.name}` : 'Видалений товар'}${i.group ? ' [збірка ракетки]' : ''}\nВаріант: ${i.variant}\nКількість: ${i.quantity}\nСтатус: ${p ? statusLabels[p.status] : 'Потребує перевірки'}${p?.status === 'preorder' ? `\nОрієнтовний строк: ${p.leadTime}` : ''}\n${threshold ? `Малий опт від ${threshold} шт.\n` : ''}${unitPrice === null ? 'Ціна за запитом' : 'Ціна: ' + money(unitPrice)} · Разом: ${total === null ? 'Ціна за запитом' : money(total)}`;
  });
  return `Вітаю! ${wholesale ? 'Заявка на малий опт' : 'Хочу замовити'}:\n\n${lines.join('\n\n')}\n${assembly ? `\nПослуга збірки: ${quote.fee === null ? 'Ціна за запитом' : money(quote.fee)}\n` : ''}\nОрієнтовна сума: ${quote.total === null ? 'Ціна за запитом (не всі ціни встановлені)' : money(quote.total)}${quote.unknownLines ? `\nВідома частина вартості товарів: ${money(quote.knownSubtotal)}; це не повна сума заявки.` : ''}${details ? `\n\nІм’я: ${details.name}\nЗв’язок: ${details.contact}\nМісто: ${details.city}\nДоставка: ${details.delivery}\nКоментар: ${details.comment || '—'}` : ''}\n\nНаявність і остаточні строки постачання узгоджуються з менеджером перед оплатою.${siteConfig.demo ? '\n\nТЕСТОВИЙ ЗАПИТ. Демонстраційний режим вітрини.' : items.some((i) => products.find((p) => p.id === i.productId)?.demo) ? '\n\nТЕСТОВИЙ ЗАПИТ. Каталог містить демонстраційні дані.' : ''}\nЦіну й умови має підтвердити менеджер. Це повідомлення ще не є прийнятим замовленням.`;
}
export function telegramUrl(text: string) {
  const user = siteConfig.contacts.telegramUsername.replace(/^@/, '');
  const draft =
    text.length > 3500
      ? `Вітаю! Хочу узгодити замовлення в ${siteConfig.name}. Повний список надішлю окремими повідомленнями.`
      : text;
  const url =
    siteConfig.canonicalUrl ||
    (typeof window !== 'undefined' ? window.location.href.split('#')[0] : 'https://telegram.org/');
  return user
    ? `https://t.me/${encodeURIComponent(user)}?text=${encodeURIComponent(draft)}`
    : `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(draft)}`;
}
export function viberUrl(text: string) {
  const phone = siteConfig.contacts.viberPhone.replace(/[^0-9+]/g, '');
  const draft =
    text.length > 200
      ? `Вітаю! Хочу узгодити замовлення в ${siteConfig.name}. Повний список вставлю окремим повідомленням.`
      : text;
  return phone
    ? `viber://chat?number=${encodeURIComponent(phone)}`
    : `viber://forward?text=${encodeURIComponent(draft)}`;
}
export function downloadText(text: string, name = 'spinpoint-order.txt') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 500);
}
