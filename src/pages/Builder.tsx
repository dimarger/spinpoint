import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Plus, ShoppingBag, Info, X } from 'lucide-react';
import { toast } from 'sonner';
import { useCatalog, useShop } from '../stores/shop';
import { ProductImage, ProductArt } from '../components/ProductArt';
import { Breadcrumbs, DemoNotice, EmptyState } from '../components/Common';
import { assemblyFee } from '../utils/orders';
import { money } from '../utils/catalog';
import { useMeta } from '../hooks/useMeta';
const steps = ['Основа', 'Чорна накладка', 'Червона накладка', 'Деталі', 'Твоя збірка'];
export default function Builder() {
  const products = useCatalog();
  const addBuild = useShop((s) => s.addBuild);
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<(string | null)[]>([null, null, null, null]);
  const [variants, setVariants] = useState<string[]>(['', '', '', '']);
  const [assembly, setAssembly] = useState(true);
  useMeta('Конструктор ракетки');
  const chosen = selected.map((id) => products.find((p) => p.id === id));
  const subtotal = chosen.reduce((s, p) => s + (p?.price || 0), 0);
  const total = subtotal + (assembly ? assemblyFee(subtotal) : 0);
  const valid = chosen
    .slice(0, 3)
    .every((p, i) => !!p && p.status !== 'unavailable' && p.variants.includes(variants[i]));
  const options = products.filter(
    (p) =>
      p.status !== 'unavailable' &&
      (step === 0
        ? p.category === 'blades'
        : step === 1 || step === 2
          ? p.category === 'rubbers' &&
            p.variants.some((v) => v.startsWith(step === 1 ? 'Чорний' : 'Червоний'))
          : p.category === 'accessories' &&
            (p.accessoryType === 'tape' || p.id.includes('edge-tape')))
  );
  function goTo(next: number) {
    setStep(next);
    requestAnimationFrame(() =>
      document
        .getElementById('builder-selection')
        ?.scrollIntoView({ block: 'start', behavior: 'instant' })
    );
  }
  function choose(id: string) {
    const p = products.find((p) => p.id === id)!;
    setSelected((s) => s.map((v, i) => (i === step ? id : v)));
    setVariants((s) =>
      s.map((v, i) =>
        i === step
          ? p.variants.find((v) =>
              step === 1 ? v.startsWith('Чорний') : step === 2 ? v.startsWith('Червоний') : true
            ) || p.variants[0]
          : v
      )
    );
  }
  function add() {
    if (!valid) {
      toast.error('Перевірте три основні компоненти й варіанти.');
      return;
    }
    const group = crypto.randomUUID();
    addBuild(
      chosen.flatMap((p, i) =>
        p ? [{ productId: p.id, variant: variants[i], quantity: 1, group }] : []
      ),
      assembly
    );
    toast.success('Усі компоненти додано до кошика');
    navigate('/cart');
  }
  if (
    !products.some((p) => p.category === 'blades') ||
    !products.some((p) => p.category === 'rubbers')
  )
    return (
      <EmptyState
        title="Для конструктора бракує компонентів"
        text="Додай основи та накладки у каталог через локальний редактор."
        to="/catalog-editor"
        link="Відкрити редактор"
      />
    );
  return (
    <div className="container page">
      <Breadcrumbs items={[{ label: 'Конструктор ракетки' }]} />
      <div className="page-title">
        <span className="eyebrow blue-text">ТВОЯ ГРА ПОЧИНАЄТЬСЯ ТУТ</span>
        <h1>
          Збери свою ракетку<span className="blue-text">.</span>
        </h1>
        <p>Основа, дві накладки й деталі — комплект, який обираєш ти.</p>
      </div>
      <DemoNotice />
      <nav className="builder-steps" aria-label="Кроки конструктора">
        {steps.map((label, i) => (
          <button
            key={label}
            className={i === step ? 'active' : i < step ? 'complete' : ''}
            aria-current={i === step ? 'step' : undefined}
            onClick={() => goTo(i)}
          >
            <span>{i < step ? <Check size={15} /> : String(i + 1).padStart(2, '0')}</span>
            {label}
          </button>
        ))}
      </nav>
      <div className="builder-layout" id="builder-selection">
        <div className="builder-main">
          <div className="section-heading">
            <h2>
              {step === 4
                ? 'Твій комплект готовий'
                : `Обери ${['основу', 'чорну накладку', 'червону накладку', 'додаткові деталі'][step]}`}
            </h2>
            <span className="muted">Крок {step + 1} / 5</span>
          </div>
          {step < 4 ? (
            <>
              <div className="builder-options">
                {options.map((p) => (
                  <button
                    key={p.id}
                    className={`builder-option ${selected[step] === p.id ? 'selected' : ''}`}
                    onClick={() => choose(p.id)}
                    aria-pressed={selected[step] === p.id}
                  >
                    <div>
                      <ProductImage product={p} color={step === 1 ? 'black' : 'red'} />
                      {selected[step] === p.id && (
                        <span className="selection-check">
                          <Check size={15} />
                        </span>
                      )}
                    </div>
                    <span className="eyebrow muted">{p.brand}</span>
                    <h3>{p.name}</h3>
                    <strong>{money(p.price)}</strong>
                    <small>
                      {p.demo ? 'Тестова ціна' : p.priceEstimated ? 'Орієнтовна ціна' : ''}
                    </small>
                  </button>
                ))}
              </div>
              {step === 3 && (
                <>
                  <button
                    className="text-button"
                    onClick={() => {
                      setSelected((s) => s.map((x, i) => (i === 3 ? null : x)));
                      setVariants((s) => s.map((x, i) => (i === 3 ? '' : x)));
                    }}
                  >
                    Без торцевої стрічки <X size={14} />
                  </button>
                  <label className="assembly-choice">
                    <input
                      type="checkbox"
                      checked={assembly}
                      onChange={(e) => setAssembly(e.target.checked)}
                    />
                    <div>
                      <strong>Додати послугу збірки</strong>
                      <p>Тестова пропозиція. Остаточний обсяг робіт підтвердить менеджер.</p>
                    </div>
                    <strong>
                      {assemblyFee(subtotal) ? money(assemblyFee(subtotal)) : 'Безкоштовно'}
                    </strong>
                  </label>
                </>
              )}
              {chosen[step] && (
                <label className="field-label variant-builder">
                  Варіант компонента
                  <select
                    value={variants[step]}
                    onChange={(e) =>
                      setVariants((v) => v.map((x, i) => (i === step ? e.target.value : x)))
                    }
                  >
                    {chosen[step]!.variants.filter((v) =>
                      step === 1
                        ? v.startsWith('Чорний')
                        : step === 2
                          ? v.startsWith('Червоний')
                          : true
                    ).map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
              )}
              <div className="builder-navigation">
                <button
                  className="button quiet"
                  disabled={step === 0}
                  onClick={() => goTo(step - 1)}
                >
                  <ArrowLeft size={17} />
                  Назад
                </button>
                <button
                  className="button primary"
                  disabled={step < 3 && !chosen[step]}
                  onClick={() => goTo(step + 1)}
                >
                  Далі <ArrowRight size={17} />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="build-final-art">
                <ProductArt category="rackets" color="black" />
                <span>Умовна ілюстрація зібраної ракетки</span>
              </div>
              {!valid && (
                <div className="notice">
                  Потрібно обрати основу, чорну й червону накладки та доступні варіанти. Поверніться
                  до відповідних кроків.
                </div>
              )}
              <button className="button primary" disabled={!valid} onClick={add}>
                <ShoppingBag size={18} />
                Додати всю збірку до кошика
              </button>
            </>
          )}
          <div className="compatibility">
            <Info size={20} />
            <div>
              <strong>Попередня перевірка комплекту</strong>
              <p>
                {valid
                  ? 'Обрано основу й дві накладки різних кольорів.'
                  : 'Для комплекту потрібні основа, чорна та червона накладки.'}{' '}
                Розміри лопаті, площа накладок та інші технічні параметри ще не підтверджені.
                Менеджер має перевірити можливість збірки; автоматичної професійної оцінки немає.
              </p>
            </div>
          </div>
        </div>
        <aside className="build-summary">
          <span className="eyebrow">ТВОЯ КОНФІГУРАЦІЯ</span>
          <h2>Баланс у деталях</h2>
          {steps.slice(0, 4).map((label, i) => (
            <button className="build-summary-item" key={label} onClick={() => goTo(i)}>
              {chosen[i] ? (
                <ProductImage product={chosen[i]!} color={i === 1 ? 'black' : 'red'} />
              ) : (
                <span className="component-placeholder">
                  <Plus size={22} />
                </span>
              )}
              <span>
                <small>{label}</small>
                <strong>
                  {chosen[i] ? `${chosen[i]!.brand} ${chosen[i]!.name}` : 'Обрати компонент'}
                </strong>
                <small>{variants[i]}</small>
              </span>
              {chosen[i] && <span>{money(chosen[i]!.price)}</span>}
            </button>
          ))}
          <div className="summary-line">
            <span>Послуга збірки</span>
            <strong>{assembly ? money(assemblyFee(subtotal)) : 'Без збірки'}</strong>
          </div>
          <div className="summary-total">
            <span>Орієнтовно</span>
            <strong>{money(total)}</strong>
          </div>
          <small className="muted">
            Роздрібні ціни наведені в гривнях. Доступність кольорів, товщин і комплектацію
            підтверджує менеджер.
          </small>
          <Link className="text-link" to="/info/preorder">
            Як працює передзамовлення ↗
          </Link>
        </aside>
      </div>
    </div>
  );
}
