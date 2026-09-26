import { useState } from 'react';
import { Section, Demo } from '../Section';
import { Button, IconButton } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Drawer } from '../../components/Drawer';
import { Dropdown, DropdownItem, DropdownSeparator } from '../../components/Dropdown';
import { Tabs } from '../../components/Tabs';
import { useToast } from '../../components/Toast';
import { Input } from '../../components/Input';
import { Chip } from '../../components/Chip';
import { IconSettings, IconUser, IconClose, IconFile } from '../../components/icons';

export function InteractiveSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tab, setTab] = useState('one');
  const toast = useToast();

  return (
    <Section
      id="interactive"
      eyebrow="Interactive"
      title="交互组件"
      description="模态、抽屉、下拉、选项卡与 Toast。全部支持键盘操作与焦点管理。"
    >
      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">
          模态与抽屉
        </p>
        <Demo>
          <Button variant="primary" onClick={() => setModalOpen(true)}>打开模态</Button>
          <Button onClick={() => setDrawerOpen(true)}>打开抽屉</Button>
        </Demo>

        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="模态标题"
          footer={
            <>
              <Button onClick={() => setModalOpen(false)}>取消</Button>
              <Button
                variant="primary"
                onClick={() => {
                  setModalOpen(false);
                  toast('已保存', 'success');
                }}
              >
                确定
              </Button>
            </>
          }
        >
          <p className="m-0 mb-4 text-sm text-ink-muted">
            焦点已进入面板。按 Tab 应在面板内循环，按 Esc 关闭，关闭后焦点回到触发按钮。
          </p>
          <Input label="示例字段" placeholder="输入点东西" />
        </Modal>

        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="抽屉标题">
          <p className="m-0 mb-4 text-sm text-ink-muted">从右侧滑入的面板，Esc 可关闭。</p>
          <Button variant="primary" onClick={() => setDrawerOpen(false)}>关闭</Button>
        </Drawer>
      </div>

      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">下拉菜单</p>
        <Demo>
          <Dropdown
            trigger={<Button icon={<IconSettings />}>操作</Button>}
          >
            <DropdownItem icon={<IconUser />}>个人资料</DropdownItem>
            <DropdownItem icon={<IconFile />}>导出数据</DropdownItem>
            <DropdownSeparator />
            <DropdownItem>退出登录</DropdownItem>
          </Dropdown>
          <Dropdown
            trigger={<IconButton label="更多"><IconSettings /></IconButton>}
          >
            <DropdownItem>菜单项一</DropdownItem>
            <DropdownItem>菜单项二</DropdownItem>
          </Dropdown>
        </Demo>
      </div>

      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">
          选项卡（受控）
        </p>
        <div className="border border-border bg-surface-raised p-4">
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { id: 'one', label: '选项卡一', content: <p className="m-0 text-sm text-ink-muted">第一个面板的内容。</p> },
              { id: 'two', label: '选项卡二', content: <p className="m-0 text-sm text-ink-muted">第二个面板的内容。</p> },
              { id: 'three', label: '选项卡三', content: <p className="m-0 text-sm text-ink-muted">第三个面板的内容。</p> },
            ]}
          />
          <p className="mb-0 mt-3 font-mono text-xs text-ink-subtle">当前选中：{tab}</p>
        </div>
      </div>

      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">Toast</p>
        <Demo>
          <Button onClick={() => toast('这是一条信息提示', 'info')}>信息</Button>
          <Button onClick={() => toast('操作已成功完成', 'success')}>成功</Button>
          <Button onClick={() => toast('请注意检查输入', 'warn')}>警告</Button>
          <Button onClick={() => toast('请求失败，请重试', 'danger')}>错误</Button>
        </Demo>
      </div>

      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-subtle">
          className 覆盖（拿不准就用 !）
        </p>
        <Demo>
          <Button variant="primary">默认内边距</Button>
          <Button variant="primary" className="px-10 py-6">覆盖为 px-10 py-6</Button>
          <Button variant="primary" className="p-8">无 ! 覆盖 p-8（不生效）</Button>
          <Button variant="primary" className="p-8!">加 ! 覆盖 p-8!</Button>
          <Button variant="secondary" className="bg-danger!">secondary + bg-danger!</Button>
          <Chip className="rounded-none!">Chip + rounded-none!</Chip>
          {/* size-12 在 IconButton 上不生效（内置 w-8/h-8 后发射），在 Button 上却生效
              （按钮没有 w-8/h-8 与之竞争）—— 同一个 class 换个组件结果相反。
              两个 48px 宽的按钮只放短标签，避免文字溢出干扰肉眼核对。 */}
          <IconButton label="尺寸无 !（不生效）" className="size-12"><IconClose /></IconButton>
          <Button variant="primary" className="size-12">尺寸</Button>
          <IconButton label="尺寸加 !" className="size-12!"><IconClose /></IconButton>
        </Demo>
      </div>
    </Section>
  );
}
