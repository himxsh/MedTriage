"use client";

import { useState, type ReactNode } from "react";

export type RecommendationOption = {
  key: string;
  short: string;
  label: string;
  signal: number;
  tone: string;
};

function Meter({ signal, tone }: { signal: number; tone: string }) {
  return (
    <span className="flex items-end gap-0.5">
      {[0, 1, 2].map((bar) => (
        <span
          key={bar}
          className="w-1 rounded-full transition-colors duration-300"
          style={{ height: 10, background: bar < signal ? tone : "var(--line-strong)" }}
        />
      ))}
    </span>
  );
}

export default function RecommendationCard({
  title,
  body,
  signal,
  tone,
  label,
  cta = "Accept",
  alternatives = [],
  onAccept,
  onAlternative,
  busy = false,
  accepted = false,
}: {
  title: string;
  body: ReactNode;
  signal: number;
  tone: string;
  label: string;
  cta?: string;
  alternatives?: RecommendationOption[];
  onAccept?: () => void;
  onAlternative?: (key: string) => void;
  busy?: boolean;
  accepted?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full overflow-hidden rounded-card bg-surface shadow-card">
      <div className="primitive-card-pad">
        <span className="text-[13px] font-semibold text-ink">{title}</span>
        <p className="mt-1.5 min-h-12 text-[13px] leading-relaxed text-ink-2">{body}</p>
      </div>

      <div
        className="grid transition-[grid-template-rows,opacity] duration-300"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          opacity: open ? 1 : 0,
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div className="overflow-hidden">
          <div className="border-t border-line bg-inset px-2 py-2">
            <p className="px-1.5 pb-1 text-[11px] font-medium text-ink-3">Other options</p>
            {alternatives.map((o) => (
              <button
                key={o.key}
                type="button"
                onClick={() => {
                  onAlternative?.(o.key);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-control px-1.5 py-1.5
                  text-left transition-colors duration-100 hover:bg-hover"
              >
                <Meter signal={o.signal} tone={o.tone} />
                <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink">{o.short}</span>
                <span className="shrink-0 text-[11px] text-ink-3">{o.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="primitive-card-footer flex items-center justify-between gap-3 border-t border-line bg-inset">
        <span className="flex items-center gap-2">
          <Meter signal={signal} tone={tone} />
          <span className="text-[12.5px] font-medium text-ink-2">{label}</span>
        </span>
        <span className="-mr-0.5 flex items-center gap-2">
          {alternatives.length > 0 && (
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpen((current) => !current)}
              className={`h-7 rounded-control px-2.5 text-[12.5px] font-medium shadow-btn
                transition-[background-color,transform] duration-100 active:scale-[0.96]
                ${open ? "bg-hover text-ink" : "bg-surface text-ink hover:bg-hover"}`}
            >
              Alternatives
            </button>
          )}
          <button
            type="button"
            disabled={busy || accepted}
            onClick={onAccept}
            className={`h-7 rounded-control px-3 text-[12.5px] font-medium
              shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_0_0_1px_rgba(16,24,40,0.12),0_1px_2px_rgba(16,24,40,0.1)]
              transition-[background-color,transform] duration-150 active:scale-[0.96]
              ${accepted ? "bg-green text-white" : "bg-accent text-white"}`}
          >
            {busy ? "Working…" : accepted ? "Accepted" : cta}
          </button>
        </span>
      </div>
    </div>
  );
}
