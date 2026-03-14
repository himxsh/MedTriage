import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Activity, CheckCircle2, AlertTriangle } from 'lucide-react';
import { PatientCase } from '../types';
import UrgencyBadge from './UrgencyBadge';

interface CaseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCase: PatientCase | null;
}

export default function CaseDetailModal({ isOpen, onClose, selectedCase }: CaseDetailModalProps) {
  if (!selectedCase) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm shadow-[inset_0px_0px_100px_rgba(201,167,74,0.1)]"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white border-4 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[90vh] overflow-hidden"
          >
            <div className="p-8 border-b-4 border-black flex justify-between items-start bg-background-linen sticky top-0 z-10">
              <div>
                <h3 className="font-bebas text-6xl text-black leading-none mb-4">CASE {selectedCase.id}</h3>
                <div className="flex gap-4 font-mono text-[10px] font-bold uppercase">
                  <UrgencyBadge urgency={selectedCase.urgency} />
                  <span className="border border-black px-2 py-1">{selectedCase.patient}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 border-2 border-black hover:bg-black hover:text-white transition-all cursor-pointer bg-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-12">
              {/* AI Breakdown */}
              <section>
                <h4 className="font-mono text-xs font-bold text-black/30 uppercase tracking-[0.4em] mb-8 border-b border-black/10 pb-4">INTELLIGENCE LAYER</h4>
                <div className="flex items-end gap-6 mb-8">
                  <div className="flex-1 bg-black text-white p-8">
                    <p className="font-mono text-[10px] text-primary font-bold mb-4">CONFIDENCE_VECTOR</p>
                    <span className="font-bebas text-8xl text-primary leading-none">{selectedCase.confidence}</span>
                    <span className="font-bebas text-3xl text-primary opacity-50 ml-2">%</span>
                  </div>
                  <div className="flex-1 border-2 border-black p-8 text-center italic">
                    <Activity className="w-8 h-8 text-black mx-auto mb-4" />
                    <p className="font-mono text-[10px] font-bold text-black">UMLS_MAPPED</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="font-mono text-[10px] font-bold text-black/50 uppercase tracking-widest">Extracted Clinical Entity</p>
                  <div className="flex flex-wrap gap-2">
                    {['CHEST_PAIN', 'SHORT_BREATH', 'HYPERTENSION', 'TACHYCARDIA'].map(tag => (
                      <span key={tag} className="border border-black px-3 py-1 font-mono text-[10px] font-bold hover:bg-black hover:text-white transition-all cursor-crosshair">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </section>

              {/* Narrative */}
              <section>
                <h4 className="font-mono text-xs font-bold text-black/30 uppercase tracking-[0.4em] mb-6 border-b border-black/10 pb-4">RAW INPUT</h4>
                <div className="bg-background-linen p-8 border-l-4 border-black italic leading-loose font-mono text-[11px] text-black/70">
                  "{selectedCase.complaint}. Historical PHI de-identified successfully. No conflicting allergy data found in local cache."
                </div>
              </section>
            </div>

            {/* Actions */}
            <div className="p-8 border-t-4 border-black bg-white space-y-4 shrink-0 transition-all sticky bottom-0 z-10">
              <button className="w-full bg-black text-white py-5 font-mono text-xs font-bold uppercase tracking-widest border-2 border-black hover:bg-primary hover:border-primary hover:text-white transition-all transform hover:-translate-y-1 active:translate-y-0 cursor-pointer flex items-center justify-center gap-3 group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CheckCircle2 className="w-4 h-4 text-primary group-hover:text-white" />
                Mark Protocol Complete
              </button>
              <button className="w-full bg-white text-urgency-critical py-5 font-mono text-xs font-bold uppercase tracking-widest border-2 border-urgency-critical hover:bg-urgency-critical hover:text-white transition-all transform hover:-translate-y-1 active:translate-y-0 cursor-pointer flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(201,33,33,0.2)]">
                <AlertTriangle className="w-4 h-4" />
                Escalate to Level 1
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
