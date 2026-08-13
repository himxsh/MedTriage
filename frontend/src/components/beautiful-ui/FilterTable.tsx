"use client";

import type { ReactNode } from "react";

export type FilterChip = {
  key: string;
  label: string;
  dot?: string;
  count: number;
};

export type FilterRow = {
  id: string;
  cells: ReactNode[];
  hidden?: boolean;
  onClick?: () => void;
  className?: string;
};

export default function FilterTable({
  filters,
  value,
  onChange,
  columns,
  rows,
  gridCols,
  empty,
}: {
  filters: FilterChip[];
  value: string;
  onChange: (key: string) => void;
  columns: string[];
  rows: FilterRow[];
  gridCols?: string;
  empty?: ReactNode;
}) {
  const template = gridCols ?? `repeat(${columns.length}, minmax(0, 1fr))`;
  const visibleCount = rows.filter((row) => !row.hidden).length;

  return (
    <div className="w-full">
      <div
        className="-mx-1 mb-1 flex items-center gap-1 overflow-x-auto px-1 py-1"
        style={{ scrollbarWidth: "none" }}
      >
        {filters.map((f) => {
          const active = value === f.key;
          return (
            <button
              key={f.key}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(f.key)}
              className={`flex h-6.5 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[12px]
                font-medium transition-[background-color,box-shadow,color] duration-200
                ${active ? "bg-surface text-ink shadow-btn" : "text-ink-2 hover:bg-hover"}`}
            >
              {f.dot && <span className="size-1.5 rounded-full" style={{ background: f.dot }} />}
              {f.label}
              <span
                className={`rounded-[4px] px-1 text-[10.5px] tabular-nums
                  ${active ? "bg-field text-ink-2" : "text-ink-3"}`}
              >
                {f.count}
              </span>
            </button>
          );
        })}
      </div>

      <div
        aria-label="Scrollable table"
        className="overflow-x-auto rounded-card bg-surface shadow-card"
        role="region"
        tabIndex={0}
        style={{ scrollbarWidth: "none" }}
      >
        <div className="min-w-[560px]">
          <div
            className="grid border-b border-line px-3 py-2 text-[11.5px] font-medium text-ink-3"
            style={{ gridTemplateColumns: template }}
          >
            {columns.map((col) => (
              <span key={col}>{col}</span>
            ))}
          </div>
          {visibleCount === 0 && empty ? (
            <div className="px-3 py-12 text-center text-[13px] text-ink-3">{empty}</div>
          ) : (
            rows.map((row) => (
              <div
                key={row.id}
                className="grid transition-[grid-template-rows,opacity] duration-300"
                style={{
                  gridTemplateRows: row.hidden ? "0fr" : "1fr",
                  opacity: row.hidden ? 0 : 1,
                  transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
                }}
              >
                <div className="overflow-hidden">
                  <div
                    role={row.onClick ? "button" : undefined}
                    onClick={row.onClick}
                    className={`grid items-center border-b border-line px-3 py-2 text-[12px] transition-colors duration-100 last:border-0 hover:bg-hover ${row.onClick ? "cursor-pointer" : ""} ${row.className ?? ""}`}
                    style={{ gridTemplateColumns: template }}
                  >
                    {row.cells.map((cell, i) => (
                      <span key={i} className="min-w-0 truncate">
                        {cell}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
