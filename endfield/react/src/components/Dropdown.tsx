import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cx } from '../lib/cx';

export interface DropdownProps {
  /**
   * 触发器元素。会被注入 `onClick`（**组合**：先调用它自己原有的 `onClick`，
   * 再切换展开状态）、`aria-haspopup` 与 `aria-expanded`。
   */
  trigger: ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>;
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, children, align = 'right', className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const items = useCallback(
    () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []),
    [],
  );

  // 回到触发器：不通过 ref 注入（会顶掉调用方自己的 ref），改为在根节点内按 ARIA 属性找。
  const focusTrigger = useCallback(() => {
    rootRef.current?.querySelector<HTMLElement>('[aria-haspopup="true"]')?.focus();
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    focusTrigger();
  }, [focusTrigger]);

  useEffect(() => {
    if (!open) return;

    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }

    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  // 展开后把焦点移入第一个菜单项（菜单按钮模式）。
  useEffect(() => {
    if (!open) return;
    items()[0]?.focus();
  }, [open, items]);

  function onMenuKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const list = items();
    if (list.length === 0) return;
    const current = list.indexOf(document.activeElement as HTMLElement);
    const last = list.length - 1;

    let next: number | null = null;
    if (e.key === 'ArrowDown') next = current >= last ? 0 : current + 1;
    else if (e.key === 'ArrowUp') next = current <= 0 ? last : current - 1;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = last;

    if (next === null) return;
    e.preventDefault();
    list[next]?.focus();
  }

  const triggerWithProps = isValidElement(trigger)
    ? cloneElement(trigger, {
        onClick: (e: ReactMouseEvent<HTMLButtonElement>) => {
          // 组合而非替换：触发器自己的 onClick 必须照常触发。
          const original = trigger.props.onClick;
          if (typeof original === 'function') original(e);
          setOpen((v) => !v);
        },
        'aria-haspopup': 'true',
        'aria-expanded': open,
      })
    : trigger;

  return (
    <div ref={rootRef} className={cx('relative inline-block', className)}>
      {triggerWithProps}
      {open ? (
        <div
          ref={menuRef}
          role="menu"
          onKeyDown={onMenuKeyDown}
          // 激活任意菜单项后收起并归还焦点。挂在菜单容器上而非每个 item 上，
          // 因为 children 由使用方自由组合；判定用 closest，空白处点击不误关。
          // 键盘 Enter/Space 在按钮上同样产生 click，故键盘路径一并覆盖。
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('[role="menuitem"]')) close();
          }}
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
