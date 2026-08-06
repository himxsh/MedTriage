import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, RefreshCw, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
import { listCases, getWsUrl, pct, reviewCase } from '../api';
import type { PatientCase } from '../types';
import CaseDetailDrawer from './CaseDetailDrawer';
import UrgencyBadge from './UrgencyBadge';
import { urgencyLabel } from '../orgLabels';
import type { UrgencyLevel } from '../types';

const URGENCY_FILTERS = ['ALL', 'Critical', 'High', 'Medium', 'Low'] as const;
const STATUS_FILTERS = [
  { id: 'pending', label: 'Pending' },
  { id: 'all', label: 'All' },
  { id: 'completed', label: 'Completed' },
] as const;
const TIME_FILTERS = [
  { id: '4h', label: '4h', ms: 4 * 3600_000 },
  { id: '24h', label: '24h', ms: 24 * 3600_000 },
  { id: '7d', label: '7d', ms: 7 * 24 * 3600_000 },
  { id: 'all', label: 'All time', ms: null },
] as const;

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
  const [filterUrgency, setFilterUrgency] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<(typeof STATUS_FILTERS)[number]['id']>('pending');
  const [filterTime, setFilterTime] = useState<(typeof TIME_FILTERS)[number]['id']>('24h');
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
      // Detect new Critical arrivals for pulse / optional beep
      const prev = knownIdsRef.current;
      if (prev.size > 0) {
        const freshCritical = next.filter(
          (c) =>
            !prev.has(c.id) &&
            c.urgency_level === 'Critical' &&
            c.status === 'Pending Review',
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
              /* ignore autoplay / AudioContext blocks */
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

  // ponytail: 5s poll as fallback when WS is down
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

  const timeMs = TIME_FILTERS.find((t) => t.id === filterTime)?.ms ?? null;
  const cutoff = timeMs != null ? Date.now() - timeMs : null;

  const seen = cases.filter((c) => {
    if (filterStatus === 'pending' && c.status !== 'Pending Review') return false;
    if (filterStatus === 'completed' && c.status !== 'Completed') return false;
    if (filterUrgency !== 'ALL' && c.urgency_level !== filterUrgency) return false;
    if (cutoff != null && new Date(c.created_at).getTime() < cutoff) return false;
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

  // Critical first, then by created_at desc within band
  const sorted = [...seen].sort((a, b) => {
    const order: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    const u = (order[a.urgency_level] ?? 99) - (order[b.urgency_level] ?? 99);
    if (u !== 0) return u;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  sortedRef.current = sorted;

  const pendingCount = cases.filter((c) => c.status === 'Pending Review').length;
  const completedCount = cases.filter((c) => c.status === 'Completed').length;
  const criticalPending = cases.filter(
    (c) => c.status === 'Pending Review' && c.urgency_level === 'Critical',
  ).length;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleQuickConfirm = useCallback(async (c: PatientCase) => {
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
  }, [fetchCases]);

  // Keyboard: C = confirm next Critical pending
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

  const toggleAlert = () => {
    const next = !alertOn;
    setAlertOn(next);
    try {
      localStorage.setItem(ALERT_KEY, next ? '1' : '0');
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-syncra-border bg-white shrink-0 flex-wrap">
        <div
          className={`flex items-center gap-2 text-[11px] font-medium ${
            wsStatus === 'live' ? 'text-syncra-up' : 'text-syncra-down'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              wsStatus === 'live' ? 'bg-syncra-up animate-pulse' : 'bg-syncra-down'
            }`}
          />
          {wsStatus === 'live' ? 'Live' : 'Offline — polling'}
        </div>
        <span className="text-[11px] text-syncra-muted">Queue</span>
        {criticalPending > 0 && (
          <span className="text-[11px] font-medium text-syncra-down bg-syncra-down-soft px-2 py-0.5 rounded-full">
            {criticalPending} Critical
          </span>
        )}
        <button
          type="button"
          onClick={toggleAlert}
          className="ml-auto flex items-center gap-1.5 text-[11px] text-syncra-secondary hover:text-syncra-ink cursor-pointer"
          title="Sound/visual alert for new Critical cases"
        >
          {alertOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          Critical alert {alertOn ? 'on' : 'off'}
        </button>
        <span className="hidden sm:inline text-[10px] text-syncra-muted">Press C = confirm next Critical</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
        {wsStatus === 'offline' && !fetchError && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-950">
            Live queue disconnected — refreshing every 5s. Check network / API.
          </div>
        )}

        {fetchError && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-syncra-down/30 bg-syncra-down-soft px-4 py-3 text-xs font-medium text-syncra-down">
            <span>{fetchError}</span>
            <button onClick={fetchCases} className="ml-auto syncra-btn-primary !bg-syncra-down cursor-pointer">
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}

        <div className="mb-4 flex flex-wrap justify-between items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setFilterStatus(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  filterStatus === s.id
                    ? 'bg-syncra-ink text-white border-syncra-ink'
                    : 'bg-white text-syncra-tertiary border-syncra-border hover:bg-syncra-card-stroke'
                }`}
              >
                {s.label}
              </button>
            ))}
            <span className="w-px h-5 bg-syncra-border mx-1 hidden sm:inline-block" />
            {URGENCY_FILTERS.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setFilterUrgency(u)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  filterUrgency === u
                    ? 'bg-syncra-ink text-white border-syncra-ink'
                    : 'bg-white text-syncra-tertiary border-syncra-border hover:bg-syncra-card-stroke'
                }`}
              >
                {u === 'ALL' ? 'All urgency' : urgencyLabel(u as UrgencyLevel)}
              </button>
            ))}
            <span className="w-px h-5 bg-syncra-border mx-1 hidden sm:inline-block" />
            {TIME_FILTERS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFilterTime(t.id)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                  filterTime === t.id
                    ? 'bg-syncra-card-stroke text-syncra-ink border-syncra-border'
                    : 'bg-white text-syncra-muted border-syncra-border hover:bg-syncra-card-stroke'
                }`}
              >
                {t.label}
              </button>
            ))}
            <div className="flex gap-2 items-center pl-2">
              <span className="px-2.5 py-1 rounded-full bg-syncra-card-stroke text-[11px] font-medium text-syncra-ink">
                Pending {pendingCount}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white border border-syncra-border text-[11px] font-medium text-syncra-muted">
                Completed {completedCount}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-syncra-border bg-white px-3 py-2 w-full sm:w-auto">
            <Search className="w-3.5 h-3.5 text-syncra-muted" />
            <input
              type="text"
              placeholder="Search name, MRN, complaint…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-xs flex-1 sm:w-48 text-syncra-ink placeholder:text-syncra-muted"
            />
          </div>
        </div>

        {confirmError && (
          <div className="mb-4 rounded-lg border border-syncra-down/30 bg-syncra-down-soft px-3 py-2 text-xs font-medium text-syncra-down">
            {confirmError}
          </div>
        )}

        <div className="syncra-card syncra-table-wrap overflow-x-auto overflow-hidden">
          <table className="syncra-table text-left text-xs min-w-[720px]">
            <thead className="sticky top-0 bg-syncra-card-stroke z-10 border-b border-syncra-border">
              <tr className="text-syncra-secondary">
                <th className="w-[7%]">ID</th>
                <th className="w-[14%]">Patient</th>
                <th className="w-[10%]">MRN</th>
                <th className="w-[24%]">Complaint</th>
                <th className="w-[10%]">Urgency</th>
                <th className="w-[12%] text-center">Confidence</th>
                <th className="w-[10%] text-right">Time</th>
                <th className="w-[9%] text-center">Confirm</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="!h-auto">
                  <td colSpan={8} className="!h-auto !max-h-none p-16 text-center text-syncra-muted">
                    Loading…
                  </td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr className="!h-auto">
                  <td colSpan={8} className="!h-auto !max-h-none p-16 text-center">
                    <p className="text-sm text-syncra-ink font-medium">No cases in this view</p>
                    <p className="text-xs text-syncra-muted mt-1">
                      {filterStatus === 'pending'
                        ? 'Queue is clear — new intakes will appear here.'
                        : 'Try widening status, urgency, or time filters.'}
                    </p>
                  </td>
                </tr>
              ) : (
                sorted.map((c) => {
                  const pulsing = pulseIds.has(c.id);
                  const critical = c.urgency_level === 'Critical' && c.status === 'Pending Review';
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCase(c)}
                      className={`border-t border-syncra-border hover:bg-syncra-card-stroke/60 cursor-pointer transition-colors ${
                        selectedCase?.id === c.id ? 'bg-syncra-card-stroke' : ''
                      } ${critical ? 'bg-syncra-down-soft/30' : ''} ${
                        pulsing ? 'animate-pulse ring-1 ring-inset ring-syncra-down/40' : ''
                      }`}
                    >
                      <td className="font-medium text-syncra-ink whitespace-nowrap">{c.id.substring(0, 8)}</td>
                      <td className="font-medium text-syncra-ink truncate max-w-[10rem]">
                        {c.patient_name || 'Unknown'}
                        {(c.risk_flags?.length ?? 0) > 0 && (
                          <span className="ml-1.5 text-[10px] font-medium text-syncra-down">risk</span>
                        )}
                      </td>
                      <td className="text-syncra-secondary whitespace-nowrap">{c.mrn || '—'}</td>
                      <td className="text-syncra-secondary truncate max-w-[14rem]">
                        {c.chief_complaint || '(no complaint)'}
                      </td>
                      <td>
                        <UrgencyBadge urgency={c.urgency_level} />
                      </td>
                      <td>
                        <div className="flex items-center gap-2 justify-center">
                          <span className="font-medium text-syncra-ink tabular-nums">
                            {pct(c.confidence_score)}%
                          </span>
                          <div className="w-14 bg-syncra-border h-1.5 rounded-full overflow-hidden flex-shrink-0">
                            <div
                              className="bg-syncra-ink h-full rounded-full"
                              style={{ width: `${pct(c.confidence_score)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="text-syncra-secondary text-right whitespace-nowrap">
                        {formatTime(c.created_at)}
                      </td>
                      <td className="text-center">
                        {c.status === 'Pending Review' ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickConfirm(c);
                            }}
                            disabled={confirmingId === c.id}
                            className="p-1.5 rounded-lg border border-syncra-border text-syncra-secondary hover:bg-syncra-up-soft hover:border-syncra-up/30 hover:text-syncra-up transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                            title="Confirm triage"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-syncra-muted">{c.status}</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
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
