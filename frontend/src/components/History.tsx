import React, { useState } from 'react';
import { Search, Filter, History as HistoryIcon, User, ChevronRight, ArrowLeft } from 'lucide-react';
import Sidebar from './Sidebar';
import { PatientCase, Screen } from '../types';

const MOCK_HISTORY: PatientCase[] = [
  { id: '#00142', patient: 'John Doe', complaint: 'CHEST PAIN / SHORTNESS OF BREATH', urgency: 'CRITICAL', confidence: 92, time: '2023-10-24', age: 54, sex: 'M', arrival: '12:38 UTC', vitals: { bp: '145/92', hr: 112, spo2: '94%', temp: '98.6 F' } },
  { id: '#00143', patient: 'Jane Smith', complaint: 'ABDOMINAL PAIN / ACUTE / RUQ SENSITIVITY', urgency: 'HIGH', confidence: 88, time: '2023-10-24', age: 32, sex: 'F', arrival: '12:45 UTC', vitals: { bp: '110/70', hr: 85, spo2: '98%', temp: '101.2 F' } },
  { id: '#00144', patient: 'Bob White', complaint: 'LACERATION / RIGHT HAND / DEPTH 2CM', urgency: 'MODERATE', confidence: 75, time: '2023-10-24', age: 45, sex: 'M', arrival: '13:10 UTC', vitals: { bp: '128/82', hr: 72, spo2: '99%', temp: '98.4 F' } },
  { id: '#00145', patient: 'Sarah Connor', complaint: 'PERSISTENT COUGH / FEVER 102.4', urgency: 'MODERATE', confidence: 81, time: '2023-10-24', age: 29, sex: 'F', arrival: '13:20 UTC', vitals: { bp: '118/76', hr: 88, spo2: '98%', temp: '102.4 F' } },
  { id: '#00141', patient: 'Michael Myers', complaint: 'HAND TRAUMA / EXPOSURE', urgency: 'HIGH', confidence: 90, time: '2023-10-23', age: 41, sex: 'M', arrival: '22:15 UTC', vitals: { bp: '130/85', hr: 95, spo2: '96%', temp: '98.9 F' } },
  { id: '#00140', patient: 'Ellen Ripley', complaint: 'FOREIGN BODY INHALATION / RESPIRATORY DISTRESS', urgency: 'CRITICAL', confidence: 97, time: '2023-10-22', age: 35, sex: 'F', arrival: '03:40 UTC', vitals: { bp: '135/88', hr: 105, spo2: '92%', temp: '99.2 F' } },
  { id: '#00139', patient: 'Arthur Dent', complaint: 'CONFUSION / PANIC / TOWEL MISSING', urgency: 'MODERATE', confidence: 65, time: '2023-10-21', age: 30, sex: 'M', arrival: '11:15 UTC', vitals: { bp: '120/80', hr: 75, spo2: '100%', temp: '98.6 F' } },
  { id: '#00138', patient: 'Marty McFly', complaint: 'ELECTRICAL BURN / LIGHTNING STRIKE', urgency: 'HIGH', confidence: 84, time: '2023-10-20', age: 17, sex: 'M', arrival: '01:21 UTC', vitals: { bp: '132/84', hr: 98, spo2: '97%', temp: '98.5 F' } },
  { id: '#00137', patient: 'Indiana Jones', complaint: 'SNAKE BITE / PUNCTURE WOUND', urgency: 'HIGH', confidence: 89, time: '2023-10-19', age: 38, sex: 'M', arrival: '16:00 UTC', vitals: { bp: '125/80', hr: 92, spo2: '98%', temp: '100.5 F' } },
  { id: '#00136', patient: 'Rick Sanchez', complaint: 'CHRONIC LIVER FATIGUE / SLURRED SPEECH', urgency: 'MODERATE', confidence: 72, time: '2023-10-18', age: 70, sex: 'M', arrival: '23:59 UTC', vitals: { bp: '140/95', hr: 68, spo2: '95%', temp: '98.2 F' } }
];

interface HistoryProps {
  onNavigate: (screen: Screen) => void;
}

