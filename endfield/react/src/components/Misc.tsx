import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../lib/cx';

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
}

export function Divider({ label, className, ...rest }: DividerProps) {
  if (!label) {
    return <hr className={cx('my-4 h-px border-0 bg-border', className)} {...rest} />;
  }
  return (
    <div
      role="separator"
      className={cx(
        'my-4 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle',
        'before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border',
        className,
      )}
      {...rest}
    >
      {label}
    </div>
  );
}

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

export function Kbd({ children, className, ...rest }: KbdProps) {
  return (
    <kbd
      className={cx(
        'inline-block min-w-6 rounded-ef-sm border border-border border-b-2',
        'bg-surface-raised px-1.5 text-center font-mono text-[11px] leading-normal text-ink-muted',
        className,
      )}
      {...rest}
    >
      {children}
    </kbd>
  );
}

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  size?: AvatarSize;
  src?: string;
  alt?: string;
  /** 无图时显示的文字，通常取名字首字。 */
  fallback?: string;
}

const AVATAR_SIZE: Record<AvatarSize, string> = {
  sm: 'size-6.5 text-xs',
  md: 'size-9 text-sm',
  lg: 'size-13 text-lg',
};

export function Avatar({ size = 'md', src, alt, fallback, className, ...rest }: AvatarProps) {
  return (
    <span
      className={cx(
        'chamfer-sm inline-flex shrink-0 items-center justify-center overflow-hidden',
        'border border-border bg-surface-muted font-mono font-semibold text-ink-muted',
        AVATAR_SIZE[size],
        className,
      )}
      {...rest}
    >
      {src ? (
        <img src={src} alt={alt ?? ''} className="size-full object-cover" />
      ) : (
        fallback ?? null
      )}
    </span>
  );
}

/* 必须剔除 content：React 的 HTMLAttributes 已把它声明成 string（meta 的
   属性），气泡内容要收 ReactNode，不做 Omit 会是接口冲突而非可赋值问题。 */
export interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'content'> {
  content: ReactNode;
}

/** 悬停 / 聚焦显示的气泡提示，纯 CSS 驱动。 */
export function Tooltip({ content, className, children, ...rest }: TooltipProps) {
  return (
    <span className={cx('group relative inline-flex', className)} {...rest}>
      {children}
      <span
        role="tooltip"
        className={cx(
          'pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-80',
          '-translate-x-1/2 whitespace-nowrap rounded-ef-sm px-2 py-1',
          'bg-[var(--ef-tooltip)] font-mono text-xs text-[var(--ef-tooltip-fg)]',
          'invisible opacity-0 transition-opacity duration-150',
          'group-hover:visible group-hover:opacity-100',
          'group-focus-within:visible group-focus-within:opacity-100',
        )}
      >
        {content}
      </span>
    </span>
  );
}
