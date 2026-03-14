import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Search, Download, Settings, User, ChevronsLeft, ChevronsRight, LayoutGrid, Filter, ArrowLeft, Terminal, Printer, LayoutDashboard } from 'lucide-react';
import { AuditEntry, Screen } from '../types';

const MOCK_LOGS: AuditEntry[] = [
  {
    timestamp: '2023-10-24 14:22:01.004',
    clinicianId: 'DR_HENDERSON_42',
    caseRef: '#00142',
    action: 'TRIAGE_UPGRADE',
    prevLevel: 'LEVEL 3',
    newLevel: 'LEVEL 1',
    status: 'upgrade'
  },
  {
    timestamp: '2023-10-24 14:15:45.912',
    clinicianId: 'RN_CHEN_19',
    caseRef: '#00143',
    action: 'INITIAL_ASSESS',
    prevLevel: 'NULL',
    newLevel: 'LEVEL 2',
    status: 'initial'
  },
  {
    timestamp: '2023-10-24 14:02:10.552',
    clinicianId: 'DR_HENDERSON_42',
    caseRef: '#00141',
    action: 'DISCHARGE_AUTH',
    prevLevel: 'LEVEL 2',
    newLevel: 'N/A',
    status: 'discharge'
  },
  {
    timestamp: '2023-10-24 13:55:12.118',
    clinicianId: 'RN_SMITH_04',
    caseRef: '#00140',
    action: 'TRIAGE_DOWNGRADE',
    prevLevel: 'LEVEL 1',
    newLevel: 'LEVEL 2',
    status: 'downgrade'
  },
  {
    timestamp: '2023-10-24 13:48:30.000',
    clinicianId: 'DR_ALTO_88',
    caseRef: '#00142',
    action: 'RECORD_OPEN',
    prevLevel: 'LEVEL 3',
    newLevel: 'LEVEL 3',
    status: 'record'
  },
  {
    timestamp: '2023-10-24 13:30:05.421',
    clinicianId: 'SYS_CORE_AUTO',
    caseRef: '#00139',
    action: 'DATA_SCRUB_COMPLETE',
    prevLevel: 'RAW',
    newLevel: 'DEID',
    status: 'record'
  }
];

interface AuditLogProps {
  onNavigate: (screen: Screen) => void;
}

