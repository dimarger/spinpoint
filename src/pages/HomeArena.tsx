import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowUpRight,
  ArrowRight,
  ChevronRight,
  Layers,
  MousePointer2,
  PackageCheck,
  MessagesSquare,
  Plus,
} from 'lucide-react';
import { useCatalog } from '../stores/shop';
import { ProductCard } from '../components/Common';
import { Reveal } from '../components/Reveal';
import { useMeta } from '../hooks/useMeta';

const choices = [
  {
    label: 'Починаю грати',
    title: 'Одразу до столу.',
    text: 'Готова ракетка: основу й накладки вже зібрано. Обери свій перший комплект без клею, ножиць і складних рішень.',
    to: '/catalog?category=rackets',
    link: 'Обрати готову ракетку',
    index: '01',
  },
  {
    label: 'Уже тренуюсь',
    title: 'Більше твого стилю.',
    text: 'Знайома основа, нове відчуття м’яча. Порівняй накладки за типом поверхні й обери губку під свій удар.',
    to: '/catalog?category=rubbers',
    link: 'Підібрати накладки',
    index: '02',
  },
  {
    label: 'Збираю своє',
    title: 'Кожна деталь — твоя.',
    text: 'Основа, дві накладки та торцева стрічка. Збери власну конфігурацію й побач ціну компонентів до розмови з менеджером.',
    to: '/builder',
    link: 'Відкрити конструктор',
    index: '03',
  },
];

