import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { cx } from '../lib/cx';

export type ToastVariant = 'info' | 'success' | 'warn' | 'danger';

interface ToastRecord {
  id: number;
  message: string;
  variant: ToastVariant;
}

type Push = (message: string, variant?: ToastVariant) => void;

const ToastContext = createContext<Push | null>(null);

/* 与 Callout 同样的 ink 分叉（对齐 css/components.css:1453-1474）：
   3px 左边框用 ink，原色只用于语义标识。
   注意一处有意的分歧：CSS 层没有 --info toast 变体 —— 它的默认 toast 是中性的
   （--ef-toast-color: var(--ef-border-strong)、--ef-toast-ink: var(--ef-ink-muted)，
   css/components.css:1454-1455），而默认 Callout 是信息蓝。React 层把 info 映射到
   信息蓝，以与 Callout 及 4 变体 API 保持一致。这是裁决，不是疏漏。 */
const VARIANT: Record<ToastVariant, string> = {
  info: '[--ef-toast-color:var(--ef-info)] [--ef-toast-ink:var(--ef-info-ink)]',
  success: '[--ef-toast-color:var(--ef-success)] [--ef-toast-ink:var(--ef-success-ink)]',
  warn: '[--ef-toast-color:var(--ef-warn)] [--ef-toast-ink:var(--ef-warn-ink)]',
  danger: '[--ef-toast-color:var(--ef-danger)] [--ef-toast-ink:var(--ef-danger-ink)]',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastRecord[]>([]);

  const push = useCallback<Push>((message, variant = 'info') => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        // 堆叠位置对齐 css/components.css:1442：
        // top = var(--ef-header-bar-h) + var(--ef-space-4) = 56px + 16px = 72px。
        className="pointer-events-none fixed right-4 top-[calc(var(--ef-header-bar-h)+var(--ef-space-4))] z-60 flex flex-col gap-2"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className={cx(
              'pointer-events-auto flex min-w-64 max-w-96 items-start gap-2',
              'border border-border border-l-[3px] border-l-[var(--ef-toast-ink,var(--ef-toast-color))]',
              'bg-surface-raised px-4 py-3 text-sm shadow-[0_6px_20px_rgb(0_0_0/25%)]',
              'animate-[ef-rise-in_0.25s_var(--ef-ease-out-quint)_both]',
              VARIANT[t.variant],
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** 在 ToastProvider 内调用，取得推送提示的函数。 */
export function useToast(): Push {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast 必须在 <ToastProvider> 内使用');
  return ctx;
}
