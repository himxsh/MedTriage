import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertTriangle } from 'lucide-react';
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
  const [reasonError, setReasonError] = useState('');

  const sc = selectedCase;

  // ponytail: reset override UI on case switch, prevents stale state
  useEffect(() => {
    setShowOverride(false);
    setOverrideLevel('Medium');
    setOverrideReason('');
    setError('');
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
        <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="app-ui fixed inset-0 z-[110]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-syncra-ink/25" />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute right-0 top-0 h-full w-full max-w-[560px] bg-white border-l border-syncra-border shadow-xl flex flex-col overflow-hidden rounded-l-2xl"
          >
            <div className="p-6 border-b border-syncra-border flex justify-between items-start bg-syncra-surface sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-medium text-syncra-ink leading-none mb-3">Case {sc.id.slice(0, 8)}</h3>
                <div className="flex gap-2 text-xs font-medium items-center flex-wrap">
                  <UrgencyBadge urgency={sc.urgency_level} />
                  <span className="rounded-lg border border-syncra-border bg-white px-2.5 py-1 text-sm text-syncra-ink">{sc.patient_name || 'Unknown'}</span>
                  {sc.mrn && <span className="rounded-lg border border-syncra-border px-2.5 py-1 text-syncra-secondary">{sc.mrn}</span>}
                  <span className="text-syncra-muted">{sc.status}</span>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg border border-syncra-border hover:bg-syncra-card-stroke transition-colors cursor-pointer bg-white">
                <X className="w-5 h-5 text-syncra-tertiary" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {sc.chief_complaint && (
                <section>
                  <h4 className="syncra-section-title">Chief Complaint</h4>
                  <p className="text-lg font-medium text-syncra-ink leading-snug">{sc.chief_complaint}</p>
                </section>
              )}

              <section>
                <h4 className="syncra-section-title">AI Intelligence</h4>
                <div className="flex items-stretch gap-3 mb-2">
                  <div className="flex-1 rounded-xl border border-syncra-border p-4">
                    <p className="text-[11px] font-medium text-syncra-muted mb-1">Confidence</p>
                    <span className="text-2xl font-medium text-syncra-ink">{pct(sc.confidence_score)}</span>
                    <span className="text-syncra-muted ml-0.5">%</span>
                  </div>
                  <div className="flex-1 rounded-xl border border-syncra-border p-4 text-center">
                    <p className="text-[11px] font-medium text-syncra-muted mb-1">UMLS Mapped</p>
                    <p className="text-2xl font-medium text-syncra-ink">{entities.length}</p>
                  </div>
                </div>
              </section>

              {sc.evidence && (
                <section>
                  <h4 className="syncra-section-title">Evidence</h4>
                  <div className="rounded-xl bg-syncra-surface p-4 border border-syncra-border text-sm text-syncra-secondary leading-relaxed">
                    {sc.evidence}
                  </div>
                </section>
              )}

              {symptoms.length > 0 && (
                <section>
                  <h4 className="text-xs font-medium text-syncra-secondary mb-2">Key Symptoms</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {symptoms.map(s => (
                      <span key={s} className="rounded-full border border-syncra-border bg-white px-2.5 py-1 text-xs text-syncra-ink">{s.replace(/_/g, ' ')}</span>
                    ))}
                  </div>
                </section>
              )}

              {flags.length > 0 && (
                <section>
                  <h4 className="text-xs font-medium text-syncra-down mb-2">Risk Flags</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {flags.map(f => (
                      <span key={f} className="rounded-full bg-syncra-down-soft text-syncra-down px-2.5 py-1 text-xs font-medium">{f.replace(/_/g, ' ')}</span>
                    ))}
                  </div>
                </section>
              )}

              {entities.length > 0 && (
                <section>
                  <h4 className="text-xs font-medium text-syncra-secondary mb-2">Extracted Entities ({entities.length})</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {entities.map((e, i) => (
                      <span key={i} className="rounded-lg border border-syncra-border px-2.5 py-1 text-[11px] font-medium text-syncra-ink hover:bg-syncra-card-stroke transition-colors">
                        {e.text}
                        <span className="ml-1 text-syncra-muted text-[10px]">{e.label}</span>
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {rels.length > 0 && (
                <section>
                  <h4 className="text-xs font-medium text-syncra-secondary mb-2">Relationships ({rels.length})</h4>
                  <div className="space-y-2">
                    {rels.map((r, i) => (
                      <div key={i} className="rounded-xl bg-syncra-surface p-3 border border-syncra-border text-xs text-syncra-secondary">
                        <strong className="text-syncra-ink">{r.source}</strong> → <span className="text-syncra-tertiary uppercase">{r.type}</span>
                        {r.evidence && <p className="text-xs text-syncra-muted mt-1">{r.evidence.substring(0, 120)}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h4 className="syncra-section-title">Raw Input</h4>
                <div className="rounded-xl bg-syncra-surface p-4 border border-syncra-border text-sm text-syncra-secondary whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {sc.raw_text || sc.transcription || '(no raw text)'}
                </div>
              </section>
            </div>

            {sc.status === 'Pending Review' && <div className="p-6 border-t border-syncra-border bg-white space-y-3 shrink-0">
              {error && <p className="text-xs text-syncra-down font-medium">{error}</p>}
              <div className="flex flex-col md:flex-row gap-2">
                <button onClick={handleConfirm} disabled={reviewing} className="flex-1 syncra-btn-primary !py-3 cursor-pointer disabled:opacity-50">
                  <CheckCircle2 className="w-4 h-4" />
                  {reviewing ? 'Processing...' : 'Confirm Triage'}
                </button>
                <button onClick={() => setShowOverride(!showOverride)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-syncra-down/30 bg-syncra-down-soft text-syncra-down py-3 text-xs font-medium hover:bg-syncra-down hover:text-white transition-colors cursor-pointer">
                  <AlertTriangle className="w-4 h-4" />
                  Override Urgency
                </button>
              </div>
              <AnimatePresence>
                {showOverride && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-3 overflow-hidden">
                    <div>
                      <label className="syncra-label">New Level</label>
                      <div className="flex gap-2">
                        {URGENCY_LEVELS.map(l => (
                          <button key={l} onClick={() => setOverrideLevel(l)} className={getUrgencyButtonClasses(l, overrideLevel === l)}>{l}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="syncra-label">Reason {downTriage ? '(Required)' : '(Optional)'}</label>
                      <textarea value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} className="syncra-input resize-none" rows={2} placeholder="Reason for override..." />
                      {reasonError && <p className="text-xs text-syncra-down font-medium mt-1">{reasonError}</p>}
                    </div>
                    <button onClick={handleOverride} disabled={reviewing || (downTriage && (!overrideReason.trim() || overrideReason.trim().length < 10))} className="w-full rounded-lg bg-syncra-down text-white py-3 text-xs font-medium hover:bg-[#9a3234] transition-colors disabled:opacity-50 cursor-pointer">
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
