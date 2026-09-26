import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cx } from '../lib/cx';

const FIELD_BASE = cx(
  'w-full rounded-ef border border-border bg-surface-sunken px-3 py-2 text-sm text-ink',
  'transition-colors duration-150 placeholder:text-ink-subtle',
  'hover:border-border-strong',
  'focus:outline-none focus:border-accent-ink focus:bg-surface',
  'focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--ef-accent)_30%,transparent)]',
);

/* 三个属性都写成 `| undefined`：本工程开了 exactOptionalPropertyTypes，
   而这里是必包控件的入口，label/hint/id 都可能显式传 undefined。 */
export interface FieldWrapperProps {
  label?: string | undefined;
  hint?: string | undefined;
  id?: string | undefined;
  children: (id: string) => ReactNode;
}

/** 标签 + 控件 + 提示的通用包裹，负责把 label 与控件用 id 关联。 */
export function Field({ label, hint, id, children }: FieldWrapperProps) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <div className="mb-4 flex flex-col gap-1">
      {label ? (
        <label
          htmlFor={fieldId}
          className="font-mono text-xs uppercase tracking-[0.12em] text-ink-muted"
        >
          {label}
        </label>
      ) : null}
      {children(fieldId)}
      {hint ? <span className="text-xs text-ink-subtle">{hint}</span> : null}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, className, id, ...rest },
  ref,
) {
  const auto = useId();
  const fieldId = id ?? auto;
  const control = (
    <input ref={ref} id={fieldId} className={cx(FIELD_BASE, className)} {...rest} />
  );
  if (!label && !hint) return control;
  return (
    <Field label={label} hint={hint} id={fieldId}>
      {() => control}
    </Field>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, hint, className, id, ...rest }, ref) {
    const auto = useId();
    const fieldId = id ?? auto;
    const control = (
      <textarea
        ref={ref}
        id={fieldId}
        className={cx(FIELD_BASE, 'min-h-24 resize-y leading-normal', className)}
        {...rest}
      />
    );
    if (!label && !hint) return control;
    return (
      <Field label={label} hint={hint} id={fieldId}>
        {() => control}
      </Field>
    );
  },
);

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, className, id, children, ...rest },
  ref,
) {
  const auto = useId();
  const fieldId = id ?? auto;
  const selectClass = cx(FIELD_BASE, 'cursor-pointer pr-8 appearance-none', className);
  /* CSS 层用内联 SVG 数据 URI 画下拉箭头（css/components.css:249）：
     12×8 的折线，stroke-width 1.6，定位 right 0.75rem center。
     数据 URI 读不到 CSS 变量，故层里把颜色写死成 #808080；
     这里改用 --ef-border-strong —— 它在亮色主题下正是 #808080
     （css/tokens.css:164），并随主题变化，属有意改进而非漂移。 */
  const arrow = (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
    >
      <svg viewBox="0 0 12 8" width={12} height={8} fill="none" aria-hidden="true">
        <path d="M1 1l5 5 5-5" stroke="var(--ef-border-strong)" strokeWidth={1.6} />
      </svg>
    </span>
  );
  const control = (
    <span className="relative inline-flex w-full">
      <select ref={ref} id={fieldId} className={selectClass} {...rest}>
        {children}
      </select>
      {arrow}
    </span>
  );

  if (!label && !hint) return control;
  return (
    <Field label={label} hint={hint} id={fieldId}>
      {() => control}
    </Field>
  );
});

export interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  shortcut?: string;
}

/** 带放大镜图标与快捷键提示的搜索框。 */
export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  function SearchBar({ className, shortcut = '/', ...rest }, ref) {
    return (
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute left-3 text-ink-subtle">
          <svg
            viewBox="0 0 16 16"
            width={16}
            height={16}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            aria-hidden="true"
          >
            <circle cx="7" cy="7" r="5" />
            <path d="M11 11l4 4" />
          </svg>
        </span>
        <input
          ref={ref}
          type="search"
          className={cx(FIELD_BASE, 'pl-9 pr-10', className)}
          {...rest}
        />
        {shortcut ? (
          <kbd className="pointer-events-none absolute right-2 rounded-ef-sm border border-border border-b-2 bg-surface-raised px-1.5 font-mono text-[11px] text-ink-muted">
            {shortcut}
          </kbd>
        ) : null}
      </div>
    );
  },
);
