import { useCallback, useId, type ReactNode } from 'react';
import { cx } from '../lib/cx';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { IconButton } from './Button';
import { IconClose } from './icons';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, footer, children, className }: ModalProps) {
  const close = useCallback(() => onClose(), [onClose]);
  const panelRef = useFocusTrap(open, close);
  const titleId = useId();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 遮罩用固定 rgb(0 0 0 / 60%)（对齐 css/components.css:1371）。
          规则是：本库的颜色一律走令牌，唯一例外是那些**只为与主题无关**而写死的字面量，
          遮罩就是唯一一个 —— 明暗两主题下都要压暗背景，取令牌反而会跟着主题变。
          其余字面量不是这一类，它们是 CSS 层本就写死、React 层逐字节转写过来的：
          危险按钮的白色前景（css/components.css:99）、Select 箭头 SVG 的描边色
          （css/components.css:249，数据 URI 读不到 CSS 变量）、Checkbox 选中态数据 URI
          里的勾形描边 #111827 与斜纹 rgb(0 0 0 / 18%)（css/components.css:321-338，
          同在数据 URI 内），以及本层 Dropdown / Toast 的阴影
          rgb(0 0 0 / 25%)（对齐 css/components.css:1318 / :1467）—— 阴影在两层里
          都是固定的，本就不随主题变化。 */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={close}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cx(
          // 面板宽度与四角括号对齐 css/components.css:1377 与 index.html:1461。
          'corner-frame-all relative flex max-h-[85vh] w-full max-w-[34rem] flex-col',
          'border border-border bg-surface-raised',
          'animate-[ef-corner-in_0.25s_var(--ef-ease-out-quint)_both]',
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
        {footer ? (
          <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
