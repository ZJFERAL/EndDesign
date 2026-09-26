import { StrictMode, useEffect, useState } from 'react';
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
  useFocusTrap,
  useToast,
  IconChevronDown,
  IconDownload,
  IconSettings,
} from './index';

declare global {
  interface Window {
    __escLog?: string[];
  }
}

// 记录各层 onClose 的实际调用，供 CDP 侧断言「一次 Esc 只产生一次 onClose」。
// 用模块级数组挂在 window 上，避免为探针引入额外状态。
const escLog: string[] = [];
window.__escLog = escLog;
function logClose(name: string) {
  escLog.push(name);
}

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

/** I3：面板内一个可聚焦元素都没有，直接消费 useFocusTrap 验空列表分支。 */
function SpanOnlyTrap({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useFocusTrap(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        data-probe="span-only-panel"
        className="relative border border-border bg-surface-raised p-4"
      >
        <span data-probe="span-only-text">面板内只有一个 span，没有任何可聚焦元素。</span>
      </div>
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
  const [inputModalOpen, setInputModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [stackModalOpen, setStackModalOpen] = useState(false);
  const [layerAOpen, setLayerAOpen] = useState(false);
  const [layerBOpen, setLayerBOpen] = useState(false);
  const [sameCommitOuter, setSameCommitOuter] = useState(false);
  const [sameCommitInner, setSameCommitInner] = useState(false);
  const [sameCommitDeepA, setSameCommitDeepA] = useState(false);
  const [sameCommitDeepB, setSameCommitDeepB] = useState(false);
  const [sameCommitDeepC, setSameCommitDeepC] = useState(false);
  const [sameCommitDrawer, setSameCommitDrawer] = useState(false);
  const [sameCommitDrawerModal, setSameCommitDrawerModal] = useState(false);
  const [sameCommitSibA, setSameCommitSibA] = useState(false);
  const [sameCommitSibB, setSameCommitSibB] = useState(false);
  const [spanTrapOpen, setSpanTrapOpen] = useState(false);
  const [triggerClicks, setTriggerClicks] = useState(0);
  const [tick, setTick] = useState(0);

  // C1：父组件周期性重渲染。若陷阱把 onEscape 当依赖，这个 tick 每次都会重装陷阱并夺走焦点。
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 300);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="grid gap-8 p-8">
      <SectionHeader
        eyebrow="interactive components"
        title="交互组件实测"
        actions={<ThemeToggle />}
      />

      <p data-probe="tick" className="m-0 font-mono text-xs text-ink-subtle">
        tick={tick}
      </p>

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
            <Button
              data-probe="input-modal-trigger"
              variant="primary"
              onClick={() => setInputModalOpen(true)}
            >
              打开受控输入 Modal
            </Button>
            <Button
              data-probe="span-trap-trigger"
              variant="secondary"
              onClick={() => setSpanTrapOpen(true)}
            >
              打开只有 span 的陷阱
            </Button>
            <Button
              data-probe="layer-a-trigger"
              variant="secondary"
              onClick={() => setLayerAOpen(true)}
            >
              打开嵌套层 A
            </Button>
            <Button
              data-probe="same-commit-nested-trigger"
              variant="primary"
              onClick={() => {
                setSameCommitOuter(true);
                setSameCommitInner(true);
              }}
            >
              同提交嵌套两层
            </Button>
            <Button
              data-probe="same-commit-deep-trigger"
              variant="primary"
              onClick={() => {
                setSameCommitDeepA(true);
                setSameCommitDeepB(true);
                setSameCommitDeepC(true);
              }}
            >
              同提交嵌套三层
            </Button>
            <Button
              data-probe="same-commit-drawer-trigger"
              variant="primary"
              onClick={() => {
                setSameCommitDrawer(true);
                setSameCommitDrawerModal(true);
              }}
            >
              同提交 Drawer+Modal
            </Button>
            <Button
              data-probe="same-commit-siblings-trigger"
              variant="primary"
              onClick={() => {
                setSameCommitSibA(true);
                setSameCommitSibB(true);
              }}
            >
              同提交兄弟两层
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

            {/* I2：触发器自带 onClick，必须与展开逻辑组合而不是被顶掉。 */}
            <div data-probe="dropdown-own-click-wrap">
              <Dropdown
                trigger={
                  <Button
                    data-probe="dropdown-own-click-trigger"
                    onClick={() => setTriggerClicks((n) => n + 1)}
                  >
                    自带 onClick 的菜单
                  </Button>
                }
              >
                <DropdownItem data-probe="dropdown-own-click-item">项目一</DropdownItem>
              </Dropdown>
            </div>

            <p
              data-probe="trigger-clicks"
              className="m-0 font-mono text-xs text-ink-subtle"
            >
              triggerClicks={triggerClicks}
            </p>

            <ToastTrigger />
          </div>
        </PanelBody>
      </Panel>

      <div data-probe="tabs-uncontrolled">
        <Tabs items={TABS} />
      </div>

      <div data-probe="tabs-controlled">
        <Tabs items={TABS} value={controlled} onChange={setControlled} />
        <p
          data-probe="controlled-state"
          className="m-0 mt-2 font-mono text-xs text-ink-subtle"
        >
          controlled={controlled}
        </p>
      </div>

      {/* M1：value 匹配不到任何一项时仍须可用。 */}
      <div data-probe="tabs-bad-value">
        <Tabs items={TABS} value="does-not-exist" />
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

      {/* C1：受控输入 + 父组件每 300ms 重渲染。 */}
      <Modal
        open={inputModalOpen}
        onClose={() => setInputModalOpen(false)}
        title="受控输入模态"
      >
        <input
          data-probe="modal-input"
          className="w-full border border-border bg-surface px-2 py-1 text-ink"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <p
          data-probe="modal-input-value"
          className="m-0 mt-2 font-mono text-xs text-ink-subtle"
        >
          value={inputValue}
        </p>
      </Modal>

      {/* C2 / I1（兄弟叠放）：Drawer 先开，Modal 后开，两者是兄弟节点。 */}
      <Drawer
        open={drawerOpen}
        onClose={() => {
          logClose('separateSiblings:drawer');
          setDrawerOpen(false);
        }}
        title="抽屉标题"
      >
        <p className="m-0">抽屉主体内容。Esc 应关闭。</p>
        <Button
          data-probe="drawer-open-modal"
          variant="primary"
          onClick={() => setStackModalOpen(true)}
        >
          在抽屉里再开一个 Modal
        </Button>
      </Drawer>

      <Modal
        open={stackModalOpen}
        onClose={() => {
          logClose('separateSiblings:modal');
          setStackModalOpen(false);
        }}
        title="叠放的模态"
        footer={
          <Button data-probe="stack-modal-close" onClick={() => setStackModalOpen(false)}>
            关闭叠放模态
          </Button>
        }
      >
        <p className="m-0">叠放在抽屉之上的模态。一次 Esc 只应关掉这一层。</p>
      </Modal>

      {/* C2 / I1（嵌套叠放）：层 B 写在层 A 的 children 里，B 的陷阱容器是 A 的后代。
          React 的 effect 后序遍历使 B 先于 A 运行，这是最考验入栈顺序的形态。 */}
      <Modal
        open={layerAOpen}
        onClose={() => {
          logClose('separateNested:A');
          setLayerAOpen(false);
        }}
        title="层 A"
        footer={
          <Button data-probe="layer-a-close" onClick={() => setLayerAOpen(false)}>
            关闭层 A
          </Button>
        }
      >
        <p className="m-0">外层 A。</p>
        <Button
          data-probe="layer-b-trigger"
          variant="primary"
          onClick={() => setLayerBOpen(true)}
        >
          在 A 里打开 B
        </Button>
        <Modal
          open={layerBOpen}
          onClose={() => {
            logClose('separateNested:B');
            setLayerBOpen(false);
          }}
          title="层 B"
          footer={
            <Button data-probe="layer-b-close" onClick={() => setLayerBOpen(false)}>
              关闭层 B
            </Button>
          }
        >
          <p className="m-0">内层 B。一次 Esc 只应关掉 B。</p>
        </Modal>
      </Modal>

      {/* I1 核心夹具：两层在**同一次提交**里挂载。
          上面那对夹具是「点按钮开 B」，属于两次提交 —— 恰好是守卫本来就work的路径，
          所以旧套件 30/30 全绿而缺陷仍然活着。这里 A 与 B 由**同一个事件处理器**一次性
          置位（React 18 自动批处理 → 一次提交），React 的后序遍历使 B 的 effect 先于 A 跑，
          正是会触发「一次 Esc 关两层」的形态。
          两层各有独立状态，关闭 B 不会连带关闭 A —— 否则测不出「只关一层」。 */}
      <Modal
        open={sameCommitOuter}
        onClose={() => {
          logClose('sameCommitNested:A');
          setSameCommitOuter(false);
        }}
        title="同提交层 A"
      >
        <p className="m-0">外层 A（与 B 同一次提交挂载）。</p>
        <Modal
          open={sameCommitInner}
          onClose={() => {
            logClose('sameCommitNested:B');
            setSameCommitInner(false);
          }}
          title="同提交层 B"
        >
          <p className="m-0" data-probe="same-commit-b-body">
            内层 B（与 A 同一次提交挂载）。一次 Esc 只应关掉 B。
          </p>
        </Modal>
      </Modal>

      {/* 三层同提交：A ⊃ B ⊃ C，验证一次 Esc 只产生一次 onClose。 */}
      <Modal
        open={sameCommitDeepA}
        onClose={() => {
          logClose('sameCommitDeep:A');
          setSameCommitDeepA(false);
        }}
        title="三层 A"
      >
        <p className="m-0">三层外层 A。</p>
        <Modal
          open={sameCommitDeepB}
          onClose={() => {
            logClose('sameCommitDeep:B');
            setSameCommitDeepB(false);
          }}
          title="三层 B"
        >
          <p className="m-0">三层中层 B。</p>
          <Modal
            open={sameCommitDeepC}
            onClose={() => {
              logClose('sameCommitDeep:C');
              setSameCommitDeepC(false);
            }}
            title="三层 C"
          >
            <p className="m-0">三层内层 C。一次 Esc 只应关掉 C。</p>
          </Modal>
        </Modal>
      </Modal>

      {/* 同提交的 Modal 套在 Drawer 里。 */}
      <Drawer
        open={sameCommitDrawer}
        onClose={() => {
          logClose('sameCommitDrawer:drawer');
          setSameCommitDrawer(false);
        }}
        title="同提交抽屉"
      >
        <p className="m-0">抽屉（与其中的 Modal 同一次提交挂载）。</p>
        <Modal
          open={sameCommitDrawerModal}
          onClose={() => {
            logClose('sameCommitDrawer:modal');
            setSameCommitDrawerModal(false);
          }}
          title="同提交抽屉里的模态"
        >
          <p className="m-0">一次 Esc 只应关掉这个 Modal。</p>
        </Modal>
      </Drawer>

      {/* 同提交的兄弟两层：两个平级 Modal 由同一个开关打开。 */}
      <Modal
        open={sameCommitSibA}
        onClose={() => {
          logClose('sameCommitSiblings:first');
          setSameCommitSibA(false);
        }}
        title="同提交兄弟一"
      >
        <p className="m-0">兄弟一。</p>
      </Modal>
      <Modal
        open={sameCommitSibB}
        onClose={() => {
          logClose('sameCommitSiblings:second');
          setSameCommitSibB(false);
        }}
        title="同提交兄弟二"
      >
        <p className="m-0">兄弟二（后挂载，应为栈顶）。</p>
      </Modal>

      <Drawer
        open={drawerLeftOpen}
        onClose={() => setDrawerLeftOpen(false)}
        side="left"
        title="左抽屉标题"
      >
        <p className="m-0">左侧抽屉主体内容。</p>
      </Drawer>

      <SpanOnlyTrap open={spanTrapOpen} onClose={() => setSpanTrapOpen(false)} />

      <Modal
        open={overridePlainOpen}
        onClose={() => setOverridePlainOpen(false)}
        title="无 ! 覆盖 Modal"
        className="max-w-[20rem] bg-surface-muted"
      >
        <p className="m-0">
          className 无 ! 实测：max-w-[20rem] 与 bg-surface-muted 都拼在内置类之后，但受
          Tailwind 发射顺序支配。
        </p>
      </Modal>

      <Modal
        open={overrideOpen}
        onClose={() => setOverrideOpen(false)}
        title="覆盖 Modal"
        className="max-w-[20rem] max-w-[28rem]! bg-surface-muted!"
      >
        <p className="m-0">
          className 覆盖实测：不带 ! 的 max-w-[20rem] 被内置 max-w-[34rem] 压掉；带 ! 的
          max-w-[28rem]! 生效。
        </p>
      </Modal>

      {/* C2 需要页面真的能滚，否则「滚动锁是否释放」测不出差别。
          这段填充让内容高于视口。 */}
      <div data-probe="scroll-filler" aria-hidden="true" className="h-[2000px]" />
      <p data-probe="page-bottom" className="m-0 font-mono text-xs text-ink-subtle">
        page bottom
      </p>
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
