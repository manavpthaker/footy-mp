"use client";
import React from "react";

export default function DetailError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ padding: "40px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 22, marginBottom: 8 }}>⚠</div>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>Couldn&apos;t load this page</div>
      <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>
        Usually a blip talking to the database — retry should fix it.
      </div>
      <button onClick={reset} style={{
        background: "var(--grad-gold)", color: "var(--text-on-gold)",
        border: "none", borderRadius: 10, padding: "9px 18px",
        fontWeight: 700, cursor: "pointer", font: "inherit",
      }}>Retry</button>
    </div>
  );
}
