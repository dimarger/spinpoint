import { useId, useState } from 'react';
import { categoryLabels } from '../config/site';
import type { Product, Category } from '../types/catalog';
export function ProductArt({
  category = 'rubbers',
  color = 'red',
  className = '',
}: {
  category?: Category;
  color?: string;
  className?: string;
}) {
  const id = useId().replace(/:/g, '');
  const black = color === 'black';
  return (
    <svg
      className={`product-art ${className}`}
      viewBox="0 0 320 260"
      role="img"
      aria-label={`Схематична ілюстрація категорії ${categoryLabels[category]}`}
    >
      <defs>
        <linearGradient id={`rubber${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={black ? '#3a3c40' : '#ef403c'} />
          <stop offset="1" stopColor={black ? '#111216' : '#9c1724'} />
        </linearGradient>
        <linearGradient id={`wood${id}`}>
          <stop stopColor="#e7c897" />
          <stop offset=".5" stopColor="#f5e0b8" />
          <stop offset="1" stopColor="#bb8d52" />
        </linearGradient>
        <filter id={`shadow${id}`}>
          <feDropShadow dx="0" dy="13" stdDeviation="10" floodOpacity=".14" />
        </filter>
        <pattern id={`grain${id}`} width="6" height="7" patternUnits="userSpaceOnUse">
          <path d="M0 2h6M0 5h6" stroke="#7e562d" strokeOpacity=".12" />
        </pattern>
      </defs>
      <ellipse cx="161" cy="226" rx="85" ry="9" fill="#15213c" opacity=".07" />
      <g filter={`url(#shadow${id})`}>
        {category === 'rubbers' && (
          <g transform="rotate(-12 160 130)">
            <rect x="81" y="35" width="158" height="183" rx="9" fill="#601520" />
            <rect x="76" y="29" width="158" height="183" rx="9" fill={`url(#rubber${id})`} />
            <path d="M88 194h133" stroke="white" opacity=".18" />
            <text x="92" y="186" fontSize="10" fill="white" opacity=".5" letterSpacing="2">
              TABLE TENNIS
            </text>
            <path d="M92 45h125" stroke="white" opacity=".08" />
          </g>
        )}
        {(category === 'blades' || category === 'rackets') && (
          <g transform="rotate(28 160 130)">
            <path d="M144 157h32l6 78q-22 9-44 0z" fill="#795637" />
            <path d="M149 163h22l4 69h-30z" fill="#c5a06c" />
            <path d="M157 166h6v67h-6z" fill="#25394f" />
            <ellipse cx="160" cy="99" rx="68" ry="82" fill="#9c7044" />
            <ellipse
              cx="160"
              cy="96"
              rx="68"
              ry="82"
              fill={category === 'rackets' ? `url(#rubber${id})` : `url(#wood${id})`}
            />
            {category === 'blades' && (
              <ellipse cx="160" cy="96" rx="68" ry="82" fill={`url(#grain${id})`} />
            )}
            <circle
              cx="160"
              cy="125"
              r="14"
              stroke={category === 'rackets' ? '#ffffff44' : '#826443'}
              fill="none"
            />
            <path
              d="m153 125 5 5 9-10"
              stroke={category === 'rackets' ? '#ffffff44' : '#826443'}
              fill="none"
            />
          </g>
        )}
        {category === 'balls' && (
          <>
            <circle cx="125" cy="146" r="48" fill="#f7f8f8" stroke="#dfe2e6" />
            <circle cx="204" cy="152" r="46" fill="#fff" stroke="#dfe2e6" />
            <circle cx="164" cy="91" r="47" fill="#fff" stroke="#e3e5e8" />
            <text x="150" y="98" fill="#9ca5b3" fontSize="11">
              40+
            </text>
            <path d="M126 72q-7 26 0 40" fill="none" stroke="#eee" />
          </>
        )}
        {category === 'cleaners' && (
          <>
            <rect x="129" y="26" width="62" height="30" rx="8" fill="#232a34" />
            <path d="M128 53h64l16 35v119q-48 17-96 0V88z" fill="#f3f4f4" stroke="#dadfe6" />
            <path d="M114 107h92v73h-92z" fill="#224fef" />
            <path d="m150 124 22 18-22 20" stroke="white" strokeWidth="4" fill="none" />
            <text x="138" y="194" fill="#8993a0" fontSize="10">
              CLEANER
            </text>
          </>
        )}
        {category === 'cases' && (
          <g transform="rotate(-14 160 130)">
            <rect x="63" y="62" width="195" height="144" rx="57" fill="#252a32" />
            <rect x="69" y="68" width="183" height="132" rx="53" fill="#303641" stroke="#57616f" />
            <path d="M93 88q68-21 134 0" fill="none" stroke="#7890b7" strokeWidth="3" />
            <path d="M132 66v-13q28-20 55 0v13" fill="none" stroke="#303641" strokeWidth="12" />
            <path d="m147 126 20 13-20 15" fill="none" stroke="#aab7cd" strokeWidth="4" />
          </g>
        )}
        {category === 'accessories' && (
          <>
            <ellipse cx="162" cy="145" rx="73" ry="58" fill="#172031" />
            <ellipse cx="162" cy="133" rx="73" ry="58" fill="#32435b" />
            <ellipse cx="162" cy="133" rx="48" ry="36" fill="#d6b993" />
            <ellipse cx="162" cy="133" rx="39" ry="28" fill="#f0f2f6" />
            <path d="M223 158q-7 38 36 55" stroke="#263b62" strokeWidth="15" fill="none" />
            <path d="m104 165 12 4m5-50 8-4m63-21 9 4" stroke="#86a9e0" strokeWidth="3" />
          </>
        )}
      </g>
    </svg>
  );
}
export function ProductImage({
  product,
  color,
  className = '',
}: {
  product: Product;
  color?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  return product.image && !failed ? (
    <img
      className={`product-photo ${className}`}
      src={
        product.image.startsWith('https:')
          ? product.image
          : `${import.meta.env.BASE_URL}${product.image}`
      }
      alt={`${product.brand} ${product.name}`}
      loading="lazy"
      width="320"
      height="260"
      onError={() => setFailed(true)}
    />
  ) : (
    <ProductArt
      category={product.category}
      color={
        color ||
        (product.category === 'rubbers' && product.id.includes('hurricane') ? 'black' : 'red')
      }
      className={className}
    />
  );
}