export default function HomeArena() {
  const products = useCatalog();
  const reduced = useReducedMotion();
  const [level, setLevel] = useState(0);
  const pick = choices[level];
  const rackets = products.filter((p) => p.category === 'rackets');
  useMeta('Ракетки, накладки й основи для твоєї гри');
  return (
    <div className="arena-home">
      <section className="arena-hero">
        <div className="arena-hero-media">
          <img
            src={`${import.meta.env.BASE_URL}images/hero.webp`}
            alt="Ілюстративний студійний кадр ракетки та м’яча на тенісному столі"
            width="1536"
            height="1024"
            fetchPriority="high"
          />
          <span className="arena-photo-caption">Ілюстративний кадр</span>
        </div>
        <div className="arena-court-lines" aria-hidden="true" />
        <div className="container arena-hero-inner">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="arena-kicker">
              <span /> SPINPOINT / ДЛЯ ТИХ, ХТО ГРАЄ
            </div>
            <h1>
              ТВОЯ ГРА.
              <br />
              <span>ТВІЙ ХАРАКТЕР.</span>
            </h1>
            <p>
              Від першого накату до власного стилю.
              <br />
              Знайди інвентар, з яким хочеться грати.
            </p>
            <div className="arena-hero-actions">
              <Link className="button arena-lime" to="/catalog?category=rackets">
                Обрати ракетку <ArrowUpRight size={21} />
              </Link>
              <Link className="arena-hero-link" to="/catalog">
                Увесь інвентар <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
          <div className="arena-hero-bottom">
            <span>01 — 03 / ЗНАЙДИ СВОЄ</span>
            <a
              href="#choose"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById('choose')
                  ?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' });
              }}
            >
              Почнемо з твого рівня <span aria-hidden="true">↓</span>
            </a>
            <span className="arena-tiny">TABLE TENNIS. PERSONAL.</span>
          </div>
        </div>
      </section>

      <div className="arena-service-line">
        <div className="container">
          <span>
            <PackageCheck size={17} /> Товари під замовлення
          </span>
          <span>
            <MessagesSquare size={17} /> Підбір у діалозі
          </span>
          <span>
            <Layers size={17} /> Готові ракетки та власні збірки
          </span>
          <Link to="/info/preorder">
            Умови перед оплатою <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>

      <section className="container arena-section arena-selector" id="choose">
        <Reveal>
          <div className="arena-section-label">
            <span>01 / ПОЧНИ З СЕБЕ</span>
            <span>НЕ ПОТРІБНО ЗНАТИ ВСІ МОДЕЛІ</span>
          </div>
          <div className="arena-split-heading">
            <h2>
              Твій рівень.
              <br />
              <em>Твоя наступна ракетка.</em>
            </h2>
            <p>Обрати інвентар простіше, коли починаєш із того, як хочеш грати.</p>
          </div>
        </Reveal>
        <div className="arena-choose-grid">
          <div className="arena-level-tabs" role="tablist" aria-label="Твій досвід гри">
            {choices.map((c, i) => (
              <button
                role="tab"
                id={`level-${i}`}
                aria-selected={level === i}
                aria-controls="level-panel"
                tabIndex={level === i ? 0 : -1}
                onKeyDown={(e) => {
                  if (
                    e.key === 'ArrowRight' ||
                    e.key === 'ArrowDown' ||
                    e.key === 'ArrowLeft' ||
                    e.key === 'ArrowUp'
                  ) {
                    e.preventDefault();
                    const next = (i + (e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? 2 : 1)) % 3;
                    setLevel(next);
                    document.getElementById(`level-${next}`)?.focus();
                  }
                }}
                key={c.index}
                onClick={() => setLevel(i)}
              >
                <span>{c.index}</span>
                <strong>{c.label}</strong>
                <ChevronRight size={22} />
              </button>
            ))}
          </div>
          <div
            className="arena-choice-panel"
            role="tabpanel"
            aria-labelledby={`level-${level}`}
            id="level-panel"
          >
            <motion.div
              key={level}
              initial={reduced ? false : { opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
            >
              <span className="arena-choice-number" aria-hidden="true">
                {pick.index}
              </span>
              <span className="eyebrow">ПІДБІР ПІД ТВОЮ ГРУ</span>
              <h3>{pick.title}</h3>
              <p>{pick.text}</p>
              <Link className="text-link" to={pick.to}>
                {pick.link} <ArrowUpRight size={19} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {rackets.length > 0 && (
        <section className="arena-ready-band">
          <div className="container arena-section">
            <Reveal>
              <div className="arena-section-label">
                <span>02 / ГОТОВІ ДО ГРИ</span>
                <span>ЗІБРАНІ РАКЕТКИ</span>
              </div>
              <div className="arena-split-heading">
                <h2>
                  Менше вибору деталей.
                  <br />
                  <em>Більше часу на гру.</em>
                </h2>
                <Link className="text-link" to="/catalog?category=rackets">
                  Усі готові ракетки <ArrowUpRight size={19} />
                </Link>
              </div>
              <p className="arena-stock-note">
                Готова ракетка означає зібрану комплектацію. Постачання під замовлення — орієнтовно
                20–30 днів; ціну та версію погоджуємо до оплати.
              </p>
            </Reveal>
            <div className="arena-ready-grid">
              {rackets.slice(0, 3).map((p, i) => (
                <Reveal key={p.id} delay={i * 0.07}>
                  <div className="arena-ready-label">
                    <span>0{i + 1}</span>
                    <span>{p.summary}</span>
                  </div>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container arena-section">
        <Reveal>
          <div className="arena-section-label">
            <span>03 / КОМПОНЕНТИ ГРИ</span>
            <span>ЗБЕРИ ВЛАСНЕ ВІДЧУТТЯ М’ЯЧА</span>
          </div>
          <div className="arena-split-heading">
            <h2>
              Знайди свою
              <br />
              <em>точку обертання.</em>
            </h2>
            <Link className="text-link" to="/catalog">
              Весь каталог <ArrowUpRight size={19} />
            </Link>
          </div>
        </Reveal>
        <div className="arena-category-grid">
          {[
            {
              category: 'rubbers',
              label: 'Накладки',
              note: 'Контроль. Обертання. Твій удар.',
              image: products.find((p) => p.id === 'yinhe-mercury-ii-458')?.image,
            },
            {
              category: 'blades',
              label: 'Основи',
              note: 'Характер ракетки починається тут.',
              image: products.find((p) => p.id === 'sanwei-m8-811655')?.image,
            },
            {
              category: 'accessories',
              label: 'Деталі й догляд',
              note: 'Збережи відчуття нової збірки.',
              image: products.find((p) => p.category === 'cases')?.image,
            },
          ].map((c, i) => (
            <Reveal key={c.category} delay={i * 0.06}>
              <Link
                to={`/catalog?category=${c.category}`}
                className={`arena-category arena-category-${i}`}
              >
                <span className="arena-category-count">
                  0{i + 1} / {products.filter((p) => p.category === c.category).length} ПОЗИЦІЙ
                </span>
                {c.image && (
                  <img
                    src={`${import.meta.env.BASE_URL}${c.image}`}
                    alt={c.label}
                    width="320"
                    height="260"
                    loading="lazy"
                  />
                )}
                <div>
                  <h3>{c.label}</h3>
                  <ArrowUpRight size={25} />
                  <p>{c.note}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container arena-build-section">
        <Reveal className="arena-build-copy">
          <span className="arena-kicker">КОНСТРУКТОР SPINPOINT</span>
          <h2>
            НЕ ПРОСТО
            <br />
            РАКЕТКА.
            <br />
            <em>ТВОЯ ЗБІРКА.</em>
          </h2>
          <p>
            Обирай основу, накладку для форхенду й бекхенду. Деталі та ціна компонентів — в одному
            місці.
          </p>
          <Link className="button arena-lime" to="/builder">
            Зібрати свою <ArrowUpRight size={20} />
          </Link>
        </Reveal>
        <div className="arena-build-art">
          <div className="arena-build-orbit" aria-hidden="true" />
          <motion.div
            initial={reduced ? false : { y: 25, rotate: -8, opacity: 0 }}
            whileInView={{ y: 0, rotate: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {products
              .filter((p) => ['sanwei-m8-811655', 'yinhe-mercury-ii-458'].includes(p.id))
              .map((p, i) => (
                <img
                  key={p.id}
                  className={`arena-build-piece piece-${i}`}
                  src={`${import.meta.env.BASE_URL}${p.image}`}
                  alt={`${p.brand} ${p.name} — компонент збірки`}
                  loading="lazy"
                  width="320"
                  height="260"
                />
              ))}
            <span className="arena-build-plus">
              <Plus size={33} />
            </span>
          </motion.div>
          <span className="arena-build-caption">ОСНОВА + ДВІ НАКЛАДКИ + ТВОЄ ВІДЧУТТЯ</span>
        </div>
      </section>

      <section className="container arena-section">
        <Reveal>
          <div className="arena-section-label">
            <span>ПРИДИВИСЬ ДО ДЕТАЛЕЙ</span>
            <span>БЮДЖЕТНІ КОМПОНЕНТИ</span>
          </div>
          <div className="arena-split-heading">
            <h2>
              Маленькі зміни.
              <br />
              <em>Інша гра.</em>
            </h2>
            <Link className="text-link" to="/catalog?category=rubbers">
              Порівняти накладки <ArrowUpRight size={19} />
            </Link>
          </div>
        </Reveal>
        <div className="product-grid">
          {products
            .filter((p) => p.category === 'rubbers' && p.popular)
            .slice(0, 4)
            .map((p, i) => (
              <Reveal key={p.id} delay={i * 0.04}>
                <ProductCard product={p} />
              </Reveal>
            ))}
        </div>
      </section>

      <section className="arena-how">
        <div className="container arena-section">
          <Reveal>
            <div className="arena-section-label">
              <span>ПРОСТО. ВІД ВИБОРУ ДО ГРИ.</span>
            </div>
            <h2>
              Три кроки
              <br />
              <em>до твого комплекту.</em>
            </h2>
          </Reveal>
          <div className="arena-how-grid">
            {[
              {
                icon: MousePointer2,
                title: 'Обери своє',
                text: 'Готову ракетку або компоненти. В описі — призначення, комплектація й важливі відмінності.',
              },
              {
                icon: MessagesSquare,
                title: 'Узгодь деталі',
                text: 'Менеджер підтвердить варіант, ціну й строк постачання до оплати.',
              },
              {
                icon: PackageCheck,
                title: 'Отримай і грай',
                text: 'Погодь доставку Україною. Перевір комплект при отриманні та починай тренування.',
              },
            ].map((s, i) => (
              <Reveal key={s.title} delay={i * 0.06}>
                <span className="arena-step-index">
                  0{i + 1}
                  <s.icon size={27} strokeWidth={1.3} />
                </span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container arena-section arena-faq">
        <Reveal>
          <span className="arena-section-label">Є ЗАПИТАННЯ?</span>
          <h2>
            Розберемося.
            <br />
            <em>І знайдемо твоє.</em>
          </h2>
          <Link className="text-link" to="/info/contacts">
            Обговорити вибір <ArrowUpRight size={18} />
          </Link>
        </Reveal>
        <div className="faq-list">
          {[
            [
              'Що обрати для першої ракетки?',
              'Почни з готової ракетки або контрольованої збірки. Розкажи менеджеру, як часто граєш і яким інвентарем користувався: назва бренду не замінює підбір під твою техніку.',
            ],
            [
              'Готова ракетка вже є на складі?',
              '«Готова» означає, що основу й накладки вже зібрано. Статус постачання вказаний окремо: зараз готові моделі доступні під замовлення після підтвердження комплектації.',
            ],
            [
              'Скільки чекати на замовлення?',
              'Орієнтир для товарів під замовлення — 20–30 днів. Менеджер підтверджує остаточний строк і умови перед оплатою; доставка перевізником Україною — окремий етап.',
            ],
            [
              'Чому накладки й основи продаються окремо?',
              'Збірна ракетка складається з основи та двох накладок. Так можна підібрати різні поверхні для двох сторін або згодом замінити зношену накладку.',
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <span>+</span>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="container arena-final">
        <span className="arena-kicker">ТВІЙ НАСТУПНИЙ ВИХІД ДО СТОЛУ</span>
        <h2>
          ГРА ПОЧИНАЄТЬСЯ
          <br />
          <em>З ТВОГО ВИБОРУ.</em>
        </h2>
        <Link className="button arena-lime" to="/catalog?category=rackets">
          Знайти свою ракетку <ArrowUpRight size={22} />
        </Link>
        <span className="arena-final-mark" aria-hidden="true">
          SP.
        </span>
      </section>
    </div>
  );
}
