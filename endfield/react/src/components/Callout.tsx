import type { HTMLAttributes } from 'react';
import { cx } from '../lib/cx';

export type CalloutVariant = 'info' | 'warn' | 'danger' | 'success';

export interface CalloutProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CalloutVariant;
  title?: string;
}

/* 每个变体同时给出原色与 ink 色（对齐 css/components.css:1014-1041）：
   7% tint 背景用原色，3px 左边框与标题文字必须用 ink ——
   原色做文字在其自身 tint 上亮色主题仅 2.00–4.34:1。 */
const VARIANT: Record<CalloutVariant, string> = {
  info: '[--ef-callout-color:var(--ef-info)] [--ef-callout-ink:var(--ef-info-ink)]',
  warn: '[--ef-callout-color:var(--ef-warn)] [--ef-callout-ink:var(--ef-warn-ink)]',
  danger: '[--ef-callout-color:var(--ef-danger)] [--ef-callout-ink:var(--ef-danger-ink)]',
  success: '[--ef-callout-color:var(--ef-success)] [--ef-callout-ink:var(--ef-success-ink)]',
};

export function Callout({
  variant = 'info',
  title,
  className,
  children,
  ...rest
}: CalloutProps) {
  return (
    <div
      className={cx(
        'my-4 flex gap-3 border border-border border-l-[3px] px-4 py-3 text-sm',
        'border-l-[var(--ef-callout-ink,var(--ef-callout-color))]',
        'bg-[color-mix(in_srgb,var(--ef-callout-color)_7%,var(--ef-surface))]',
        VARIANT[variant],
        className,
      )}
      {...rest}
    >
      <div className="min-w-0">
        {title ? (
          <span className="mb-0.5 block font-mono text-xs uppercase tracking-[0.12em] text-[var(--ef-callout-ink,var(--ef-callout-color))]">
            {title}
          </span>
        ) : null}
        {children}
      </div>
    </div>
  );
}
