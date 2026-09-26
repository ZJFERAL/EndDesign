import type {
  HTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from 'react';
import { cx } from '../lib/cx';

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  /** 外层包一层可横向滚动的容器，宽表在窄屏可用。 */
  scrollable?: boolean;
}

export function Table({ scrollable = true, className, children, ...rest }: TableProps) {
  const table = (
    <table
      className={cx('w-full border border-border text-sm', className)}
      {...rest}
    >
      {children}
    </table>
  );
  if (!scrollable) return table;
  return <div className="overflow-x-auto">{table}</div>;
}

export function THead({ className, children, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={className} {...rest}>
      {children}
    </thead>
  );
}

export function TBody({ className, children, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={className} {...rest}>
      {children}
    </tbody>
  );
}

/* 悬停底色只给表体行（对齐 css/components.css:1105 的 `.ef-table tbody tr:hover`）：
   表头行也是 <tr>，不加 tbody 限定会连表头一起高亮。
   最后一行的单元格去掉下边框（对齐 css/components.css:1101 的
   `.ef-table tbody tr:last-child td`）—— 不能用 `last:border-b-0`，
   那个 `:last-child` 落在「每行的最后一个单元格」上，会把每一行最右列的
   分隔线都抹掉。 */
export function TR({ className, children, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cx('[tbody_&]:hover:bg-surface-muted', '[&:last-child>td]:border-b-0', className)}
      {...rest}
    >
      {children}
    </tr>
  );
}

export interface THProps extends ThHTMLAttributes<HTMLTableCellElement> {
  /** 提供 onSort 时渲染为可排序按钮，并设置 aria-sort。 */
  onSort?: () => void;
  sort?: 'asc' | 'desc';
}

export function TH({ onSort, sort, className, children, ...rest }: THProps) {
  const base = cx(
    'border-b border-border bg-surface-sunken px-3 py-2 text-left',
    'font-mono text-xs font-medium uppercase tracking-[0.12em] text-ink-muted whitespace-nowrap',
    className,
  );
  if (!onSort) {
    return (
      <th scope="col" className={base} {...rest}>
        {children}
      </th>
    );
  }
  return (
    <th
      scope="col"
      aria-sort={sort === 'asc' ? 'ascending' : sort === 'desc' ? 'descending' : 'none'}
      className={base}
      {...rest}
    >
      <button
        type="button"
        onClick={onSort}
        className={cx(
          'inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0',
          'font-[inherit] tracking-[inherit] uppercase',
          'hover:text-ink',
          sort && 'after:text-accent-ink',
          sort === 'asc' && 'after:content-["▲"]',
          sort === 'desc' && 'after:content-["▼"]',
        )}
      >
        {children}
      </button>
    </th>
  );
}

export function TD({ className, children, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cx(
        'border-b border-border px-3 py-2 [overflow-wrap:anywhere]',
        className,
      )}
      {...rest}
    >
      {children}
    </td>
  );
}
