import React, { useState, useEffect } from 'react';
import { listAudit, getCase } from '../api';
import type { AuditEntry, PatientCase } from '../types';
import CaseDetailDrawer from './CaseDetailDrawer';
import FilterTable from './beautiful-ui/FilterTable';
import LoadingState from './beautiful-ui/LoadingState';
import { toUrgencyLevel } from '../urgencyStyles';
import { urgencyLabel } from '../orgLabels';

const ACTION_DOT: Record<string, string> = {
  Confirm: '#25a878',
  Override: '#e3474c',
};

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [filter, setFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<PatientCase | null>(null);

  useEffect(() => {
    listAudit()
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredLogs = logs.filter((l) => {
    if (actionFilter !== 'all' && l.action !== actionFilter) return false;
    const q = filter.toLowerCase();
    if (!q) return true;
    return l.case_id.toLowerCase().includes(q) || l.clinician_id.toLowerCase().includes(q);
  });

  const formatTs = (ts: string) =>
    new Date(ts).toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  const esc = (s: string) => s.replace(/"/g, '""');
  const exportCSV = () => {
    const headers = ['Timestamp,Clinician ID,Case Reference,Action,Previous Level,New Level,Reason'];
    const rows = filteredLogs.map(
      (l) =>
        `"${esc(formatTs(l.timestamp))}","${esc(l.clinician_id)}","${esc(l.case_id)}","${esc(l.action)}","${esc(l.previous_level || '')}","${esc(l.new_level)}","${esc(l.reason || '')}"`,
    );
    const blob = new Blob([[...headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const confirms = logs.filter((l) => l.action === 'Confirm').length;
  const overrides = logs.filter((l) => l.action === 'Override').length;

  return (
    <>
      <div className="overflow-y-auto p-5">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <label className="flex h-9 items-center gap-2 rounded-card bg-surface px-3 shadow-hairline">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search by case ID or clinician…"
                className="w-64 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-3"
              />
            </label>
            <button
              type="button"
              onClick={exportCSV}
              className="h-8 rounded-control bg-surface px-3 text-[12.5px] font-medium text-ink shadow-btn hover:bg-hover"
            >
              Export CSV
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <LoadingState label="Loading audit" />
            </div>
          ) : (
            <FilterTable
              filters={[
                { key: 'all', label: 'All', count: logs.length },
                { key: 'Confirm', label: 'Confirm', dot: ACTION_DOT.Confirm, count: confirms },
                { key: 'Override', label: 'Override', dot: ACTION_DOT.Override, count: overrides },
              ]}
              value={actionFilter}
              onChange={setActionFilter}
              columns={['When', 'Clinician', 'Case', 'Change', 'Reason']}
              gridCols="0.9fr 1fr 0.7fr 1.2fr 1.2fr"
              empty="No audit records"
              rows={filteredLogs.map((log) => ({
                id: String(log.id),
                cells: [
                  <span key="t" className="text-ink-2 tabular-nums">{formatTs(log.timestamp)}</span>,
                  <span key="c" className="font-medium text-ink">{log.clinician_id}</span>,
                  <button
                    key="id"
                    type="button"
                    className="font-medium text-accent-ink underline"
                    onClick={() => getCase(log.case_id).then(setSelectedCase)}
                  >
                    {log.case_id.substring(0, 8)}
                  </button>,
                  <span key="lv" className="text-ink-2">
                    {log.previous_level ? urgencyLabel(toUrgencyLevel(log.previous_level)) : '—'}
                    {' → '}
                    {urgencyLabel(toUrgencyLevel(log.new_level))}
                    <span className="ml-1 text-[11px] text-ink-3">{log.action}</span>
                  </span>,
                  <span key="r" className="text-ink-2">{log.reason || '—'}</span>,
                ],
              }))}
            />
          )}
        </div>
      </div>
      <CaseDetailDrawer
        isOpen={selectedCase !== null}
        onClose={() => setSelectedCase(null)}
        selectedCase={selectedCase}
        onReviewed={() => {
          listAudit().then(setLogs).catch(() => {});
        }}
      />
    </>
  );
}
