import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, LayoutGrid, List, X } from 'lucide-react';
import { useCatalog, useShop } from '../stores/shop';
import { filterCatalog } from '../utils/catalog';
import { categoryLabels } from '../config/site';
import { ProductCard, Breadcrumbs, EmptyState, DemoNotice } from '../components/Common';
import { useMeta } from '../hooks/useMeta';
export default function Catalog({ favorites = false }: { favorites?: boolean }) {
  const products = useCatalog();
  const ids = useShop((s) => s.favorites);
  const [params, setParams] = useSearchParams();
  const source = favorites ? products.filter((p) => ids.includes(p.id)) : products;
  const filtered = filterCatalog(source, params);
  useMeta(favorites ? 'Обране' : 'Каталог інвентарю');
  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }
  function multi(key: string, value: string) {
    const next = new URLSearchParams(params);
    const values = next.getAll(key);
    next.delete(key);
    (values.includes(value) ? values.filter((v) => v !== value) : [...values, value]).forEach((v) =>
      next.append(key, v)
    );
    setParams(next, { replace: true });
  }
  const filters = (
    <>
      <div className="filter-heading">
        <h3>Фільтри</h3>
        <button className="text-button" onClick={() => setParams({})}>
          Скинути
        </button>
      </div>
      <fieldset>
        <legend>Категорія</legend>
        {Object.entries(categoryLabels).map(([key, label]) => (
          <label className="checkbox-label" key={key}>
            <input
              type="checkbox"
              checked={params.getAll('category').includes(key)}
              onChange={() => multi('category', key)}
            />
            <span>{label}</span>
            <small>{source.filter((p) => p.category === key).length}</small>
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Ціна, ₴</legend>
        <div className="price-inputs">
          <input
            aria-label="Мінімальна ціна"
            type="number"
            min="0"
            max="1000000"
            placeholder="Від"
            value={params.get('min') || ''}
            onChange={(e) => update('min', e.target.value)}
          />
          <span>—</span>
          <input
            aria-label="Максимальна ціна"
            type="number"
            min="0"
            max="1000000"
            placeholder="До"
            value={params.get('max') || ''}
            onChange={(e) => update('max', e.target.value)}
          />
        </div>
      </fieldset>
      <fieldset>
        <legend>Бренд</legend>
        {[...new Set(source.map((p) => p.brand))].sort().map((brand) => (
          <label className="checkbox-label" key={brand}>
            <input
              type="checkbox"
              checked={params.getAll('brand').includes(brand)}
              onChange={() => multi('brand', brand)}
            />
            {brand}
          </label>
        ))}
      </fieldset>
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={params.has('new')}
          onChange={() => update('new', params.has('new') ? '' : '1')}
        />
        Тільки новинки
      </label>
      <div className="filter-help">
        <h4>Шукаєш свою ракетку?</h4>
        <p>Обери компоненти крок за кроком.</p>
        <Link className="text-link" to="/builder">
          До конструктора ↗
        </Link>
      </div>
    </>
  );
  return (
    <div className="container page">
      <Breadcrumbs items={[{ label: favorites ? 'Обране' : 'Каталог' }]} />
      <div className="page-title">
        <span className="eyebrow blue-text">ОБИРАЙ СВІЙ СТИЛЬ ГРИ</span>
        <h1>
          {favorites ? 'Твоє обране' : 'Каталог інвентарю'}
          <span className="title-count">{source.length}</span>
        </h1>
        <p>
          {favorites
            ? 'Зберігай цікаві моделі й повертайся до вибору.'
            : 'Від основи до останньої деталі. Знайди інвентар для своєї гри.'}
        </p>
      </div>
      <DemoNotice />
      {favorites && !source.length ? (
        <EmptyState
          title="Тут буде твій короткий список"
          text="Натискай сердечко на картках, щоб зберегти цікаві товари."
        />
      ) : (
        <div className="catalog-layout">
          <aside className="desktop-filters">{filters}</aside>
          <div className="catalog-results">
            <div className="catalog-toolbar">
              <div className="catalog-search">
                <Search size={19} />
                <input
                  aria-label="Пошук у каталозі"
                  placeholder="Назва або бренд"
                  value={params.get('q') || ''}
                  onChange={(e) => update('q', e.target.value)}
                />
                {params.get('q') && (
                  <button
                    className="icon-button"
                    aria-label="Очистити пошук"
                    onClick={() => update('q', '')}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <label className="sort-label">
                <span className="sr-only">Сортування</span>
                <select
                  value={params.get('sort') || 'popular'}
                  onChange={(e) => update('sort', e.target.value)}
                >
                  <option value="popular">За популярністю</option>
                  <option value="price-asc">Від дешевих до дорогих</option>
                  <option value="price-desc">Від дорогих до дешевих</option>
                  <option value="newest">За новизною</option>
                </select>
              </label>
              <div className="view-toggle">
                <button
                  aria-label="Сітка"
                  aria-pressed={params.get('view') !== 'list'}
                  onClick={() => update('view', '')}
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  aria-label="Список"
                  aria-pressed={params.get('view') === 'list'}
                  onClick={() => update('view', 'list')}
                >
                  <List size={19} />
                </button>
              </div>
            </div>
            <details className="mobile-filters">
              <summary>
                <SlidersHorizontal size={18} />
                Фільтри та категорії
              </summary>
              {filters}
            </details>
            <div className="results-count" aria-live="polite">
              Знайдено товарів: <strong>{filtered.length}</strong>
              {Array.from(params.keys()).some((k) => !['sort', 'view'].includes(k)) && (
                <button className="text-button" onClick={() => setParams({})}>
                  Скинути фільтри ×
                </button>
              )}
            </div>
            {filtered.length ? (
              <div
                className={`product-grid catalog-grid ${params.get('view') === 'list' ? 'list-view' : ''}`}
              >
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} list={params.get('view') === 'list'} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Нічого не знайдено"
                text="Спробуй іншу назву, ширший діапазон цін або скинь фільтри."
                to={favorites ? '/favorites' : '/catalog'}
                link="Скинути пошук"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
