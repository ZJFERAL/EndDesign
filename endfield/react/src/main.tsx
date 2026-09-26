import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tailwind.css';
import {
  Button, IconButton, Input, Textarea, Select, SearchBar,
  Badge, Chip, ChipGroup, Checkbox, Radio, Switch,
  Spinner, Skeleton, Progress, EmptyState,
  Divider, Kbd, Avatar, Tooltip,
  IconSearch, IconSettings, IconCheck, IconFile,
} from './index';

function Probe() {
  return (
    <main className="grid gap-6 p-8">
      <div className="flex flex-wrap gap-2">
        <Button variant="primary">主按钮</Button>
        <Button variant="secondary">次按钮</Button>
        <Button variant="ghost">幽灵</Button>
        <Button variant="danger">危险</Button>
        <Button variant="primary" size="sm">小</Button>
        <Button variant="primary" size="lg">大</Button>
        <Button variant="primary" loading>载入中</Button>
        <Button variant="primary" icon={<IconCheck />}>带图标</Button>
        <IconButton label="设置"><IconSettings /></IconButton>
      </div>

      <div className="max-w-md">
        <Input label="用户名" placeholder="请输入" hint="必填项" />
        <Textarea label="简介" placeholder="多行文本" />
        <Select label="语言" defaultValue="zh">
          <option value="zh">简体中文</option>
          <option value="en">English</option>
        </Select>
        <SearchBar placeholder="搜索…" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge>默认</Badge>
        <Badge variant="info">信息</Badge>
        <Badge variant="success">成功</Badge>
        <Badge variant="warn">警告</Badge>
        <Badge variant="danger">错误</Badge>
        <Badge variant="accent">强调</Badge>
        <Badge variant="tier" tier={1}>1</Badge>
        <Badge variant="tier" tier={4}>4</Badge>
        <Badge variant="tier" tier={6}>6</Badge>
      </div>

      <ChipGroup label="筛选">
        <Chip active>全部</Chip>
        <Chip>选项一</Chip>
        <Chip>选项二</Chip>
      </ChipGroup>

      <div className="flex flex-wrap items-center gap-4">
        <Checkbox label="复选" defaultChecked />
        <Radio label="单选" name="r" defaultChecked />
        <Radio label="单选二" name="r" />
        <Switch label="开关" defaultChecked />
      </div>

      <div className="flex items-center gap-4">
        <Spinner />
        <div className="w-40"><Skeleton height="1rem" /></div>
        <div className="w-40"><Progress value={45} label="进度" /></div>
        <Kbd>/</Kbd>
        <Avatar fallback="AB" />
        <Avatar size="lg" fallback="CD" />
        <Tooltip content="提示文本"><Button>悬停我</Button></Tooltip>
        <IconSearch />
        <IconFile size={24} />
      </div>

      <Divider label="分隔" />
      <EmptyState icon={<IconFile size={48} />} title="暂无内容" description="试试别的关键词" action={<Button variant="primary">返回</Button>} />

      {/* className 覆盖实测（Review Focus 第 1 条）：
          className 拼在内置类之后只是必要条件 —— 同一个 CSS 属性上，Tailwind
          按自己的规范顺序发射，后发射的赢，而这个顺序使用方看不到也控制不了。
          所以同一个 class 在不同组件上结果可能相反，拿不准就用 ! 修饰符。 */}
      <Button variant="primary" className="rounded-none">覆盖圆角（primary，应生效）</Button>
      <Button variant="primary" className="bg-danger">覆盖底色（primary，应生效）</Button>
      {/* 对照：同一个 bg-danger 在 secondary / ghost / Chip 上会被内置的
          bg-transparent / bg-surface-muted 压掉（它们发射更晚）。 */}
      <Button variant="secondary" className="bg-danger">覆盖底色（secondary，预期不生效）</Button>
      <Button variant="ghost" className="bg-danger">覆盖底色（ghost，预期不生效）</Button>
      <Chip className="bg-danger">覆盖底色（Chip，预期不生效）</Chip>
      <Chip className="rounded-none">覆盖圆角（Chip，预期不生效）</Chip>
      <Button variant="primary" className="p-8">覆盖内边距（无 !，预期不生效）</Button>
      {/* 加 ! 后全部生效：!important 绕过发射顺序。 */}
      <Button variant="primary" className="p-8!">覆盖内边距（!，应生效）</Button>
      <Button variant="secondary" className="bg-danger!">覆盖底色（secondary + !，应生效）</Button>
      <Chip className="bg-danger!">覆盖底色（Chip + !，应生效）</Chip>
      <Chip className="rounded-none!">覆盖圆角（Chip + !，应生效）</Chip>
    </main>
  );
}

const container = document.getElementById('root');
if (!container) throw new Error('找不到 #root 容器');
createRoot(container).render(<StrictMode><Probe /></StrictMode>);
