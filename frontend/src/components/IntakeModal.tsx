import React, { useState, useRef, useEffect } from 'react';
import { Type, Mic, Upload, ArrowRight, Loader2, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { intakeText, intakeAudio } from '../api';
import type { Screen } from '../types';

interface IntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: Screen) => void;
}

export default function IntakeModal({ isOpen, onClose, onNavigate }: IntakeModalProps) {
  const [mode, setMode] = useState<'text' | 'audio'>('text');
  const [patientName, setPatientName] = useState('');
  const [notes, setNotes] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const audioRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMode('text');
      setPatientName('');
      setNotes('');
      setAudioFile(null);
      setIsProcessing(false);
      setProcessStep('');
      setIsSuccess(false);
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);
    try {
      if (mode === 'text') {
        if (!notes.trim()) { setError('Clinical notes required'); setIsProcessing(false); return; }
        setProcessStep('SUBMITTING...');
        await intakeText(notes, patientName || undefined);
      } else {
        if (!audioFile) { setError('Audio file required'); setIsProcessing(false); return; }
        setProcessStep('UPLOADING...');
        await intakeAudio(audioFile, patientName || undefined);
      }
      setProcessStep('PROCESSING...');
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={isProcessing || isSuccess ? undefined : onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm shadow-[inset_0px_0px_100px_rgba(201,167,74,0.1)]"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 10 }}
        className="relative w-full max-w-5xl bg-background-linen border-4 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[90vh] overflow-hidden"
      >
        <header className="p-8 border-b-4 border-black bg-white flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="font-bebas text-5xl tracking-wider text-black text-balance">NEW INTAKE PROTOCOL</h1>
            <p className="font-mono text-[10px] text-black/50 uppercase tracking-[0.3em] mt-1">Initialize patient clinical intelligence pipeline</p>
          </div>
          <button onClick={onClose} disabled={isProcessing || isSuccess} className="p-3 border-2 border-black hover:bg-black hover:text-white transition-colors active:scale-[0.96] cursor-pointer bg-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-black">
            <X className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 md:p-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-0 mb-10 border-2 border-black w-fit bg-white">
              <button onClick={() => setMode('text')} className={`flex items-center gap-3 px-8 py-4 font-mono font-bold uppercase text-sm cursor-pointer transition-colors ${mode === 'text' ? 'bg-black text-white' : 'hover:bg-black/5'}`}>
                <Type className="w-4 h-4" /> Text Mode
              </button>
              <button onClick={() => setMode('audio')} className={`flex items-center gap-3 px-8 py-4 font-mono font-bold uppercase text-sm border-l-2 border-black cursor-pointer transition-colors ${mode === 'audio' ? 'bg-black text-white' : 'hover:bg-black/5'}`}>
                <Mic className="w-4 h-4" /> Audio Mode
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="font-mono text-xs font-bold uppercase tracking-widest text-black/60">Patient Name / Identifier (Optional)</label>
                <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} className="w-full bg-white border-2 border-black p-5 font-mono text-lg outline-none focus:bg-primary/5 transition-colors placeholder:text-black/10" placeholder="Ex: PATIENT 0042 / JOHN DOE" />
              </div>

              {mode === 'text' ? (
                <div className="space-y-3">
                  <label className="font-mono text-xs font-bold uppercase tracking-widest text-black/60">Clinical Notes / Initial Narrative</label>
                  <textarea required value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full h-64 bg-white border-2 border-black p-6 font-mono text-sm leading-relaxed outline-none focus:bg-primary/5 transition-colors placeholder:text-black/10 resize-none" placeholder="Enter patient symptoms, history of present illness, and any relevant clinical context here..."></textarea>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="font-mono text-xs font-bold uppercase tracking-widest text-black/60">Audio Submission</label>
                  <input ref={audioRef} type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} className="hidden" />
                  <div onClick={() => audioRef.current?.click()} className="w-full h-64 bg-white border-2 border-dashed border-black flex flex-col items-center justify-center p-8 text-center group hover:bg-black/5 transition-colors cursor-pointer">
                    <Upload className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                    {audioFile ? (
                      <>
                        <p className="font-mono text-sm font-bold uppercase mb-2">{audioFile.name}</p>
                        <p className="font-mono text-[10px] text-black/40 uppercase tracking-widest">{(audioFile.size / 1024 / 1024).toFixed(1)} MB</p>
                      </>
                    ) : (
                      <>
                        <p className="font-mono text-sm font-bold uppercase mb-2">Click to select audio file</p>
                        <p className="font-mono text-[10px] text-black/40 uppercase tracking-widest">WAV / MP3 / FLAC (MAX 50MB)</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-4 flex flex-col md:flex-row gap-6 items-start md:items-center">
                <button type="submit" disabled={isProcessing || isSuccess} className="group relative flex items-center justify-center w-full md:w-fit min-w-[300px] border-2 border-black bg-black text-white px-10 py-6 font-mono font-bold uppercase text-lg tracking-wider hover:bg-primary hover:text-black hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer overflow-hidden active:scale-[0.96]">
                  <span className="relative z-10">{isProcessing ? 'Processing...' : isSuccess ? 'Success' : 'Submit for Analysis'}</span>
                  {!isProcessing && !isSuccess && <ArrowRight className="ml-4 w-6 h-6 group-hover:translate-x-2 transition-transform relative z-10" />}
                  <AnimatePresence>
                    {isProcessing && (
                      <motion.div initial={{ top: '-100%' }} animate={{ top: '100%' }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="absolute left-0 right-0 h-4 bg-primary/30 z-0 blur-sm" />
                    )}
                  </AnimatePresence>
                </button>

                <AnimatePresence>
                  {(isProcessing || isSuccess || error) && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 font-mono font-bold italic">
                      {isProcessing ? (
                        <><Loader2 className="w-5 h-5 animate-spin text-primary-ink" /><span className="text-primary-ink text-sm uppercase tracking-widest">{processStep}</span></>
                      ) : isSuccess ? (
                        <><CheckCircle2 className="w-5 h-5 text-green-600" /><span className="text-green-600 text-sm uppercase tracking-widest">Cycle Complete // Redirecting</span></>
                      ) : (
                        <><X className="w-5 h-5 text-red-500" /><span className="text-red-500 text-sm uppercase tracking-widest">{error}</span></>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </div>
        </div>

        <footer className="bg-black text-[8px] font-mono text-primary/60 p-4 flex justify-between uppercase tracking-widest">
          <span>Secure Intake Layer: active</span>
          <span>Encrypted Stream: AES4096</span>
        </footer>
      </motion.div>
    </div>
  );
}
