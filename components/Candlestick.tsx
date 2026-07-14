"use client";
import { useState } from "react";
import type { Candle } from "@/lib/candle";

interface Props { candles: Candle[]; height?: number; }

export default function Candlestick({ candles, height = 320 }: Props) {
  const [hover, setHover] = useState<Candle | null>(null);

  if (candles.length < 2) {
    return (
      <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "var(--text-dim)" }}>
        Sem histórico suficiente ainda
      </div>
    );
  }

  const pad   = { top: 16, right: 8, bottom: 22, left: 36 };
  const w     = 900, h = height;
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;

  const min = Math.min(...candles.map(c => c.l));
  const max = Math.max(...candles.map(c => c.h));
  const range = Math.max(max - min, 0.5);

  const y = (v: number) => pad.top + plotH - ((v - min) / range) * plotH;
  const slot = plotW / candles.length;
  const bodyW = Math.max(2, slot * 0.6);

  const gridLines = [min, min + range * 0.25, min + range * 0.5, min + range * 0.75, max];

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ display: "block", overflow: "visible" }}>
        {/* Grid + eixo Y */}
        {gridLines.map((v, i) => (
          <g key={i}>
            <line x1={pad.left} x2={w - pad.right} y1={y(v)} y2={y(v)} stroke="var(--border)" strokeWidth="1" />
            <text x={pad.left - 6} y={y(v)} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="var(--text-dim)">{v.toFixed(0)}¢</text>
          </g>
        ))}

        {/* Candles */}
        {candles.map((c, i) => {
          const cx  = pad.left + slot * i + slot / 2;
          const up  = c.c >= c.o;
          const color = up ? "var(--yes)" : "var(--no)";
          const bodyTop = y(Math.max(c.o, c.c));
          const bodyBot = y(Math.min(c.o, c.c));
          return (
            <g key={i}
              onMouseEnter={() => setHover(c)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: "crosshair" }}>
              <rect x={cx - slot / 2} y={pad.top} width={slot} height={plotH} fill="transparent" />
              <line x1={cx} x2={cx} y1={y(c.h)} y2={y(c.l)} stroke={color} strokeWidth="1.2" />
              <rect x={cx - bodyW / 2} y={bodyTop} width={bodyW} height={Math.max(1.5, bodyBot - bodyTop)} fill={color} />
            </g>
          );
        })}
      </svg>

      {hover && (
        <div style={{
          position: "absolute", top: 4, left: 42, background: "var(--surface2)", border: "1px solid var(--border)",
          borderRadius: 8, padding: "6px 10px", fontSize: 11, color: "var(--text-muted)", display: "flex", gap: 12, pointerEvents: "none",
        }}>
          <span>{new Date(hover.t).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
          <span>A: <b style={{ color: "var(--text)" }}>{hover.o.toFixed(1)}¢</b></span>
          <span>Máx: <b style={{ color: "var(--text)" }}>{hover.h.toFixed(1)}¢</b></span>
          <span>Mín: <b style={{ color: "var(--text)" }}>{hover.l.toFixed(1)}¢</b></span>
          <span>F: <b style={{ color: hover.c >= hover.o ? "var(--yes)" : "var(--no)" }}>{hover.c.toFixed(1)}¢</b></span>
        </div>
      )}
    </div>
  );
}
