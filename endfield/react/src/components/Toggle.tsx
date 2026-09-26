import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../lib/cx';

interface ToggleShellProps {
  htmlFor?: string | undefined;
  className?: string | undefined;
  children: ReactNode;
}

function ToggleShell({ htmlFor, className, children }: ToggleShellProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cx('inline-flex cursor-pointer items-center gap-2 text-sm select-none', className)}
    >
      {children}
    </label>
  );
}

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, className, id, ...rest },
  ref,
) {
  const auto = useId();
  const controlId = id ?? auto;
  return (
    <ToggleShell htmlFor={controlId} className={className}>
      <input
        ref={ref}
        id={controlId}
        type="checkbox"
        className={cx(
          'size-4 shrink-0 cursor-pointer appearance-none rounded-ef-sm',
          'border border-border-strong bg-surface-sunken',
          'checked:border-accent-strong checked:bg-accent',
          // 斜纹与勾形是同一 background-image 的两层，避免其中一个静默覆盖另一个。
          // 斜纹对齐 css/components.css:321-325，勾形对齐 :328-338。
          // 数据 URI 内读不到 CSS 变量，故勾形描边 #111827 与斜纹 rgb(0 0 0 / 18%)
          // 是写死的颜色字面量 —— 与 CSS 层逐字节一致，属已认可的例外（同 Select
          // 箭头）。斜纹与勾形都必须保留，缺一即与 CSS 层不一致。
          'checked:bg-[image:url("data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%2012%2012%27%3E%3Cpath%20d=%27M2%206.2l2.6%202.6L10%203.4%27%20fill=%27none%27%20stroke=%27%23111827%27%20stroke-width=%272%27/%3E%3C/svg%3E"),repeating-linear-gradient(-45deg,rgb(0_0_0/18%)_0_1px,transparent_1px_4px)]',
          'checked:bg-[length:100%,auto] checked:bg-[position:center,0_0] checked:bg-no-repeat',
        )}
        {...rest}
      />
      {label ? <span>{label}</span> : null}
    </ToggleShell>
  );
});

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, className, id, ...rest },
  ref,
) {
  const auto = useId();
  const controlId = id ?? auto;
  return (
    <ToggleShell htmlFor={controlId} className={className}>
      <input
        ref={ref}
        id={controlId}
        type="radio"
        className={cx(
          'size-4 shrink-0 cursor-pointer appearance-none rounded-full',
          'border border-border-strong bg-surface-sunken',
          'checked:border-accent-strong checked:bg-accent',
          // 选中圆点为 6px（对齐 css/components.css:341-348），用背景图而非
          // inset shadow —— 后者画的是 3px 内环，与层里的小圆点不符。
          'checked:bg-[image:radial-gradient(circle,var(--ef-accent-fg)_0_3px,transparent_3px)]',
        )}
        {...rest}
      />
      {label ? <span>{label}</span> : null}
    </ToggleShell>
  );
});

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, className, id, ...rest },
  ref,
) {
  const auto = useId();
  const controlId = id ?? auto;
  return (
    <ToggleShell htmlFor={controlId} className={className}>
      <input
        ref={ref}
        id={controlId}
        type="checkbox"
        role="switch"
        className={cx(
          // 胶囊圆角对齐 css/components.css:367 的 --ef-radius-pill。
          'relative h-5 w-9 shrink-0 cursor-pointer appearance-none rounded-pill',
          'border border-border-strong bg-surface-sunken',
          'transition-colors duration-250',
          'after:absolute after:left-0.5 after:top-0.5 after:size-3.5 after:rounded-full',
          'after:bg-ink-subtle after:transition-transform after:duration-250',
          'checked:border-accent-strong checked:bg-accent',
          'checked:after:translate-x-4 checked:after:bg-accent-fg',
        )}
        {...rest}
      />
      {label ? <span>{label}</span> : null}
    </ToggleShell>
  );
});
