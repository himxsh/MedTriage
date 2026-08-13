"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

export type SidebarNavItem = {
  key: string;
  label: string;
  section: string;
  icon?: ReactNode;
  count?: number;
};

export default function SidebarNav({
  workspace = "MedTriage",
  subtitle = "Clinical workspace",
  items,
  sections,
  active,
  onSelect,
  onNew,
  newLabel = "New intake",
  searchQuery,
  onSearch,
}: {
  workspace?: string;
  subtitle?: string;
  items: SidebarNavItem[];
  sections: string[];
  active: string;
  onSelect: (key: string) => void;
  onNew?: () => void;
  newLabel?: string;
  searchQuery?: string;
  onSearch?: (q: string) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [box, setBox] = useState<{ top: number; height: number } | null>(null);
  const [query, setQuery] = useState("");
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const q = searchQuery ?? query;
  const visible = q
    ? items.filter((item) => item.label.toLowerCase().includes(q.toLowerCase()))
    : items;

  useLayoutEffect(() => {
    const container = navRef.current;
    const target = itemRefs.current[hovered ?? active];
    if (!container || !target) return;
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    setBox({
      top: targetRect.top - containerRect.top,
      height: targetRect.height,
    });
  }, [hovered, active, visible]);

  return (
    <div className="flex h-full w-full flex-col rounded-card bg-surface p-2">
      <button
        type="button"
        className="mb-2 flex w-full items-center gap-2.5 rounded-control p-1.5 text-left
          transition-[background-color,transform] duration-100 hover:bg-hover active:scale-[0.96]"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-ink text-[13px] font-semibold text-surface">
          {workspace.slice(0, 1).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium leading-tight text-ink">{workspace}</span>
          <span className="block truncate text-[11px] leading-tight text-ink-3">{subtitle}</span>
        </span>
      </button>

      <label className="mb-1 flex h-8 items-center gap-2 rounded-control bg-inset px-2.5 shadow-hairline">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          value={q}
          onChange={(event) => {
            onSearch?.(event.target.value);
            if (searchQuery === undefined) setQuery(event.target.value);
          }}
          placeholder="Quick search"
          className="min-w-0 flex-1 bg-transparent text-[12.5px] text-ink outline-none placeholder:text-ink-3"
        />
      </label>

      {onNew && (
        <button
          type="button"
          onClick={onNew}
          className="mb-2 flex w-full items-center gap-2 rounded-control px-2 py-1.5 text-[13px]
            font-medium text-accent transition-[background-color,transform] duration-100 hover:bg-accent-tint active:scale-[0.96]"
        >
          <span className="min-w-0 flex-1 truncate text-left">{newLabel}</span>
          <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-accent text-white">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
        </button>
      )}

      <div
        ref={navRef}
        onMouseLeave={() => setHovered(null)}
        className="relative min-h-0 flex-1 overflow-y-auto"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 rounded-[7px] bg-hover"
          style={{
            top: box?.top ?? 0,
            height: box?.height ?? 0,
            opacity: box ? 1 : 0,
            transition:
              "top 220ms cubic-bezier(0.23,1,0.32,1), height 220ms cubic-bezier(0.23,1,0.32,1), opacity 150ms ease",
          }}
        />
        {sections.map((section) => {
          const group = visible.filter((item) => item.section === section);
          if (group.length === 0) return null;
          return (
            <div key={section} className="mb-2">
              <div className="px-2 pb-1 pt-1 text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-3">
                {section}
              </div>
              <div className="flex flex-col gap-px">
                {group.map((item) => {
                  const isActive = item.key === active;
                  return (
                    <button
                      key={item.key}
                      ref={(el) => {
                        itemRefs.current[item.key] = el;
                      }}
                      type="button"
                      onMouseEnter={() => setHovered(item.key)}
                      onFocus={() => setHovered(item.key)}
                      onBlur={() => setHovered(null)}
                      onClick={() => onSelect(item.key)}
                      aria-current={isActive ? "page" : undefined}
                      className="group relative z-10 flex w-full items-center gap-2 rounded-[7px] px-2 py-1.5 text-left
                        transition-[color,transform] duration-150 active:scale-[0.96]"
                    >
                      <span className={isActive ? "text-ink" : "text-ink-3"}>{item.icon}</span>
                      <span
                        className={`min-w-0 flex-1 truncate text-[13px] transition-colors duration-150
                          ${isActive ? "font-medium text-ink" : "text-ink-2"}`}
                      >
                        {item.label}
                      </span>
                      {item.count != null && item.count > 0 && (
                        <span
                          className={`flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[10.5px] font-semibold tabular-nums ${
                            isActive ? "bg-surface text-ink-2 shadow-hairline" : "bg-accent-tint text-accent-ink"
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
