import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../lib/cx';

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="加载中"
      className={cx(
        'inline-block size-5 animate-spin rounded-full border-2 border-border border-t-accent-ink',
        className,
      )}
    />
  );
}

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
}

export function Skeleton({ width, height, className, style, ...rest }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cx(
        // 用扫光而非 Tailwind 的透明度脉冲：对齐 css/components.css:585-603 与 spec §6.1。
        'block skeleton-sweep rounded-ef-sm bg-surface-muted',
        className,
      )}
      style={{ width, height, ...style }}
      {...rest}
    />
  );
}

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** 0–100。 */
  value: number;
  label?: string;
}

export function Progress({ value, label, className, ...rest }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cx(
        'relative h-1.5 overflow-hidden rounded-ef-sm border border-border bg-surface-sunken',
        className,
      )}
      {...rest}
    >
      <div
        /* 进度条填充用 background-color 而非任何 background 简写，否则会重置
           background-image，静默抹掉叠加上来的 hatch 斜纹（spec §6.1 要求
           进度条「可叠加 hatch」；对齐 css/components.css:616-623）。 */
        className="h-full bg-accent transition-[width] duration-400"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...rest
}: EmptyStateProps) {
  return (
    <div
      className={cx(
        'flex flex-col items-center gap-3 px-6 py-12 text-center text-ink-muted',
        className,
      )}
      {...rest}
    >
      {icon ? <span className="text-border-strong">{icon}</span> : null}
      <p className="m-0 text-lg font-semibold text-ink">{title}</p>
      {description ? <p className="m-0 max-w-md text-sm">{description}</p> : null}
      {action}
    </div>
  );
}
