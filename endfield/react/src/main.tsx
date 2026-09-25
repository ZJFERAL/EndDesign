import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tailwind.css';

function Placeholder() {
  return <main className="p-8 text-ink">Endfield React 组件库</main>;
}

const container = document.getElementById('root');
if (!container) throw new Error('找不到 #root 容器');

createRoot(container).render(
  <StrictMode>
    <Placeholder />
  </StrictMode>,
);