export default function AuditLog({ onNavigate }: AuditLogProps) {
  const [filter, setFilter] = useState('');

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-linen font-mono">
      <Sidebar currentScreen="audit" onNavigate={onNavigate} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b-2 border-black flex items-center justify-between px-10 bg-white sticky top-0 z-50 shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <LayoutGrid className="w-8 h-8 text-primary" />
              <h1 className="font-bebas text-4xl tracking-widest text-black uppercase">Platform_Audit_Log</h1>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 border-2 border-black px-4 py-2 bg-white">
              <Search className="w-4 h-4 text-black/30" />
              <input
                type="text"
                placeholder="SEARCH_BY_ID or_CLINICIAN..."
                className="bg-transparent border-none outline-none font-mono text-[10px] w-64 uppercase"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <div className="h-10 w-0.5 bg-black"></div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] text-black/40 font-bold leading-none uppercase">Admin_Node</p>
                <p className="text-xs font-bold text-black uppercase">J. Henderson</p>
              </div>
              <div className="w-10 h-10 bg-black text-primary flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(201,167,74,1)]">
                <Terminal className="w-5 h-5" />
              </div>
            </div>
          </div>
        </header>

        {/* Audit Table Area */}
        <main className="flex-1 p-12 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <header className="mb-10 flex justify-between items-end">
              <div>
                <h2 className="font-bebas text-7xl text-black mb-2">SYSTEM_CHRONOLOGY</h2>
                <div className="h-1.5 w-full bg-black mb-6"></div>
                <div className="flex items-center gap-8 font-mono text-[10px] font-bold text-black/40 uppercase tracking-[0.4em]">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Log_Daemon: Active</span>
                  <span>Total_Trace: 142,901 Nodes</span>
                  <span>Displaying_Subset: 001-025</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex items-center gap-3 border-2 border-black bg-white px-6 py-3 font-bold uppercase text-[10px] hover:bg-black hover:text-white transition-all cursor-pointer">
                  <Download className="w-4 h-4" />
                  Export_CSV
                </button>
                <button className="flex items-center gap-3 border-2 border-black bg-white px-6 py-3 font-bold uppercase text-[10px] hover:bg-black hover:text-white transition-all cursor-pointer">
                  <Printer className="w-4 h-4" />
                  Print_Physical
                </button>
              </div>
            </header>

            {/* Dense Data Table */}
            <div className="border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead className="bg-black text-white uppercase text-[11px] tracking-widest border-b-4 border-black font-bold">
                  <tr>
                    <th className="p-6 border-r border-white/10">Timestamp</th>
                    <th className="p-6 border-r border-white/10">Clinician_ID</th>
                    <th className="p-6 border-r border-white/10">Case_Reference</th>
                    <th className="p-6 border-r border-white/10">Action_Protocol</th>
                    <th className="p-6 border-r border-white/10 text-center">Prev_Lvl</th>
                    <th className="p-6 text-center">New_Lvl</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black/10">
                  {MOCK_LOGS.map((log, i) => (
                    <tr key={i} className="hover:bg-primary/5 transition-colors group">
                      <td className="p-6 text-black/50 border-r border-black/5 font-bold group-hover:text-black transition-colors">{log.timestamp}</td>
                      <td className="p-6 font-bold uppercase border-r border-black/5">{log.clinicianId}</td>
                      <td className="p-6 text-primary font-bold border-r border-black/5 flex items-center gap-4">
                        <span className="underline decoration-2 decoration-primary/30 hover:decoration-primary cursor-pointer transition-all">{log.caseRef}</span>
                        <ChevronsRight className="w-3 h-3 translate-x-0 group-hover:translate-x-2 transition-transform opacity-40" />
                      </td>
                      <td className="p-6 border-r border-black/5">
                        <span className={`px-4 py-1.5 border-2 text-[10px] font-bold uppercase transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] group-hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${log.status === 'upgrade' ? 'bg-red-500 text-white border-black' :
                          log.status === 'downgrade' ? 'bg-green-500 text-white border-black' :
                            log.status === 'initial' ? 'bg-primary text-white border-black' :
                              'bg-white text-black border-black'
                          }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-6 text-center border-r border-black/5 text-black/30 font-bold italic">{log.prevLevel}</td>
                      <td className="p-6 text-center">
                        <span className={`text-base font-bebas tracking-widest px-4 py-1 ${log.newLevel === 'LEVEL 1' ? 'text-red-600 bg-red-50' :
                          log.status === 'discharge' ? 'text-green-600 bg-green-50' : 'text-black'
                          }`}>
                          {log.newLevel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Matrix */}
            <div className="mt-12 flex justify-center">
              <div className="flex border-4 border-black bg-white overflow-hidden shadow-[8px_8px_0px_0px_rgba(201,167,74,1)]">
                <button className="p-4 border-r-2 border-black hover:bg-black hover:text-white transition-all cursor-pointer group">
                  <ChevronsLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </button>
                <div className="flex">
                  {[1, 2, 3, '...', 1422].map((p, i) => (
                    <button key={i} className={`px-8 py-4 border-r-2 border-black font-bold text-lg hover:bg-primary hover:text-white transition-all cursor-pointer ${p === 1 ? 'bg-black text-white' : ''}`}>
                      {p}
                    </button>
                  ))}
                </div>
                <button className="p-4 hover:bg-black hover:text-white transition-all cursor-pointer group">
                  <ChevronsRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Persistent Terminal Status */}
        <footer className="h-10 bg-black text-[9px] font-mono text-primary/60 flex items-center justify-between px-10 tracking-[0.2em] uppercase shrink-0">
          <div className="flex gap-10">
            <span>ENCRYPTION_LAYER: AES-4096_ACTIVE</span>
            <span>NODE_AUTH: VALIDATED</span>
            <span>Uptime: 1,421:42:01</span>
          </div>
          <div className="text-white font-bold animate-pulse">
            Terminal_Active // {new Date().toLocaleTimeString()}
          </div>
        </footer>
      </div>
    </div>
  );
}

