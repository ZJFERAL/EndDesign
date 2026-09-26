import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../lib/cx';

/* Omit 掉 `title`：`HTMLAttributes` 的 `title?: string`（原生提示文本）与这里的
   `title: ReactNode`（区块标题）同名不同义，不 Omit 会 TS2430。 */
export interface SectionHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  eyebrow?: string;
  title: ReactNode;
  actions?: ReactNode;
}

export function SectionHeader({
  eyebrow,
  title,
  actions,
  className,
  ...rest
}: SectionHeaderProps) {
  return (
    <div
      className={cx(
        'mb-4 flex flex-wrap items-end gap-4 border-b border-border pb-3',
        className,
      )}
      {...rest}
    >
      <div className="min-w-0 flex-1">
        {eyebrow ? (
          <span className="mb-0.5 block font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">
            {'// '}
            {eyebrow}
          </span>
        ) : null}
        <h2 className="m-0 flex items-center gap-3 font-display text-xl font-bold">
          <span aria-hidden="true" className="h-[1.1em] w-[3px] shrink-0 bg-accent-ink" />
          {title}
        </h2>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
