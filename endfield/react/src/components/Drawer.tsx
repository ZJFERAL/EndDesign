import { useCallback, useId, type ReactNode } from 'react';
import { cx } from '../lib/cx';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { IconButton } from './Button';
import { IconClose } from './icons';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: 'left' | 'right';
  children: ReactNode;
  className?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  side = 'right',
  children,
  className,
}: DrawerProps) {
  const close = useCallback(() => onClose(), [onClose]);
  const panelRef = useFocusTrap(open, close);
  const titleId = useId();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* 遮罩固定 rgb(0 0 0 / 60%)，与主题无关（对齐 css/components.css:1371）。 */}
      <div className="absolute inset-0 bg-black/60" onClick={close} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cx(
          'absolute inset-y-0 flex w-[min(24rem,92vw)] flex-col',
          'border-border bg-surface-raised',
          // 右侧抽屉的关键帧对齐 css/components.css:1429-1435。
          // 左侧抽屉 CSS 层没有实现（.ef-drawer 只做右侧），
          // ef-drawer-in-left 由 tailwind.css 为 React 层补充声明。
          side === 'right'
            ? 'right-0 border-l animate-[ef-drawer-in_0.25s_var(--ef-ease-out-quint)_both]'
            : 'left-0 border-r animate-[ef-drawer-in-left_0.25s_var(--ef-ease-out-quint)_both]',
          className,
        )}
      >
        <div className="flex items-center gap-3 border-b border-border bg-surface-muted px-4 py-3">
          <h2 id={titleId} className="m-0 flex-1 font-display text-lg font-semibold">
            {title}
          </h2>
          <IconButton label="关闭" onClick={close}>
            <IconClose />
          </IconButton>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
