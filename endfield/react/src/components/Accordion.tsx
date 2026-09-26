import type { ReactNode } from 'react';
import { cx } from '../lib/cx';

export interface AccordionProps {
  children: ReactNode;
  className?: string;
}

/** 用原生 <details>，无 JavaScript 时仍可展开。 */
export function Accordion({ children, className }: AccordionProps) {
  return <div className={cx('border border-border', className)}>{children}</div>;
}

export interface AccordionItemProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}

export function AccordionItem({
  title,
  defaultOpen = false,
  children,
  className,
}: AccordionItemProps) {
  return (
    <details
      open={defaultOpen}
      className={cx(
        'border-b border-border last:border-b-0',
        '[&:not([open])>summary]:before:-rotate-90',
        className,
      )}
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
