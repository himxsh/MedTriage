import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { LayoutDashboard, History, BarChart3, Settings, User, Activity, Search, Filter, Plus, ChevronRight, X, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PatientCase, Screen } from '../types';
import CaseDetailModal from './CaseDetailModal';
import UrgencyBadge from './UrgencyBadge';

const MOCK_CASES: PatientCase[] = [
  {
    id: '#00142',
    patient: 'John Doe',
    complaint: 'CHEST PAIN / SHORTNESS OF BREATH / RADIATING TO JAW',
    urgency: 'CRITICAL',
    confidence: 92,
    time: '02:15',
    age: 54,
    sex: 'M',
    arrival: '12:38 IST',
    vitals: { bp: '145/92', hr: 112, spo2: '94%', temp: '98.6 F' }
  },
  {
    id: '#00143',
    patient: 'Jane Smith',
    complaint: 'ABDOMINAL PAIN / ACUTE / RUQ SENSITIVITY',
    urgency: 'HIGH',
    confidence: 88,
    time: '05:30',
    age: 32,
    sex: 'F',
    arrival: '12:45 IST',
    vitals: { bp: '110/70', hr: 85, spo2: '98%', temp: '101.2 F' }
  },
  {
    id: '#00144',
    patient: 'Bob White',
    complaint: 'LACERATION / RIGHT HAND / DEPTH 2CM',
    urgency: 'MODERATE',
    confidence: 75,
    time: '08:45',
    age: 45,
    sex: 'M',
    arrival: '13:10 IST',
    vitals: { bp: '128/82', hr: 72, spo2: '99%', temp: '98.4 F' }
  },
  {
    id: '#00145',
    patient: 'Sarah Connor',
    complaint: 'PERSISTENT COUGH / FEVER 102.4 / 3 DAYS',
    urgency: 'MODERATE',
    confidence: 81,
    time: '09:12',
    age: 29,
    sex: 'F',
    arrival: '13:20 IST',
    vitals: { bp: '118/76', hr: 88, spo2: '98%', temp: '102.4 F' }
  }
];

interface DashboardProps {
  onNavigate: (screen: Screen) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [selectedCase, setSelectedCase] = useState<PatientCase | null>(null);
  const [filterUrgency, setFilterUrgency] = useState<string>('ALL');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredCases = filterUrgency === 'ALL'
    ? MOCK_CASES
    : MOCK_CASES.filter(c => c.urgency === filterUrgency);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-linen">
      <Sidebar currentScreen="dashboard" onNavigate={onNavigate} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-20 border-b-2 border-black flex items-center justify-between px-10 bg-white shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-8">
            <h2 className="font-bebas text-4xl tracking-[0.1em] text-black">DASHBOARD</h2>

          </div>
          <div className="flex items-center gap-8">
            <div className="font-mono text-2xl text-black tracking-tighter font-bold bg-black text-white px-4 py-1">
              {currentTime}
            </div>
            <button
              onClick={() => onNavigate('intake')}
              className="bg-primary text-white px-8 py-3 border-2 border-black font-mono text-sm font-bold uppercase transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              + New Intake
            </button>
          </div>
        </header>

        {/* Rapid Stats Row */}
        <div className="flex divide-x-2 divide-black border-b-2 border-black bg-white shrink-0">
          {[
            { label: 'Pending', count: '24', color: 'text-black' },
            { label: 'In Review', count: '08', color: 'text-primary' },
            { label: 'Completed', count: '142', color: 'text-black/30' }
          ].map((stat, i) => (
            <div key={i} className="flex-1 p-6 hover:bg-black/5 transition-colors group cursor-default">
              <p className="font-mono text-[10px] font-bold text-black/40 uppercase tracking-[0.3em] mb-2">{stat.label}</p>
              <p className={`font-bebas text-6xl ${stat.color} group-hover:scale-105 transition-transform origin-left`}>{stat.count}</p>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden relative">
          <main className="flex-1 overflow-y-auto bg-background-linen p-8">
            {/* Filter Bar */}
            <div className="mb-8 flex justify-between items-end">
              <div className="flex gap-4">
                {['ALL', 'CRITICAL', 'HIGH', 'MODERATE'].map(u => (
                  <button
                    key={u}
                    onClick={() => setFilterUrgency(u)}
                    className={`px-6 py-2 border-2 border-black font-mono text-[10px] font-bold uppercase transition-all cursor-pointer ${filterUrgency === u ? 'bg-black text-white' : 'bg-white text-black hover:bg-black/5'
                      }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 border-b-2 border-black pb-2 px-2">
                <Search className="w-4 h-4 text-black/30" />
                <input type="text" placeholder="FILTER_RECORDS..." className="bg-transparent border-none outline-none font-mono text-[10px] w-48 uppercase" />
              </div>
            </div>

            {/* Queue Table */}
            <div className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead className="sticky top-0 bg-neutral-100 z-10 border-b-2 border-black">
                  <tr>
                    <th className="p-5 text-black font-bold uppercase tracking-widest border-r border-black/10">ID</th>
                    <th className="p-5 text-black font-bold uppercase tracking-widest border-r border-black/10">Patient Name</th>
                    <th className="p-5 text-black font-bold uppercase tracking-widest border-r border-black/10">Primary Complaint</th>
                    <th className="p-5 text-black font-bold uppercase tracking-widest border-r border-black/10">Urgency</th>
                    <th className="p-5 text-black font-bold uppercase tracking-widest border-r border-black/10 text-center">AI Confidence</th>
                    <th className="p-5 text-black font-bold uppercase tracking-widest text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black/10 italic">
                  {filteredCases.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCase(c)}
                      className={`hover:bg-primary/5 cursor-pointer transition-colors group ${selectedCase?.id === c.id ? 'bg-primary/10' : ''}`}
                    >
                      <td className="p-5 text-primary font-bold border-r border-black/5">{c.id}</td>
                      <td className="p-5 text-black font-bold uppercase border-r border-black/5 group-hover:underline">{c.patient}</td>
                      <td className="p-5 text-black/60 truncate max-w-[300px] border-r border-black/5">{c.complaint}</td>
                      <td className="p-5 border-r border-black/5">
                        <UrgencyBadge urgency={c.urgency} />
                      </td>
                      <td className="p-5 border-r border-black/5">
                        <div className="flex items-center gap-3 justify-center">
                          <span className="font-bold text-black">{c.confidence}%</span>
                          <div className="w-16 bg-black/10 h-1.5 flex-shrink-0">
                            <div className="bg-primary h-full" style={{ width: `${c.confidence}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-black/40 text-right font-bold">{c.time}</td>
                    </tr>
                  ))}
                  {filteredCases.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-20 text-center">
                        <h3 className="font-bebas text-6xl text-black/10 tracking-widest">NO_RECORDS_FOUND</h3>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </main>

          <CaseDetailModal
            isOpen={selectedCase !== null}
            onClose={() => setSelectedCase(null)}
            selectedCase={selectedCase}
          />
        </div>
      </div>
    </div>
  );
}
