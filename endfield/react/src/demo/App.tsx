import { useState } from 'react';
import { ToastProvider } from '../components/Toast';
import { ThemeToggle } from '../components/ThemeToggle';
import { Button, IconButton } from '../components/Button';
import { SearchBar } from '../components/Input';
import { IconGrid, IconList, IconSettings, IconUser } from '../components/icons';
import { cx } from '../lib/cx';

import { TokensSection } from './sections/TokensSection';
import { TypographySection } from './sections/TypographySection';
import { AtomsSection } from './sections/AtomsSection';
import { FormsSection } from './sections/FormsSection';
import { StructureSection } from './sections/StructureSection';
import { InteractiveSection } from './sections/InteractiveSection';
import { DataSection } from './sections/DataSection';

const NAV = [
  { id: 'tokens', label: '设计令牌', sub: 'Tokens' },
  { id: 'typography', label: '排版尺度', sub: 'Typography' },
  { id: 'atoms', label: '原子组件', sub: 'Atoms' },
  { id: 'forms', label: '表单控件', sub: 'Forms' },
  { id: 'structure', label: '结构组件', sub: 'Structure' },
  { id: 'interactive', label: '交互组件', sub: 'Interactive' },
  { id: 'data', label: '数据展示', sub: 'Data' },
] as const;

export function App() {
  const [active, setActive] = useState<string>('tokens');

  return (
    <ToastProvider>
      <div className="min-h-screen">
        {/* 跳到主内容：spec §9 要求每页首个可聚焦元素是它。 */}
        <a className="ef-skip-link" href="#ef-main">跳到主内容</a>
        <header className="sticky top-0 z-40 border-b border-border bg-surface">
          <div className="top-signal-strip" />
          <div className="flex h-14 items-center gap-4 px-4">
            <span className="font-display text-lg font-bold">◈ Endfield React</span>
            <div className="max-w-lg flex-1">
              <SearchBar placeholder="搜索组件…" aria-label="搜索组件" />
            </div>
            <div className="ml-auto flex items-center gap-1">
              <ThemeToggle />
              <IconButton label="设置"><IconSettings /></IconButton>
              <IconButton label="账户"><IconUser /></IconButton>
            </div>
          </div>
        </header>

        <div className="mx-auto flex max-w-[90rem] gap-6 px-4 py-6">
          {/* 侧栏紧贴顶栏下方：top = var(--ef-header-bar-h) + var(--ef-header-signal-h)
              = 56px + 3px = 59px（对齐 css/layout.css:87）；
              高度取视口减去这 59px 再留 1.5rem 余量，保证不溢出视口。 */}
          <aside className="sticky top-[59px] hidden h-[calc(100vh-59px-1.5rem)] w-56 shrink-0 overflow-y-auto border-r border-border pr-3 lg:block">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-subtle">
              ◆ 章节
            </p>
            <nav aria-label="章节导航">
              {NAV.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setActive(item.id)}
                  aria-current={active === item.id ? 'true' : undefined}
                  className={cx(
                    'relative block rounded-ef-sm px-3 py-2 no-underline transition-colors',
                    active === item.id
                      ? 'bg-surface-muted text-ink'
                      : 'text-ink-muted hover:bg-surface-muted hover:text-ink',
                    active === item.id &&
                      'before:absolute before:inset-y-[30%] before:left-0 before:w-0.5 before:rounded-full before:bg-accent-ink',
                  )}
                >
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-ink-subtle">
                    {item.sub}
                  </span>
                </a>
              ))}
            </nav>
            <p className="mb-2 mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-subtle">
              ◆ 布局
            </p>
            <div className="flex gap-1">
              <IconButton label="网格视图"><IconGrid /></IconButton>
              <IconButton label="列表视图"><IconList /></IconButton>
            </div>
          </aside>

          <main id="ef-main" tabIndex={-1} className="min-w-0 flex-1">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">
                  {'// Component Library'}
                </span>
                <h1 className="m-0 mt-1 font-display text-4xl font-bold">
                  Endfield React 组件库
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-ink-muted">
                  与 HTML/CSS 层令牌同源的 React 组件。按钮与表单控件为函数组件 + forwardRef，
                  展示型容器透传 className 与原生属性；零运行时依赖。
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="primary">主要操作</Button>
                <Button>次要操作</Button>
              </div>
            </div>

            <div className="flex flex-col gap-12">
              <TokensSection />
              <TypographySection />
              <AtomsSection />
              <FormsSection />
              <StructureSection />
              <InteractiveSection />
              <DataSection />
            </div>
          </main>
        </div>

        <footer className="border-t border-border bg-surface px-6 py-8 text-sm text-ink-muted">
          <div className="mx-auto max-w-[90rem]">
            <p className="m-0 text-xs text-ink-subtle">
              Endfield 设计系统 · React 组件库演示站。全部内容为中性占位文案。
            </p>
          </div>
        </footer>
      </div>
    </ToastProvider>
  );
}
