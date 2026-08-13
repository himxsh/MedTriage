"use client";

import { useMemo, useState, type ReactNode } from "react";

export type RecordsStrength = "strong" | "weak" | "veryweak" | "none";
type SortKey = "name" | "last" | "strength";

const STRENGTH: Record<RecordsStrength, { label: string; color: string; rank: number }> = {
  strong: { label: "High confidence", color: "var(--green)", rank: 3 },
  weak: { label: "Moderate", color: "var(--orange)", rank: 2 },
  veryweak: { label: "Low confidence", color: "var(--red)", rank: 1 },
  none: { label: "No score", color: "var(--ink-3)", rank: 0 },
};

const DEFAULT_TAG_COLORS: Record<string, string> = {
  Critical: "#e3474c",
  High: "#ef720c",
  Medium: "#eab308",
  Low: "#189a4d",
  "Pending Review": "#f09a2f",
  Completed: "#25a878",
  Failed: "#e3474c",
};

export type RecordsRow = {
  id: string;
  name: string;
  tags: string[];
  last: string;
  strength: RecordsStrength;
  link?: string;
};

function Icon({ children, size = 14, strokeWidth = 1.8 }: { children: ReactNode; size?: number; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

function Tag({ name, colors }: { name: string; colors: Record<string, string> }) {
  const color = colors[name] ?? "#7f858d";
  return (
    <span className="records-tag" style={{ "--tag-color": color } as React.CSSProperties}>
      <span className="records-tag-dot" style={{ background: color }} />
      {name}
    </span>
  );
}

export default function RecordsTable({
  rows,
  tagColors = DEFAULT_TAG_COLORS,
  columns = { name: "Patient", tags: "Status", last: "Logged", strength: "Confidence", link: "Case" },
  onRowClick,
  ariaLabel = "Records table",
}: {
  rows: RecordsRow[];
  tagColors?: Record<string, string>;
  columns?: { name: string; tags: string; last: string; strength: string; link: string };
  onRowClick?: (id: string) => void;
  ariaLabel?: string;
}) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "last", dir: -1 });

  const visibleRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const value =
        sort.key === "name"
          ? a.name.localeCompare(b.name)
          : sort.key === "last"
            ? a.last.localeCompare(b.last)
            : STRENGTH[a.strength].rank - STRENGTH[b.strength].rank;
      return value * sort.dir;
    });
  }, [rows, sort]);

  const toggleSort = (key: SortKey) =>
    setSort((current) => (current.key === key ? { key, dir: (current.dir * -1) as 1 | -1 } : { key, dir: 1 }));

  const header = (label: string, sortKey?: SortKey) => (
    <th className="records-header-cell">
      <button type="button" className="records-header-button" onClick={sortKey ? () => toggleSort(sortKey) : undefined}>
        <span className="truncate">{label}</span>
        {sortKey && (
          <span
            className={`records-sort ${sort.key === sortKey ? "is-visible" : ""}`}
            style={{ transform: sort.key === sortKey && sort.dir === -1 ? "rotate(180deg)" : undefined }}
          >
            <Icon size={12}>
              <path d="M12 5v14M5 12l7 7 7-7" />
            </Icon>
          </span>
        )}
      </button>
    </th>
  );

  return (
    <div className="records-shell">
      <div className="records-scroll" tabIndex={0} aria-label={ariaLabel}>
        <table className="records-table">
          <colgroup>
            <col className="records-company-col" />
            <col className="records-category-col" />
            <col className="records-last-col" />
            <col className="records-strength-col" />
            <col className="records-link-col" />
          </colgroup>
          <thead>
            <tr>
              <th className="records-header-cell records-sticky-cell">
                <div className="records-company-header">
                  <span>{columns.name}</span>
                </div>
              </th>
              {header(columns.tags)}
              {header(columns.last, "last")}
              {header(columns.strength, "strength")}
              {header(columns.link)}
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td className="records-cell records-muted" colSpan={5}>
                  No matching records
                </td>
              </tr>
            ) : (
              visibleRows.map((row) => {
                const strength = STRENGTH[row.strength];
                return (
                  <tr
                    key={row.id}
                    className="records-row cursor-pointer"
                    onClick={() => onRowClick?.(row.id)}
                  >
                    <td className="records-cell records-sticky-cell records-company-cell">
                      <span className="records-company-mark">{row.name.slice(0, 1).toUpperCase()}</span>
                      <span className="records-company-name">{row.name}</span>
                    </td>
                    <td className="records-cell">
                      <div className="records-tags">
                        {row.tags.slice(0, 4).map((tag) => (
                          <Tag key={tag} name={tag} colors={tagColors} />
                        ))}
                        {row.tags.length > 4 ? <span className="records-more-tag">+{row.tags.length - 4}</span> : null}
                      </div>
                    </td>
                    <td className="records-cell">{row.last}</td>
                    <td className="records-cell">
                      <span className="records-strength">
                        <span className="records-strength-dot" style={{ background: strength.color }} />
                        {strength.label}
                      </span>
                    </td>
                    <td className="records-cell">
                      {row.link ? <span className="records-link">{row.link}</span> : <span className="records-muted">—</span>}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot>
            <tr className="records-calculation-row">
              <td className="records-cell records-sticky-cell records-calculation-label">
                <span className="records-calculation-number">{rows.length}</span> count
              </td>
              <td className="records-cell records-muted">—</td>
              <td className="records-cell records-muted">—</td>
              <td className="records-cell">
                <span className="records-average">
                  <span className="records-strength-dot" style={{ background: "var(--orange)" }} />
                  {rows.length
                    ? `${Math.round((rows.reduce((sum, row) => sum + STRENGTH[row.strength].rank, 0) / rows.length / 3) * 100)}% avg`
                    : "—"}
                </span>
              </td>
              <td className="records-cell records-muted">—</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
