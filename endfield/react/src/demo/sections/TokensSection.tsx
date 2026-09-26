import { Section, Demo } from '../Section';

const SURFACES = [
  ['surface-sunken', '--ef-surface-sunken'],
  ['surface', '--ef-surface'],
  ['surface-muted', '--ef-surface-muted'],
  ['surface-raised', '--ef-surface-raised'],
  ['surface-inverse', '--ef-surface-inverse'],
] as const;

const INKS = [
  ['ink', '--ef-ink'],
  ['ink-muted', '--ef-ink-muted'],
  ['ink-subtle', '--ef-ink-subtle'],
] as const;

const SEMANTIC = [
  ['accent', '--ef-accent'],
  ['accent-strong', '--ef-accent-strong'],
  ['accent-soft', '--ef-accent-soft'],
  ['signal-yellow', '--ef-signal-yellow'],
  ['signal-cyan', '--ef-signal-cyan'],
  ['signal-magenta', '--ef-signal-magenta'],
  ['system', '--ef-system'],
  ['success', '--ef-success'],
  ['warn', '--ef-warn'],
  ['danger', '--ef-danger'],
  ['info', '--ef-info'],
] as const;

const TIERS = [1, 2, 3, 4, 5, 6] as const;

function Swatches({
  items,
  title,
}: {
  items: ReadonlyArray<readonly [string, string]>;
  title: string;
}) {
  return (
    <div>
      <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">{title}</p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3">
        {items.map(([name, token]) => (
          <div key={name} className="border border-border bg-surface-raised">
            <div className="h-12" style={{ background: `var(${token})` }} />
            <div className="px-2 py-1.5">
              <span className="block text-xs font-semibold">{name}</span>
              <span className="block font-mono text-[10px] text-ink-subtle">{token}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TokensSection() {
  return (
    <Section
      id="tokens"
      eyebrow="Design Tokens"
      title="设计令牌"
      description="令牌唯一来源是 endfield/css/tokens.css，经 sync:tokens 同步到本包。切换右上角主题按钮可对比明暗两套值。"
    >
      <Swatches items={SURFACES} title="表面层级" />
      <Swatches items={INKS} title="文字" />
      <Swatches items={SEMANTIC} title="主色 / 信号色 / 语义色" />
      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">
          分级色 1–6
        </p>
        <div className="grid grid-cols-6 gap-3">
          {TIERS.map((t) => (
            <div key={t} className="border border-border bg-surface-raised">
              <div className="h-12" style={{ background: `var(--ef-tier-${t})` }} />
              <div className="px-2 py-1.5 font-mono text-[10px] text-ink-subtle">
                tier-{t}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Demo>
        <span className="text-sm text-ink-muted">
          以上色块直接读取 CSS 变量，未硬编码任何颜色字面量。
        </span>
      </Demo>
    </Section>
  );
}
