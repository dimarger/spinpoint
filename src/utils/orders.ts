import type { CartItem, CheckoutDetails, Product } from '../types/catalog';
import { money } from './catalog';
import { siteConfig } from '../config/site';
export function assemblyFee(subtotal: number) {
  return siteConfig.assembly.enabled && subtotal >= siteConfig.assembly.freeFrom
    ? 0
    : siteConfig.assembly.fee;
}
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
  assembly = false
) {
  const subtotal = cartTotal(items, products);
  const fee = assembly ? assemblyFee(subtotal) : 0;
  const lines = items.map((i, index) => {
    const p = products.find((p) => p.id === i.productId);
    return `${index + 1}. ${p ? `${p.brand} ${p.name}` : 'Видалений товар'}${i.group ? ' [збірка ракетки]' : ''}\nВаріант: ${i.variant}\nКількість: ${i.quantity}\nЦіна: ${money(p?.price ?? 0)} · Разом: ${money((p?.price ?? 0) * i.quantity)}`;
  });
  return `Вітаю! Хочу замовити:\n\n${lines.join('\n\n')}\n${assembly ? `\nПослуга збірки: ${money(fee)}\n` : ''}\nОрієнтовна сума: ${money(subtotal + fee)}${details ? `\n\nІм’я: ${details.name}\nЗв’язок: ${details.contact}\nМісто: ${details.city}\nДоставка: ${details.delivery}\nКоментар: ${details.comment || '—'}` : ''}\n\nПідкажіть, будь ласка, актуальну наявність та терміни доставки.${siteConfig.demo ? '\n\nТЕСТОВИЙ ЗАПИТ. Демонстраційний режим вітрини.' : items.some((i) => products.find((p) => p.id === i.productId)?.demo) ? '\n\nТЕСТОВИЙ ЗАПИТ. Каталог містить демонстраційні дані.' : ''}\nЦіну й умови має підтвердити менеджер. Це повідомлення ще не є прийнятим замовленням.`;
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
