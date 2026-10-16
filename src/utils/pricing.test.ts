import { describe, expect, it } from 'vitest';
import { initialCatalog } from '../data/catalog';
import { catalogSchema, type CartItem, type Product } from '../types/catalog';
import { productPrice, quoteCart } from './pricing';
import { formatOrder } from './orders';
import { money } from './catalog';
import { useShop } from '../stores/shop';

const mercury = initialCatalog.find((p) => p.id === 'yinhe-mercury-ii-458')!;
const other = initialCatalog.find((p) => p.id === 'kokutaku-868-training-502')!;
const priced: Product = { ...mercury, wholesalePrices: { 3: 310, 5: 290, 10: 275 } };
const line = (p: Product, quantity: number, index = 0): CartItem => ({
  key: `${p.id}-${index}`,
  productId: p.id,
  quantity,
  variant: p.variants[index],
});

describe('explicit per-product wholesale pricing', () => {
  it.each([
    [2, 329],
    [3, 310],
    [4, 310],
    [5, 290],
    [9, 290],
    [10, 275],
    [50, 275],
  ])('uses the correct tier for %i units', (quantity, unitPrice) => {
    expect(productPrice(priced, quantity, true).unitPrice).toBe(unitPrice);
  });
  it('leaves retail pricing unchanged at every quantity', () => {
    expect(productPrice(priced, 10).unitPrice).toBe(329);
    expect(quoteCart([line(priced, 10)], [priced]).total).toBe(3290);
  });
  it('does not invent a price or fall back to another tier or to retail', () => {
    const p = { ...priced, wholesalePrices: { 3: 310, 10: 275 } };
    expect(productPrice(p, 5, true).unitPrice).toBeNull();
    expect(productPrice(mercury, 3, true).unitPrice).toBeNull();
    expect(quoteCart([line(mercury, 3)], [mercury], true).total).toBeNull();
  });
  it('combines variants of one model but not quantities of different models', () => {
    const cart = [line(priced, 2, 0), line(priced, 3, 2), line(other, 2)];
    const quote = quoteCart(cart, [priced, other], true);
    expect(quote.lines.map((l) => l.unitPrice)).toEqual([290, 290, 329]);
    expect(quote.total).toBe(2108);
    expect(quoteCart([line(priced, 2), line(other, 2)], [priced, other], true).total).toBe(1316);
  });
  it('keeps incomplete totals and assembly unknown while identifying the known subtotal', () => {
    const quote = quoteCart([line(priced, 5), line(other, 3)], [priced, other], true, true);
    expect(quote.knownSubtotal).toBe(1450);
    expect(quote.unknownLines).toBe(1);
    expect(quote.subtotal).toBeNull();
    expect(quote.fee).toBeNull();
    expect(quote.total).toBeNull();
    expect(quote.lines.every((l) => !l.invalid)).toBe(true);
  });
  it('calculates assembly after known wholesale prices and retains unavailable validation', () => {
    expect(quoteCart([line(priced, 10)], [priced], true, true).total).toBe(2900);
    expect(quoteCart([line(priced, 20)], [priced], true, true).fee).toBe(0);
    const unavailable = { ...priced, status: 'unavailable' as const };
    expect(quoteCart([line(unavailable, 3)], [unavailable], true).lines[0].invalid).toBe(true);
    expect(
      quoteCart([{ ...line(priced, 3), variant: 'Missing' }], [priced], true).lines[0].invalid
    ).toBe(true);
  });
  it('preserves explicitly set kopecks in display and sums', () => {
    const p = { ...priced, wholesalePrices: { 3: 300.01 } };
    expect(quoteCart([line(p, 3)], [p], true).total).toBe(900.03);
    expect(money(300.01)).toContain('300,01');
  });
  it('includes every item, variant, status, contact and incomplete estimate in a non-accepted request', () => {
    const text = formatOrder(
      [line(priced, 5), line(other, 3)],
      [priced, other],
      {
        name: 'Seller',
        contact: '@reseller',
        city: 'Київ',
        delivery: 'Нова пошта',
        comment: 'Prom.ua',
      },
      false,
      true
    );
    expect(text).toContain('Заявка на малий опт');
    expect(text).toContain('Yinhe Mercury II');
    expect(text).toContain('Kokutaku 868 Training');
    expect(text).toContain(priced.variants[0]);
    expect(text).toContain('Кількість: 5');
    expect(text).toContain('Кількість: 3');
    expect(text).toContain('@reseller');
    expect(text).toContain('Під замовлення');
    expect(text).toContain('20–30 днів');
    expect(text).toContain('Орієнтовна сума: Ціна за запитом');
    expect(text).toContain('це не повна сума заявки');
    expect(text).toContain('ще не є прийнятим замовленням');
  });
});

describe('B2B data compatibility and persistence', () => {
  it('accepts legacy JSON, defaults missing fields and strips private cost fields', () => {
    const legacy = {
      ...mercury,
      wholesalePrices: undefined,
      leadTime: undefined,
      fullCost: 200,
      supplier: 'private',
    };
    const p = catalogSchema.parse([legacy])[0];
    expect(p.wholesalePrices).toEqual({});
    expect(p.leadTime).toBe('20–30 днів');
    expect(p).not.toHaveProperty('fullCost');
    expect(p).not.toHaveProperty('supplier');
  });
  it.each([-1, 0, NaN, Infinity, 1000001, 1.001])('rejects unsafe wholesale price %s', (price) => {
    expect(catalogSchema.safeParse([{ ...mercury, wholesalePrices: { 3: price } }]).success).toBe(
      false
    );
  });
  it('roundtrips prices, statuses and delivery terms through JSON and persistence validation', () => {
    const products = [
      { ...priced, status: 'available' as const, leadTime: 'Відправлення після погодження' },
    ];
    const parsed = catalogSchema.parse(JSON.parse(JSON.stringify(products)));
    const merged = useShop.persist.getOptions().merge!(
      { catalog: parsed, wholesale: true, cart: [line(priced, 5)] },
      useShop.getState()
    );
    expect(merged.catalog).toEqual(products);
    expect(merged.wholesale).toBe(true);
    expect(merged.cart[0].quantity).toBe(5);
  });
  it('migrates version 2 without resetting edited retail prices, variants or custom delivery terms', async () => {
    const saved = {
      catalog: [
        { ...priced, price: 350, leadTime: 'Термін узгоджуємо перед оплатою' },
        { ...other, leadTime: '35–40 днів' },
      ],
      cart: [line(priced, 5)],
      favorites: [priced.id],
      wholesale: true,
    };
    const options = useShop.persist.getOptions();
    const merged = options.merge!(await options.migrate!(saved, 2), useShop.getState());
    expect(merged.catalog![0]).toMatchObject({
      price: 350,
      wholesalePrices: priced.wholesalePrices,
      leadTime: '20–30 днів',
    });
    expect(merged.catalog![1].leadTime).toBe('35–40 днів');
    expect(merged.cart).toEqual(saved.cart);
    expect(merged.favorites).toEqual(saved.favorites);
    expect(merged.wholesale).toBe(true);
    expect(options.version).toBe(3);
  });
});
