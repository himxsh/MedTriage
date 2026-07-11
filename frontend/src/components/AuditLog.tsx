import React, { useState, useEffect } from 'react';
import { Search, Download } from 'lucide-react';
import { listAudit, getCase } from '../api';
import type { AuditEntry, PatientCase } from '../types';
import CaseDetailModal from './CaseDetailModal';

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<PatientCase | null>(null);

  useEffect(() => {
    listAudit().then(setLogs).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filteredLogs = logs.filter(l =>
    l.case_id.toLowerCase().includes(filter.toLowerCase()) ||
    l.clinician_id.toLowerCase().includes(filter.toLowerCase())
  );

  const formatTs = (ts: string) => new Date(ts).toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // ponytail: simple CSV from loaded rows, no server-side export
  const esc = (s: string) => s.replace(/"/g, '""');
  const exportCSV = () => {
    const headers = ['Timestamp,Clinician ID,Case Reference,Action,Previous Level,New Level'];
    const rows = filteredLogs.map(l =>
      `"${esc(formatTs(l.timestamp))}","${esc(l.clinician_id)}","${esc(l.case_id)}","${esc(l.action)}","${esc(l.previous_level || '')}","${esc(l.new_level)}"`
    );
    const blob = new Blob([[...headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <>
    <div className="pt-6 px-12 pb-12 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-end">
          <div className="flex items-center gap-3 border-2 border-black px-4 py-2 bg-white w-fit">
            <Search className="w-4 h-4 text-black/50" />
            <input type="text" placeholder="SEARCH BY CASE ID or CLINICIAN..." className="bg-transparent border-none outline-none font-mono text-[10px] w-64 uppercase" value={filter} onChange={(e) => setFilter(e.target.value)} />
          </div>
          <button onClick={exportCSV} className="flex items-center gap-3 border-2 border-black bg-white px-6 py-3 font-bold uppercase text-[10px] hover:bg-black hover:text-white transition-colors active:scale-[0.96] cursor-pointer">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        <div className="border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead className="bg-black text-white uppercase text-[11px] tracking-widest border-b-4 border-black font-bold">
              <tr>
                <th className="p-6 border-r border-white/10">Timestamp</th>
                <th className="p-6 border-r border-white/10">Clinician ID</th>
                <th className="p-6 border-r border-white/10">Case Reference</th>
                <th className="p-6 border-r border-white/10">Action</th>
                <th className="p-6 border-r border-white/10 text-center">Prev Lvl</th>
                <th className="p-6 text-center">New Lvl</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black/10">
              {loading ? (
                <tr><td colSpan={6} className="p-20 text-center text-black/20">LOADING...</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan={6} className="p-20 text-center"><h3 className="font-bebas text-5xl text-black/10 tracking-widest">NO AUDIT RECORDS</h3></td></tr>
              ) : filteredLogs.map((log, i) => (
                <tr key={log.id || i} className="hover:bg-primary/5 transition-colors group">
                   <td className="p-6 text-black/70 border-r border-black/5 font-bold group-hover:text-black transition-colors">{formatTs(log.timestamp)}</td>
                  <td className="p-6 font-bold uppercase border-r border-black/5">{log.clinician_id}</td>
                   <td className="p-6 text-primary-ink font-bold border-r border-black/5">
                    <span onClick={() => getCase(log.case_id).then(setSelectedCase)} className="underline decoration-2 decoration-primary/30 hover:decoration-primary cursor-pointer transition-all">
                      {log.case_id.substring(0, 8)}
                    </span>
                  </td>
                  <td className="p-6 border-r border-black/5">
                    <span className={`px-4 py-1.5 border-2 text-[10px] font-bold uppercase ${
                      log.action === 'Override' ? 'bg-red-500 text-white border-black' :
                      log.action === 'Confirm' ? 'bg-green-500 text-white border-black' :
                       'bg-primary text-black border-black'
                    }`}>{log.action}</span>
                  </td>
                   <td className="p-6 text-center border-r border-black/5 text-black/50 font-bold italic">{log.previous_level || '—'}</td>
                  <td className="p-6 text-center">
                    <span className={`text-base font-bebas tracking-widest px-4 py-1 ${log.new_level === 'Critical' ? 'text-red-600 bg-red-50' : 'text-black'}`}>{log.new_level}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <CaseDetailModal isOpen={selectedCase !== null} onClose={() => setSelectedCase(null)} selectedCase={selectedCase} onReviewed={() => { listAudit().then(setLogs).catch(() => {}); }} />
    </>
  );
}
