import { useState } from 'react';
import { Section } from '../Section';
import { Table, THead, TBody, TR, TH, TD } from '../../components/Table';
import { Timeline, TimelineItem, TimelineTitle } from '../../components/Timeline';
import { TOC, Pagination } from '../../components/Nav';
import { Badge, type Tier } from '../../components/Badge';

const ROWS = [
  ['条目名称一', '类别一', 6, 128, '2026.09.24'],
  ['条目名称二', '类别二', 5, 96, '2026.09.23'],
  ['条目名称三', '类别一', 4, 74, '2026.09.22'],
  ['条目名称四', '类别三', 3, 52, '2026.09.21'],
  ['条目名称五', '类别二', 2, 31, '2026.09.20'],
] as const;

export function DataSection() {
  const [page, setPage] = useState(3);

  return (
    <Section
      id="data"
      eyebrow="Data"
      title="数据展示"
      description="表格、时间线、目录与分页。表格在窄屏可横向滚动。"
    >
      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">
          表格（可排序表头）
        </p>
        <Table>
          <THead>
            <TR>
              <TH>条目</TH>
              <TH>类别</TH>
              <TH>等级</TH>
              <TH onSort={() => {}} sort="desc">修订数</TH>
              <TH>最近更新</TH>
            </TR>
          </THead>
          <TBody>
            {ROWS.map((row) => (
              <TR key={row[0]}>
                <TD className="font-semibold">{row[0]}</TD>
                <TD>{row[1]}</TD>
                <TD>
                  {/* 等级列含 2–6 全档，故断言为 Tier 而非字面量子集（任务书里的
                      `as 3 | 4 | 5 | 6` 与 ROWS 中的 2 冲突，strict 下是 TS2352）。 */}
                  <Badge variant="tier" tier={row[2] as Tier}>{row[2]}</Badge>
                </TD>
                <TD className="font-mono tabular-nums">{row[3]}</TD>
                <TD className="font-mono text-xs text-ink-subtle">{row[4]}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_14rem]">
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">
            时间线
          </p>
          <Timeline>
            <TimelineItem time="2026/9/24 11:35:14" dateTime="2026-09-24T11:35:14" accent>
              <TimelineTitle href="#data">条目名称一</TimelineTitle>{' '}
              <Badge variant="success">+128</Badge> <Badge variant="danger">−42</Badge>
              <p className="m-0 mt-0.5 text-xs text-ink-subtle">
                编辑：示例编辑者 · 摘要：更新条目档案
              </p>
            </TimelineItem>
            <TimelineItem time="2026/9/24 09:12:03" dateTime="2026-09-24T09:12:03">
              <TimelineTitle href="#data">条目名称二</TimelineTitle>{' '}
              <Badge variant="success">+64</Badge>
              <p className="m-0 mt-0.5 text-xs text-ink-subtle">
                编辑：示例编辑者 · 摘要：修正数值
              </p>
            </TimelineItem>
            <TimelineItem time="2026/9/23 18:40:55" dateTime="2026-09-23T18:40:55">
              <TimelineTitle href="#data">条目名称三</TimelineTitle>{' '}
              <Badge variant="warn">±0</Badge>
              <p className="m-0 mt-0.5 text-xs text-ink-subtle">
                编辑：示例编辑者 · 摘要：调整格式
              </p>
            </TimelineItem>
          </Timeline>
        </div>

        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">目录</p>
          <TOC
            title="本页目录"
            activeId="data"
            items={[
              { id: 'tokens', label: '设计令牌' },
              { id: 'typography', label: '排版尺度' },
              { id: 'atoms', label: '原子组件' },
              { id: 'structure', label: '结构组件' },
              { id: 'data', label: '数据展示' },
              { id: 'data-sub', label: '表格', sub: true },
            ]}
          />
        </div>
      </div>

      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">
          分页（受控，当前第 {page} 页）
        </p>
        <Pagination page={page} total={10} onChange={setPage} />
      </div>
    </Section>
  );
}
