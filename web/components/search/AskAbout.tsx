"use client";

import React from "react";

export function AskAbout({
  question,
  label = "Ask about this",
}: {
  question: string;
  label?: string;
}) {
  return (
    <button type="button" onClick={() => {
      window.dispatchEvent(new CustomEvent("mpfc:ask", { detail: { question } }));
    }} style={{
      display: "inline-flex", alignItems: "center", gap: 7,
      border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
      background: "var(--surface-panel)", color: "var(--accent-2)",
      padding: "7px 10px", cursor: "pointer", fontSize: "var(--fs-xs)",
      fontWeight: 700,
    }}>
      <span aria-hidden style={{
        display: "grid", placeItems: "center", width: 16, height: 16,
        border: "1px solid currentColor", borderRadius: "50%", fontSize: 10,
      }}>?</span>
      {label}
    </button>
  );
}

