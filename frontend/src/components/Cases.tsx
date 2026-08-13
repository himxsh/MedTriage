import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listCases, getCase, pct } from '../api';
import type { PatientCase } from '../types';
import CaseDetailDrawer from './CaseDetailDrawer';
import RecordsTable, { type RecordsRow, type RecordsStrength } from './beautiful-ui/RecordsTable';
import LoadingState from './beautiful-ui/LoadingState';

const URGENCY_FILTERS = ['ALL', 'Critical', 'High', 'Medium', 'Low'] as const;

function strengthOf(score: number): RecordsStrength {
  if (score >= 0.8) return 'strong';
  if (score >= 0.5) return 'weak';
  if (score >= 0.25) return 'veryweak';
  return 'none';
}

export default function Cases() {
  const [allCases, setAllCases] = useState<PatientCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<PatientCase | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const fetchCases = useCallback(async () => {
    try {
      setAllCases(await listCases());
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  useEffect(() => {
    if (selectedCase) return;
    const caseId = searchParams.get('case');
    if (!caseId) return;
    const found = allCases.find((c) => c.id === caseId || c.id.startsWith(caseId));
    if (found) {
      setSelectedCase(found);
      return;
    }
    getCase(caseId).then(setSelectedCase).catch(() => {});
  }, [searchParams, allCases, selectedCase]);

  const filtered = allCases.filter((c) => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (urgencyFilter !== 'ALL' && c.urgency_level !== urgencyFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      if (
        !c.id.toLowerCase().includes(q) &&
        !(c.patient_name || '').toLowerCase().includes(q) &&
        !(c.mrn || '').toLowerCase().includes(q) &&
        !(c.chief_complaint || '').toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });

  const statuses = ['ALL', ...new Set(allCases.map((c) => c.status))];

  const rows: RecordsRow[] = filtered.map((c) => ({
    id: c.id,
    name: c.patient_name || 'Unknown',
    tags: [c.status, c.urgency_level, ...(c.chief_complaint ? [c.chief_complaint.slice(0, 24)] : [])],
    last: formatDate(c.created_at),
    strength: strengthOf(c.confidence_score),
    link: `${c.id.slice(0, 8)} · ${pct(c.confidence_score)}%`,
  }));

  return (
    <div className="p-5">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded-control bg-surface px-2.5 text-[12px] text-ink shadow-btn outline-none"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s === 'ALL' ? 'All statuses' : s.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            {URGENCY_FILTERS.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUrgencyFilter(u)}
                className={`h-6.5 rounded-full px-2.5 text-[12px] font-medium ${
                  urgencyFilter === u ? 'bg-surface text-ink shadow-btn' : 'text-ink-2 hover:bg-hover'
                }`}
              >
                {u === 'ALL' ? 'All' : u}
              </button>
            ))}
          </div>
          <label className="flex h-9 items-center gap-2 rounded-card bg-surface px-3 shadow-hairline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search id / patient / complaint…"
              className="w-56 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-3"
            />
          </label>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingState label="Loading cases" />
          </div>
        ) : (
          <RecordsTable
            rows={rows}
            ariaLabel="Cases table"
            onRowClick={(id) => {
              const found = allCases.find((c) => c.id === id);
              if (found) setSelectedCase(found);
            }}
          />
        )}
      </div>

      <CaseDetailDrawer
        isOpen={selectedCase !== null}
        onClose={() => {
          setSelectedCase(null);
          setSearchParams(
            (prev) => {
              const next = new URLSearchParams(prev);
              next.delete('case');
              return next;
            },
            { replace: true },
          );
        }}
        selectedCase={selectedCase}
        onReviewed={fetchCases}
      />
    </div>
  );
}
