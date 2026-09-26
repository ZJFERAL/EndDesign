import { useId, useRef, useState, type ReactNode } from 'react';
import { cx } from '../lib/cx';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  /** 受控：当前选中项 id。 */
  value?: string;
  /** 非受控：初始选中项 id，默认第一项。 */
  defaultValue?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export function Tabs({ items, value, defaultValue, onChange, className }: TabsProps) {
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.id ?? '');
  const current = value ?? internal;
  // 受控值若不匹配任何一项（拼错 id、数据被删），不能就这么晾着：那样每个 tab 都是
  // aria-selected=false 且 tabIndex=-1，roving tabindex 没有落点，键盘根本进不了
  // tablist，所有面板还都被 hidden。回退到第一项，控件始终可用。
  // 只影响选中态，不调用 onChange —— 不替使用方改状态，受控语义不变。
  const selectedId = items.some((it) => it.id === current) ? current : (items[0]?.id ?? '');
  const baseId = useId();
  const listRef = useRef<HTMLDivElement | null>(null);

  function select(id: string, focus = false) {
    if (value === undefined) setInternal(id);
    onChange?.(id);
    if (focus) {
      const index = items.findIndex((it) => it.id === id);
      const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
      buttons?.[index]?.focus();
    }
  }

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + items.length) % items.length;
    const target = items[next];
    if (target) select(target.id, true);
  }

  return (
    <div className={className}>
      <div
        ref={listRef}
        role="tablist"
        className="flex flex-wrap gap-1 border-b border-border"
      >
        {items.map((item, i) => {
          const selected = item.id === selectedId;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              aria-controls={`${baseId}-panel-${item.id}`}
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(item.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cx(
                'cursor-pointer border-0 border-b-2 border-transparent bg-transparent',
                'px-4 py-2 font-mono text-xs uppercase tracking-[0.12em]',
                'transition-colors duration-150',
                // 激活态斜纹用 hatch-accent（主色 22% 斜纹，对齐 css/components.css:1285-1291）。
                // 不用 hatch：它取 currentColor，而此处文字是 text-ink（亮色主题 #000000），
                // 会画出近黑斜纹，与层里的主色斜纹相反。
                selected
                  ? 'border-b-accent-ink text-ink hatch-accent'
                  : 'text-ink-muted hover:text-ink',
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${baseId}-panel-${item.id}`}
          aria-labelledby={`${baseId}-tab-${item.id}`}
          hidden={item.id !== selectedId}
          className="pt-4"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
