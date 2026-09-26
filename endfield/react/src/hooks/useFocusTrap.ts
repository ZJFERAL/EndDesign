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
 * 已经处理过本次按键事件的陷阱。
 *
 * 一次 keydown 会在 document 上依次通知**所有**陷阱的监听器。光看「我是不是栈顶」不够：
 * 最顶层陷阱的 onClose 可能在这次派发还没走完时就把自己卸载掉、并从 stack 里摘出去，
 * 于是后面尚未执行的监听器再查栈顶，会得到「是我」—— 同一个 Esc 就把两层都关了。
 * 判定必须按**事件**而不是按**监听器**来。把「本次事件已有人处理」记在事件对象上之后，
 * 结论与监听器的注册顺序、以及监听器挂在哪个节点上全都无关。
 *
 * 不用 `e.stopImmediatePropagation()`：它只有在「所有陷阱都挂在同一个节点、且最顶层恰好
 * 先注册」时才等价，一旦监听器分散在不同节点就得依赖 DOM 传播顺序；而且它会连带掐掉
 * document 上其他无关的 keydown 监听器。WeakSet 以事件对象为键，天然按事件隔离、不跨事件
 * 残留，也不持有事件引用。
 */
const handledEvents = new WeakSet<KeyboardEvent>();

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

function focusables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null,
  );
}

/**
 * 把焦点交给当前栈顶（焦点已在其中则不动）。
 * 播种与归还都走这一处，保证「焦点属于最上层」只有一个实现。
 */
function activateTop(): void {
  const top = stack[stack.length - 1];
  if (!top) return;
  if (top.container.contains(document.activeElement)) return;
  (focusables(top.container)[0] ?? top.container).focus();
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

    function onKeyDown(e: KeyboardEvent) {
      const top = stack[stack.length - 1];
      if (!top || top.handler !== onKeyDown) return;

      if (e.key === 'Escape') {
        // 本次按键只放行一次。见 handledEvents 的说明：栈顶处理完可能就把自己摘掉，
        // 后面同一次派发里的监听器会误以为自己成了栈顶。
        if (handledEvents.has(e)) return;
        handledEvents.add(e);
        escapeRef.current?.();
        return;
      }
      if (e.key !== 'Tab') return;

      const list = focusables(container!);
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

    // 播种焦点必须在入栈**之后**，且只有栈顶才播。同一提交里嵌套挂载时，子层（B）的
    // effect 先跑并成为栈顶、播下焦点，父层（A）的 effect 后跑并插到 B 之前；若 A 在
    // 入栈前无条件播种，就会把焦点从 B 抢走，键盘用户从错误的那层开始。
    activateTop();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      const at = stack.indexOf(entry);
      if (at >= 0) stack.splice(at, 1);
      unlockScroll();

      // 归还焦点：还有下层时，优先还给「打开本层的那个元素」（前提是它仍在下层容器里）；
      // 否则交给新的栈顶 —— 顶层关掉后焦点绝不能留在下层遮罩之外。全部关掉才还给
      // 激活本层之前聚焦的元素。
      const top = stack[stack.length - 1];
      if (!top) {
        // 必须判 isConnected：激活本层之前聚焦的元素可能随本层一起卸载（例如触发按钮
        // 就渲染在模态内部）。此时 focus() 是静默空操作，焦点会掉到 <body>，键盘与读屏
        // 用户彻底失去位置。脱落时退到页面的主内容容器（演示站的 <main id="ef-main"
        // tabIndex={-1}>，也是「跳到主内容」链接的目标），至少把焦点留在主内容上。
        if (previous && previous.isConnected) {
          previous.focus();
        } else {
          document.getElementById('ef-main')?.focus();
        }
      } else if (previous && previous.isConnected && top.container.contains(previous)) {
        previous.focus();
      } else {
        activateTop();
      }
    };
  }, [active]);

  return ref;
}
