import { Section } from '../Section';
import { Panel, PanelHeader, PanelTitle, PanelBody, PanelFooter } from '../../components/Panel';
import { Card, CardMedia, CardBody, CardTitle, CardMeta, ItemCard, Stat, StatCard } from '../../components/Card';
import { Callout } from '../../components/Callout';
import { Accordion, AccordionItem } from '../../components/Accordion';
import { Breadcrumb, FilterRow, InfoGrid } from '../../components/Nav';
import { Chip, ChipGroup } from '../../components/Chip';
import { Badge, type Tier } from '../../components/Badge';
import { Button } from '../../components/Button';
import { IconActivity, IconFile, IconTrend, IconUser } from '../../components/icons';

const TIERS: Tier[] = [1, 2, 3, 4, 5, 6];

export function StructureSection() {
  return (
    <Section
      id="structure"
      eyebrow="Structure"
      title="结构组件"
      description="面板、卡片、提示块、折叠面板与导航元素。这些是页面级组合的基本单元。"
    >
      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">面板</p>
        <Panel>
          <PanelHeader>
            <PanelTitle>面板标题</PanelTitle>
            <Badge variant="info">3</Badge>
          </PanelHeader>
          <PanelBody>
            <p className="m-0 text-sm text-ink-muted">面板主体内容。</p>
          </PanelBody>
          <PanelFooter>
            <Button size="sm">取消</Button>
            <Button size="sm" variant="primary">保存</Button>
          </PanelFooter>
        </Panel>
      </div>

      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">统计</p>
        <div className="flex flex-wrap items-center gap-10 border border-border bg-surface-raised p-6">
          <Stat value="7,256" label="条目" sub="Articles" />
          <Stat value="63,593" label="次修订" sub="Revisions" />
          <Stat value="18" label="位编辑者" sub="Editors" />
        </div>
        <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-3">
          <StatCard icon={<IconFile />} value="7,256" label="总条目" />
          <StatCard icon={<IconTrend />} value="+128" label="本周新增" glow />
          <StatCard icon={<IconActivity />} value="63,593" label="总修订" />
          <StatCard icon={<IconUser />} value="18" label="活跃编辑者" />
        </div>
      </div>

      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">
          条目卡（分级条随 tier 变化）
        </p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3">
          {TIERS.map((t, i) => (
            <ItemCard
              key={t}
              href="#structure"
              tier={t}
              index={String(i + 1).padStart(2, '0')}
              name={`条目名称${t}`}
              sub={`// Item ${t}`}
              icons={<Badge variant="tier" tier={t}>{t}</Badge>}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">内容卡</p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-4">
          <Card>
            <CardMedia className="flex items-center justify-center text-sm text-ink-subtle">
              封面占位
            </CardMedia>
            <CardBody>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-subtle">
                2026.09.24
              </span>
              <CardTitle>卡片标题</CardTitle>
              <CardMeta>示例摘要文本，用于演示卡片布局。</CardMeta>
            </CardBody>
          </Card>
        </div>
      </div>

      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">提示块</p>
        <Callout variant="info" title="提示">
          这是一条信息提示，用于补充说明。
        </Callout>
        <Callout variant="success" title="成功">
          操作已成功完成。
        </Callout>
        <Callout variant="warn" title="注意">
          请确认后再继续，此操作可能影响其他数据。
        </Callout>
        <Callout variant="danger" title="错误">
          请求失败，请稍后重试。
        </Callout>
      </div>

      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">折叠面板</p>
        <Accordion>
          <AccordionItem title="第一项（默认展开）" defaultOpen>
            折叠内容一。使用原生 details 元素，无 JavaScript 时仍可展开。
          </AccordionItem>
          <AccordionItem title="第二项">折叠内容二。</AccordionItem>
          <AccordionItem title="第三项">折叠内容三。</AccordionItem>
        </Accordion>
      </div>

      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">导航元素</p>
        <Breadcrumb
          items={[
            { label: '首页', href: '#structure' },
            { label: '条目列表', href: '#structure' },
            { label: '条目名称一' },
          ]}
        />
        <div className="border border-border bg-surface-raised p-4">
          <FilterRow label="类别">
            <ChipGroup>
              <Chip active>全部</Chip>
              <Chip>类别一</Chip>
              <Chip>类别二</Chip>
            </ChipGroup>
          </FilterRow>
          <FilterRow label="等级">
            <ChipGroup>
              <Chip active>全部</Chip>
              {TIERS.map((t) => (
                <Chip key={t}>{t} 级</Chip>
              ))}
            </ChipGroup>
          </FilterRow>
        </div>
        <div className="mt-3 border border-border bg-surface-raised p-4">
          <InfoGrid
            items={[
              { key: '类别', value: '类别一' },
              { key: '等级', value: '4' },
              { key: '属性', value: '示例属性' },
              { key: '状态', value: '可用' },
              { key: '更新', value: '2026.09.24' },
              { key: '编辑者', value: '示例编辑者' },
            ]}
          />
        </div>
      </div>
    </Section>
  );
}
