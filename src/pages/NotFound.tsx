import { EmptyState } from '../components/Common';
import { useMeta } from '../hooks/useMeta';
export default function NotFound() {
  useMeta('404 — Сторінка не знайдена');
  return (
    <div className="container page">
      <h1 className="sr-only">Сторінка не знайдена</h1>
      <span className="eyebrow blue-text">404 / ПОЗА СТОЛОМ</span>
      <EmptyState
        title="Цей м’яч полетів за межі"
        text="Такої сторінки немає. Повернися до гри — у каталозі є що обрати."
      />
    </div>
  );
}
