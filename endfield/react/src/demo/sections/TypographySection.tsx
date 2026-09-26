import { Section, Demo } from '../Section';
import { Divider } from '../../components/Misc';

const SCALE = [
  ['text-6xl', 'text-6xl'],
  ['text-5xl', 'text-5xl'],
  ['text-4xl', 'text-4xl'],
  ['text-3xl', 'text-3xl'],
  ['text-2xl', 'text-2xl'],
  ['text-xl', 'text-xl'],
  ['text-lg', 'text-lg'],
  ['text-base', 'text-base'],
  ['text-sm', 'text-sm'],
  ['text-xs', 'text-xs'],
] as const;

export function TypographySection() {
  return (
    <Section
      id="typography"
      eyebrow="Typography"
      title="排版尺度"
      description="拉丁与数字用等宽字体（JetBrains Mono 回退栈），中文用无衬线栈。大写拉丁标签一律加字距。"
    >
      <div className="flex flex-col gap-3">
        {SCALE.map(([name, token]) => (
          <div key={name} className="flex items-baseline gap-4 border-b border-border pb-2">
            <span className="w-24 shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-subtle">
              {name}
            </span>
            <span
              className="font-display font-bold"
              style={{ fontSize: `var(--ef-${token})`, lineHeight: 1.15 }}
            >
              档案库 Archive
            </span>
          </div>
        ))}
      </div>

      <Divider label="字距" />

      <Demo>
        <span className="font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">
          tracking-caps .12em
        </span>
        <span className="font-mono text-xs uppercase tracking-[0.16em] text-ink-subtle">
          tracking-caps-lg .16em
        </span>
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-ink-subtle">
          tracking-caps-xl .2em
        </span>
      </Demo>
    </Section>
  );
}
