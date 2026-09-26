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
      {/* 遮罩是明暗两主题下都要压暗背景，不随主题变化，故用固定 rgb(0 0 0 / 60%)
          （对齐 css/components.css:1371）—— 它是本库唯一的**与主题无关**的颜色字面量。
          库中另有几处字面量，都只在 CSS 层本身就写死的地方出现，且各自就近注释：
          危险按钮的白色前景（css/components.css:99）、Select 箭头 SVG 的描边色
          （css/components.css:249，数据 URI 读不到 CSS 变量），以及 Checkbox 选中态
          数据 URI 里的勾形描边 #111827 与斜纹 rgb(0 0 0 / 18%)
          （css/components.css:321-338）—— 后两者同样因为处在数据 URI 内而无法引用
          CSS 变量，且与 CSS 层逐字节一致，属同一类已认可的例外。 */}
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
