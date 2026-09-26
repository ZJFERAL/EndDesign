import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * 在容器内循环焦点，并支持 Esc 关闭。
 * 激活时把焦点移入容器，退出时归还给此前聚焦的元素。
 *
 * 返回 `RefObject<HTMLDivElement>`（不是 `RefObject<HTMLDivElement | null>`）：
 * `@types/react` 18.3 里 `ref` prop 要的是 `LegacyRef<T>`，其中的 `RefObject<T>`
 * 是 `readonly current: T | null`。显式把 null 写进类型实参会得到
 * `RefObject<HTMLDivElement | null>`，与 `RefObject<HTMLDivElement>` 不兼容，
 * 传给 `ref` 会报 TS2322。`useRef<HTMLDivElement>(null)` 已经隐含 `| null`，
 * 无需再写；运行时逻辑完全不变（`ref.current` 仍可能为 null，下方已判空）。
 */
export function useFocusTrap(
  active: boolean,
  onEscape?: () => void,
): RefObject<HTMLDivElement> {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    const container = ref.current;
    if (!container) return;

    const previous = document.activeElement as HTMLElement | null;
    const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null,
    );
    (items[0] ?? container).focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onEscape?.();
        return;
      }
      if (e.key !== 'Tab') return;

      const list = Array.from(container!.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      );
      if (list.length === 0) return;
      const first = list[0]!;
      const last = list[list.length - 1]!;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
      previous?.focus?.();
    };
  }, [active, onEscape]);

  return ref;
}
