import React, { useState, useRef, useEffect } from 'react';
import { Type, Mic, Upload, ArrowRight, Loader2, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { intakeText, intakeAudio } from '../api';
import type { Screen } from '../types';
import { getLocale, t, type Locale } from '../i18n';
import { INDIA_ED_TEMPLATES } from '../intakeTemplates';

interface IntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: Screen) => void;
}

export default function IntakeModal({ isOpen, onClose, onNavigate }: IntakeModalProps) {
  const [mode, setMode] = useState<'text' | 'audio'>('text');
  const [patientName, setPatientName] = useState('');
  const [mrn, setMrn] = useState('');
  const [notes, setNotes] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [locale, setLoc] = useState<Locale>(getLocale);
  const audioRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onLoc = () => setLoc(getLocale());
    window.addEventListener('mt-locale', onLoc);
    return () => window.removeEventListener('mt-locale', onLoc);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setMode('text');
      setPatientName('');
      setMrn('');
      setNotes('');
      setAudioFile(null);
      setIsProcessing(false);
      setProcessStep('');
      setIsSuccess(false);
      setError('');
      setLoc(getLocale());
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);
    try {
      if (mode === 'text') {
        if (!notes.trim()) {
          setError(t('clinicalNotesRequired', locale));
          setIsProcessing(false);
          return;
        }
        setProcessStep('Submitting...');
        await intakeText(notes, patientName || undefined, mrn || undefined);
      } else {
        if (!audioFile) {
          setError(t('audioRequired', locale));
          setIsProcessing(false);
          return;
        }
        setProcessStep('Uploading...');
        await intakeAudio(audioFile, patientName || undefined, mrn || undefined);
      }
      setProcessStep('Processing...');
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        onNavigate('queue');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="app-ui fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={isProcessing || isSuccess ? undefined : onClose}
        className="absolute inset-0 bg-syncra-ink/40"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 8 }}
        className="relative w-full max-w-3xl bg-white border border-syncra-border rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        <header className="p-6 border-b border-syncra-border flex justify-between items-center sticky top-0 z-10 bg-white">
          <div>
            <h1 className="text-xl font-medium text-syncra-ink">{t('intakeTitle', locale)}</h1>
            <p className="text-xs text-syncra-muted mt-1">{t('hinglishHint', locale)}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing || isSuccess}
            className="p-2 rounded-lg border border-syncra-border hover:bg-syncra-card-stroke transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5 text-syncra-tertiary" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-1 mb-8 p-1 rounded-xl border border-syncra-border bg-syncra-card-stroke w-fit">
              <button
                onClick={() => setMode('text')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  mode === 'text' ? 'bg-white text-syncra-ink shadow-sm' : 'text-syncra-secondary hover:text-syncra-ink'
                }`}
              >
                <Type className="w-3.5 h-3.5" /> {t('textMode', locale)}
              </button>
              <button
                onClick={() => setMode('audio')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  mode === 'audio' ? 'bg-white text-syncra-ink shadow-sm' : 'text-syncra-secondary hover:text-syncra-ink'
                }`}
              >
                <Mic className="w-3.5 h-3.5" /> {t('audioMode', locale)}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="syncra-label">{t('patientName', locale)}</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="syncra-input"
                  placeholder="Ex: Patient 0042 / John Doe"
                />
              </div>

              <div>
                <label className="syncra-label">{t('mrn', locale)}</label>
                <input
                  type="text"
                  value={mrn}
                  onChange={(e) => setMrn(e.target.value)}
                  className="syncra-input"
                  placeholder="Ex: MRN-0042-98765"
                />
              </div>

              {mode === 'text' ? (
                <div className="space-y-3">
                  <div>
                    <label className="syncra-label">India ED templates</label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {INDIA_ED_TEMPLATES.map((tpl) => (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() =>
                            setNotes((prev) => (prev.trim() ? `${prev.trim()}\n\n${tpl.hint}` : tpl.hint))
                          }
                          className="px-2.5 py-1 rounded-lg border border-syncra-border bg-white text-[11px] font-medium text-syncra-ink hover:bg-syncra-card-stroke cursor-pointer"
                        >
                          {locale === 'hi' ? tpl.labelHi : tpl.labelEn}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-syncra-muted mt-1.5">
                      Chips prefill a structured hint — edit freely before submit.
                    </p>
                  </div>
                  <div>
                    <label className="syncra-label">{t('clinicalNotes', locale)}</label>
                    <textarea
                      required
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="syncra-input h-48 resize-none leading-relaxed"
                      placeholder={t('notesPlaceholder', locale)}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="syncra-label">{t('audioMode', locale)}</label>
                  <input
                    ref={audioRef}
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <div
                    onClick={() => audioRef.current?.click()}
                    className="w-full h-48 rounded-xl border border-dashed border-syncra-nested flex flex-col items-center justify-center p-6 text-center hover:bg-syncra-card-stroke transition-colors cursor-pointer"
                  >
                    <Upload className="w-8 h-8 text-syncra-muted mb-3" />
                    {audioFile ? (
                      <>
                        <p className="text-sm font-medium text-syncra-ink mb-1">{audioFile.name}</p>
                        <p className="text-[11px] text-syncra-muted">
                          {(audioFile.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-syncra-ink mb-1">Click to select audio file</p>
                        <p className="text-[11px] text-syncra-muted">WAV / MP3 / FLAC (max 25MB)</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2 flex flex-col md:flex-row gap-4 items-start md:items-center">
                <button
                  type="submit"
                  disabled={isProcessing || isSuccess}
                  className="syncra-btn-primary !px-8 !py-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  <span>
                    {isProcessing ? 'Processing...' : isSuccess ? 'Success' : t('submitIntake', locale)}
                  </span>
                  {!isProcessing && !isSuccess && <ArrowRight className="w-4 h-4" />}
                </button>

                <AnimatePresence>
                  {(isProcessing || isSuccess || error) && (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 text-xs font-medium"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-syncra-tertiary" />
                          <span className="text-syncra-tertiary">{processStep}</span>
                        </>
                      ) : isSuccess ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-syncra-up" />
                          <span className="text-syncra-up">Complete — redirecting</span>
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4 text-syncra-down" />
                          <span className="text-syncra-down">{error}</span>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </div>
        </div>

        <footer className="bg-syncra-card-stroke text-[10px] text-syncra-muted px-6 py-3 flex justify-between border-t border-syncra-border">
          <span>Secure Intake Layer: active</span>
          <span className="max-w-[60%] text-right truncate">{t('hinglishHint', locale)}</span>
        </footer>
      </motion.div>
    </div>
  );
}
