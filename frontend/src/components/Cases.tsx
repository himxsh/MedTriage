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
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-5 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2 flex-wrap items-center">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="syncra-input !w-auto !py-2 cursor-pointer"
            >
              {statuses.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All statuses' : s.replace(/_/g, ' ')}</option>)}
            </select>
            <div className="flex gap-1.5">
              {URGENCY_FILTERS.map(u => (
                <button
                  key={u}
                  onClick={() => setUrgencyFilter(u)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    urgencyFilter === u
                      ? 'bg-syncra-ink text-white border-syncra-ink'
                      : 'bg-white text-syncra-tertiary border-syncra-border hover:bg-syncra-card-stroke'
                  }`}
                >
                  {u === 'ALL' ? 'All' : u}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-syncra-border bg-white px-3 py-2">
            <Search className="w-3.5 h-3.5 text-syncra-muted" />
            <input
              type="text"
              placeholder="Search id / patient / complaint..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-xs w-56 text-syncra-ink placeholder:text-syncra-muted"
            />
          </div>
        </div>

        <div className="syncra-card syncra-table-wrap overflow-hidden">
          <table className="syncra-table text-left text-xs">
            <thead className="bg-syncra-card-stroke border-b border-syncra-border text-syncra-secondary">
              <tr>
                <th className="w-[10%]">Case ID</th>
                <th className="w-[14%]">Patient Name</th>
                <th className="w-[10%]">MRN</th>
                <th className="w-[28%]">Clinical Complaint</th>
                <th className="w-[12%]">Status</th>
                <th className="w-[10%]">Urgency</th>
                <th className="w-[16%] text-right">Date Logged</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="!h-auto"><td colSpan={7} className="!h-auto !max-h-none p-16 text-center text-syncra-muted">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr className="!h-auto"><td colSpan={7} className="!h-auto !max-h-none p-16 text-center text-syncra-muted text-sm">No matching records</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id} onClick={() => setSelectedCase(c)} className="border-t border-syncra-border hover:bg-syncra-card-stroke/60 transition-colors cursor-pointer">
                  <td className="font-medium text-syncra-ink whitespace-nowrap">{c.id.substring(0, 8)}</td>
                  <td className="font-medium text-syncra-ink truncate">{c.patient_name || 'Unknown'}</td>
                  <td className="text-syncra-secondary whitespace-nowrap">{c.mrn || '—'}</td>
                  <td className="text-syncra-secondary truncate">{c.chief_complaint || '(no complaint)'}</td>
                  <td>
                    <span className="inline-flex px-2.5 py-0.5 rounded-full bg-syncra-card-stroke text-[11px] font-medium text-syncra-tertiary">
                      {c.status}
                    </span>
                  </td>
                  <td><UrgencyBadge urgency={c.urgency_level} /></td>
                  <td className="text-right text-syncra-secondary whitespace-nowrap">{formatDate(c.created_at)}</td>
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
