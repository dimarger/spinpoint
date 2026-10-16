import { useEffect } from 'react';
import { siteConfig } from '../config/site';
export function useMeta(
  title: string,
  description = 'Інвентар для настільного тенісу. Оберіть свій комплект у SpinPoint. Демонстраційний каталог.'
) {
  useEffect(() => {
    document.title = `${title} — ${siteConfig.name}`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
  }, [title, description]);
}
