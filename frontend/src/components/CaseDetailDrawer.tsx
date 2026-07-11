import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertTriangle, ChevronDown } from 'lucide-react';
import { reviewCase, getClinician, pct } from '../api';
import type { PatientCase, UrgencyLevel } from '../types';
import UrgencyBadge from './UrgencyBadge';
import { getUrgencyButtonClasses, isDownTriage } from '../urgencyStyles';

interface CaseDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCase: PatientCase | null;
  onReviewed?: () => void;
}

const URGENCY_LEVELS: UrgencyLevel[] = ['Critical', 'High', 'Medium', 'Low'];

export default function CaseDetailDrawer({ isOpen, onClose, selectedCase, onReviewed }: CaseDetailDrawerProps) {
  const [showOverride, setShowOverride] = useState(false);
  const [overrideLevel, setOverrideLevel] = useState<UrgencyLevel>('Medium');
  const [overrideReason, setOverrideReason] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState('');
  const [showRaw, setShowRaw] = useState(false);
  const [reasonError, setReasonError] = useState('');

  const sc = selectedCase;

  // ponytail: reset override UI on case switch, prevents stale state
  useEffect(() => {
    setShowOverride(false);
    setOverrideLevel('Medium');
    setOverrideReason('');
    setError('');
    setShowRaw(false);
    setReasonError('');
  }, [selectedCase?.id]);

  const downTriage = sc ? isDownTriage(sc.urgency_level, overrideLevel) : false;

  useEffect(() => {
    if (!downTriage) { setReasonError(''); return; }
    const trimmed = overrideReason.trim();
    if (trimmed.length > 0 && trimmed.length < 10) {
      setReasonError('Reason must be at least 10 characters');
    } else {
      setReasonError('');
    }
  }, [overrideReason, downTriage]);

  // ponytail: Escape closes drawer
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const entities = sc?.entities || [];
  const symptoms = sc?.key_symptoms || [];
  const flags = sc?.risk_flags || [];
  const rels = sc?.relationships || [];

  const handleConfirm = async () => {
    const s = sc!;
    if (s.urgency_level === 'Critical') {
      const ok = window.confirm('This case is CRITICAL. Confirm triage level?');
      if (!ok) return;
    }
    setReviewing(true);
    setError('');
    try {
      await reviewCase(s.id, getClinician().id, 'Confirm', s.urgency_level);
      onReviewed?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Review failed');
    }
    setReviewing(false);
  };

  const handleOverride = async () => {
    setReviewing(true);
    setError('');
    try {
      await reviewCase(sc!.id, getClinician().id, 'Override', overrideLevel, overrideReason || undefined);
      onReviewed?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Override failed');
    }
    setReviewing(false);
  };

  return (
    <AnimatePresence>
      {isOpen && sc && (
        <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/20" />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute right-0 top-0 h-full w-full max-w-[560px] bg-white border-l border-black/10 shadow-xl flex flex-col overflow-hidden"
          >
            <div className="p-6 md:p-8 border-b border-black/10 flex justify-between items-start bg-background-linen sticky top-0 z-10">
              <div>
                <h3 className="font-sans text-2xl font-bold text-black leading-none mb-4">Case {sc.id.slice(0, 8)}</h3>
                <div className="flex gap-4 font-mono text-[10px] font-bold items-center flex-wrap">
                  <UrgencyBadge urgency={sc.urgency_level} />
                  <span className="border border-black px-2 py-1 normal-case font-sans text-sm">{sc.patient_name || 'Unknown'}</span>
                  {sc.mrn && <span className="border border-black/30 px-2 py-1 font-mono text-[10px] text-black/60">{sc.mrn}</span>}
                  <span className="text-black/60 uppercase">{sc.status}</span>
                </div>
              </div>
              <button onClick={onClose} className="p-3 border border-black/20 hover:bg-black/5 transition-colors active:scale-[0.96] cursor-pointer bg-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 md:space-y-8">
              {sc.chief_complaint && (
                <section>
                  <h4 className="font-mono text-xs font-bold text-black/50 uppercase tracking-[0.4em] mb-4 border-b border-black/10 pb-3">CHIEF COMPLAINT</h4>
                  <p className="font-sans text-2xl font-bold text-black leading-tight">{sc.chief_complaint}</p>
                </section>
              )}

              <section>
                <h4 className="font-mono text-xs font-bold text-black/50 uppercase tracking-[0.4em] mb-4 border-b border-black/10 pb-3">AI INTELLIGENCE</h4>
                <div className="flex items-stretch gap-4 mb-6">
                  <div className="flex-1 border border-black/10 p-4">
                    <p className="font-mono text-[10px] font-bold text-black/40 mb-1">CONFIDENCE</p>
                    <span className="font-sans text-2xl font-bold text-black">{pct(sc.confidence_score)}</span>
                    <span className="text-black/40 ml-0.5">%</span>
                  </div>
                  <div className="flex-1 border border-black/10 p-4 text-center">
                    <p className="font-mono text-[10px] font-bold text-black/40 mb-1">UMLS MAPPED</p>
                    <p className="font-sans text-2xl font-bold text-black mt-1">{entities.length}</p>
                  </div>
                </div>
              </section>

              {sc.evidence && (
                <section>
                  <h4 className="font-mono text-xs font-bold text-black/50 uppercase tracking-[0.4em] mb-4 border-b border-black/10 pb-3">EVIDENCE</h4>
                  <div className="bg-background-linen p-6 border-l-4 border-black/10 leading-relaxed text-sm text-black/70">
                    {sc.evidence}
                  </div>
                </section>
              )}

              {symptoms.length > 0 && (
                <section>
                  <h4 className="font-mono text-xs font-bold text-black/70 uppercase tracking-widest mb-3">Key Symptoms</h4>
                  <div className="flex flex-wrap gap-2">{symptoms.map(s => <span key={s} className="border border-black px-3 py-1 font-sans text-xs font-medium">{s.replace(/_/g, ' ')}</span>)}</div>
                </section>
              )}

              {flags.length > 0 && (
                <section>
                  <h4 className="font-mono text-xs font-bold text-urgency-critical uppercase tracking-widest mb-3">Risk Flags</h4>
                  <div className="flex flex-wrap gap-2">{flags.map(f => <span key={f} className="border border-urgency-critical text-urgency-critical px-3 py-1 font-sans text-xs font-medium">{f.replace(/_/g, ' ')}</span>)}</div>
                </section>
              )}

              {entities.length > 0 && (
                <section>
                  <h4 className="font-mono text-xs font-bold text-black/70 uppercase tracking-widest mb-3">Extracted Entities ({entities.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {entities.map((e, i) => (
                      <span key={i} className="border border-black px-3 py-1 font-mono text-[10px] font-bold hover:bg-black hover:text-white transition-colors cursor-crosshair group relative">
                        {e.text}
                        <span className="ml-1 text-black/50 text-[8px]">{e.label}</span>
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {rels.length > 0 && (
                <section>
                  <h4 className="font-mono text-xs font-bold text-black/70 uppercase tracking-widest mb-3">Relationships ({rels.length})</h4>
                  <div className="space-y-2">
                    {rels.map((r, i) => (
                      <div key={i} className="bg-background-linen p-4 border-l-4 border-primary font-mono text-[11px] text-black/70">
                        <strong className="text-black">{r.source}</strong> → <span className="text-primary-ink uppercase">{r.type}</span>
                        {r.evidence && <p className="text-xs text-black/60 mt-1 font-sans">{r.evidence.substring(0, 120)}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <button onClick={() => setShowRaw(!showRaw)} className="flex items-center gap-2 font-mono text-[10px] font-bold text-black/60 uppercase tracking-widest hover:text-black transition-colors cursor-pointer">
                  <ChevronDown className={`w-4 h-4 transition-transform ${showRaw ? 'rotate-180' : ''}`} />
                  Raw Input
                </button>
                <AnimatePresence>
                  {showRaw && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="mt-4 bg-background-linen p-6 border-l-4 border-black/10 text-sm text-black/70 whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {sc.raw_text || sc.transcription || '(no raw text)'}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            </div>

            {sc.status === 'Pending Review' && <div className="p-8 border-t border-black/10 bg-white space-y-4 shrink-0">
              {error && <p className="font-mono text-[10px] text-red-500 font-bold">{error}</p>}
              <div className="flex flex-col md:flex-row gap-4">
                <button onClick={handleConfirm} disabled={reviewing} className="flex-1 w-full bg-black text-white py-5 font-mono text-xs font-bold uppercase tracking-widest border border-black/20 hover:bg-primary hover:text-white transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-3 group shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary group-hover:text-black" />
                  {reviewing ? 'Processing...' : 'Confirm Triage'}
                </button>
                <button onClick={() => setShowOverride(!showOverride)} className="flex-1 w-full bg-white text-urgency-critical py-5 font-mono text-xs font-bold uppercase tracking-widest border border-urgency-critical hover:bg-urgency-critical hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-3">
                  <AlertTriangle className="w-4 h-4" />
                  Override Urgency
                </button>
              </div>
              <AnimatePresence>
                {showOverride && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-4 overflow-hidden">
                    <div>
                      <label className="font-mono text-[10px] font-bold uppercase text-black/60 block mb-2">New Level</label>
                      <div className="flex gap-2">
                        {URGENCY_LEVELS.map(l => (
                          <button key={l} onClick={() => setOverrideLevel(l)} className={getUrgencyButtonClasses(l, overrideLevel === l)}>{l}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="font-mono text-[10px] font-bold uppercase text-black/60 block mb-2">Reason {downTriage ? '(Required)' : '(Optional)'}</label>
                      <textarea value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} className="w-full border border-black/20 p-4 font-mono text-xs outline-none focus:bg-primary/5 resize-none" rows={2} placeholder="Reason for override..." />
                      {reasonError && <p className="font-mono text-[10px] text-red-500 font-bold mt-1">{reasonError}</p>}
                    </div>
                    <button onClick={handleOverride} disabled={reviewing || (downTriage && (!overrideReason.trim() || overrideReason.trim().length < 10))} className="w-full bg-urgency-critical text-white py-4 font-mono text-xs font-bold uppercase border border-urgency-critical hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer">
                      Apply Override
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
