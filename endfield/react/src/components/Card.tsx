import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../lib/cx';
import type { Tier } from './Badge';

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx('flex flex-col overflow-hidden border border-border bg-surface-raised', className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardMedia({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx('aspect-video overflow-hidden bg-surface-muted', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx('flex min-w-0 flex-col gap-1 px-4 pb-4 pt-3', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cx('m-0 text-base font-semibold [overflow-wrap:anywhere]', className)} {...rest}>
      {children}
    </h3>
  );
}

export function CardMeta({ className, children, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cx('m-0 text-xs text-ink-subtle', className)} {...rest} />;
}

/* 同时 Omit 掉 children 与 media：`AnchorHTMLAttributes` 已声明
   `media?: string`（媒体查询描述符），与本卡片的 `media?: ReactNode`（图上内容）
   同名不同义，不 Omit 会 TS2430。 */
export interface ItemCardProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'media'> {
  name: string;
  sub?: string;
  /** 图上角的水印编号，如 "01"。 */
  index?: string;
  tier?: Tier;
  icons?: ReactNode;
  media?: ReactNode;
}

/** 数据卡：图像 + 名称 + 英文副名 + 图标组 + 底部分级条。强制直角。 */
export function ItemCard({
  name,
  sub,
  index,
  tier,
  icons,
  media,
  className,
  style,
  ...rest
}: ItemCardProps) {
  return (
    <a
      className={cx(
        'flex flex-col overflow-hidden rounded-none border border-border bg-surface-raised',
        'text-inherit no-underline transition duration-150',
        'hover:-translate-y-0.5 hover:border-accent-ink',
        className,
      )}
      /* 等级用 data-tier 属性而非内联样式（规格 §5.12）：属性由 tailwind.css 的
         [data-tier="N"] 规则产出 --ef-tier-color 与 --ef-tier-ink，
         子元素 .tier-strip 从祖先继承前者。 */
      data-tier={tier !== undefined ? String(tier) : undefined}
      style={style}
      {...rest}
    >
      <div className="relative aspect-square overflow-hidden bg-surface-muted">
        {index ? (
          <span className="absolute left-2 top-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-subtle">
            # {index}
          </span>
        ) : null}
        {media}
      </div>
      <div className="flex min-w-0 items-center gap-2 px-3 py-2">
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold [overflow-wrap:anywhere]">{name}</span>
          {sub ? (
            <span className="block font-mono text-[10px] tracking-wide text-ink-subtle [overflow-wrap:anywhere]">
              {sub}
            </span>
          ) : null}
        </span>
        {icons ? <span className="flex shrink-0 items-center gap-1">{icons}</span> : null}
      </div>
      <div className="tier-strip mt-auto" />
    </a>
  );
}

export interface StatProps extends HTMLAttributes<HTMLDivElement> {
  value: ReactNode;
  label: string;
  sub?: string;
}

export function Stat({ value, label, sub, className, ...rest }: StatProps) {
  return (
    <div className={cx('flex flex-col items-center gap-0.5 text-center', className)} {...rest}>
      <span className="font-mono text-3xl font-bold leading-none tabular-nums text-accent-ink">
        {value}
      </span>
      <span className="text-sm font-medium text-ink">{label}</span>
      {sub ? (
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-subtle">
          {sub}
        </span>
      ) : null}
    </div>
  );
}

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  value: ReactNode;
  label: string;
  /** 加内阴影辉光。 */
  glow?: boolean;
}

export function StatCard({
  icon,
  value,
  label,
  glow = false,
  className,
  ...rest
}: StatCardProps) {
  return (
    <div
      className={cx(
        'flex items-center gap-3 border border-border bg-surface-raised p-4',
        glow && 'shadow-[inset_0_0_20px_-4px_color-mix(in_srgb,var(--ef-accent-glow)_60%,transparent)]',
        className,
      )}
      {...rest}
    >
      {icon ? (
        <span className="chamfer-sm inline-flex size-10 shrink-0 items-center justify-center bg-surface-muted text-accent-ink">
          {icon}
        </span>
      ) : null}
      <span className="min-w-0">
        <span className="block font-mono text-2xl font-bold leading-tight tabular-nums">
          {value}
        </span>
        <span className="block text-xs text-ink-muted">{label}</span>
      </span>
    </div>
  );
}
