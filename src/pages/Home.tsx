import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  SlidersHorizontal,
  Layers,
  PackageCheck,
  MessagesSquare,
  Truck,
  ShieldCheck,
  Wrench,
  MoveUpRight,
  Check,
} from 'lucide-react';
import { useCatalog } from '../stores/shop';
import { categoryLabels, siteConfig } from '../config/site';
import { ProductArt } from '../components/ProductArt';
import { ProductCard, SectionTitle, DemoNotice } from '../components/Common';
import type { Category } from '../types/catalog';
import { useMeta } from '../hooks/useMeta';
export default function Home() {
  const products = useCatalog();
  const reduced = useReducedMotion();
  useMeta(siteConfig.tagline);
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <span className="hero-kicker">
              <span /> БІЛЬШЕ КОНТРОЛЮ. БІЛЬШЕ ГРИ.
            </span>
            <h1>
              Професійний
              <br />
              інвентар для
              <br />{' '}
              <span>
                настільного
                <br className="desktop-break" /> тенісу.
              </span>
            </h1>
            <p>
              Накладки, основи, ракетки та аксесуари для твоєї гри. Великий вибір товарів під
              замовлення.
            </p>
            <div className="button-row">
              <Link className="button white" to="/catalog">
                Переглянути каталог <ArrowUpRight size={19} />
              </Link>
              <Link className="hero-secondary" to="/builder">
                Зібрати ракетку <ArrowRight size={18} />
              </Link>
            </div>
            <div className="hero-note">
              <span className="tiny-line" /> Точний вибір для твого стилю гри
            </div>
          </motion.div>
        </div>
        <div className="hero-image">
          <img
            src={`${import.meta.env.BASE_URL}images/hero.webp`}
            alt="Ілюстративний студійний знімок ракетки й м’яча на синьому столі"
            width="1536"
            height="1024"
            fetchPriority="high"
          />
          <span className="hero-index">01 / THE GAME STARTS HERE</span>
          <span className="image-caption">Ілюстративне зображення</span>
          <div className="hero-image-tag">
            <span>ЗНАЙДИ СВІЙ БАЛАНС</span>
            <ArrowUpRight size={22} />
          </div>
        </div>
      </section>
      <div className="container service-strip">
        <div>
          <PackageCheck />
          <span>
            Інвентар під замовлення<small>Вибір без обмежень складу</small>
          </span>
        </div>
        <div>
          <MessagesSquare />
          <span>
            Особистий контакт<small>Узгодження з менеджером</small>
          </span>
        </div>
        <div>
          <Wrench />
          <span>
            Твоя власна збірка<small>Основа + дві накладки</small>
          </span>
        </div>
        <div>
          <ShieldCheck />
          <span>
            Прозорі умови<small>Підтвердження перед оплатою</small>
          </span>
        </div>
      </div>
      <section className="container section categories-section">
        <SectionTitle
          eyebrow="ЗНАЙДИ СВОЄ"
          title="Усе для твоєї гри"
          to="/catalog"
          link="Увесь каталог"
        />
        <div className="category-grid">
          {(Object.entries(categoryLabels) as [Category, string][]).map(([id, label], i) => (
            <Link key={id} to={`/catalog?category=${id}`} className="category-tile">
              <span className="category-number">0{i + 1}</span>
              <ProductArt category={id} />
              <div>
                <h3>{label}</h3>
                <ArrowUpRight size={18} />
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="container section">
        <SectionTitle eyebrow="ВАРТО ПРИДИВИТИСЯ" title="Популярний інвентар" to="/catalog" />
        <DemoNotice />
        <div className="product-grid">
          {products
            .filter((p) => p.popular)
            .slice(0, 4)
            .map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
        </div>
      </section>
      <section className="container builder-promo">
        <div className="builder-art">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <ProductArt category="rubbers" color="black" className="floating-rubber black-rubber" />
          <ProductArt category="blades" className="floating-blade" />
          <ProductArt category="rubbers" className="floating-rubber red-rubber" />
          <span>КОНСТРУКТОР / 01—05</span>
        </div>
        <div className="builder-promo-copy">
          <span className="eyebrow blue-text">ТВОЯ РАКЕТКА. ТВОЇ ПРАВИЛА.</span>
          <h2>
            Збери ракетку,
            <br />
            яка грає <em>по-твоєму.</em>
          </h2>
          <p>
            Обери основу, дві накладки та деталі. Побач загальну вартість ще до розмови з
            менеджером.
          </p>
          <div className="builder-features">
            <span>
              <Check size={16} /> Усі компоненти в одному місці
            </span>
            <span>
              <Check size={16} /> Перевірка деталей з менеджером
            </span>
          </div>
          <Link className="button primary" to="/builder">
            До конструктора <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <section className="container section">
        <SectionTitle
          eyebrow="НОВЕ У КАТАЛОЗІ"
          title="Знайомся з новинками"
          to="/catalog?new=1&sort=newest"
        />
        <div className="product-grid">
          {products
            .filter((p) => p.isNew)
            .slice(0, 4)
            .map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
        </div>
      </section>
      <section className="container offer-band">
        <div>
          <span className="eyebrow">ВИГІДНА ПРОПОЗИЦІЯ · ТЕСТОВІ УМОВИ</span>
          <h2>
            Вдалий комплект.
            <br />
            Приємний бонус.
          </h2>
          <p>{siteConfig.assembly.label}. Актуальні умови акції підтверджує менеджер.</p>
        </div>
        <Link className="button white" to="/builder">
          Зібрати комплект <ArrowUpRight size={19} />
        </Link>
      </section>
      <section className="container section">
        <SectionTitle eyebrow="ПРОСТО Й ЗРОЗУМІЛО" title="Від вибору — до першого удару" />
        <div className="steps-grid">
          {[
            {
              icon: SlidersHorizontal,
              title: 'Обирай інвентар',
              text: 'Знайди своє у каталозі або збери ракетку в конструкторі.',
            },
            {
              icon: MessagesSquare,
              title: 'Обговори деталі',
              text: 'Передай список менеджеру. Уточни ціну, наявність і строки.',
            },
            {
              icon: Truck,
              title: 'Узгодь доставку',
              text: 'Погодь спосіб доставки та умови оплати перед замовленням.',
            },
          ].map((s, i) => (
            <div key={s.title}>
              <div className="step-top">
                <s.icon size={27} strokeWidth={1.4} />
                <span>0{i + 1}</span>
              </div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="about-band">
        <div className="container about-inner">
          <span className="eyebrow">{siteConfig.name.toUpperCase()} / ПРО МАГАЗИН</span>
          <h2>
            Ми за гру,
            <br />в якій <span>важливі деталі.</span>
          </h2>
          <div>
            <p>
              Від першої власної ракетки до наступного турніру. Збираємо в одному каталозі інвентар,
              щоб було легше порівнювати, обирати й ставити правильні запитання.
            </p>
            <p>
              Працюємо за моделлю передзамовлення: спочатку підтверджуємо деталі, потім узгоджуємо
              покупку.
            </p>
            <Link className="text-link" to="/info/about">
              Більше про {siteConfig.name} <MoveUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>
      <section className="container section faq-section">
        <div>
          <span className="eyebrow blue-text">Є ЗАПИТАННЯ?</span>
          <h2>
            Допоможемо
            <br />
            розібратися.
          </h2>
          <Link className="text-link" to="/info/contacts">
            Зв’язатися з менеджером <ArrowUpRight size={18} />
          </Link>
          <Layers className="faq-symbol" size={80} strokeWidth={0.7} />
        </div>
        <div className="faq-list">
          {[
            [
              'Як працює замовлення?',
              'Ви обираєте інвентар і формуєте повідомлення. Після самостійного надсилання менеджер має підтвердити ціну, наявність, строки та умови. До підтвердження замовлення не прийняте.',
            ],
            [
              'Чи всі товари є в наявності?',
              'Працюємо під замовлення. Наявність конкретного кольору, товщини та рукоятки підтверджуємо перед оплатою.',
            ],
            [
              'Чи можна зібрати ракетку?',
              'Так. У конструкторі можна обрати основу, чорну й червону накладки, варіанти та торцеву стрічку. Розміри й придатність компонентів перевіряє менеджер.',
            ],
            [
              'Як оплатити й отримати замовлення?',
              'Спосіб оплати, передоплату, перевізника й терміни потрібно погодити з менеджером. Автоматичної оплати карткою на сайті немає.',
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
      <section className="container contact-band">
        <div>
          <span className="eyebrow">ТВІЙ НАСТУПНИЙ КРОК</span>
          <h2>Почнемо з правильної ракетки?</h2>
        </div>
        <Link className="button primary" to="/info/contacts">
          Обговорити вибір <ArrowUpRight size={19} />
        </Link>
      </section>
    </>
  );
}
