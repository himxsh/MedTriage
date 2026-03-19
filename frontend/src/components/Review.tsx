import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { LayoutDashboard, History, BarChart3, Settings, User, CheckCircle, AlertTriangle, ShieldAlert, ArrowRight, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PatientCase, Screen } from '../types';

const MOCK_REVIEW_CASES: PatientCase[] = [
  {
    id: '#00187',
    patient: 'Alice Green',
    complaint: 'SEVERE LOWER BACK PAIN / RADIATING',
    urgency: 'HIGH',
    confidence: 85,
    time: '14:20',
    age: 42,
    sex: 'F',
    arrival: '14:10 UTC',
    vitals: { bp: '138/88', hr: 92, spo2: '97%', temp: '99.1 F' }
  },
  {
    id: '#00188',
    patient: 'Charlie Brown',
    complaint: 'CONFUSION / SLURRED SPEECH / ACUTE',
    urgency: 'CRITICAL',
    confidence: 96,
    time: '14:25',
    age: 68,
    sex: 'M',
    arrival: '14:15 UTC',
    vitals: { bp: '160/95', hr: 104, spo2: '93%', temp: '98.4 F' }
  }
];

interface ReviewProps {
  onNavigate: (screen: Screen) => void;
}

export default function Review({ onNavigate }: ReviewProps) {
  const [selectedCase, setSelectedCase] = useState<PatientCase>(MOCK_REVIEW_CASES[0]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-linen">
      <Sidebar currentScreen="review" onNavigate={onNavigate} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b-2 border-black flex items-center justify-between px-10 bg-white">
          <div className="flex items-center gap-4">
             <h2 className="font-bebas text-4xl tracking-[0.1em] text-black uppercase">Active Reviews</h2>
             <span className="bg-primary text-white font-mono text-[10px] px-2 py-1 font-bold">L-04 CLEARANCE</span>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 border-2 border-black px-4 py-2 bg-background-linen">
              <Search className="w-4 h-4 text-black/40" />
              <input type="text" placeholder="FILTER BY ID..." className="bg-transparent border-none outline-none font-mono text-[10px] w-32 placeholder:text-black/20" />
            </div>
          </div>
        </header>

        {/* Bulk Actions Bar */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-primary px-10 py-4 flex justify-between items-center border-b-2 border-black"
            >
              <div className="flex items-center gap-4 text-white font-mono text-xs font-bold uppercase">
                <CheckCircle className="w-5 h-5" />
                {selectedIds.length} Cases Selected for Batch Processing
              </div>
              <div className="flex gap-4">
                <button className="bg-black text-white px-6 py-2 font-mono text-[10px] font-bold uppercase hover:bg-white hover:text-black transition-all border-2 border-black cursor-pointer">
                  MARK SELECTED COMPLETE
                </button>
                <button onClick={() => setSelectedIds([])} className="text-white hover:underline font-mono text-[10px] uppercase cursor-pointer">
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Queue Content */}
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-10">
            <div className="space-y-6">
              {MOCK_REVIEW_CASES.map((c) => (
                <div 
                  key={c.id}
                  onClick={() => setSelectedCase(c)}
                  className={`relative border-2 border-black bg-white p-8 transition-all cursor-pointer group hover:translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${
                    selectedCase.id === c.id ? 'translate-x-1 -translate-y-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-primary' : ''
                  }`}
                >
                  <div className="absolute top-0 left-0 bottom-0 w-2 bg-primary"></div>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center justify-center border-2 border-black p-1 hover:bg-primary transition-all" onClick={(e) => toggleSelect(c.id, e)}>
                         <div className={`w-4 h-4 border-2 border-black ${selectedIds.includes(c.id) ? 'bg-black' : 'bg-white'}`}></div>
                      </div>
                      <div>
                        <span className="font-mono text-xs font-bold text-primary mb-1 block">{c.id}</span>
                        <h3 className="font-bebas text-4xl text-black leading-none">{c.patient}</h3>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className={`px-4 py-1.5 font-mono text-xs font-bold text-white uppercase ${
                         c.urgency === 'CRITICAL' ? 'bg-urgency-critical' : 'bg-urgency-high text-black'
                       }`}>
                         {c.urgency}
                       </span>
                       <p className="font-mono text-[10px] text-black/40 uppercase mt-2 tracking-widest">{c.time} // {c.arrival}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="md:col-span-2">
                        <p className="font-mono text-[10px] font-bold text-black/30 uppercase tracking-[0.2em] mb-3">Narrative Snippet</p>
                        <p className="font-mono text-sm text-black/70 italic leading-relaxed">
                          "{c.complaint}. Patient appears stable but reports escalating discomfort. Preliminary AI scan suggests potential high-risk markers..."
                        </p>
                     </div>
                     <div className="border-l-2 border-black/10 pl-8">
                        <p className="font-mono text-[10px] font-bold text-black/30 uppercase tracking-[0.2em] mb-3">AI confidence</p>
                        <div className="flex items-baseline gap-2">
                           <span className="font-bebas text-6xl text-primary">{c.confidence}%</span>
                        </div>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </main>

          {/* Quick Info Panel */}
          <aside className="w-[400px] border-l-2 border-black bg-white/50 overflow-y-auto p-10">
            <div className="space-y-10">
              <header>
                 <p className="font-mono text-sm font-bold text-primary mb-2 uppercase tracking-widest">Active Focus</p>
                 <h2 className="font-bebas text-5xl text-black leading-none uppercase">Case Detail</h2>
              </header>

              <section className="space-y-6">
                <div className="bg-white border-2 border-black p-6">
                   <p className="font-mono text-[10px] font-bold text-black/40 uppercase tracking-[0.2em] mb-4">Vitals / Biometrics</p>
                   <div className="grid grid-cols-2 gap-y-6">
                      <div>
                        <p className="text-[10px] font-mono text-black/60 uppercase">BP</p>
                        <p className="text-xl font-mono font-bold text-black leading-none">{selectedCase.vitals.bp}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono text-black/60 uppercase">Pulse</p>
                        <p className="text-xl font-mono font-bold text-black leading-none">{selectedCase.vitals.hr} BPM</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono text-black/60 uppercase">SpO2</p>
                        <p className="text-xl font-mono font-bold text-black leading-none">{selectedCase.vitals.spo2}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono text-black/60 uppercase">Temp</p>
                        <p className="text-xl font-mono font-bold text-black leading-none">{selectedCase.vitals.temp}</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                  <button className="w-full flex items-center justify-center gap-3 bg-black text-white px-8 py-5 font-mono text-sm font-bold uppercase transition-all hover:bg-primary cursor-pointer border-2 border-black">
                    <CheckCircle className="w-5 h-5" />
                    APPROVE TRIAGE
                  </button>
                  <button className="w-full flex items-center justify-center gap-3 bg-white text-urgency-critical border-2 border-urgency-critical px-8 py-5 font-mono text-sm font-bold uppercase transition-all hover:bg-urgency-critical hover:text-white cursor-pointer">
                    <AlertTriangle className="w-5 h-5" />
                    ESCALATE IMMEDIATELY
                  </button>
                  <button className="w-full py-4 font-mono text-[10px] font-bold text-black/40 uppercase hover:text-black hover:underline transition-all cursor-pointer">
                    View Full Analysis Record
                  </button>
                </div>
              </section>

              <div className="border-t-2 border-black/10 pt-10">
                 <div className="bg-black text-white p-6 font-mono">
                    <p className="text-[10px] text-primary font-bold mb-4 uppercase tracking-[0.3em]">AI INSIGHT DELTA</p>
                    <p className="text-xs leading-relaxed opacity-80">
                      UMLS mapping detected high correlation with cardiovascular distress markers. Recommend immediate ECG.
                    </p>
                 </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
