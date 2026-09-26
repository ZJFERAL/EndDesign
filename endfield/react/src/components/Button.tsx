import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../lib/cx';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
}

/* 每个变体同时给出 --ef-btn-fg：载入态的旋转环读它取色，否则环会画成
   按钮文字的继承色（对齐 css/components.css:135 的 color: var(--ef-btn-fg)）。 */
const VARIANT: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-accent-fg border-accent-strong font-semibold hover:bg-accent-strong hover:border-accent-strong [--ef-btn-fg:var(--ef-accent-fg)]',
  secondary:
    'bg-transparent text-ink border-border-strong hover:bg-surface-muted [--ef-btn-fg:var(--ef-ink)]',
  ghost:
    'bg-transparent text-ink-muted border-transparent hover:bg-surface-muted hover:text-ink [--ef-btn-fg:var(--ef-ink-muted)]',
  /* 危险按钮：hover 压暗而非变淡（对齐 css/components.css:97-105）。
     前景硬编码 #ffffff 与层一致 —— 白字在 #dc2626 上对比度达标。 */
  danger:
    'bg-danger text-white border-danger hover:bg-[color-mix(in_srgb,var(--ef-danger)_82%,#000000)] hover:border-[color-mix(in_srgb,var(--ef-danger)_82%,#000000)] [--ef-btn-fg:#ffffff]',
};

const SIZE: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', loading = false, icon, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        'relative inline-flex items-center justify-center gap-2 rounded-ef border font-medium leading-tight whitespace-nowrap',
        'transition-colors duration-150 cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANT[variant],
        SIZE[size],
        loading && 'text-transparent pointer-events-none',
        className,
      )}
      {...rest}
    >
      {icon ? <span className="shrink-0 inline-flex">{icon}</span> : null}
      {children}
      {loading ? (
        <span
          aria-hidden="true"
          className="absolute inset-0 m-auto h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          /* 环色取按钮自身前景，与层一致（css/components.css:125-137）。
             不能写成 var(--ef-ink)：那会在红色危险按钮上画出黑环。 */
          style={{ color: 'var(--ef-btn-fg)' }}
        />
      ) : null}
    </button>
  );
});

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 必填：图标按钮没有可见文字，必须提供无障碍名称。 */
  label: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ label, className, children, ...rest }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        title={label}
        className={cx(
          'chamfer-sm inline-flex h-8 w-8 shrink-0 items-center justify-center',
          'border border-border bg-surface-muted text-ink-muted cursor-pointer',
          'transition-colors duration-150 hover:bg-accent hover:text-accent-fg',
          className,
        )}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
