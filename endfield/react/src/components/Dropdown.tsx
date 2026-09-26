import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cx } from '../lib/cx';

export interface DropdownProps {
  /** 触发器元素，会被注入 onClick / aria-expanded。 */
  trigger: ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>;
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, children, align = 'right', className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const triggerWithProps = isValidElement(trigger)
    ? cloneElement(trigger, {
        onClick: () => setOpen((v) => !v),
        'aria-haspopup': 'true',
        'aria-expanded': open,
      })
    : trigger;

  return (
    <div ref={rootRef} className={cx('relative inline-block', className)}>
      {triggerWithProps}
      {open ? (
        <div
          role="menu"
          className={cx(
            'absolute top-[calc(100%+4px)] z-60 min-w-48 border border-border',
            'bg-surface-raised p-1 shadow-[0_6px_20px_rgb(0_0_0/25%)]',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export interface DropdownItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
}

export function DropdownItem({ icon, className, children, ...rest }: DropdownItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cx(
        'flex w-full cursor-pointer items-center gap-2 border-0 bg-transparent',
        'px-3 py-2 text-left text-sm text-ink-muted',
        'hover:bg-surface-muted hover:text-ink focus-visible:bg-surface-muted focus-visible:text-ink',
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return <div role="separator" className="my-1 h-px bg-border" />;
}
