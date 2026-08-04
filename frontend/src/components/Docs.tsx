import React from 'react';
import {
  LayoutGrid,
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  Mic,
  ListOrdered,
  CheckCircle2,
  ScrollText,
  FileText,
  ScanSearch,
  ShieldOff,
  GitBranch,
  Sparkles,
  Database,
  Radio,
  MonitorSmartphone,
} from 'lucide-react';
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

const FLOW_STAGES = [
  {
    label: 'Capture',
    nodes: [
      { icon: FileText, title: 'Text / Audio', detail: 'Clinical notes or Whisper STT' },
    ],
  },
  {
    label: 'AI pipeline',
    nodes: [
      { icon: ScanSearch, title: 'Clinical NER', detail: 'Entities + UMLS linking' },
      { icon: ShieldOff, title: 'De-ID', detail: 'Mask PHI, keep meds/dx' },
      { icon: GitBranch, title: 'Relations', detail: 'Negation & modifiers' },
      { icon: Sparkles, title: 'Gemini triage', detail: 'Urgency + evidence JSON' },
    ],
  },
  {
    label: 'Deliver',
    nodes: [
      { icon: Database, title: 'Postgres', detail: 'Case persisted' },
      { icon: Radio, title: 'Redis → WS', detail: 'Live queue push' },
      { icon: MonitorSmartphone, title: 'Queue UI', detail: 'Clinician sees case' },
    ],
  },
  {
    label: 'Decide',
    nodes: [
      { icon: CheckCircle2, title: 'Confirm / Override', detail: 'Human-in-the-loop' },
      { icon: ScrollText, title: 'Audit log', detail: 'Previous → new + reason' },
    ],
  },
] as const;

function FlowArrow({ vertical = false }: { vertical?: boolean }) {
  if (vertical) {
    return (
      <div className="flex justify-center py-3 text-primary" aria-hidden>
        <ArrowDown className="w-5 h-5" />
      </div>
    );
  }
  return (
    <div className="hidden md:flex items-center px-1 text-primary shrink-0" aria-hidden>
      <ArrowRight className="w-5 h-5" />
    </div>
  );
}

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

        <section className="px-6 md:px-10 py-16 md:py-20 brutalist-rule-x bg-background-linen">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary-ink mb-4">System flow</p>
          <h2 className="font-bebas text-4xl md:text-6xl tracking-tight leading-none uppercase mb-4">
            How a case moves
          </h2>
          <p className="max-w-2xl font-mono text-sm uppercase tracking-wide text-black/50 text-pretty leading-relaxed mb-12">
            Intake is accepted fast. The AI pipeline runs in the background, then the case lands on the live queue for clinician review.
          </p>

          <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
            <ol className="flex flex-col md:flex-row md:items-stretch gap-0 md:gap-0 min-w-0 md:min-w-max list-none p-0 m-0">
              {FLOW_STAGES.map((stage, stageIdx) => (
                <React.Fragment key={stage.label}>
                  <li className="flex flex-col md:w-[220px] shrink-0">
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary-ink mb-3">
                      {String(stageIdx + 1).padStart(2, '0')} · {stage.label}
                    </span>
                    <div className="flex flex-col gap-2 flex-grow border-2 border-black/15 bg-white p-3">
                      {stage.nodes.map((node, nodeIdx) => {
                        const Icon = node.icon;
                        return (
                          <React.Fragment key={node.title}>
                            {nodeIdx > 0 && (
                              <div className="flex justify-center text-black/25" aria-hidden>
                                <ArrowDown className="w-3.5 h-3.5" />
                              </div>
                            )}
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true, margin: '-40px' }}
                              transition={{ delay: stageIdx * 0.08 + nodeIdx * 0.04 }}
                              className="flex items-start gap-3 border border-black/10 bg-background-linen/60 p-3"
                            >
                              <Icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <p className="font-bebas text-lg tracking-widest leading-none uppercase">
                                  {node.title}
                                </p>
                                <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wide text-black/50 leading-snug text-pretty">
                                  {node.detail}
                                </p>
                              </div>
                            </motion.div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </li>
                  {stageIdx < FLOW_STAGES.length - 1 && (
                    <>
                      <FlowArrow />
                      <div className="md:hidden">
                        <FlowArrow vertical />
                      </div>
                    </>
                  )}
                </React.Fragment>
              ))}
            </ol>
          </div>

          <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.25em] text-black/40 max-w-3xl leading-relaxed">
            Pipeline: Intake → NER → De-ID → Relations → Gemini → DB → Redis → WebSocket → Queue → Review → Audit
          </p>
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
