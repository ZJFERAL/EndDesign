import type { HTMLAttributes } from 'react';
import { cx } from '../lib/cx';

/* 两个组件都 extends HTMLAttributes，透传原生属性与 className（全局约束）。
   AccordionItem 渲染 <details>，故用 HTMLAttributes<HTMLDetailsElement>。
   注意 title 这里是 `string`，与原生 `title?: string` 兼容（string 可赋给
   string | undefined），故无需 Omit —— 与 SectionHeader 的 `title: ReactNode`
   不同，后者不 Omit 会 TS2430。 */
export type AccordionProps = HTMLAttributes<HTMLDivElement>;

/** 用原生 <details>，无 JavaScript 时仍可展开。 */
export function Accordion({ className, children, ...rest }: AccordionProps) {
  return (
    <div className={cx('border border-border', className)} {...rest}>
      {children}
    </div>
  );
}

export interface AccordionItemProps extends HTMLAttributes<HTMLDetailsElement> {
  title: string;
  defaultOpen?: boolean;
}

export function AccordionItem({
  title,
  defaultOpen = false,
  className,
  children,
  ...rest
}: AccordionItemProps) {
  return (
    <details
      open={defaultOpen}
      className={cx(
        'border-b border-border last:border-b-0',
        '[&:not([open])>summary]:before:-rotate-90',
        className,
      )}
      {...rest}
    >
      <summary
        className={cx(
          'flex cursor-pointer list-none items-center gap-2 px-4 py-3',
          'text-sm font-medium hover:bg-surface-muted',
          '[&::-webkit-details-marker]:hidden',
          'before:text-accent-ink before:content-["▾"] before:transition-transform before:duration-150',
        )}
      >
        {title}
      </summary>
      <div className="px-4 pb-4 text-sm text-ink-muted">{children}</div>
    </details>
  );
}
