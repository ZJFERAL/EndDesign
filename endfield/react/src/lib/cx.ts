/**
 * 拼接类名，过滤假值。
 * 不引入 classnames / clsx —— 本库保持零运行时依赖。
 * 注意：组件的 className 必须拼在最后，但这是必要条件而非充分条件 ——
 * Tailwind v4 在 @layer utilities 内按自己的规范顺序发射，同一个 CSS 属性上
 * 后发射的赢，而这个顺序使用方看不到也控制不了。同一个 class 在不同组件上
 * 结果可能相反（bg-danger 在 Button primary 上生效，在 secondary/ghost/Chip
 * 上被内置的 bg-transparent/bg-surface-muted 压掉）。拿不准就用 Tailwind 的
 * ! 修饰符（bg-danger!、rounded-none!、p-8!），它产出 !important，绕过发射顺序。
 * 详见实施计划的 Review Focus 第 1 条。
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
