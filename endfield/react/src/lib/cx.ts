/**
 * 拼接类名，过滤假值。
 * 不引入 classnames / clsx —— 本库保持零运行时依赖。
 * 注意：Tailwind 的层叠由生成顺序决定，故组件的 className 必须拼在最后，
 * 使用方才能覆盖内置样式。
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
