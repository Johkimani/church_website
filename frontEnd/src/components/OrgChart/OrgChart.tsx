import React, { useEffect, useRef, useState } from 'react';

interface Official {
  id: string | number;
  name: string;
  role?: string;
  photo_url?: string;
}

interface Props {
  officials: Official[];
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

const OrgChart: React.FC<Props> = ({ officials }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const panStart = useRef<{ x: number; y: number } | null>(null);

  // Simple layout: rows of 4
  const cols = 4;
  const gap = 220;

  const nodes = officials.map((o, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    return {
      ...o,
      x: col * gap,
      y: row * gap,
    };
  });

  useEffect(() => {
    // center the chart
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setOffset({ x: rect.width / 2 - (cols - 1) * gap / 2, y: 20 });
  }, [officials]);

  // Pan handlers (drag background)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as Element).closest('.org-node')) return; // don't pan when dragging node
      panStart.current = { x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!panStart.current) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      panStart.current = { x: e.clientX, y: e.clientY };
      setOffset((p) => ({ x: p.x + dx, y: p.y + dy }));
    };

    const onPointerUp = (e: PointerEvent) => {
      panStart.current = null;
      try { el.releasePointerCapture(e.pointerId); } catch {}
    };

    el.addEventListener('pointerdown', onPointerDown as any);
    window.addEventListener('pointermove', onPointerMove as any);
    window.addEventListener('pointerup', onPointerUp as any);

    return () => {
      el.removeEventListener('pointerdown', onPointerDown as any);
      window.removeEventListener('pointermove', onPointerMove as any);
      window.removeEventListener('pointerup', onPointerUp as any);
    };
  }, []);

  // Wheel zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // let browser handle
      e.preventDefault();
      const delta = -e.deltaY;
      const factor = delta > 0 ? 1.08 : 0.92;
      setScale((s) => clamp(s * factor, 0.5, 3));
    };
    el.addEventListener('wheel', onWheel as any, { passive: false });
    return () => el.removeEventListener('wheel', onWheel as any);
  }, []);

  // Node dragging (simple local state)
  const dragging = useRef<{ id: string | number; startX: number; startY: number } | null>(null);
  const [nodePositions, setNodePositions] = useState(() => nodes.map(n => ({ id: n.id, x: n.x, y: n.y })));

  useEffect(() => setNodePositions(nodes.map(n => ({ id: n.id, x: n.x, y: n.y }))), [officials]);

  const onNodePointerDown = (e: React.PointerEvent, id: string | number) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    dragging.current = { id, startX: e.clientX, startY: e.clientY };
  };

  const onNodePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const d = dragging.current;
    const dx = (e.clientX - d.startX) / scale;
    const dy = (e.clientY - d.startY) / scale;
    d.startX = e.clientX;
    d.startY = e.clientY;
    setNodePositions((prev) => prev.map(p => p.id === d.id ? { ...p, x: p.x + dx, y: p.y + dy } : p));
  };

  const onNodePointerUp = (e: React.PointerEvent) => {
    if (dragging.current) {
      try { (e.target as Element).releasePointerCapture(e.pointerId); } catch {}
      dragging.current = null;
    }
  };

  return (
    <div ref={containerRef} className="w-full h-[520px] bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden relative">
      <svg ref={svgRef} className="w-full h-full" style={{ touchAction: 'none' }}>
        <g transform={`translate(${offset.x}, ${offset.y}) scale(${scale})`}>
          {/* links (simple grid connections) */}
          {nodePositions.map((n, i) => (
            (i % cols !== 0) ? (
              <line key={`link-${n.id}`} x1={n.x - gap} y1={n.y} x2={n.x} y2={n.y} stroke="#e6e9ef" strokeWidth={2} />
            ) : null
          ))}

          {/* nodes */}
          {nodePositions.map((n) => {
            const official = officials.find(o => o.id === n.id as any) as Official | undefined;
            return (
              <g
                className="org-node"
                key={n.id}
                transform={`translate(${n.x}, ${n.y})`}
                onPointerDown={(e) => onNodePointerDown(e, n.id)}
                onPointerMove={onNodePointerMove}
                onPointerUp={onNodePointerUp}
                style={{ cursor: 'grab' }}
              >
                <rect x={-80} y={-40} width={160} height={80} rx={14} fill="white" stroke="#e6e9ef" strokeWidth={1} style={{ boxShadow: '0 10px 30px rgba(2,6,23,0.06)' }} />
                {official?.photo_url ? (
                  <image href={official.photo_url} x={-72} y={-32} width={64} height={64} clipPath="none" style={{ borderRadius: 12 }} />
                ) : (
                  <rect x={-72} y={-32} width={64} height={64} rx={10} fill="#eef2ff" />
                )}
                <text x={-2} y={-2} fontSize={14} fontWeight={700} textAnchor="start" fill="#0f172a">{official?.name}</text>
                <text x={-2} y={18} fontSize={11} fill="#64748b">{official?.role}</text>
              </g>
            );
          })}
        </g>
      </svg>
      <div className="absolute left-4 bottom-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-100 text-xs font-semibold">
        Drag nodes • Pan background • Wheel to zoom
      </div>
    </div>
  );
};

export default OrgChart;
