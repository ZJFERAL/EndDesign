import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tailwind.css';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownSeparator,
  Drawer,
  Modal,
  Panel,
  PanelBody,
  PanelHeader,
  PanelTitle,
  SectionHeader,
  Tabs,
  ThemeToggle,
  ToastProvider,
  useToast,
  IconChevronDown,
  IconDownload,
  IconSettings,
} from './index';

const TABS = [
  { id: 'overview', label: '总览', content: <p className="m-0">总览面板内容。</p> },
  { id: 'stats', label: '统计', content: <p className="m-0">统计面板内容。</p> },
  { id: 'logs', label: '日志', content: <p className="m-0">日志面板内容。</p> },
];

function ToastTrigger() {
  const toast = useToast();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        data-probe="toast-btn"
        variant="primary"
        onClick={() => toast('已保存', 'success')}
      >
        触发 Toast
      </Button>
      <Button
        data-probe="toast-btn-danger"
        variant="danger"
        onClick={() => toast('出错了', 'danger')}
      >
        触发 danger Toast
      </Button>
      <Button
        data-probe="toast-btn-info"
        variant="secondary"
        onClick={() => toast('提示', 'info')}
      >
        触发 info Toast
      </Button>
    </div>
  );
}

function Probe() {
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLeftOpen, setDrawerLeftOpen] = useState(false);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overridePlainOpen, setOverridePlainOpen] = useState(false);
  const [controlled, setControlled] = useState('stats');

  return (
    <main className="grid gap-8 p-8">
      <SectionHeader
        eyebrow="interactive components"
        title="交互组件实测"
        actions={<ThemeToggle />}
      />

      <Panel>
        <PanelHeader>
          <PanelTitle>浮层</PanelTitle>
        </PanelHeader>
        <PanelBody>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              data-probe="modal-trigger"
              variant="primary"
              onClick={() => setModalOpen(true)}
            >
              打开 Modal
            </Button>
            <Button
              data-probe="drawer-trigger"
              variant="secondary"
              onClick={() => setDrawerOpen(true)}
            >
              打开 Drawer
            </Button>
            <Button
              data-probe="drawer-left-trigger"
              variant="ghost"
              onClick={() => setDrawerLeftOpen(true)}
            >
              打开左 Drawer
            </Button>
            <Button
              data-probe="modal-override-trigger"
              variant="ghost"
              onClick={() => setOverrideOpen(true)}
            >
              打开 className 覆盖 Modal
            </Button>
            <Button
              data-probe="modal-override-plain-trigger"
              variant="ghost"
              onClick={() => setOverridePlainOpen(true)}
            >
              打开 className 无 ! Modal
            </Button>

            <div data-probe="dropdown-wrap">
              <Dropdown
                trigger={
                  <Button data-probe="dropdown-trigger" icon={<IconChevronDown />}>
                    菜单
                  </Button>
                }
              >
                <DropdownItem
                  data-probe="dropdown-item-1"
                  icon={<IconSettings />}
                  onClick={() => undefined}
                >
                  设置
                </DropdownItem>
                <DropdownSeparator />
                <DropdownItem
                  data-probe="dropdown-item-2"
                  icon={<IconDownload />}
                  onClick={() => undefined}
                >
                  导出
                </DropdownItem>
              </Dropdown>
            </div>

            <ToastTrigger />
          </div>
        </PanelBody>
      </Panel>

      <div data-probe="tabs-uncontrolled">
        <Tabs items={TABS} />
      </div>

      <div data-probe="tabs-controlled">
        <Tabs
          items={TABS}
          value={controlled}
          onChange={setControlled}
        />
        <p
          data-probe="controlled-state"
          className="m-0 mt-2 font-mono text-xs text-ink-subtle"
        >
          controlled={controlled}
        </p>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="模态标题"
        footer={
          <>
            <Button data-probe="modal-cancel" onClick={() => setModalOpen(false)}>
              取消
            </Button>
            <Button
              data-probe="modal-confirm"
              variant="primary"
              onClick={() => setModalOpen(false)}
            >
              确认
            </Button>
          </>
        }
      >
        <p className="m-0">
          模态主体内容。焦点应进入面板，Tab 在面板内循环，Esc 关闭并归还焦点。
        </p>
      </Modal>

      <Modal
        open={overridePlainOpen}
        onClose={() => setOverridePlainOpen(false)}
        title="无 ! 覆盖 Modal"
        className="max-w-[20rem] bg-surface-muted"
      >
        <p className="m-0">className 无 ! 实测：max-w-[20rem] 与 bg-surface-muted 都拼在内置类之后，但受 Tailwind 发射顺序支配。</p>
      </Modal>

      <Modal
        open={overrideOpen}
        onClose={() => setOverrideOpen(false)}
        title="覆盖 Modal"
        className="max-w-[20rem] max-w-[28rem]! bg-surface-muted!"
      >
        <p className="m-0">className 覆盖实测：不带 ! 的 max-w-[20rem] 被内置 max-w-[34rem] 压掉；带 ! 的 max-w-[28rem]! 生效。</p>
      </Modal>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="抽屉标题"
      >
        <p className="m-0">抽屉主体内容。Esc 应关闭。</p>
      </Drawer>

      <Drawer
        open={drawerLeftOpen}
        onClose={() => setDrawerLeftOpen(false)}
        side="left"
        title="左抽屉标题"
      >
        <p className="m-0">左侧抽屉主体内容。</p>
      </Drawer>
    </main>
  );
}

const container = document.getElementById('root');
if (!container) throw new Error('找不到 #root 容器');
createRoot(container).render(
  <StrictMode>
    <ToastProvider>
      <Probe />
    </ToastProvider>
  </StrictMode>,
);
