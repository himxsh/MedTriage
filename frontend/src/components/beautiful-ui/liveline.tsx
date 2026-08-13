/** ponytail: stub chart — enough for InsightCards layout without liveline dep. */
import type { CSSProperties, ReactNode } from 'react';

export type LivelinePoint = { time: number; value: number };

export type LivelineSeries = {
  id?: string;
  label?: string;
  color?: string;
  data: LivelinePoint[];
};

type LivelineProps = {
  data?: LivelinePoint[];
  value?: number;
  series?: LivelineSeries[];
  theme?: string;
  color?: string;
  grid?: boolean;
  pulse?: boolean;
  window?: number;
  paused?: boolean;
  scrub?: boolean;
  fill?: boolean;
  momentum?: boolean;
  cursor?: string;
  lineWidth?: number;
  padding?: { top?: number; right?: number; bottom?: number; left?: number };
  formatValue?: (v: number) => string;
  children?: ReactNode;
};

function pathFromPoints(points: LivelinePoint[], w: number, h: number): string {
  if (points.length === 0) return '';
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return points
    .map((p, i) => {
      const x = (i / Math.max(points.length - 1, 1)) * w;
      const y = h - ((p.value - min) / span) * h;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

export function Liveline({
  data = [],
  series = [],
  color = 'var(--accent)',
  lineWidth = 2,
}: LivelineProps) {
  const w = 400;
  const h = 120;
  const style: CSSProperties = { width: '100%', height: '100%', display: 'block' };
  const lines =
    series.length > 0
      ? series.map((s) => ({ color: s.color ?? color, d: pathFromPoints(s.data, w, h) }))
      : [{ color, d: pathFromPoints(data, w, h) }];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={style} aria-hidden>
      {lines.map((line, i) =>
        line.d ? (
          <path
            key={i}
            d={line.d}
            fill="none"
            stroke={line.color}
            strokeWidth={lineWidth}
            vectorEffect="non-scaling-stroke"
          />
        ) : null,
      )}
    </svg>
  );
}