export default function History({ onNavigate }: HistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = MOCK_HISTORY.filter(c => 
    c.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-linen font-mono">
      <Sidebar currentScreen="history" onNavigate={onNavigate} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b-2 border-black flex items-center justify-between px-10 bg-white shrink-0">
          <div className="flex items-center gap-6">
            <h2 className="font-bebas text-4xl tracking-[0.1em] text-black">PATIENT_HISTORY</h2>
            <div className="bg-black text-white px-4 py-1 text-[10px] font-bold tracking-widest uppercase">
              // TOTAL_RECORDS: {MOCK_HISTORY.length}
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3 border-2 border-black px-4 py-2 bg-background-linen">
               <Search className="w-4 h-4 text-black/40" />
               <input 
                 type="text" 
                 placeholder="SEARCH_BY_PATIENT_OR_ID..." 
                 className="bg-transparent border-none outline-none font-mono text-[10px] w-64 uppercase"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-12">
          <div className="max-w-7xl mx-auto">
             <div className="mb-10 flex justify-between items-end">
                <div>
                   <h1 className="font-bebas text-7xl text-black">SYSTEM_ARCHIVE</h1>
                   <div className="h-2 w-full bg-black mt-2"></div>
                </div>
                <button className="flex items-center gap-2 border-2 border-black px-6 py-3 font-bold uppercase text-[10px] hover:bg-black hover:text-white transition-all cursor-pointer">
                   <Filter className="w-4 h-4" />
                   Advanced Filter
                </button>
             </div>

             <div className="border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <table className="w-full text-left border-collapse">
                   <thead className="bg-black text-white uppercase text-[11px] font-bold tracking-[0.2em] border-b-4 border-black">
                      <tr>
                         <th className="p-6 border-r border-white/10 uppercase">Case_ID</th>
                         <th className="p-6 border-r border-white/10 uppercase">Patient_Name</th>
                         <th className="p-6 border-r border-white/10 uppercase">Clinical_Complaint</th>
                         <th className="p-6 border-r border-white/10 uppercase">Final_Urgency</th>
                         <th className="p-6 uppercase text-right">Date_Logged</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y-2 divide-black/10">
                      {filteredHistory.map((c) => (
                         <tr key={c.id} className="hover:bg-primary/5 transition-all group cursor-pointer">
                            <td className="p-6 border-r border-black/5 font-bold text-primary">{c.id}</td>
                            <td className="p-6 border-r border-black/5 font-bold uppercase group-hover:underline">{c.patient}</td>
                            <td className="p-6 border-r border-black/5 text-black/60 italic truncate max-w-xs">{c.complaint}</td>
                            <td className="p-6 border-r border-black/5">
                               <span className={`px-4 py-1.5 border-2 font-bold uppercase text-[10px] ${
                                  c.urgency === 'CRITICAL' ? 'bg-urgency-critical text-white border-black' :
                                  c.urgency === 'HIGH' ? 'bg-urgency-high text-black border-black' :
                                  'bg-urgency-moderate text-black border-black'
                               }`}>
                                  {c.urgency}
                               </span>
                            </td>
                            <td className="p-6 text-right font-bold text-black/40 group-hover:text-black">{c.time}</td>
                         </tr>
                      ))}
                      {filteredHistory.length === 0 && (
                        <tr>
                           <td colSpan={5} className="p-20 text-center text-black/20 font-bebas text-5xl tracking-widest">
                              // NO_MATCHING_RECORDS
                           </td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>

             <div className="mt-12 flex justify-center gap-4">
                <div className="flex border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(201,167,74,1)]">
                   <button className="px-8 py-4 bg-black text-white font-bold text-lg">1</button>
                   <button className="px-8 py-4 border-l-2 border-black hover:bg-black/5 font-bold text-lg">2</button>
                   <button className="px-8 py-4 border-l-2 border-black hover:bg-black/5 font-bold text-lg">3</button>
                   <div className="px-6 py-4 flex items-center font-bold text-black/20">...</div>
                   <button className="px-8 py-4 border-l-2 border-black hover:bg-black/5 font-bold text-lg">42</button>
                </div>
             </div>
          </div>
        </main>
      </div>
    </div>
  );
}
