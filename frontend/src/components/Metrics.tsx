import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { fetchMetrics, downloadMetricsCsv } from '../api';
import type { PilotMetrics } from '../types';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function pct(v: number | null | undefined): string {
  if (v == null) return '—';
  return `${Math.round(v * 100)}%`;
}

function sec(v: number | null | undefined): string {
  if (v == null) return '—';
  if (v < 60) return `${v.toFixed(1)}s`;
  return `${(v / 60).toFixed(1)}m`;
}

export default function Metrics() {
  const [from, setFrom] = useState(daysAgoISO(14));
  const [to, setTo] = useState(todayISO());
  const [data, setData] = useState<PilotMetrics | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setError('');
    fetchMetrics(from, to)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load metrics'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onExport = async () => {
    try {
      await downloadMetricsCsv(from, to);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed');
    }
  };

  return (
    <div className="p-6 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-medium text-syncra-ink">Pilot metrics</h2>
            <p className="text-xs text-syncra-muted mt-1">
              Org-scoped evidence for weekly pilot review. Admin only.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label className="syncra-label">From</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="syncra-input"
              />
            </div>
            <div>
              <label className="syncra-label">To</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="syncra-input"
              />
            </div>
            <button type="button" onClick={load} className="syncra-btn-primary cursor-pointer">
              Apply
            </button>
            <button type="button" onClick={onExport} className="syncra-btn-ghost cursor-pointer">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>
        </div>

        {error && <p className="text-xs text-syncra-down">{error}</p>}
        {loading && <p className="text-xs text-syncra-muted">Loading…</p>}

        {data && !loading && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ['Ingested', String(data.cases_ingested)],
                ['Processed', String(data.cases_processed)],
                ['Failed', String(data.cases_failed)],
                ['Reviews', String(data.reviews_total)],
                ['Confirm rate', pct(data.confirm_rate)],
                ['Override rate', pct(data.override_rate)],
                ['Latency p50', sec(data.latency_median_sec)],
                ['Latency p95', sec(data.latency_p95_sec)],
              ].map(([label, value]) => (
                <div key={label} className="syncra-card p-4">
                  <div className="text-[11px] text-syncra-muted uppercase tracking-wide">{label}</div>
                  <div className="text-xl font-medium text-syncra-ink mt-1">{value}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="syncra-card p-5 space-y-3">
                <h3 className="text-sm font-medium text-syncra-ink">Urgency distribution</h3>
                <ul className="space-y-2 text-xs text-syncra-secondary">
                  {Object.entries(data.urgency_distribution).map(([k, v]) => (
                    <li key={k} className="flex justify-between border-b border-syncra-border pb-1">
                      <span>{k}</span>
                      <span className="text-syncra-ink font-medium">{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="syncra-card p-5 space-y-3">
                <h3 className="text-sm font-medium text-syncra-ink">Review quality</h3>
                <ul className="space-y-2 text-xs text-syncra-secondary">
                  <li className="flex justify-between border-b border-syncra-border pb-1">
                    <span>Confirms</span>
                    <span className="text-syncra-ink font-medium">{data.confirms}</span>
                  </li>
                  <li className="flex justify-between border-b border-syncra-border pb-1">
                    <span>Overrides</span>
                    <span className="text-syncra-ink font-medium">{data.overrides}</span>
                  </li>
                  <li className="flex justify-between border-b border-syncra-border pb-1">
                    <span>Down-triage overrides</span>
                    <span className="text-syncra-ink font-medium">{data.down_triage_overrides}</span>
                  </li>
                  <li className="flex justify-between border-b border-syncra-border pb-1">
                    <span>Down-triage reason completion</span>
                    <span className="text-syncra-ink font-medium">{pct(data.down_triage_reason_pct)}</span>
                  </li>
                  <li className="flex justify-between border-b border-syncra-border pb-1">
                    <span>Active clinicians (range)</span>
                    <span className="text-syncra-ink font-medium">{data.active_clinicians}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Open sessions (now)</span>
                    <span className="text-syncra-ink font-medium">{data.open_sessions}</span>
                  </li>
                </ul>
              </div>
            </div>

            {data.notes?.length > 0 && (
              <p className="text-[11px] text-syncra-muted leading-relaxed">
                {data.notes.join(' ')}
                {data.latency_sample_n === 0
                  ? ' Latency needs new intakes after accepted_at tracking shipped.'
                  : ` Latency sample n=${data.latency_sample_n}.`}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
