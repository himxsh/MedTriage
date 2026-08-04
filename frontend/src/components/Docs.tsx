import React from 'react';
import { LayoutGrid, ArrowLeft, Mic, ListOrdered, CheckCircle2, ScrollText } from 'lucide-react';
import { motion } from 'motion/react';
import type { Screen } from '../types';

interface DocsProps {
  onNavigate: (screen: Screen) => void;
}

const STEPS = [
  {
    n: '01',
    icon: Mic,
    title: 'Intake',
    body: 'Open New Intake from the app nav. Submit free-text clinical notes or a voice recording, optionally with patient name and MRN. The case is accepted immediately while AI triage runs in the background.',
  },
  {
    n: '02',
    icon: ListOrdered,
    title: 'Live queue',
    body: 'When triage finishes, the case appears on the Queue with urgency, chief complaint, and confidence. Open a row to see symptoms, risk flags, entities, and evidence.',
  },
  {
    n: '03',
    icon: CheckCircle2,
    title: 'Review',
    body: 'Confirm the AI urgency, or Override to a different level. Down-triaging (lowering priority) requires a reason of at least 10 characters. Completed cases no longer show Confirm/Override.',
  },
  {
    n: '04',
    icon: ScrollText,
    title: 'Audit',
    body: 'Every Confirm or Override is logged with previous → new urgency, clinician id, and reason. Use the Audit screen for a full decision trail.',
  },
] as const;

export default function Docs({ onNavigate }: DocsProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background-linen">
      <header className="flex items-center justify-between px-6 md:px-10 py-6 brutalist-rule-x bg-white sticky top-0 z-50">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => onNavigate('landing')}>
          <LayoutGrid className="w-8 h-8 text-primary" />
          <h2 className="text-2xl font-bold tracking-tighter font-mono">MEDTRIAGE</h2>
        </div>
        <div className="flex items-center gap-6 md:gap-10 font-mono text-sm uppercase">
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="hidden md:inline hover:text-primary-ink transition-colors cursor-pointer"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="font-bold hover:text-primary-ink transition-colors cursor-pointer"
          >
            LOGIN
          </button>
        </div>
      </header>

      <main className="flex-grow">
        <section className="px-6 md:px-10 py-16 md:py-24 brutalist-rule-x bg-white">
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-black/50 hover:text-primary-ink transition-colors mb-10 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary-ink mb-4">Documentation</p>
            <h1 className="font-bebas text-6xl md:text-8xl tracking-tight leading-none uppercase mb-6">
              How to use
            </h1>
            <p className="max-w-2xl font-mono text-sm uppercase tracking-wide text-black/50 text-pretty leading-relaxed">
              MedTriage turns unstructured intake into a structured triage assessment for ER staff.
              AI assists — licensed clinicians confirm or override before any clinical action.
            </p>
          </motion.div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 bg-black/5 brutalist-rule-x">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const edge = i % 2 === 0;
            return (
              <div
                key={step.n}
                className={`p-10 md:p-14 flex flex-col gap-6 ${edge ? 'brutalist-rule-y' : ''} ${i < 2 ? 'brutalist-rule-x md:brutalist-rule-x' : ''} ${i === 0 || i === 3 ? 'bg-white' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <Icon className="w-10 h-10 text-primary shrink-0" />
                  <span className="font-mono text-[10px] tracking-[0.35em] text-black/40">{step.n}</span>
                </div>
                <h2 className="font-bebas text-4xl md:text-5xl tracking-widest leading-none uppercase">
                  {step.title}
                </h2>
                <p className="font-mono text-sm leading-relaxed uppercase text-black/60 text-pretty">
                  {step.body}
                </p>
              </div>
            );
          })}
        </section>

        <section className="px-6 md:px-10 py-16 md:py-20 brutalist-rule-x bg-white">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary-ink mb-4">Safety</p>
          <h2 className="font-bebas text-4xl md:text-5xl tracking-tight leading-none uppercase mb-6">
            Clinical decision support
          </h2>
          <p className="max-w-3xl font-mono text-sm uppercase tracking-wide text-black/50 text-pretty leading-relaxed mb-10">
            MedTriage is not a medical device. It does not diagnose or order care. Urgency from the model
            must be reviewed. Treat AI output as a draft until a clinician Confirm or Override is recorded.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('register')}
            className="inline-flex items-center justify-center border-2 border-black/20 bg-primary px-10 py-5 text-white font-mono text-sm font-bold uppercase transition-colors hover:bg-primary-ink active:scale-[0.96] cursor-pointer"
          >
            Get Started
          </button>
        </section>
      </main>

      <footer className="p-8 md:p-12 font-mono text-[10px] uppercase text-black/40 bg-white brutalist-rule-x">
        <div className="flex justify-between items-center tracking-[0.3em]">
          <span>MedTriage Docs</span>
          <span>AI assists / clinicians decide</span>
        </div>
      </footer>
    </div>
  );
}
