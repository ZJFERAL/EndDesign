import type { AnchorHTMLAttributes, HTMLAttributes } from 'react';
import { cx } from '../lib/cx';

export function Timeline({ className, children, ...rest }: HTMLAttributes<HTMLOListElement>) {
  return (
    <ol
      className={cx(
        'relative m-0 list-none pl-6',
        'before:absolute before:bottom-1.5 before:left-[5px] before:top-1.5 before:w-px before:bg-border',
        className,
      )}
      {...rest}
    >
      {children}
    </ol>
  );
}

export interface TimelineItemProps extends HTMLAttributes<HTMLLIElement> {
  time: string;
  dateTime?: string;
  /** 重点修订：节点用主色。 */
  accent?: boolean;
}

export function TimelineItem({
  time,
  dateTime,
  accent = false,
  className,
  children,
  ...rest
}: TimelineItemProps) {
  return (
    <li
      className={cx(
        'relative pb-5',
        // 节点为 9×9、切角 3px、位置 left: calc(-1 * var(--ef-space-6) + 1px)、top: 5px
        // （对齐 css/components.css:1166-1182）。chamfer 的尺寸回退写在 var() 里，
        // 故可用 [--ef-chamfer-size:3px] 覆盖。
        'before:absolute before:left-[calc(-1*var(--ef-space-6)+1px)] before:top-[5px]',
        'before:size-[9px] before:chamfer before:[--ef-chamfer-size:3px]',
        accent ? 'before:bg-accent-ink' : 'before:bg-border-strong',
        className,
      )}
      {...rest}
    >
      <time
        dateTime={dateTime}
        className="mb-0.5 block font-mono text-xs text-ink-subtle"
      >
        {time}
      </time>
      <div className="text-sm">{children}</div>
    </li>
  );
}

/* TimelineTitle 渲染的是 <a>，props 必须用 AnchorHTMLAttributes 才能接受 href。
   HTMLAttributes<HTMLAnchorElement> 里没有 href，DataSection 的
   `<TimelineTitle href="#data">` 会报 TS2322。 */
export function TimelineTitle({
  className,
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={cx('font-semibold [overflow-wrap:anywhere]', className)} {...rest}>
      {children}
    </a>
  );
}
