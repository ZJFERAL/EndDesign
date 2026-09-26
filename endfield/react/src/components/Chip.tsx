import type { ButtonHTMLAttributes, HTMLAttributes } from 'react';
import { cx } from '../lib/cx';

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

/**
 * 可选中标签，用于筛选行。
 * active 为受控：由使用方传入，本组件不持有内部状态，仅把它映射为 aria-pressed。
 * 不提供 defaultPressed 之类的非受控入口 —— 它既不是合法 DOM 属性，
 * 又会经 ...rest 漏到 DOM 上并触发 React 警告。
 */
export function Chip({ active = false, className, children, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cx(
        // rounded-pill 映射自 --ef-radius-pill（对齐 css/components.css:449）。
        'inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1',
        'text-sm leading-tight cursor-pointer transition-colors duration-150',
        // 激活态斜纹用 hatch-soft 而非 hatch：hatch 取 currentColor，而此处文字是
        // text-accent-fg（#111827），会画出近黑斜纹。层里是固定 rgb(0 0 0 / 12%)
        // 5px 间距（css/components.css:473-477）。
        active
          ? 'border-accent-strong bg-accent text-accent-fg font-semibold hatch-soft'
          : 'border-border bg-surface-muted text-ink-muted hover:border-border-strong hover:text-ink',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export interface ChipGroupProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
}

export function ChipGroup({ label, className, children, ...rest }: ChipGroupProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cx('flex flex-wrap items-center gap-2', className)}
      {...rest}
    >
      {children}
    </div>
  );
}
