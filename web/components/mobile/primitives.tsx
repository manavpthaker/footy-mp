"use client";
import React from "react";

export const mono = {
  fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" as const,
};
export const eyebrow = {
  fontSize: "var(--fs-2xs)", textTransform: "uppercase" as const,
  letterSpacing: "var(--tracking-label)", color: "var(--text-faint)",
  fontWeight: "var(--fw-semibold)",
};

export function Pad({
  children, style = {},
}: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ padding: "0 16px", ...style }}>{children}</div>;
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      border: "1px dashed var(--border)", borderRadius: "var(--radius-xl)",
      padding: "18px 14px", color: "var(--text-faint)", fontSize: "var(--fs-sm)",
      textAlign: "center",
    }}>{children}</div>
  );
}

export function ChipRail({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", gap: 6, overflowX: "auto",
      padding: "2px 16px 4px",
      scrollbarWidth: "none",
    }}>{children}</div>
  );
}

export function Chip({
  active, onClick, children,
}: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      flex: "0 0 auto", cursor: "pointer",
      fontFamily: "var(--font-ui)", fontSize: "var(--fs-xs)", fontWeight: 600,
      padding: "7px 11px", borderRadius: "var(--radius-md)", lineHeight: 1,
      background: active ? "var(--ember-tint)" : "var(--surface-panel)",
      color: active ? "var(--accent)" : "var(--text-muted)",
      border: `1px solid ${active ? "var(--ember-600)" : "var(--border)"}`,
      whiteSpace: "nowrap",
    }}>{children}</button>
  );
}

export function Segmented<T extends string>({
  options, value, onChange,
}: {
  options: { value: T; label: string }[];
  value: T; onChange: (v: T) => void;
}) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: `repeat(${options.length}, 1fr)`,
      background: "var(--surface-tint)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)", padding: 2, gap: 2,
    }}>
      {options.map(o => {
        const on = o.value === value;
        return (
          <button key={o.value} onClick={() => onChange(o.value)} style={{
            border: "none", cursor: "pointer", padding: "7px 4px",
            borderRadius: "var(--radius-sm)", lineHeight: 1,
            fontFamily: "var(--font-ui)", fontSize: "var(--fs-xs)", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.06em",
            background: on ? "var(--surface-raised)" : "transparent",
            color: on ? "var(--accent)" : "var(--text-faint)",
            boxShadow: on ? "inset 0 0 0 1px var(--border)" : "none",
          }}>{o.label}</button>
        );
      })}
    </div>
  );
}

export function MiniProb({ pred }: { pred: { h: number; d: number; a: number } }) {
  const h = Math.round(pred.h * 100);
  const d = Math.round(pred.d * 100);
  const a = 100 - h - d;
  const [favKey, favP, favColor] =
    pred.h >= pred.a && pred.h >= pred.d ? ["H", h, "var(--accent-2)"] as const
    : pred.a >= pred.h && pred.a >= pred.d ? ["A", a, "var(--accent)"] as const
    : ["D", d, "var(--slate-300)"] as const;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
      <div style={{
        display: "flex", width: 56, height: 5, borderRadius: 2, overflow: "hidden",
        border: "1px solid var(--border-soft)",
      }}>
        <span style={{ width: `${h}%`, background: "var(--steel-500)" }} />
        <span style={{ width: `${d}%`, background: "var(--track)" }} />
        <span style={{ width: `${a}%`, background: "var(--ember-500)" }} />
      </div>
      <span style={{
        ...mono, fontSize: "var(--fs-2xs)", color: favColor, fontWeight: 700,
      }}>{favKey} {favP}%</span>
    </div>
  );
}
