import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../lib/cx';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items, className, ...rest }: BreadcrumbProps) {
  return (
    <nav aria-label="面包屑" className={className} {...rest}>
      <ol className="m-0 mb-2 flex list-none flex-wrap items-center gap-2 p-0 font-mono text-xs text-ink-subtle">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-2">
            {i > 0 ? <span aria-hidden="true" className="text-border-strong">/</span> : null}
            {item.href ? (
              <a href={item.href} className="text-ink-muted no-underline hover:text-accent-ink">
                {item.label}
              </a>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* Omit 掉 `onChange`：`HTMLAttributes` 的 `onChange?: FormEventHandler`（原生事件）
   与这里的 `onChange?: (page: number) => void`（页码回调）签名不兼容，不 Omit 会 TS2430。 */
export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  page: number;
  total: number;
  onChange?: (page: number) => void;
  /** 两侧各显示多少页。 */
  siblings?: number;
}

export function Pagination({
  page,
  total,
  onChange,
  siblings = 1,
  className,
  ...rest
}: PaginationProps) {
  const pages: number[] = [];
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || Math.abs(p - page) <= siblings) pages.push(p);
  }

  const linkClass = cx(
    'inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-none',
    'border border-border bg-surface-raised px-2 font-mono text-sm tabular-nums text-ink-muted',
    'hover:border-border-strong hover:text-ink',
    'aria-[current=page]:border-accent-strong aria-[current=page]:bg-accent',
    'aria-[current=page]:font-semibold aria-[current=page]:text-accent-fg',
    'disabled:pointer-events-none disabled:opacity-40',
  );

  let last = 0;

  return (
    <nav aria-label="分页" className={cx('mt-6 flex flex-wrap items-center gap-1', className)} {...rest}>
      <button
        type="button"
        className={linkClass}
        disabled={page <= 1}
        onClick={() => onChange?.(page - 1)}
      >
        上一页
      </button>

      {pages.map((p) => {
        const gap = p - last > 1 && last !== 0;
        last = p;
        return (
          <span key={p} className="flex items-center gap-1">
            {gap ? <span className="px-1 text-ink-subtle">…</span> : null}
            <button
              type="button"
              aria-current={p === page ? 'page' : undefined}
              className={linkClass}
              onClick={() => onChange?.(p)}
            >
              {p}
            </button>
          </span>
        );
      })}

      <button
        type="button"
        className={linkClass}
        disabled={page >= total}
        onClick={() => onChange?.(page + 1)}
      >
        下一页
      </button>
    </nav>
  );
}

export interface FilterRowProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
}

export function FilterRow({ label, className, children, ...rest }: FilterRowProps) {
  return (
    <div
      className={cx(
        'flex flex-col gap-2 border-b border-border py-2 last:border-b-0',
        'sm:flex-row sm:items-start sm:gap-4',
        className,
      )}
      {...rest}
    >
      <span className="shrink-0 pt-1 text-sm text-ink-muted sm:w-22">{label}</span>
      <div className="flex min-w-0 flex-1 flex-wrap gap-2">{children}</div>
    </div>
  );
}

export interface InfoGridItem {
  key: string;
  value: ReactNode;
}

export interface InfoGridProps extends HTMLAttributes<HTMLDListElement> {
  items: InfoGridItem[];
}

export function InfoGrid({ items, className, ...rest }: InfoGridProps) {
  return (
    <dl
      className={cx('grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-3 text-sm', className)}
      {...rest}
    >
      {items.map((item) => (
        <div key={item.key} className="contents">
          <dt className="m-0 font-mono text-xs tracking-wide text-ink-subtle">{item.key}</dt>
          <dd className="m-0 font-semibold [overflow-wrap:anywhere]">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export interface TOCItem {
  id: string;
  label: string;
  /** 二级条目，缩进显示。 */
  sub?: boolean;
}

export interface TOCProps extends HTMLAttributes<HTMLElement> {
  items: TOCItem[];
  activeId?: string;
  title?: string;
}

export function TOC({ items, activeId, title = '本页目录', className, ...rest }: TOCProps) {
  return (
    <nav aria-label={title} className={cx('text-sm', className)} {...rest}>
      <p className="m-0 mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">
        {title}
      </p>
      <ul className="m-0 list-none border-l border-border p-0">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={item.id === activeId ? 'location' : undefined}
              className={cx(
                'block border-l-2 border-transparent py-1 no-underline',
                item.sub ? 'pl-6 text-xs' : 'pl-3',
                item.id === activeId
                  ? 'border-l-accent-ink font-medium text-ink'
                  : 'text-ink-muted hover:text-ink',
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
