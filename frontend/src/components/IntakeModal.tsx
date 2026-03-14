import React, { useState } from 'react';
import { Type, Mic, Upload, ArrowRight, Loader2, CheckCircle2, X, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Screen } from '../types';

interface IntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: Screen) => void;
}

export default function IntakeModal({ isOpen, onClose, onNavigate }: IntakeModalProps) {
  const [mode, setMode] = useState<'text' | 'audio' | 'document'>('text');
  const [patientName, setPatientName] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    if (mode === 'audio') {
      setProcessStep('TRANSCRIBING...');
      await new Promise(r => setTimeout(r, 1500));
    } else if (mode === 'document') {
      setProcessStep('EXTRACTING_TEXT...');
      await new Promise(r => setTimeout(r, 1500));
    }
    
    setProcessStep('ANALYZING...');
    await new Promise(r => setTimeout(r, 2000));
    
    setIsProcessing(false);
    setIsSuccess(true);
    
    setTimeout(() => {
      onClose();
      onNavigate('dashboard');
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
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
            className="relative w-full max-w-5xl bg-background-linen border-4 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <header className="p-8 border-b-4 border-black bg-white flex justify-between items-center sticky top-0 z-10">
              <div>
                <h1 className="font-bebas text-5xl tracking-wider text-black">NEW_INTAKE_PROTOCOL</h1>
                <p className="font-mono text-[10px] text-black/50 uppercase tracking-[0.3em] mt-1">Initialize patient clinical intelligence pipeline</p>
              </div>
              <button 
                onClick={onClose}
                className="p-3 border-2 border-black hover:bg-black hover:text-white transition-all cursor-pointer bg-white"
              >
                <X className="w-6 h-6" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-8 md:p-12">
              <div className="max-w-4xl mx-auto">
                {/* Mode Switcher */}
                <div className="flex gap-0 mb-10 border-2 border-black w-fit bg-white">
                  <button
                    onClick={() => setMode('text')}
                    className={`flex items-center gap-3 px-8 py-4 font-mono font-bold uppercase text-sm cursor-pointer transition-all ${
                      mode === 'text' ? 'bg-black text-white' : 'hover:bg-black/5'
                    }`}
                  >
                    <Type className="w-4 h-4" />
                    Text Mode
                  </button>
                  <button
                    onClick={() => setMode('audio')}
                    className={`flex items-center gap-3 px-8 py-4 font-mono font-bold uppercase text-sm border-l-2 border-black cursor-pointer transition-all ${
                      mode === 'audio' ? 'bg-black text-white' : 'hover:bg-black/5'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    Audio Mode
                  </button>
                  <button
                    onClick={() => setMode('document')}
                    className={`flex items-center gap-3 px-8 py-4 font-mono font-bold uppercase text-sm border-l-2 border-black cursor-pointer transition-all ${
                      mode === 'document' ? 'bg-black text-white' : 'hover:bg-black/5'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Document Mode
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Patient Name */}
                  <div className="space-y-3">
                    <label className="font-mono text-xs font-bold uppercase tracking-widest text-black/60">Patient Name / Identifier (Optional)</label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full bg-white border-2 border-black p-5 font-mono text-lg outline-none focus:bg-primary/5 transition-colors placeholder:text-black/10"
                      placeholder="Ex: PATIENT_0042 / JOHN_DOE"
                    />
                  </div>

                  {/* Content Area */}
                  {mode === 'text' ? (
                    <div className="space-y-3">
                      <label className="font-mono text-xs font-bold uppercase tracking-widest text-black/60">Clinical Notes / Initial Narrative</label>
                      <textarea
                        required
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full h-64 bg-white border-2 border-black p-6 font-mono text-sm leading-relaxed outline-none focus:bg-primary/5 transition-colors placeholder:text-black/10 resize-none"
                        placeholder="Enter patient symptoms, history of present illness, and any relevant clinical context here..."
                      ></textarea>
                    </div>
                  ) : mode === 'audio' ? (
                    <div className="space-y-3">
                      <label className="font-mono text-xs font-bold uppercase tracking-widest text-black/60">Audio Submission</label>
                      <div className="w-full h-64 bg-white border-2 border-dashed border-black flex flex-col items-center justify-center p-8 text-center group hover:bg-black/5 transition-all cursor-pointer">
                        <Upload className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                        <p className="font-mono text-sm font-bold uppercase mb-2">Drag and drop audio file</p>
                        <p className="font-mono text-[10px] text-black/40 uppercase tracking-widest">WAV / MP3 / FLAC (MAX 50MB)</p>
                        <div className="mt-8 flex items-center gap-4">
                          <span className="h-[2px] w-8 bg-black/10"></span>
                          <span className="font-mono text-[10px] text-black/40 uppercase">OR</span>
                          <span className="h-[2px] w-8 bg-black/10"></span>
                        </div>
                        <button type="button" className="mt-6 border-2 border-black px-6 py-3 font-mono text-xs font-bold uppercase hover:bg-black hover:text-white transition-all">
                          Start Recording
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="font-mono text-xs font-bold uppercase tracking-widest text-black/60">Document Submission</label>
                      <div className="w-full h-64 bg-white border-2 border-dashed border-black flex flex-col items-center justify-center p-8 text-center group hover:bg-black/5 transition-all cursor-pointer">
                        <Upload className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                        <p className="font-mono text-sm font-bold uppercase mb-2">Drag and drop clinical document</p>
                        <p className="font-mono text-[10px] text-black/40 uppercase tracking-widest">PDF / DOCX / TXT (MAX 25MB)</p>
                        <div className="mt-8 flex items-center gap-4">
                          <span className="h-[2px] w-8 bg-black/10"></span>
                          <span className="font-mono text-[10px] text-black/40 uppercase">OR</span>
                          <span className="h-[2px] w-8 bg-black/10"></span>
                        </div>
                        <button type="button" className="mt-6 border-2 border-black px-6 py-3 font-mono text-xs font-bold uppercase hover:bg-black hover:text-white transition-all">
                          Select File
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Submit Section */}
                  <div className="pt-4 flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <button
                      type="submit"
                      disabled={isProcessing || isSuccess}
                      className="group relative flex items-center justify-center w-full md:w-fit min-w-[300px] border-2 border-black bg-black text-white px-10 py-6 font-mono font-bold uppercase text-lg tracking-wider hover:bg-primary hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer overflow-hidden"
                    >
                      <span className="relative z-10">{isProcessing ? 'Processing...' : isSuccess ? 'Success' : 'Submit for Analysis'}</span>
                      {!isProcessing && !isSuccess && <ArrowRight className="ml-4 w-6 h-6 group-hover:translate-x-2 transition-transform relative z-10" />}
                      <AnimatePresence>
                        {isProcessing && (
                          <motion.div 
                            initial={{ top: '-100%' }}
                            animate={{ top: '100%' }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="absolute left-0 right-0 h-4 bg-primary/30 z-0 blur-sm"
                          />
                        )}
                      </AnimatePresence>
                    </button>

                    {/* Status indicator */}
                    <AnimatePresence>
                      {(isProcessing || isSuccess) && (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-4 font-mono font-bold italic"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin text-primary" />
                              <span className="text-primary text-sm uppercase tracking-widest">{processStep}</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                              <span className="text-green-600 text-sm uppercase tracking-widest">Cycle Complete // Redirecting</span>
                            </>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </form>
              </div>
            </div>
            
            {/* Footer decoration */}
            <footer className="bg-black text-[8px] font-mono text-primary/60 p-4 flex justify-between uppercase tracking-widest">
              <span>Secure_Intake_Layer: active</span>
              <span>Encrypted_Stream: AES4096</span>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
