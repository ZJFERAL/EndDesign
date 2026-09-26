import type { HTMLAttributes } from 'react';
import { cx } from '../lib/cx';

export type BadgeVariant =
  | 'default'
  | 'info'
  | 'success'
  | 'warn'
  | 'danger'
  | 'accent'
  | 'tier';

export type Tier = 1 | 2 | 3 | 4 | 5 | 6;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  /** variant="tier" 时生效，1–6。 */
  tier?: Tier;
}

const VARIANT: Record<Exclude<BadgeVariant, 'tier'>, string> = {
  default: 'border-border bg-surface-muted text-ink-muted',
  info: 'border-info-ink text-info-ink bg-info/12',
  success: 'border-success-ink text-success-ink bg-success/12',
  warn: 'border-warn-ink text-warn-ink bg-warn/12',
  danger: 'border-danger-ink text-danger-ink bg-danger/12',
  accent: 'border-accent-strong bg-accent text-accent-fg',
};

/**
 * 徽标。
 * tint 填充用语义原色，其中的文字与描边必须用 *-ink —— 原色在自身 12% tint 上
 * 亮色主题仅 1.92–4.01:1，低于 4.5:1（对齐 css/components.css:419-424）。
 * 分级徽标同样分叉：文字与描边用 --ef-tier-ink，tint 填充用 --ef-tier-color
 * （对齐 css/components.css:427-433）。
 * 等级通过 data-tier 属性传递，由 tailwind.css 的 [data-tier="N"] 规则同时
 * 产出 --ef-tier-color 与 --ef-tier-ink；不用内联样式（规格 §5.12）。
 */
export function Badge({ variant = 'default', tier, className, children, ...rest }: BadgeProps) {
  const isTier = variant === 'tier';
  return (
    <span
      {...(isTier && tier !== undefined ? { 'data-tier': String(tier) } : {})}
      className={cx(
        'inline-flex items-center gap-1 rounded-ef-sm border px-2 py-0.5',
        'font-mono text-[11px] leading-relaxed whitespace-nowrap tracking-wide',
        isTier
          ? 'border-[var(--ef-tier-ink,var(--ef-border))] text-[var(--ef-tier-ink,var(--ef-ink-muted))] bg-[color-mix(in_srgb,var(--ef-tier-color,transparent)_14%,transparent)]'
          : VARIANT[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
