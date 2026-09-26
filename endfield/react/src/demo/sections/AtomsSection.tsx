import { Section, Demo } from '../Section';
import { Button, IconButton } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Chip, ChipGroup } from '../../components/Chip';
import { Checkbox, Radio, Switch } from '../../components/Toggle';
import { Spinner, Skeleton, Progress, EmptyState } from '../../components/Feedback';
import { Avatar, Divider, Kbd, Tooltip } from '../../components/Misc';
import { IconCheck, IconClose, IconDownload, IconFile, IconSettings } from '../../components/icons';

export function AtomsSection() {
  return (
    <Section
      id="atoms"
      eyebrow="Atoms"
      title="原子组件"
      description="按钮、徽标、标签、开关、反馈与杂项。全部支持明暗双主题与键盘操作。"
    >
      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">按钮</p>
        <Demo>
          <Button variant="primary">主按钮</Button>
          <Button variant="secondary">次按钮</Button>
          <Button variant="ghost">幽灵</Button>
          <Button variant="danger">危险</Button>
          <Button variant="primary" size="sm">小号</Button>
          <Button variant="primary" size="lg">大号</Button>
          <Button variant="primary" loading>载入中</Button>
          <Button variant="primary" icon={<IconDownload />}>带图标</Button>
          <Button variant="primary" disabled>禁用</Button>
          <IconButton label="设置"><IconSettings /></IconButton>
          <IconButton label="关闭"><IconClose /></IconButton>
        </Demo>
      </div>

      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">徽标</p>
        <Demo>
          <Badge>默认</Badge>
          <Badge variant="info">信息</Badge>
          <Badge variant="success">成功</Badge>
          <Badge variant="warn">警告</Badge>
          <Badge variant="danger">错误</Badge>
          <Badge variant="accent">强调</Badge>
          <Badge variant="tier" tier={1}>1</Badge>
          <Badge variant="tier" tier={2}>2</Badge>
          <Badge variant="tier" tier={3}>3</Badge>
          <Badge variant="tier" tier={4}>4</Badge>
          <Badge variant="tier" tier={5}>5</Badge>
          <Badge variant="tier" tier={6}>6</Badge>
        </Demo>
      </div>

      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">标签</p>
        <Demo>
          <ChipGroup label="筛选示例">
            <Chip active>全部</Chip>
            <Chip>选项一</Chip>
            <Chip>选项二</Chip>
            <Chip>选项三</Chip>
          </ChipGroup>
        </Demo>
      </div>

      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">
          复选 / 单选 / 开关
        </p>
        <Demo>
          <Checkbox label="复选项" defaultChecked />
          <Checkbox label="未选中" />
          <Radio label="单选项一" name="demo-radio" defaultChecked />
          <Radio label="单选项二" name="demo-radio" />
          <Switch label="开关（开）" defaultChecked />
          <Switch label="开关（关）" />
        </Demo>
      </div>

      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">
          反馈与杂项
        </p>
        <Demo>
          <Spinner />
          <div className="w-40"><Skeleton height="1rem" /></div>
          <div className="w-40"><Progress value={62} label="完成度" /></div>
          <Kbd>/</Kbd>
          <Avatar fallback="AB" />
          <Avatar size="lg" fallback="CD" />
          <Tooltip content="提示文本"><Button>悬停查看提示</Button></Tooltip>
          <Tooltip content="带图标">
            <IconButton label="确认"><IconCheck /></IconButton>
          </Tooltip>
        </Demo>
      </div>

      <Divider label="空状态" />

      <EmptyState
        icon={<IconFile size={48} />}
        title="暂无内容"
        description="这里还没有任何条目。试试创建第一条，或调整筛选条件。"
        action={<Button variant="primary">创建条目</Button>}
      />
    </Section>
  );
}
