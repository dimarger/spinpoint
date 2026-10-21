import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Heart,
  Sun,
  Moon,
  Menu,
  X,
  ArrowUpRight,
  ArrowRight,
  Send,
  ChevronDown,
} from 'lucide-react';
import { useShop } from '../stores/shop';
import { categoryLabels, siteConfig } from '../config/site';
import { CartLink } from './Common';
export function Logo() {
  return (
    <Link to="/" className="logo" aria-label={`${siteConfig.name} — Головна`}>
      <svg viewBox="0 0 42 42" aria-hidden="true">
        <g transform="rotate(35 21 21)" fill="currentColor">
          <ellipse cx="20" cy="16" rx="12" ry="14" />
          <rect x="17" y="28" width="6" height="13" rx="2" />
        </g>
        <circle cx="35" cy="6" r="5" fill="#204bf2" />
      </svg>
      <span>
        {siteConfig.name}
        <b>®</b>
      </span>
    </Link>
  );
}
function NavItems() {
  return (
    <>
      <NavLink to="/catalog">
        Каталог <ChevronDown size={13} />
      </NavLink>
      <Link to="/catalog?category=rackets">Готові ракетки</Link>
      <NavLink className="builder-link" to="/builder">
        Конструктор ракетки
      </NavLink>
      <NavLink to="/info/delivery">Доставка й оплата</NavLink>
      <NavLink to="/wholesale">Співпраця</NavLink>
      <NavLink to="/info/contacts">Контакти</NavLink>
    </>
  );
}
export default function Layout() {
  const theme = useShop((s) => s.theme);
  const toggleTheme = useShop((s) => s.toggleTheme);
  const favorites = useShop((s) => s.favorites.length);
  const localCatalog = useShop((s) => !!s.catalog);
  const [query, setQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const menu = useRef<HTMLDialogElement>(null);
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    menu.current?.close();
    main.current?.focus({ preventScroll: true });
  }, [location.pathname]);
  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
          main.current?.scrollIntoView({ block: 'start' });
        }}
      >
        Перейти до вмісту
      </a>
      <div className="topbar" role="complementary" aria-label="Інформація магазину">
        <span>Велика гра починається з правильного інвентарю.</span>
        <Link to="/info/preorder">
          Працюємо під замовлення <ArrowUpRight size={13} />
        </Link>
      </div>
      <header className="header">
        <div className="header-main container">
          <Logo />
          <form
            className="header-search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/catalog?q=${encodeURIComponent(query)}`);
            }}
          >
            <Search size={19} />
            <input
              aria-label="Пошук товарів"
              placeholder="Знайдіть свій наступний інвентар"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button aria-label="Шукати" type="submit">
              <ArrowRight size={18} />
            </button>
          </form>
          <div className="header-actions">
            <button
              className="icon-button"
              aria-label={theme === 'light' ? 'Увімкнути темну тему' : 'Увімкнути світлу тему'}
              onClick={toggleTheme}
            >
              {theme === 'light' ? <Moon size={21} /> : <Sun size={21} />}
            </button>
            <Link
              className="icon-button favorites-link"
              to="/favorites"
              aria-label={`Обране: ${favorites}`}
            >
              <Heart size={22} />
              {favorites > 0 && <span className="count">{favorites}</span>}
            </Link>
            <CartLink />
            <button
              className="icon-button mobile-menu-button"
              aria-label="Відкрити меню"
              onClick={() => menu.current?.showModal()}
            >
              <Menu />
            </button>
          </div>
        </div>
        <div className="nav-bar container">
          <nav aria-label="Основна навігація">
            <NavItems />
          </nav>
          <span className="nav-caption">
            <i /> Для тих, хто любить гру
          </span>
        </div>
      </header>
      <dialog ref={menu} className="mobile-menu">
        <div className="dialog-header">
          <Logo />
          <button
            className="icon-button"
            aria-label="Закрити меню"
            onClick={() => menu.current?.close()}
          >
            <X />
          </button>
        </div>
        <form
          className="mobile-search"
          onSubmit={(e) => {
            e.preventDefault();
            navigate(`/catalog?q=${encodeURIComponent(query)}`);
            menu.current?.close();
          }}
        >
          <input
            aria-label="Пошук у мобільному меню"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Назва або бренд"
          />
          <button className="icon-button" aria-label="Шукати">
            <Search />
          </button>
        </form>
        <nav onClick={() => menu.current?.close()}>
          <NavItems />
          <Link to="/favorites">Обране</Link>
        </nav>
      </dialog>
      {localCatalog && (
        <div className="local-banner">
          Локальна версія каталогу цього браузера. <Link to="/catalog-editor">Керувати</Link>
        </div>
      )}
      <main id="main" ref={main} tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <Logo />
            <p>
              {siteConfig.tagline}
              <br />
              Усе для наступного влучного удару.
            </p>
            <Link to="/info/contacts" className="text-link">
              Зв’язатися з нами <Send size={16} />
            </Link>
          </div>
          <div>
            <h3>Інвентар</h3>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <Link key={key} to={`/catalog?category=${key}`}>
                {label}
              </Link>
            ))}
          </div>
          <div>
            <h3>Покупцеві</h3>
            <Link to="/info/delivery">Доставка</Link>
            <Link to="/info/payment">Оплата</Link>
            <Link to="/info/preorder">Умови передзамовлення</Link>
            <Link to="/info/returns">Обмін і повернення</Link>
            <Link to="/info/privacy">Конфіденційність</Link>
          </div>
          <div>
            <h3>{siteConfig.name}</h3>
            <Link to="/builder">Конструктор ракетки</Link>
            <Link to="/wholesale">Співпраця для магазинів</Link>
            <Link to="/info/about">Про магазин</Link>
            <Link to="/info/contacts">Контакти</Link>
            <Link to="/catalog-editor">Локальний редактор каталогу</Link>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            © {new Date().getFullYear()} {siteConfig.name}
          </span>
          <span>Демонстраційна версія · Ціни потребують підтвердження</span>
          <span>З любов’ю до настільного тенісу ↗</span>
        </div>
      </footer>
    </>
  );
}
