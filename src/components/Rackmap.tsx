'use client';

import { useMemo } from 'react';

export default function Rackmap({
  cols,
  rows,
  density = 0.4,
  style
}: {
  cols: number;
  rows: number;
  density?: number;
  style?: React.CSSProperties;
}) {
  const cells = useMemo(() => {
    const total = cols * rows;
    return Array.from({ length: total }, () => {
      const r = Math.random();
      if (r < density * 0.5) return 'o3';
      if (r < density * 0.8) return 'o2';
      if (r < density) return 'o1';
      return '';
    });
  }, [cols, rows, density]);

  return (
    <div className="rackmap" style={{ gridTemplateColumns: `repeat(${cols},1fr)`, ...style }}>
      {cells.map((cls, i) => (
        <div key={i} className={`cell ${cls}`} />
      ))}
    </div>
  );
}
