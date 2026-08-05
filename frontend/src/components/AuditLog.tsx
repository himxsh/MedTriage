import React, { useState, useEffect } from 'react';
import { Search, Download } from 'lucide-react';
import { listAudit, getCase } from '../api';
import type { AuditEntry, PatientCase } from '../types';
import CaseDetailDrawer from './CaseDetailDrawer';
import UrgencyBadge from './UrgencyBadge';
import { toUrgencyLevel } from '../urgencyStyles';

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
    const headers = ['Timestamp,Clinician ID,Case Reference,Action,Previous Level,New Level,Reason'];
    const rows = filteredLogs.map(l =>
      `"${esc(formatTs(l.timestamp))}","${esc(l.clinician_id)}","${esc(l.case_id)}","${esc(l.action)}","${esc(l.previous_level || '')}","${esc(l.new_level)}","${esc(l.reason || '')}"`
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
    <div className="p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-5 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-syncra-border bg-white px-3 py-2">
            <Search className="w-3.5 h-3.5 text-syncra-muted" />
            <input
              type="text"
              placeholder="Search by case ID or clinician..."
              className="bg-transparent border-none outline-none text-xs w-64 text-syncra-ink placeholder:text-syncra-muted"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <button onClick={exportCSV} className="syncra-btn-ghost cursor-pointer active:scale-[0.98]">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>

        <div className="syncra-card syncra-table-wrap overflow-hidden">
          <table className="syncra-table text-left text-xs">
            <thead className="bg-syncra-card-stroke border-b border-syncra-border text-syncra-secondary">
              <tr>
                <th className="w-[16%]">Timestamp</th>
                <th className="w-[14%]">Clinician ID</th>
                <th className="w-[12%]">Case Reference</th>
                <th className="w-[12%]">Action</th>
                <th className="w-[22%]">Level Change</th>
                <th className="w-[24%]">Reason</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="!h-auto"><td colSpan={6} className="!h-auto !max-h-none p-16 text-center text-syncra-muted">Loading...</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr className="!h-auto"><td colSpan={6} className="!h-auto !max-h-none p-16 text-center text-syncra-muted text-sm">No audit records</td></tr>
              ) : filteredLogs.map((log, i) => (
                <tr key={log.id || i} className="border-t border-syncra-border hover:bg-syncra-card-stroke/60 transition-colors">
                  <td className="text-syncra-secondary whitespace-nowrap">{formatTs(log.timestamp)}</td>
                  <td className="font-medium text-syncra-ink truncate">{log.clinician_id}</td>
                  <td className="font-medium text-syncra-ink">
                    <button
                      type="button"
                      onClick={() => getCase(log.case_id).then(setSelectedCase)}
                      className="underline decoration-syncra-nested hover:decoration-syncra-ink cursor-pointer"
                    >
                      {log.case_id.substring(0, 8)}
                    </button>
                  </td>
                  <td>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                      log.action === 'Override' ? 'bg-syncra-down-soft text-syncra-down' :
                      log.action === 'Confirm' ? 'bg-syncra-up-soft text-syncra-up' :
                      'bg-syncra-card-stroke text-syncra-tertiary'
                    }`}>{log.action}</span>
                  </td>
                  <td>
                    <span className="flex items-center gap-2">
                      {log.previous_level ? <UrgencyBadge urgency={toUrgencyLevel(log.previous_level)} /> : <span className="text-syncra-muted">—</span>}
                      <span className="text-syncra-muted">→</span>
                      <UrgencyBadge urgency={toUrgencyLevel(log.new_level)} />
                    </span>
                  </td>
                  <td className="text-syncra-secondary truncate">{log.reason || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <CaseDetailDrawer isOpen={selectedCase !== null} onClose={() => setSelectedCase(null)} selectedCase={selectedCase} onReviewed={() => { listAudit().then(setLogs).catch(() => {}); }} />
    </>
  );
}
