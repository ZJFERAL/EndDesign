import type { HTMLAttributes } from 'react';
import { cx } from '../lib/cx';

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  /** 加四角括号装饰。 */
  cornerFrame?: boolean;
}

export function Panel({ cornerFrame = false, className, children, ...rest }: PanelProps) {
  return (
    <div
      className={cx(
        'border border-border bg-surface',
        cornerFrame && 'corner-frame-all',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function PanelHeader({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'flex items-center gap-3 border-b border-border bg-surface-muted px-4 py-3',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function PanelTitle({ className, children, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cx('m-0 font-display text-base font-semibold', className)} {...rest}>
      {children}
    </h2>
  );
}

export function PanelBody({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx('p-4', className)} {...rest}>
      {children}
    </div>
  );
}

export function PanelFooter({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'flex items-center gap-2 border-t border-border bg-surface-muted px-4 py-3',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
