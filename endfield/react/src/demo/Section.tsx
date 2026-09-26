import type { ReactNode } from 'react';
import { SectionHeader } from '../components/SectionHeader';

export interface SectionProps {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function Section({ id, eyebrow, title, description, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-20">
      <SectionHeader eyebrow={eyebrow} title={title} />
      {description ? <p className="mb-4 max-w-3xl text-sm text-ink-muted">{description}</p> : null}
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  );
}

export function Demo({ children }: { children: ReactNode }) {
  return (
    <div className="border border-dashed border-border bg-surface-muted/40 p-4">
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}
