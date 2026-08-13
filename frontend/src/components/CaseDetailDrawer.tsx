import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle } from 'lucide-react';
import { reviewCase, pct } from '../api';
import type { PatientCase, UrgencyLevel } from '../types';
import UrgencyBadge from './UrgencyBadge';
import { getUrgencyButtonClasses, isDownTriage } from '../urgencyStyles';
import { urgencyLabel } from '../orgLabels';
import RecommendationCard from './beautiful-ui/RecommendationCard';
import ContextCards, { type ContextChunk } from './beautiful-ui/ContextCards';

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

  const confidenceSignal = sc
    ? sc.confidence_score >= 0.8
      ? 3
      : sc.confidence_score >= 0.5
        ? 2
        : 1
    : 0;
  const confidenceTone =
    sc?.urgency_level === 'Critical' || sc?.urgency_level === 'High' ? 'var(--red)' : 'var(--green)';

  const chunks: ContextChunk[] = sc
    ? [
        ...(sc.evidence
          ? [
              {
                title: 'Evidence',
                chars: `${sc.evidence.length} characters`,
                body: sc.evidence,
                source: 'Triage model',
                badge: 'AI',
                tone: 'bg-accent',
              },
            ]
          : []),
        ...entities.slice(0, 6).map((e) => ({
          title: e.text,
          chars: e.label,
          body: e.mappings?.[0]?.name || e.label,
          source: e.mappings?.[0]?.cui || 'UMLS',
          badge: e.label.slice(0, 3).toUpperCase(),
          tone: 'bg-green',
        })),
        ...rels.slice(0, 4).map((r) => ({
          title: `${r.source} → ${r.type}`,
          chars: 'relation',
          body: r.evidence || r.indicators.join(', ') || r.type,
          source: 'Relationship extract',
          badge: 'REL',
          tone: 'bg-orange',
        })),
      ]
    : [];

  const handleConfirm = async () => {
    const s = sc!;
    if (s.urgency_level === 'Critical') {
      const ok = window.confirm('This case is CRITICAL. Confirm triage level?');
      if (!ok) return;
    }
    setReviewing(true);
    setError('');
    try {
      await reviewCase(s.id, 'Confirm', s.urgency_level);
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
      await reviewCase(sc!.id, 'Override', overrideLevel, overrideReason || undefined);
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
        <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="bui-root app-ui fixed inset-0 z-[110]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-ink/25" />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute right-0 top-0 h-full w-full max-w-[560px] bg-surface border-l border-line shadow-overlay flex flex-col overflow-hidden rounded-l-2xl"
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
                {sc.status === 'Pending Review' ? (
                  <RecommendationCard
                    title={`Confirm ${urgencyLabel(sc.urgency_level)} triage?`}
                    body={
                      <>
                        {sc.chief_complaint || 'No chief complaint'}
                        {' · '}
                        <span className="font-medium text-ink">{pct(sc.confidence_score)}% confidence</span>
                        {flags.length > 0 && (
                          <>
                            {' · '}
                            <span className="text-red">{flags.length} risk flag{flags.length > 1 ? 's' : ''}</span>
                          </>
                        )}
                      </>
                    }
                    signal={confidenceSignal}
                    tone={confidenceTone}
                    label={`${pct(sc.confidence_score)}% · ${urgencyLabel(sc.urgency_level)}`}
                    cta="Confirm"
                    busy={reviewing}
                    alternatives={URGENCY_LEVELS.filter((l) => l !== sc.urgency_level).map((l) => ({
                      key: l,
                      short: `Override to ${urgencyLabel(l)}`,
                      label: urgencyLabel(l),
                      signal: l === 'Critical' ? 3 : l === 'High' ? 2 : 1,
                      tone: l === 'Low' ? 'var(--green)' : 'var(--orange)',
                    }))}
                    onAccept={handleConfirm}
                    onAlternative={(key) => {
                      setOverrideLevel(key as UrgencyLevel);
                      setShowOverride(true);
                    }}
                  />
                ) : (
                  <div className="flex items-stretch gap-3 mb-2">
                    <div className="flex-1 rounded-card border border-line p-4">
                      <p className="text-[11px] font-medium text-ink-3 mb-1">Confidence</p>
                      <span className="text-2xl font-medium text-ink">{pct(sc.confidence_score)}</span>
                      <span className="text-ink-3 ml-0.5">%</span>
                    </div>
                    <div className="flex-1 rounded-card border border-line p-4 text-center">
                      <p className="text-[11px] font-medium text-ink-3 mb-1">UMLS Mapped</p>
                      <p className="text-2xl font-medium text-ink">{entities.length}</p>
                    </div>
                  </div>
                )}
              </section>

              <ContextCards heading="Retrieved context" chunks={chunks} />

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
                  <h4 className="text-xs font-medium text-syncra-down mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Risk Flags
                  </h4>
                  <div className="rounded-xl border border-syncra-down/40 bg-syncra-down-soft/60 p-3">
                    <div className="flex flex-wrap gap-1.5">
                      {flags.map(f => (
                        <span key={f} className="rounded-full bg-white border border-syncra-down/30 text-syncra-down px-2.5 py-1 text-xs font-medium">
                          {f.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              <section>
                <h4 className="syncra-section-title">Intake record</h4>
                <div className="rounded-xl bg-syncra-surface p-4 border border-syncra-border space-y-3">
                  {sc.has_audio && (
                    <div>
                      <p className="text-[11px] font-medium text-syncra-secondary mb-1.5">Original audio</p>
                      <audio
                        controls
                        preload="metadata"
                        className="w-full h-10"
                        src={`/api/v1/cases/${sc.id}/audio`}
                      >
                        Your browser does not support audio playback.
                      </audio>
                    </div>
                  )}
                  {(sc.transcription || sc.input_type === 'audio') && (
                    <div>
                      <p className="text-[11px] font-medium text-syncra-secondary mb-1.5">
                        Transcription
                      </p>
                      <div className="text-sm text-syncra-secondary whitespace-pre-wrap max-h-36 overflow-y-auto">
                        {sc.transcription || '(no transcription)'}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-[11px] font-medium text-syncra-secondary mb-1.5">
                      {sc.input_type === 'audio' ? 'Raw text (from audio)' : 'Raw input'}
                    </p>
                    <div className="text-sm text-syncra-secondary whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {sc.raw_text || '(no raw text)'}
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {sc.status === 'Pending Review' && (error || showOverride) && (
              <div className="p-6 border-t border-line bg-surface space-y-3 shrink-0">
              {error && <p className="text-xs text-red font-medium">{error}</p>}
              <AnimatePresence>
                {showOverride && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-3 overflow-hidden">
                    <div>
                      <label className="syncra-label">New Level</label>
                      <div className="flex gap-2">
                        {URGENCY_LEVELS.map(l => (
                          <button key={l} onClick={() => setOverrideLevel(l)} className={getUrgencyButtonClasses(l, overrideLevel === l)}>{urgencyLabel(l)}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="syncra-label">Reason {downTriage ? '(Required)' : '(Optional)'}</label>
                      <textarea value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} className="syncra-input resize-none" rows={2} placeholder="Reason for override..." />
                      {reasonError && <p className="text-xs text-red font-medium mt-1">{reasonError}</p>}
                    </div>
                    <button onClick={handleOverride} disabled={reviewing || (downTriage && (!overrideReason.trim() || overrideReason.trim().length < 10))} className="w-full rounded-control bg-red text-white py-3 text-xs font-medium disabled:opacity-50 cursor-pointer">
                      Apply Override
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            )}

            {sc.status === 'Completed' && (
              <div className="p-6 border-t border-syncra-border bg-syncra-surface shrink-0">
                <p className="text-xs font-medium text-syncra-ink">Review complete — immutable</p>
                <p className="text-[11px] text-syncra-muted mt-1">
                  This case can no longer be Confirm/Override’d. See Audit for the clinician decision.
                </p>
              </div>
            )}

            {sc.status === 'Failed' && (
              <div className="p-6 border-t border-syncra-border bg-syncra-down-soft shrink-0">
                <p className="text-xs font-medium text-syncra-down">Pipeline failed</p>
                <p className="text-[11px] text-syncra-down/80 mt-1">
                  No triage decision was produced. Re-intake or check evidence notes.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
