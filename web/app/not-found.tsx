import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ padding: "60px 20px", textAlign: "center" }}>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 40, fontWeight: 700,
        color: "var(--accent)", marginBottom: 8,
      }}>404</div>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>Off the pitch</div>
      <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
        Nothing lives at this address — maybe the entity was merged or the id changed.
      </div>
      <Link href="/" style={{
        display: "inline-block", background: "var(--grad-gold)",
        color: "var(--text-on-gold)", borderRadius: 10, padding: "9px 18px",
        fontWeight: 700, textDecoration: "none",
      }}>Back to Today</Link>
    </div>
  );
}
