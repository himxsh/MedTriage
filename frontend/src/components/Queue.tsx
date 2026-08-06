import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, RefreshCw, CheckCircle2 } from 'lucide-react';
import { listCases, getWsUrl, pct, reviewCase } from '../api';
import type { PatientCase } from '../types';
import CaseDetailDrawer from './CaseDetailDrawer';
import UrgencyBadge from './UrgencyBadge';

const URGENCY_FILTERS = ['ALL', 'Critical', 'High', 'Medium', 'Low'] as const;

export default function Queue() {
  const [cases, setCases] = useState<PatientCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<PatientCase | null>(null);
  const [filterUrgency, setFilterUrgency] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [wsStatus, setWsStatus] = useState<'offline' | 'live'>('offline');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchCases = useCallback(async () => {
    try {
      setCases(await listCases());
      setFetchError('');
    } catch {
      setFetchError('Failed to load cases from API');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchCases(); }, [fetchCases]);

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimer: ReturnType<typeof setTimeout>;
    const shouldReconnect = { current: true };
    function connect() {
      shouldReconnect.current = true;
      ws = new WebSocket(getWsUrl());
      ws.onopen = () => setWsStatus('live');
      ws.onclose = () => {
        if (!shouldReconnect.current) return;
        setWsStatus('offline');
        reconnectTimer = setTimeout(connect, 3000);
      };
      ws.onmessage = () => fetchCases();
      wsRef.current = ws;
    }
    connect();
    return () => {
      shouldReconnect.current = false;
      clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, [fetchCases]);

  // ponytail: 5s poll as fallback when WS is down
  useEffect(() => {
    if (wsStatus === 'live') { pollRef.current = null; return; }
    pollRef.current = setInterval(fetchCases, 5000);
    return () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };
  }, [fetchCases, wsStatus]);

  const seen = cases.filter(c => {
    if (c.status !== 'Pending Review') return false;
    if (filterUrgency !== 'ALL' && c.urgency_level !== filterUrgency) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      if (!c.id.toLowerCase().includes(q) && !(c.patient_name || '').toLowerCase().includes(q) && !(c.mrn || '').toLowerCase().includes(q) && !(c.chief_complaint || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // ponytail: sort Critical first, inline sort no abstraction
  const sorted = [...seen].sort((a, b) => {
    const order: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    return (order[a.urgency_level] ?? 99) - (order[b.urgency_level] ?? 99);
  });

  const pendingCount = cases.filter(c => c.status === 'Pending Review').length;
  const completedCount = cases.filter(c => c.status === 'Completed').length;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleQuickConfirm = async (c: PatientCase) => {
    if (c.urgency_level === 'Critical') {
      const ok = window.confirm('This case is CRITICAL. Confirm triage level?');
      if (!ok) return;
    }
    setConfirmingId(c.id);
    setConfirmError('');
    try {
      await reviewCase(c.id, 'Confirm', c.urgency_level);
      await fetchCases();
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : 'Confirm failed');
    }
    setConfirmingId(null);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center gap-3 px-6 py-3 border-b border-syncra-border bg-white shrink-0">
        <div className={`flex items-center gap-2 text-[11px] font-medium ${wsStatus === 'live' ? 'text-syncra-up' : 'text-syncra-down'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${wsStatus === 'live' ? 'bg-syncra-up animate-pulse' : 'bg-syncra-down'}`} />
          {wsStatus === 'live' ? 'Live' : 'Offline'}
        </div>
        <span className="text-[11px] text-syncra-muted">Queue</span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 min-h-0">
        {fetchError && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-syncra-down/30 bg-syncra-down-soft px-4 py-3 text-xs font-medium text-syncra-down">
            <span>{fetchError}</span>
            <button onClick={fetchCases} className="ml-auto syncra-btn-primary !bg-syncra-down cursor-pointer">
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}

        <div className="mb-5 flex flex-wrap justify-between items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {URGENCY_FILTERS.map(u => (
              <button
                key={u}
                onClick={() => setFilterUrgency(u)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  filterUrgency === u
                    ? 'bg-syncra-ink text-white border-syncra-ink'
                    : 'bg-white text-syncra-tertiary border-syncra-border hover:bg-syncra-card-stroke'
                }`}
              >
                {u === 'ALL' ? 'All' : u}
              </button>
            ))}
            <div className="flex gap-2 items-center pl-3 ml-1 border-l border-syncra-border">
              <span className="px-2.5 py-1 rounded-full bg-syncra-card-stroke text-[11px] font-medium text-syncra-ink">
                Pending {pendingCount}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white border border-syncra-border text-[11px] font-medium text-syncra-muted">
                Completed {completedCount}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-syncra-border bg-white px-3 py-2">
            <Search className="w-3.5 h-3.5 text-syncra-muted" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-xs w-48 text-syncra-ink placeholder:text-syncra-muted"
            />
          </div>
        </div>

        {confirmError && (
          <div className="mb-4 rounded-lg border border-syncra-down/30 bg-syncra-down-soft px-3 py-2 text-xs font-medium text-syncra-down">
            {confirmError}
          </div>
        )}

        {/* Syncra: Customers / Tasks data table */}
        <div className="syncra-card syncra-table-wrap overflow-hidden">
          <table className="syncra-table text-left text-xs">
            <thead className="sticky top-0 bg-syncra-card-stroke z-10 border-b border-syncra-border">
              <tr className="text-syncra-secondary">
                <th className="w-[7%]">ID</th>
                <th className="w-[14%]">Patient Name</th>
                <th className="w-[10%]">MRN</th>
                <th className="w-[26%]">Primary Complaint</th>
                <th className="w-[10%]">Urgency</th>
                <th className="w-[14%] text-center">AI Confidence</th>
                <th className="w-[10%] text-right">Time</th>
                <th className="w-[9%] text-center">Confirm</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="!h-auto"><td colSpan={8} className="!h-auto !max-h-none p-16 text-center text-syncra-muted">Loading...</td></tr>
              ) : sorted.length === 0 ? (
                <tr className="!h-auto"><td colSpan={8} className="!h-auto !max-h-none p-16 text-center text-syncra-muted text-sm">No records found</td></tr>
              ) : sorted.map(c => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedCase(c)}
                  className={`border-t border-syncra-border hover:bg-syncra-card-stroke/60 cursor-pointer transition-colors ${selectedCase?.id === c.id ? 'bg-syncra-card-stroke' : ''}`}
                >
                  <td className="font-medium text-syncra-ink whitespace-nowrap">{c.id.substring(0, 8)}</td>
                  <td className="font-medium text-syncra-ink truncate">{c.patient_name || 'Unknown'}</td>
                  <td className="text-syncra-secondary whitespace-nowrap">{c.mrn || '—'}</td>
                  <td className="text-syncra-secondary truncate">{c.chief_complaint || '(no complaint)'}</td>
                  <td><UrgencyBadge urgency={c.urgency_level} /></td>
                  <td>
                    <div className="flex items-center gap-2 justify-center">
                      <span className="font-medium text-syncra-ink tabular-nums">{pct(c.confidence_score)}%</span>
                      <div className="w-14 bg-syncra-border h-1.5 rounded-full overflow-hidden flex-shrink-0">
                        <div className="bg-syncra-ink h-full rounded-full" style={{ width: `${pct(c.confidence_score)}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="text-syncra-secondary text-right whitespace-nowrap">{formatTime(c.created_at)}</td>
                  <td className="text-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleQuickConfirm(c); }}
                      disabled={confirmingId === c.id}
                      className="p-1.5 rounded-lg border border-syncra-border text-syncra-secondary hover:bg-syncra-up-soft hover:border-syncra-up/30 hover:text-syncra-up transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      title="Confirm triage"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CaseDetailDrawer isOpen={selectedCase !== null} onClose={() => setSelectedCase(null)} selectedCase={selectedCase} onReviewed={fetchCases} />
    </div>
  );
}
