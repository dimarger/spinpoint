import { beforeEach, describe, expect, it } from 'vitest';
import { initialCatalog } from '../data/catalog';
import { catalogSchema } from '../types/catalog';
import { filterCatalog } from './catalog';
import { assemblyFee, cartTotal, formatOrder, telegramUrl, viberUrl } from './orders';
import { useShop } from '../stores/shop';
import { siteConfig } from '../config/site';
describe('public catalog schema', () => {
  it('validates all 80 sourced products and identifies duplicate IDs', () => {
    expect(initialCatalog).toHaveLength(80);
    expect(catalogSchema.safeParse(initialCatalog).success).toBe(true);
    expect(catalogSchema.safeParse([...initialCatalog, initialCatalog[0]]).success).toBe(false);
  });
  it('rejects invalid prices and unsafe image schemes', () => {
    for (const price of [-1, NaN, Infinity])
      expect(catalogSchema.safeParse([{ ...initialCatalog[0], price }]).success).toBe(false);
    expect(
      catalogSchema.safeParse([{ ...initialCatalog[0], image: 'javascript:alert(1)' }]).success
    ).toBe(false);
  });
  it('strips unknown supplier and cost fields on import', () => {
    const imported = catalogSchema.parse([
      { ...initialCatalog[0], supplier: 'private', purchaseCost: 100 },
    ]);
    expect(imported[0]).not.toHaveProperty('supplier');
    expect(imported[0]).not.toHaveProperty('purchaseCost');
  });
});
describe('URL filters', () => {
  it('combines brand, category, price and case insensitive search', () => {
    const results = filterCatalog(
      initialCatalog,
      new URLSearchParams('q=MERCURY&category=rubbers&brand=Yinhe&min=300&max=350')
    );
    expect(results.map((p) => p.id)).toEqual(['yinhe-mercury-ii-458']);
  });
  it('supports multiple brands, new products, sorting and empty results', () => {
    const filtered = filterCatalog(
      initialCatalog,
      new URLSearchParams('brand=Palio&brand=Yinhe&sort=price-asc')
    );
    expect(filtered.length).toBeGreaterThan(1);
    expect(filtered.every((p, i) => i === 0 || p.price >= filtered[i - 1].price)).toBe(true);
    const descending = filterCatalog(initialCatalog, new URLSearchParams('sort=price-desc'));
    expect(descending.every((p, i) => i === 0 || p.price <= descending[i - 1].price)).toBe(true);
    expect(filterCatalog(initialCatalog, new URLSearchParams('new=1')).every((p) => p.isNew)).toBe(
      true
    );
    expect(filterCatalog(initialCatalog, new URLSearchParams('min=10000&max=1'))).toEqual([]);
  });
});
describe('cart and configuration', () => {
  beforeEach(() => useShop.setState({ cart: [], favorites: [], assembly: false }));
  it('merges identical variants while keeping distinct variants separate', () => {
    const s = useShop.getState();
    s.add('yinhe-mercury-ii-458', 'Чорний - Середня', 2);
    s.add('yinhe-mercury-ii-458', 'Чорний - Середня');
    s.add('yinhe-mercury-ii-458', 'Червоний - Середня');
    expect(useShop.getState().cart.map((i) => i.quantity)).toEqual([3, 1]);
    expect(cartTotal(useShop.getState().cart, initialCatalog)).toBe(
      initialCatalog.find((p) => p.id === 'yinhe-mercury-ii-458')!.price * 4
    );
  });
  it('adding after changing a variant keeps the requested variant correct', () => {
    const s = useShop.getState();
    s.add('yinhe-mercury-ii-458', 'Чорний - Середня');
    const key = useShop.getState().cart[0].key;
    s.variant(key, 'Червоний - Середня');
    s.add('yinhe-mercury-ii-458', 'Чорний - Середня');
    expect(useShop.getState().cart.map((i) => i.variant)).toEqual([
      'Червоний - Середня',
      'Чорний - Середня',
    ]);
  });
  it('clamps quantity, removes products and toggles favorites', () => {
    const s = useShop.getState();
    s.add('spinpoint-8-294', 'Стандартна комплектація', 1000);
    const key = useShop.getState().cart[0].key;
    expect(useShop.getState().cart[0].quantity).toBe(99);
    s.quantity(key, -5);
    expect(useShop.getState().cart[0].quantity).toBe(1);
    s.toggleFavorite('spinpoint-8-294');
    s.toggleFavorite('spinpoint-8-294');
    expect(useShop.getState().favorites).toEqual([]);
    s.remove(key);
    expect(useShop.getState().cart).toEqual([]);
  });
  it('adds every racket component as one grouped configuration', () => {
    useShop.getState().addBuild(
      [
        { productId: '729-z1-1371', variant: 'FL — розкльошена', quantity: 1, group: 'one' },
        {
          productId: 'yinhe-mercury-ii-458',
          variant: 'Чорний - Середня',
          quantity: 1,
          group: 'one',
        },
        {
          productId: 'kokutaku-868-training-502',
          variant: 'Червоний',
          quantity: 1,
          group: 'one',
        },
      ],
      true
    );
    expect(useShop.getState().cart).toHaveLength(3);
    expect(new Set(useShop.getState().cart.map((i) => i.key)).size).toBe(3);
    expect(useShop.getState().assembly).toBe(true);
    expect(cartTotal(useShop.getState().cart, initialCatalog)).toBe(
      ['729-z1-1371', 'yinhe-mercury-ii-458', 'kokutaku-868-training-502'].reduce(
        (total, id) => total + initialCatalog.find((p) => p.id === id)!.price,
        0
      )
    );
  });
});
describe('honest messenger handoff', () => {
  it('calculates assembly on either side of the promotion threshold', () => {
    expect(assemblyFee(siteConfig.assembly.freeFrom - 1)).toBe(siteConfig.assembly.fee);
    expect(assemblyFee(siteConfig.assembly.freeFrom)).toBe(0);
  });
  it('includes variants, quantities, contacts, test warning and no acceptance claim', () => {
    const text = formatOrder(
      [{ key: 'x', productId: 'kokutaku-868-training-502', variant: 'Червоний', quantity: 2 }],
      initialCatalog,
      { name: 'Тест', contact: '@example', city: 'Київ', delivery: 'Нова пошта', comment: '' }
    );
    expect(text).toContain('868 Training');
    expect(text).toContain('Кількість: 2');
    expect(text).toContain('Червоний');
    expect(text).toContain('Ціна: 329');
    expect(text).toContain('Разом: 658');
    expect(text).toContain('Орієнтовна сума: 658');
    expect(text).toContain('@example');
    expect(text).toContain('ТЕСТОВИЙ ЗАПИТ');
    expect(text).toContain('ще не є прийнятим замовленням');
  });
  it('encodes message content in supported fallback messenger links', () => {
    const text = 'Вітаю! & + #';
    expect(new URL(telegramUrl(text)).searchParams.get('text')).toBe(text);
    expect(decodeURIComponent(viberUrl(text))).toContain(text);
  });
  it('uses an explicit short introduction for messages exceeding client limits', () => {
    const text = 'Довгий запит '.repeat(600);
    expect(decodeURIComponent(viberUrl(text)).length).toBeLessThan(230);
    expect(decodeURIComponent(viberUrl(text))).toContain('Повний список');
    expect(new URL(telegramUrl(text)).searchParams.get('text')).toContain('Повний список');
    const telegram = new URL(telegramUrl(text));
    if (siteConfig.contacts.telegramUsername) {
      expect(telegram.hostname).toBe('t.me');
      expect(telegram.pathname).toBe(`/${siteConfig.contacts.telegramUsername}`);
    } else {
      expect(telegram.searchParams.get('url')).toBeTruthy();
    }
  });
  it('recovers safely from corrupted persisted cart and catalog data', () => {
    const merge = useShop.persist.getOptions().merge!;
    const next = merge(
      {
        cart: [{ key: 'bad', productId: 'x', variant: 'a', quantity: Infinity }],
        favorites: [42, 'valid'],
        theme: 'unknown',
        catalog: [{ ...initialCatalog[0], price: -1 }],
      },
      useShop.getState()
    );
    expect(next.cart).toEqual([]);
    expect(next.favorites).toEqual(['valid']);
    expect(next.theme).toBe('light');
    expect(next.catalog).toBeNull();
  });
  it('migrates saved prices once without losing cart, variants, custom fields or custom products', async () => {
    const product = initialCatalog.find((p) => p.id === 'yinhe-mercury-ii-458')!;
    const custom = { ...initialCatalog[0], id: 'custom-model', price: 555 };
    const saved = {
      cart: [
        { key: 'black', productId: product.id, variant: product.variants[0], quantity: 1 },
        { key: 'red', productId: product.id, variant: product.variants[2], quantity: 2 },
      ],
      favorites: [product.id],
      theme: 'dark',
      assembly: false,
      catalog: [
        { ...product, price: 1370, priceEstimated: true, description: 'Local edit' },
        custom,
      ],
    };
    const options = useShop.persist.getOptions();
    const migrated = options.merge!(await options.migrate!(saved, 1), useShop.getState());
    expect(migrated.cart).toEqual(saved.cart);
    expect(migrated.favorites).toEqual(saved.favorites);
    expect(migrated.theme).toBe('dark');
    expect(migrated.catalog![0]).toMatchObject({
      price: 329,
      priceEstimated: false,
      description: 'Local edit',
    });
    expect(migrated.catalog![1]).toEqual(custom);
    expect(cartTotal(migrated.cart, migrated.catalog!)).toBe(987);
    expect(saved.catalog[0].price).toBe(1370);
    const edited = { ...saved, catalog: [{ ...product, price: 350 }] };
    expect(await options.migrate!(edited, 3)).toBe(edited);
    expect(options.version).toBe(3);
  });
});
