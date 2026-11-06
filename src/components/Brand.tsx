import { useId } from 'react';
import { useApp } from '../context';

export function BrandMark({ size = 40 }: { size?: number }) {
  const gradientId = `brand-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <span
      className="relative grid shrink-0 place-items-center overflow-hidden rounded-[0.9rem] text-[#2A2016] shadow-[0_10px_26px_-12px_rgba(197,164,109,0.85),inset_0_1px_0_rgba(255,255,255,0.45)]"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg className="absolute inset-0 size-full" viewBox="0 0 48 48" fill="none">
        <defs>
          <linearGradient id={gradientId} x1="4" y1="2" x2="46" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E7D8C3" />
            <stop offset="0.55" stopColor="#C5A46D" />
            <stop offset="1" stopColor="#B77C55" />
          </linearGradient>
          <radialGradient id={`${gradientId}-glow`} cx="0.2" cy="0.1" r="0.9">
            <stop stopColor="#FFFFFF" stopOpacity="0.5" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="48" height="48" rx="14" fill={`url(#${gradientId})`} />
        <rect width="48" height="48" rx="14" fill={`url(#${gradientId}-glow)`} />
        <circle cx="38" cy="10" r="2.2" fill="#F4EBDD" />
      </svg>
      <span className="relative -mt-0.5 text-lg font-bold leading-none" style={{ fontSize: size * 0.46 }}>
        ع
      </span>
    </span>
  );
}

export function BrandLockup({ compact = false }: { compact?: boolean }) {
  const { t } = useApp();
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <BrandMark size={40} />
      <span className={`min-w-0 ${compact ? 'hidden min-[360px]:block' : 'block'}`}>
        <span className="block truncate text-[0.9rem] font-bold leading-tight text-[var(--text)]">
          {t.brand.name}
        </span>
        <span className="block truncate text-[0.6rem] font-medium uppercase tracking-[0.2em] text-[var(--faint)]">
          {t.brand.sub}
        </span>
      </span>
    </span>
  );
}
