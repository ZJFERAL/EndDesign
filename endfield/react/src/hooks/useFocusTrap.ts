import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

interface TrapEntry {
  container: HTMLDivElement;
  handler: (e: KeyboardEvent) => void;
}

/**
 * 当前激活的焦点陷阱，末位为最顶层，只有它能响应键盘 —— 多个遮罩叠放时，
 * 一次 Esc 只应关掉最上面那层，Tab 也只应在最上面那层里循环。
 *
 * 入栈位置不能简单 append。React 的 passive effect 是后序遍历，**同一提交里子组件的
 * effect 先于父组件运行**；若父子两层在同一次提交里挂载（例如深链直接进入两层都开的状态），
 * 一律 append 就会把父层压在子层之上，Esc 关错层。规则：新陷阱插到**它自己包含的第一个
 * 条目之前**，没有这样的条目就追加。于是「祖先先于后代、后代后于祖先」恒成立，
 * 互不包含的兄弟则按激活顺序排列，与 DOM 顺序和绘制顺序一致。
 */
const stack: TrapEntry[] = [];

/**
 * body 滚动锁的引用计数。
 * 不能用「各自保存 prevOverflow 再各自还原」的写法：两个遮罩叠放时，内层捕获到的
 * 已经是内联的 'hidden'，两层都关掉后最后一次还原会把它写死成 hidden，页面再也滚不动。
 * 改为只有第一个激活的陷阱记录原值、只有最后一个释放的陷阱还原。
 * 增减与监听器的增删绑在同一个 effect 里，两者不会各走各的。
 */
let lockCount = 0;
let savedOverflow = '';

function lockScroll() {
  if (lockCount === 0) savedOverflow = document.body.style.overflow;
  lockCount += 1;
  document.body.style.overflow = 'hidden';
}

function unlockScroll() {
  if (lockCount === 0) return;
  lockCount -= 1;
  if (lockCount === 0) document.body.style.overflow = savedOverflow;
}

/**
 * 在容器内循环焦点，并支持 Esc 关闭。
 * 激活时把焦点移入容器，退出时归还给此前聚焦的元素。
 *
 * `onEscape` 存放在 ref 里，**不列入依赖数组**。调用方几乎总是写
 * `onClose={() => setOpen(false)}`，父组件每渲染一次就是一个新函数；若把它当依赖，
 * 父组件每重渲染都会拆掉重建陷阱，并重新把焦点种到第一个可聚焦元素上 —— 受控输入框
 * 里打到一半的字会被夺走，计时器每跳一次也会把焦点从按钮上拽回来。故依赖只有 [active]。
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
  const escapeRef = useRef(onEscape);

  // 在 effect 里刷新而不是渲染期赋值：渲染期写 ref 在并发渲染下不安全。
  // 本 effect 声明在陷阱 effect 之前，故先于它运行；而 escapeRef 只在按键时才被读取，
  // 那时所有 effect 都已跑完，取到的必然是最新一次渲染的回调。
  useEffect(() => {
    escapeRef.current = onEscape;
  });

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
      const top = stack[stack.length - 1];
      if (!top || top.handler !== onKeyDown) return;

      if (e.key === 'Escape') {
        escapeRef.current?.();
        return;
      }
      if (e.key !== 'Tab') return;

      const list = Array.from(container!.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      );
      if (list.length === 0) {
        // 面板里没有可聚焦元素。不拦截的话浏览器会把焦点移到遮罩后面的元素上，
        // 焦点就逃出陷阱了；这里吞掉 Tab 并把焦点按回容器（容器 tabIndex={-1} 可聚焦）。
        e.preventDefault();
        container!.focus();
        return;
      }
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

    const entry: TrapEntry = { container, handler: onKeyDown };
    let insertAt = stack.length;
    for (let i = 0; i < stack.length; i += 1) {
      if (container.contains(stack[i]!.container)) {
        insertAt = i;
        break;
      }
    }
    stack.splice(insertAt, 0, entry);

    document.addEventListener('keydown', onKeyDown);
    lockScroll();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      const at = stack.indexOf(entry);
      if (at >= 0) stack.splice(at, 1);
      unlockScroll();
      previous?.focus?.();
    };
  }, [active]);

  return ref;
}
