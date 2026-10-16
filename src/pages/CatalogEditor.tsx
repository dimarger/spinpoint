import { useState } from 'react';
import { Download, Upload, Save, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCatalog, useShop } from '../stores/shop';
import { catalogSchema, wholesaleThresholds, type Product, type Category } from '../types/catalog';
import { initialCatalog } from '../data/catalog';
import { categoryLabels, statusLabels } from '../config/site';
import { Breadcrumbs } from '../components/Common';
import { ProductImage } from '../components/ProductArt';
import { downloadText } from '../utils/orders';
import { useMeta } from '../hooks/useMeta';
export default function CatalogEditor() {
  useMeta('Локальний редактор каталогу');
  const catalog = useCatalog();
  const setCatalog = useShop((s) => s.setCatalog);
  const [draft, setDraft] = useState<Product[]>(() => structuredClone(catalog));
  const [index, setIndex] = useState(0);
  const [error, setError] = useState('');
  const [json, setJson] = useState('');
  const p = draft[index];
  function update<K extends keyof Product>(key: K, value: Product[K]) {
    setDraft((d) => d.map((x, i) => (i === index ? { ...x, [key]: value } : x)));
    setError('');
  }
  function parse(raw: unknown) {
    const result = catalogSchema.safeParse(raw);
    if (!result.success) {
      setError(
        result.error.issues
          .map((x) => `${x.path.join('.')}: ${x.message}`)
          .slice(0, 6)
          .join('\n')
      );
      return null;
    }
    setError('');
    return result.data;
  }
  function apply() {
    const data = parse(draft);
    if (data) {
      setCatalog(data);
      toast.success('Каталог застосовано лише в цьому браузері. Для сайту експортуйте JSON.');
    }
  }
  return (
    <div className="container page">
      <Breadcrumbs items={[{ label: 'Локальний редактор' }]} />
      <div className="page-title">
        <span className="eyebrow blue-text">ІНСТРУМЕНТ ВЛАСНИКА</span>
        <h1>Редактор каталогу</h1>
        <p>Підготовка публічних даних, імпорт і експорт JSON.</p>
      </div>
      <div className="notice">
        <strong>Це локальний редактор, не серверна адмінпанель.</strong> Зміни бачить лише цей
        браузер. Для всіх відвідувачів потрібно експортувати дані, оновити файл каталогу в
        репозиторії та повторно розгорнути сайт. Не додавайте закупочні ціни, постачальників чи
        персональні дані.
      </div>
      <div className="editor-toolbar">
        <button className="button primary" onClick={apply}>
          <Save size={16} />
          Застосувати локально
        </button>
        <button
          className="button outline"
          onClick={() => {
            const data = parse(draft);
            if (data) downloadText(JSON.stringify(data, null, 2), 'catalog.json');
          }}
        >
          <Download size={16} />
          Експорт JSON
        </button>
        <label className="button outline upload-button">
          <Upload size={16} />
          Імпорт JSON
          <input
            type="file"
            accept=".json,application/json"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 5000000) {
                setError('Максимальний розмір — 5 МБ.');
                return;
              }
              try {
                const data = parse(JSON.parse(await file.text()));
                if (data) {
                  setDraft(data);
                  setIndex(0);
                  toast.success('Імпортовано в чернетку. Перевірте та застосуйте локально.');
                }
              } catch {
                setError('Файл не містить коректний JSON.');
              }
              e.target.value = '';
            }}
          />
        </label>
        <button
          className="button quiet"
          onClick={() => {
            if (window.confirm('Скинути локальний каталог і чернетку до початкових даних?')) {
              setCatalog(null);
              setDraft(structuredClone(initialCatalog));
              setIndex(0);
              setError('');
              toast.success('Відновлено початковий каталог');
            }
          }}
        >
          <RotateCcw size={16} />
          Відновити
        </button>
      </div>
      {error && (
        <pre className="error-box" role="alert">
          {error}
        </pre>
      )}
      <div className="editor-layout">
        <aside>
          <label>
            Товар
            <select
              size={Math.min(15, draft.length)}
              value={index}
              onChange={(e) => setIndex(Number(e.target.value))}
            >
              {draft.map((p, i) => (
                <option value={i} key={i}>
                  {p.brand} {p.name}
                </option>
              ))}
            </select>
          </label>
          <button
            className="button outline full-width"
            onClick={() => {
              const next: Product = {
                ...structuredClone(initialCatalog[0]),
                id: `new-${crypto.randomUUID().slice(0, 8)}`,
                name: 'Новий товар',
                brand: 'Вкажіть бренд',
                price: 0,
                wholesalePrices: {},
                status: 'preorder',
                leadTime: '20–30 днів',
                popular: false,
                isNew: false,
                image: '',
                specs: {},
                variants: ['Уточнити варіант'],
              };
              setDraft((d) => [...d, next]);
              setIndex(draft.length);
            }}
          >
            <Plus size={16} />
            Додати товар
          </button>
        </aside>
        <div>
          {p && (
            <>
              <div className="editor-product-preview">
                <ProductImage key={p.image + p.category} product={p} />
                <span>Попередній перегляд зображення</span>
              </div>
              <div className="form-grid">
                <label>
                  ID / URL
                  <input value={p.id} onChange={(e) => update('id', e.target.value)} />
                </label>
                <label>
                  Назва
                  <input value={p.name} onChange={(e) => update('name', e.target.value)} />
                </label>
                <label>
                  Бренд
                  <input value={p.brand} onChange={(e) => update('brand', e.target.value)} />
                </label>
                <label>
                  Роздрібна ціна, ₴
                  <input
                    type="number"
                    min="0"
                    max="1000000"
                    value={Number.isFinite(p.price) ? p.price : ''}
                    onChange={(e) => update('price', Number(e.target.value))}
                  />
                </label>
                {wholesaleThresholds.map((min) => (
                  <label key={min}>
                    Опт від {min} шт., ₴ / одиницю
                    <input
                      type="number"
                      min="0.01"
                      max="1000000"
                      step="0.01"
                      placeholder="Ціна за запитом"
                      value={p.wholesalePrices[min] ?? ''}
                      onChange={(e) =>
                        update('wholesalePrices', {
                          ...p.wholesalePrices,
                          [min]: e.target.value === '' ? null : e.target.valueAsNumber,
                        })
                      }
                    />
                    <small className="muted">
                      Порожнє поле — запит менеджеру. Ціну задайте після перевірки власних витрат.
                    </small>
                  </label>
                ))}
                <label>
                  Категорія
                  <select
                    value={p.category}
                    onChange={(e) => update('category', e.target.value as Category)}
                  >
                    {Object.entries(categoryLabels).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Статус
                  <select
                    value={p.status}
                    onChange={(e) => update('status', e.target.value as Product['status'])}
                  >
                    {Object.entries(statusLabels).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                  <small className="muted">
                    «В наявності» встановлюйте лише після підтвердження залишку.
                  </small>
                </label>
                <label>
                  Строк поставки
                  <input value={p.leadTime} onChange={(e) => update('leadTime', e.target.value)} />
                </label>
                <label>
                  Дата додавання
                  <input
                    type="date"
                    value={p.addedAt}
                    onChange={(e) => update('addedAt', e.target.value)}
                  />
                </label>
                <label className="span-two">
                  Зображення: HTTPS або images/filename.webp
                  <input
                    value={p.image}
                    onChange={(e) => update('image', e.target.value)}
                    placeholder="Порожньо — ілюстрація категорії"
                  />
                </label>
                <label className="span-two">
                  Додаткові фото — HTTPS або images/filename.webp, одне на рядок
                  <textarea
                    rows={3}
                    value={(p.gallery || []).join('\n')}
                    onChange={(e) => update('gallery', e.target.value.split('\n').filter(Boolean))}
                  />
                </label>
                {p.category === 'accessories' && (
                  <label>
                    Тип аксесуара
                    <select
                      value={p.accessoryType || 'other'}
                      onChange={(e) =>
                        update(
                          'accessoryType',
                          e.target.value as NonNullable<Product['accessoryType']>
                        )
                      }
                    >
                      <option value="other">Інший</option>
                      <option value="tape">Торцева стрічка — для конструктора</option>
                      <option value="glue">Клей</option>
                      <option value="film">Плівка</option>
                    </select>
                  </label>
                )}
                <label className="span-two">
                  Опис
                  <textarea
                    rows={4}
                    value={p.description}
                    onChange={(e) => update('description', e.target.value)}
                  />
                </label>
                <label className="span-two">
                  Варіанти — один на рядок
                  <textarea
                    rows={4}
                    value={p.variants.join('\n')}
                    onChange={(e) => update('variants', e.target.value.split('\n'))}
                  />
                </label>
                <label className="span-two">
                  Характеристики — Назва: значення
                  <textarea
                    rows={4}
                    key={p.id + JSON.stringify(p.specs)}
                    defaultValue={Object.entries(p.specs)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join('\n')}
                    onBlur={(e) =>
                      update(
                        'specs',
                        Object.fromEntries(
                          e.target.value
                            .split('\n')
                            .filter((x) => x.includes(':'))
                            .map((x) => {
                              const at = x.indexOf(':');
                              return [x.slice(0, at), x.slice(at + 1).trimStart()];
                            })
                        )
                      )
                    }
                  />
                </label>
              </div>
              <div className="button-row editor-checks">
                {(['demo', 'popular', 'isNew'] as const).map((key, i) => (
                  <label className="checkbox-label" key={key}>
                    <input
                      type="checkbox"
                      checked={p[key]}
                      onChange={(e) => update(key, e.target.checked)}
                    />
                    {['Тестові дані', 'Популярний', 'Новинка'][i]}
                  </label>
                ))}
              </div>
              <button
                className="button quiet danger"
                disabled={draft.length <= 1}
                onClick={() => {
                  if (window.confirm(`Видалити ${p.name} із чернетки?`)) {
                    setDraft((d) => d.filter((_, i) => i !== index));
                    setIndex(0);
                  }
                }}
              >
                <Trash2 size={16} />
                Видалити з чернетки
              </button>
            </>
          )}
        </div>
      </div>
      <details className="json-editor">
        <summary>Розширений імпорт JSON із тексту</summary>
        <label>
          Вставте масив товарів
          <textarea rows={10} value={json} onChange={(e) => setJson(e.target.value)} />
        </label>
        <button
          className="button outline"
          onClick={() => {
            try {
              const data = parse(JSON.parse(json));
              if (data) {
                setDraft(data);
                setIndex(0);
                toast.success('Дані завантажено в чернетку');
              }
            } catch {
              setError('Синтаксична помилка JSON.');
            }
          }}
        >
          Перевірити й імпортувати
        </button>
      </details>
    </div>
  );
}
