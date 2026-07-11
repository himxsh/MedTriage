import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { listCases, getCase } from '../api';
import type { PatientCase } from '../types';
import CaseDetailDrawer from './CaseDetailDrawer';
import UrgencyBadge from './UrgencyBadge';

const URGENCY_FILTERS = ['ALL', 'Critical', 'High', 'Medium', 'Low'] as const;

export default function Cases() {
  const [allCases, setAllCases] = useState<PatientCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<PatientCase | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const fetchCases = useCallback(async () => {
    try { setAllCases(await listCases()); } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchCases(); }, [fetchCases]);

  // ponytail: deep-link ?case= opens detail modal
  useEffect(() => {
    if (selectedCase) return;
    const caseId = searchParams.get('case');
    if (!caseId) return;
    const found = allCases.find(c => c.id === caseId || c.id.startsWith(caseId));
    if (found) { setSelectedCase(found); return; }
    getCase(caseId).then(setSelectedCase).catch(() => {});
  }, [searchParams, allCases, selectedCase]);

  const filtered = allCases.filter(c => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (urgencyFilter !== 'ALL' && c.urgency_level !== urgencyFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      if (!c.id.toLowerCase().includes(q) && !(c.patient_name || '').toLowerCase().includes(q) && !(c.mrn || '').toLowerCase().includes(q) && !(c.chief_complaint || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });

  // ponytail: derive status options from data
  const statuses = ['ALL', ...new Set(allCases.map(c => c.status))];

  return (
    <div className="pt-6 px-12 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-wrap gap-4 items-end justify-between">
          <div className="flex gap-4 flex-wrap items-center">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-black/20 px-4 py-2 font-mono text-[10px] font-bold uppercase bg-white cursor-pointer">
              {statuses.map(s => <option key={s} value={s}>{s === 'ALL' ? 'ALL STATUSES' : s.replace(/_/g, ' ').toUpperCase()}</option>)}
            </select>
            <div className="flex gap-2">
              {URGENCY_FILTERS.map(u => (
                <button key={u} onClick={() => setUrgencyFilter(u)} className={`px-4 py-2 border border-black/20 font-mono text-[10px] font-bold uppercase transition-colors cursor-pointer ${urgencyFilter === u ? 'bg-black text-white' : 'bg-white text-black hover:bg-black/5'}`}>
                  {u}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 border-b border-black/10 pb-2 px-2">
            <Search className="w-4 h-4 text-black/50" />
            <input type="text" placeholder="SEARCH id/patient/complaint..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none font-mono text-[10px] w-64 uppercase" />
          </div>
        </div>

        <div className="border border-black/10 bg-white shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-black text-white uppercase text-[11px] font-bold tracking-[0.2em] border-b border-black/10">
              <tr>
                <th className="p-6 border-r border-white/10">Case ID</th>
                <th className="p-6 border-r border-white/10">Patient Name</th>
                <th className="p-6 border-r border-white/10">MRN</th>
                <th className="p-6 border-r border-white/10">Clinical Complaint</th>
                <th className="p-6 border-r border-white/10">Status</th>
                <th className="p-6 border-r border-white/10">Urgency</th>
                <th className="p-6 text-right">Date Logged</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black/10">
              {loading ? (
                <tr><td colSpan={7} className="p-20 text-center text-black/20 font-mono">LOADING...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-20 text-center text-black/20 font-sans text-3xl font-bold">// No matching records</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id} onClick={() => setSelectedCase(c)} className="hover:bg-primary/5 transition-colors group cursor-pointer">
                   <td className="p-6 border-r border-black/5 font-bold text-primary-ink">{c.id.substring(0, 8)}</td>
                  <td className="p-6 border-r border-black/5 font-bold group-hover:underline normal-case">{c.patient_name || 'Unknown'}</td>
                  <td className="p-6 border-r border-black/5 text-black/60 font-mono text-[10px]">{c.mrn || '—'}</td>
                  <td className="p-6 border-r border-black/5 text-black/60 truncate max-w-xs normal-case">{c.chief_complaint || '(no complaint)'}</td>
                  <td className="p-6 border-r border-black/5"><span className="font-mono text-[10px] font-bold uppercase text-black/70">{c.status}</span></td>
                  <td className="p-6 border-r border-black/5"><UrgencyBadge urgency={c.urgency_level} /></td>
                  <td className="p-6 text-right font-bold text-black/60 group-hover:text-black">{formatDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CaseDetailDrawer isOpen={selectedCase !== null} onClose={() => { setSelectedCase(null); setSearchParams(prev => { const next = new URLSearchParams(prev); next.delete('case'); return next; }, { replace: true }); }} selectedCase={selectedCase} onReviewed={fetchCases} />
    </div>
  );
}
