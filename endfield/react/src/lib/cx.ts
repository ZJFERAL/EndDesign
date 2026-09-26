/**
 * 拼接类名，过滤假值。
 * 不引入 classnames / clsx —— 本库保持零运行时依赖。
 * 注意：组件的 className 必须拼在最后，但这是必要条件而非充分条件 ——
 * Tailwind v4 在 @layer utilities 内按规范顺序发射，同一属性的胜者由工具类组
 * 的发射顺序决定，而非 class 属性里的先后。跨组覆盖（改圆角、改背景色等）
 * 追加即可生效；覆盖同一组的内置工具类（如 px-4/py-2 之上再传 p-8）必须用
 * Tailwind 的 ! 修饰符。详见实施计划的 Review Focus 第 1 条。
 */
export type ClassValue = string | false | null | undefined;

export function cx(...classes: ClassValue[]): string {
  let out = '';
  for (const c of classes) {
    if (!c) continue;
    out = out ? `${out} ${c}` : c;
  }
  return out;
}
