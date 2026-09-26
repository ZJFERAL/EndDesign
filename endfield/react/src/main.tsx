import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tailwind.css';
import {
  Button, Badge, Chip, ChipGroup,
  Panel, PanelHeader, PanelTitle, PanelBody, PanelFooter,
  SectionHeader,
  Card, CardMedia, CardBody, CardTitle, CardMeta, ItemCard, Stat, StatCard,
  Callout,
  Table, THead, TBody, TR, TH, TD,
  Timeline, TimelineItem, TimelineTitle,
  Accordion, AccordionItem,
  Breadcrumb, Pagination, FilterRow, InfoGrid, TOC,
  IconActivity, IconBell, IconClock, IconDownload, IconFile, IconGrid,
  IconLock, IconSearch, IconSettings, IconTrend, IconUser,
  type Tier,
} from './index';

const TIERS: Tier[] = [1, 2, 3, 4, 5, 6];

function Probe() {
  const [page, setPage] = useState(3);
  const [sort, setSort] = useState<'asc' | 'desc' | undefined>(undefined);
  const [lastPageEvent, setLastPageEvent] = useState<number | null>(null);
  const [toggleCount, setToggleCount] = useState(0);
  const onAccordionToggle = () => setToggleCount((n) => n + 1);

  return (
    <main className="grid gap-8 p-8">
      <SectionHeader
        eyebrow="structural components"
        title="结构组件实测"
        actions={<Button variant="secondary" size="sm">操作</Button>}
      />

      {/* ---------- Panel ---------- */}
      <Panel cornerFrame data-probe="panel">
        <PanelHeader>
          <PanelTitle>面板标题</PanelTitle>
          <Badge variant="accent">PROBE</Badge>
        </PanelHeader>
        <PanelBody>
          <p>面板主体内容。cornerFrame 打开，四角应出现括号。</p>
        </PanelBody>
        <PanelFooter>
          <Button variant="primary" size="sm">确认</Button>
          <Button variant="ghost" size="sm">取消</Button>
        </PanelFooter>
      </Panel>

      {/* ---------- Card 族 ---------- */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card data-probe="card">
          <CardMedia data-probe="card-media" />
          <CardBody>
            <CardTitle>普通卡片</CardTitle>
            <CardMeta data-probe="card-meta">CardMeta 副文本</CardMeta>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <CardTitle>无图卡片</CardTitle>
            <CardMeta>只有 CardBody</CardMeta>
          </CardBody>
        </Card>
      </div>

      {/* ---------- 6 张不同 tier 的 ItemCard ---------- */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" data-probe="itemcards">
        {TIERS.map((tier, i) => (
          <ItemCard
            key={tier}
            href="#item"
            index={String(i + 1).padStart(2, '0')}
            name={`条目 ${tier}`}
            sub={`ITEM-${tier}`}
            tier={tier}
            icons={<IconTrend size={14} />}
            media={<span className="grid h-full place-items-center text-ink-subtle"><IconFile size={32} /></span>}
          />
        ))}
      </div>

      {/* ---------- className 覆盖实测（Review Focus 第 1 条） ----------
          className 拼在内置类之后只是必要条件：同一个 CSS 属性上 Tailwind 按
          自己的规范顺序发射，后发射的赢。这里并排渲染四种写法实测谁赢。 */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" data-probe="override">
        <ItemCard data-probe="override-plain" name="内置" sub="baseline" />
        <ItemCard data-probe="override-radius" className="rounded-pill" name="rounded-pill" sub="无 !" />
        <ItemCard data-probe="override-bg" className="bg-danger" name="bg-danger" sub="无 !" />
        <ItemCard data-probe="override-bg-bang" className="bg-danger!" name="bg-danger!" sub="有 !" />
      </div>

      {/* ---------- Stat 组 ---------- */}
      <div className="grid grid-cols-3 gap-4" data-probe="stats">
        <Stat value="128" label="记录" sub="records" />
        <Stat value="42.7%" label="覆盖率" />
        <Stat value="9" label="待处理" sub="pending" />
      </div>

      {/* ---------- 4 个 StatCard，其一带 glow ---------- */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-probe="statcards">
        <StatCard icon={<IconActivity />} value="1,024" label="事件总数" />
        <StatCard data-probe="glow-card" icon={<IconTrend />} value="+18%" label="增长率" glow />
        <StatCard icon={<IconClock />} value="3h 12m" label="平均耗时" />
        <StatCard icon={<IconLock />} value="6" label="权限组" />
      </div>

      {/* ---------- 4 种 Callout ---------- */}
      <div data-probe="callouts">
        <Callout variant="info" title="info">信息提示：左侧色条与标题应为蓝色。</Callout>
        <Callout variant="warn" title="warn">警告提示：左侧色条与标题应为橙色。</Callout>
        <Callout variant="danger" title="danger">危险提示：左侧色条与标题应为红色。</Callout>
        <Callout variant="success" title="success">成功提示：左侧色条与标题应为青色。</Callout>
      </div>

      {/* ---------- Table（含可排序表头） ---------- */}
      <Table data-probe="table">
        <THead>
          <TR>
            <TH {...(sort !== undefined ? { sort } : {})} onSort={() => setSort(sort === 'asc' ? 'desc' : 'asc')}>名称</TH>
            <TH>等级</TH>
            <TH>数量</TH>
          </TR>
        </THead>
        <TBody>
          {[1, 2, 3].map((n) => (
            <TR key={n}>
              <TD>条目 {n}</TD>
              <TD><Badge variant="tier" tier={n as Tier}>{n}</Badge></TD>
              <TD>{n * 100}</TD>
            </TR>
          ))}
        </TBody>
      </Table>

      {/* ---------- Timeline（5 项，其一 accent） ---------- */}
      <Timeline data-probe="timeline">
        <TimelineItem time="2026-09-20" dateTime="2026-09-20">
          <TimelineTitle href="#data">初始版本</TimelineTitle> 发布。
        </TimelineItem>
        <TimelineItem time="2026-09-21" dateTime="2026-09-21">补充说明。</TimelineItem>
        <TimelineItem time="2026-09-22" dateTime="2026-09-22" accent>
          <TimelineTitle href="#data">重点修订</TimelineTitle>，节点应为主色。
        </TimelineItem>
        <TimelineItem time="2026-09-23" dateTime="2026-09-23">小幅调整。</TimelineItem>
        <TimelineItem time="2026-09-24" dateTime="2026-09-24">归档。</TimelineItem>
      </Timeline>

      {/* ---------- Accordion（3 项） ----------
          Accordion / AccordionItem 现在透传原生属性，故可直接挂 data-probe。
          item 2 传 onToggle（DetailsHTMLAttributes 提供，HTMLAttributes 没有）
          与 name（原生独占分组），并把 toggle 次数打印到探针里。 */}
      <div data-probe="accordion">
        <Accordion data-probe="accordion-root" data-forwarded="root">
          <AccordionItem title="第一项" defaultOpen data-forwarded="item1">第一项内容，默认展开。</AccordionItem>
          <AccordionItem
            title="第二项"
            data-probe="accordion-item-2"
            data-forwarded="item2"
            name="probe-group"
            onToggle={onAccordionToggle}
          >
            第二项内容，默认关闭。
          </AccordionItem>
          <AccordionItem title="第三项" name="probe-group" data-probe="accordion-item-3">第三项内容，默认关闭。</AccordionItem>
        </Accordion>
        <p data-probe="accordion-toggle-state" className="m-0 mt-2 font-mono text-xs text-ink-subtle">
          toggles={toggleCount}
        </p>
      </div>

      {/* ---------- Breadcrumb ---------- */}
      <Breadcrumb
        data-probe="breadcrumb"
        items={[
          { label: '首页', href: '#home' },
          { label: '文档', href: '#docs' },
          { label: '结构组件' },
        ]}
      />

      {/* ---------- Pagination ---------- */}
      <div>
        <Pagination
          data-probe="pagination"
          page={page}
          total={10}
          onChange={(p) => { setLastPageEvent(p); setPage(p); }}
        />
        <p data-probe="page-state" className="m-0 mt-2 font-mono text-xs text-ink-subtle">
          page={page} lastEvent={lastPageEvent === null ? 'null' : lastPageEvent}
        </p>
      </div>

      {/* ---------- FilterRow + ChipGroup ---------- */}
      <div data-probe="filters">
        <FilterRow label="分类">
          <ChipGroup label="分类">
            <Chip active>全部</Chip>
            <Chip>武器</Chip>
            <Chip>装备</Chip>
            <Chip>材料</Chip>
          </ChipGroup>
        </FilterRow>
        <FilterRow label="稀有度">
          <ChipGroup label="稀有度">
            {TIERS.map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </ChipGroup>
        </FilterRow>
      </div>

      {/* ---------- InfoGrid（6 项） ---------- */}
      <InfoGrid
        data-probe="infogrid"
        items={[
          { key: 'ID', value: 'EF-0001' },
          { key: '类型', value: '武器' },
          { key: '等级', value: <Badge variant="tier" tier={5}>5</Badge> },
          { key: '来源', value: '制造台' },
          { key: '稀有度', value: '★★★★★' },
          { key: '状态', value: '已归档' },
        ]}
      />

      {/* ---------- TOC（5 项，其一带 sub 且 activeId 命中） ---------- */}
      <TOC
        data-probe="toc"
        activeId="usage"
        items={[
          { id: 'intro', label: '简介' },
          { id: 'install', label: '安装' },
          { id: 'usage', label: '用法' },
          { id: 'usage-1', label: '基础示例', sub: true },
          { id: 'api', label: 'API' },
        ]}
      />

      <div className="flex flex-wrap items-center gap-3 text-ink-subtle">
        <IconSearch />
        <IconSettings />
        <IconBell />
        <IconGrid />
        <IconDownload />
        <IconUser />
      </div>
    </main>
  );
}

const container = document.getElementById('root');
if (!container) throw new Error('找不到 #root 容器');
createRoot(container).render(<StrictMode><Probe /></StrictMode>);
