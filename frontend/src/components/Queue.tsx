import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, RefreshCw, CheckCircle2 } from 'lucide-react';
import { listCases, getWsUrl, pct, reviewCase, getClinician } from '../api';
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
      if (!c.id.toLowerCase().includes(q) && !(c.patient_name || '').toLowerCase().includes(q) && !(c.chief_complaint || '').toLowerCase().includes(q)) return false;
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
      await reviewCase(c.id, getClinician().id, 'Confirm', c.urgency_level);
      await fetchCases();
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : 'Confirm failed');
    }
    setConfirmingId(null);
  };

  return (
    <>
      <div className="flex items-center gap-4 px-10 py-4 border-b border-black/10 bg-white shrink-0">
        <div className={`flex items-center gap-2 font-mono text-[10px] font-bold uppercase ${wsStatus === 'live' ? 'text-green-600' : 'text-red-500'}`}>
          <span className={`w-2 h-2 rounded-full ${wsStatus === 'live' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          {wsStatus === 'live' ? 'LIVE' : 'OFFLINE'}
        </div>
        <span className="font-mono text-[10px] text-black/50 uppercase tracking-widest">QUEUE</span>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {fetchError && (
          <div className="mb-6 flex items-center gap-4 bg-red-50 border-2 border-red-500 p-4 font-mono text-[10px] font-bold uppercase">
            <span className="text-red-600">{fetchError}</span>
            <button onClick={fetchCases} className="ml-auto flex items-center gap-2 bg-red-500 text-white px-4 py-2 hover:bg-red-600 transition-colors cursor-pointer">
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}
        <div className="mb-8 flex justify-between items-end">
          <div className="flex items-center gap-4">
            <div className="flex gap-4">
              {URGENCY_FILTERS.map(u => (
                <button key={u} onClick={() => setFilterUrgency(u)} className={`px-6 py-2 border border-black/20 font-mono text-[10px] font-bold uppercase transition-colors cursor-pointer active:scale-[0.96] ${filterUrgency === u ? 'bg-black text-white' : 'bg-white text-black hover:bg-black/5'}`}>
                  {u}
                </button>
              ))}
            </div>
            <div className="flex gap-3 items-center pl-4 border-l border-black/10">
              <span className="px-3 py-1.5 bg-black/[0.03] font-mono text-[10px] font-bold border border-black/10">
                PENDING <span className="ml-1">{pendingCount}</span>
              </span>
              <span className="px-3 py-1.5 bg-black/[0.03] font-mono text-[10px] font-bold border border-black/10 text-black/50">
                COMPLETED <span className="ml-1">{completedCount}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 border-b border-black/10 pb-2 px-2">
            <Search className="w-4 h-4 text-black/50" />
            <input type="text" placeholder="FILTER RECORDS..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none font-mono text-[10px] w-48 uppercase" />
          </div>
        </div>

        {confirmError && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-500 p-3 font-mono text-[10px] font-bold text-red-600">
            {confirmError}
          </div>
        )}

        <div className="border border-black/10 bg-white shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-neutral-100 z-10 border-b border-black/10">
              <tr>
                <th className="p-5 text-black font-bold uppercase tracking-widest border-r border-black/10">ID</th>
                <th className="p-5 text-black font-bold uppercase tracking-widest border-r border-black/10">Patient Name</th>
                <th className="p-5 text-black font-bold uppercase tracking-widest border-r border-black/10">Primary Complaint</th>
                <th className="p-5 text-black font-bold uppercase tracking-widest border-r border-black/10">Urgency</th>
                <th className="p-5 text-black font-bold uppercase tracking-widest border-r border-black/10 text-center">AI Confidence</th>
                <th className="p-5 text-black font-bold uppercase tracking-widest border-r border-black/10 text-right">Time</th>
                <th className="p-5 text-black font-bold uppercase tracking-widest text-center w-20">Confirm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {loading ? (
                <tr><td colSpan={7} className="p-20 text-center font-mono text-black/50">LOADING...</td></tr>
              ) : sorted.length === 0 ? (
                <tr><td colSpan={7} className="p-20 text-center"><h3 className="font-sans text-3xl font-bold text-black/10 text-balance">No records found</h3></td></tr>
              ) : sorted.map(c => (
                <tr key={c.id} onClick={() => setSelectedCase(c)} className={`hover:bg-primary/5 cursor-pointer transition-colors group ${selectedCase?.id === c.id ? 'bg-primary/10' : ''}`}>
                  <td className="p-5 text-primary-ink font-bold border-r border-black/5">{c.id.substring(0, 8)}</td>
                  <td className="p-5 text-black font-bold border-r border-black/5 group-hover:underline normal-case">{c.patient_name || 'Unknown'}</td>
                  <td className="p-5 text-black/60 truncate max-w-[300px] border-r border-black/5">{c.chief_complaint || '(no complaint)'}</td>
                  <td className="p-5 border-r border-black/5"><UrgencyBadge urgency={c.urgency_level} /></td>
                  <td className="p-5 border-r border-black/5">
                    <div className="flex items-center gap-3 justify-center">
                      <span className="font-bold text-black tabular-nums">{pct(c.confidence_score)}%</span>
                      <div className="w-16 bg-black/10 h-1.5 flex-shrink-0">
                        <div className="bg-primary h-full" style={{ width: `${pct(c.confidence_score)}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-black/60 text-right font-bold border-r border-black/5">{formatTime(c.created_at)}</td>
                  <td className="p-5 text-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleQuickConfirm(c); }}
                      disabled={confirmingId === c.id}
                      className="p-2 border border-black/20 hover:bg-green-50 hover:border-green-500 hover:text-green-600 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer active:scale-[0.96]"
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
    </>
  );
}
