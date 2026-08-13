import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { listCases, getWsUrl, pct, reviewCase } from '../api';
import type { PatientCase, UrgencyLevel } from '../types';
import CaseDetailDrawer from './CaseDetailDrawer';
import FilterTable from './beautiful-ui/FilterTable';
import LoadingState from './beautiful-ui/LoadingState';
import { urgencyLabel } from '../orgLabels';

const STATUS_PILL: Record<string, string> = {
  Critical: 'filter-status-todo',
  High: 'filter-status-todo',
  Medium: 'filter-status-progress',
  Low: 'filter-status-done',
};

const ALERT_KEY = 'mt_critical_alert';

function loadAlertPref(): boolean {
  try {
    return localStorage.getItem(ALERT_KEY) !== '0';
  } catch {
    return true;
  }
}

export default function Queue() {
  const [cases, setCases] = useState<PatientCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<PatientCase | null>(null);
  const [filterStatus, setFilterStatus] = useState<'pending' | 'all' | 'completed'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [wsStatus, setWsStatus] = useState<'offline' | 'live'>('offline');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState('');
  const [alertOn, setAlertOn] = useState(loadAlertPref);
  const [pulseIds, setPulseIds] = useState<Set<string>>(new Set());
  const wsRef = useRef<WebSocket | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const knownIdsRef = useRef<Set<string>>(new Set());
  const sortedRef = useRef<PatientCase[]>([]);

  const fetchCases = useCallback(async () => {
    try {
      const next = await listCases();
      const prev = knownIdsRef.current;
      if (prev.size > 0) {
        const freshCritical = next.filter(
          (c) => !prev.has(c.id) && c.urgency_level === 'Critical' && c.status === 'Pending Review',
        );
        if (freshCritical.length > 0) {
          setPulseIds((old) => {
            const n = new Set(old);
            freshCritical.forEach((c) => n.add(c.id));
            return n;
          });
          if (loadAlertPref()) {
            try {
              const ctx = new AudioContext();
              const o = ctx.createOscillator();
              const g = ctx.createGain();
              o.connect(g);
              g.connect(ctx.destination);
              o.frequency.value = 880;
              g.gain.value = 0.04;
              o.start();
              o.stop(ctx.currentTime + 0.12);
            } catch {
              /* ignore */
            }
          }
          setTimeout(() => {
            setPulseIds((old) => {
              const n = new Set(old);
              freshCritical.forEach((c) => n.delete(c.id));
              return n;
            });
          }, 8000);
        }
      }
      knownIdsRef.current = new Set(next.map((c) => c.id));
      setCases(next);
      setFetchError('');
    } catch {
      setFetchError('Failed to load cases from API');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

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

  useEffect(() => {
    if (wsStatus === 'live') {
      pollRef.current = null;
      return;
    }
    pollRef.current = setInterval(fetchCases, 5000);
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [fetchCases, wsStatus]);

  const pendingCount = cases.filter((c) => c.status === 'Pending Review').length;
  const completedCount = cases.filter((c) => c.status === 'Completed').length;
  const criticalPending = cases.filter(
    (c) => c.status === 'Pending Review' && c.urgency_level === 'Critical',
  ).length;

  const seen = cases.filter((c) => {
    if (filterStatus === 'pending' && c.status !== 'Pending Review') return false;
    if (filterStatus === 'completed' && c.status !== 'Completed') return false;
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

  const sorted = [...seen].sort((a, b) => {
    const order: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    const u = (order[a.urgency_level] ?? 99) - (order[b.urgency_level] ?? 99);
    if (u !== 0) return u;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  sortedRef.current = sorted;

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const handleQuickConfirm = useCallback(
    async (c: PatientCase) => {
      if (c.status !== 'Pending Review') return;
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
    },
    [fetchCases],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }
      if (e.key === 'c' || e.key === 'C') {
        const next = sortedRef.current.find(
          (c) => c.status === 'Pending Review' && c.urgency_level === 'Critical',
        );
        if (next) {
          e.preventDefault();
          void handleQuickConfirm(next);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleQuickConfirm]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-line bg-surface px-5 py-3">
        <div className={`flex items-center gap-2 text-[11px] font-medium ${wsStatus === 'live' ? 'text-green' : 'text-red'}`}>
          <span className={`size-1.5 rounded-full ${wsStatus === 'live' ? 'bg-green animate-pulse' : 'bg-red'}`} />
          {wsStatus === 'live' ? 'Live' : 'Offline — polling'}
        </div>
        {criticalPending > 0 && (
          <span className="rounded-full bg-red-tint px-2 py-0.5 text-[11px] font-medium text-red">
            {criticalPending} Critical
          </span>
        )}
        <button
          type="button"
          onClick={() => {
            const next = !alertOn;
            setAlertOn(next);
            try {
              localStorage.setItem(ALERT_KEY, next ? '1' : '0');
            } catch {
              /* ignore */
            }
          }}
          className="ml-auto flex items-center gap-1.5 text-[11px] text-ink-2 hover:text-ink"
        >
          {alertOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          Critical alert {alertOn ? 'on' : 'off'}
        </button>
        <span className="hidden text-[10px] text-ink-3 sm:inline">Press C = confirm next Critical</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {fetchError && (
          <div className="mb-4 rounded-card bg-red-tint px-4 py-3 text-xs font-medium text-red">{fetchError}</div>
        )}
        {confirmError && (
          <div className="mb-4 rounded-card bg-red-tint px-3 py-2 text-xs font-medium text-red">{confirmError}</div>
        )}

        <label className="mb-3 flex h-10 max-w-80 items-center gap-2 rounded-card bg-surface px-3 shadow-hairline">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, MRN, complaint…"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-3"
          />
        </label>

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingState label="Loading queue" />
          </div>
        ) : (
          <FilterTable
            filters={[
              { key: 'pending', label: 'Pending', dot: '#f09a2f', count: pendingCount },
              { key: 'all', label: 'All', count: cases.length },
              { key: 'completed', label: 'Completed', dot: '#25a878', count: completedCount },
            ]}
            value={filterStatus}
            onChange={(key) => setFilterStatus(key as typeof filterStatus)}
            columns={['Patient', 'Complaint', 'Urgency', 'Time', 'Confirm']}
            gridCols="1.4fr 1.6fr 0.9fr 0.7fr 0.7fr"
            empty={filterStatus === 'pending' ? 'Queue is clear — new intakes will appear here.' : 'No cases in this view.'}
            rows={sorted.map((c) => {
              const critical = c.urgency_level === 'Critical' && c.status === 'Pending Review';
              return {
                id: c.id,
                onClick: () => setSelectedCase(c),
                className: `${critical ? 'bg-red-tint/40' : ''} ${pulseIds.has(c.id) ? 'animate-pulse' : ''}`,
                cells: [
                  <span key="p" className="font-medium text-ink">
                    {c.patient_name || 'Unknown'}
                    {(c.risk_flags?.length ?? 0) > 0 && <span className="ml-1.5 text-[10px] font-medium text-red">risk</span>}
                  </span>,
                  <span key="c" className="text-ink-2">{c.chief_complaint || '(no complaint)'}</span>,
                  <span
                    key="u"
                    className={`inline-flex h-5 items-center rounded-[5px] px-1.5 text-[11px] font-medium ${STATUS_PILL[c.urgency_level] ?? ''}`}
                  >
                    {urgencyLabel(c.urgency_level as UrgencyLevel)}
                  </span>,
                  <span key="t" className="text-ink-2 tabular-nums">{formatTime(c.created_at)}</span>,
                  c.status === 'Pending Review' ? (
                    <button
                      key="ok"
                      type="button"
                      disabled={confirmingId === c.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleQuickConfirm(c);
                      }}
                      className="rounded-control bg-green-tint px-2 py-0.5 text-[11px] font-medium text-green"
                    >
                      {confirmingId === c.id ? '…' : 'Confirm'}
                    </button>
                  ) : (
                    <span key="s" className="text-[11px] text-ink-3">{c.status}</span>
                  ),
                ],
              };
            })}
          />
        )}
      </div>

      <CaseDetailDrawer
        isOpen={selectedCase !== null}
        onClose={() => setSelectedCase(null)}
        selectedCase={selectedCase}
        onReviewed={fetchCases}
      />
    </div>
  );
}
