import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { listCases, getWsUrl, pct } from '../api';
import type { PatientCase } from '../types';
import CaseDetailModal from './CaseDetailModal';
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

  return (
    <>
      <div className="flex items-center gap-4 px-10 py-4 border-b-2 border-black bg-white shrink-0">
        <div className={`flex items-center gap-2 font-mono text-[10px] font-bold uppercase ${wsStatus === 'live' ? 'text-green-600' : 'text-red-500'}`}>
          <span className={`w-2 h-2 rounded-full ${wsStatus === 'live' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          {wsStatus === 'live' ? 'LIVE' : 'OFFLINE'}
        </div>
        <span className="font-mono text-[10px] text-black/30 uppercase tracking-widest">QUEUE</span>
      </div>

      <div className="flex divide-x-2 divide-black border-b-2 border-black bg-white shrink-0">
        {[
          { label: 'Pending', count: pendingCount, color: 'text-black' },
          { label: 'Completed', count: completedCount, color: 'text-black/30' }
        ].map((stat, i) => (
          <div key={i} className="flex-1 p-6 hover:bg-black/5 transition-colors group cursor-default">
            <p className="font-mono text-[10px] font-bold text-black/40 uppercase tracking-[0.3em] mb-2">{stat.label}</p>
            <p className={`font-bebas text-6xl ${stat.color} group-hover:scale-105 transition-transform origin-left tabular-nums`}>{stat.count}</p>
          </div>
        ))}
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
          <div className="flex gap-4">
            {URGENCY_FILTERS.map(u => (
              <button key={u} onClick={() => setFilterUrgency(u)} className={`px-6 py-2 border-2 border-black font-mono text-[10px] font-bold uppercase transition-colors cursor-pointer active:scale-[0.96] ${filterUrgency === u ? 'bg-black text-white' : 'bg-white text-black hover:bg-black/5'}`}>
                {u}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 border-b-2 border-black pb-2 px-2">
            <Search className="w-4 h-4 text-black/30" />
            <input type="text" placeholder="FILTER_RECORDS..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none font-mono text-[10px] w-48 uppercase" />
          </div>
        </div>

        <div className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead className="sticky top-0 bg-neutral-100 z-10 border-b-2 border-black">
              <tr>
                <th className="p-5 text-black font-bold uppercase tracking-widest border-r border-black/10">ID</th>
                <th className="p-5 text-black font-bold uppercase tracking-widest border-r border-black/10">Patient Name</th>
                <th className="p-5 text-black font-bold uppercase tracking-widest border-r border-black/10">Primary Complaint</th>
                <th className="p-5 text-black font-bold uppercase tracking-widest border-r border-black/10">Urgency</th>
                <th className="p-5 text-black font-bold uppercase tracking-widest border-r border-black/10 text-center">AI Confidence</th>
                <th className="p-5 text-black font-bold uppercase tracking-widest text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black/10 italic">
              {loading ? (
                <tr><td colSpan={6} className="p-20 text-center font-mono text-black/30">LOADING...</td></tr>
              ) : sorted.length === 0 ? (
                <tr><td colSpan={6} className="p-20 text-center"><h3 className="font-bebas text-6xl text-black/10 tracking-widest text-balance">NO_RECORDS_FOUND</h3></td></tr>
              ) : sorted.map(c => (
                <tr key={c.id} onClick={() => setSelectedCase(c)} className={`hover:bg-primary/5 cursor-pointer transition-colors group ${selectedCase?.id === c.id ? 'bg-primary/10' : ''}`}>
                  <td className="p-5 text-primary font-bold border-r border-black/5">{c.id.substring(0, 8)}</td>
                  <td className="p-5 text-black font-bold uppercase border-r border-black/5 group-hover:underline">{c.patient_name || 'Unknown'}</td>
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
                  <td className="p-5 text-black/40 text-right font-bold">{formatTime(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CaseDetailModal isOpen={selectedCase !== null} onClose={() => setSelectedCase(null)} selectedCase={selectedCase} onReviewed={fetchCases} />
    </>
  );
}
