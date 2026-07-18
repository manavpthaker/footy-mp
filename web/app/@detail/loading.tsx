import React from "react";

/** Skeleton for detail panes — scoreboard block + content rows. */
export default function DetailLoading() {
  return (
    <div style={{ padding: "14px 16px" }} aria-busy="true" aria-label="Loading">
      <div className="fmp-skel" style={{ height: 92, borderRadius: 16, marginBottom: 12 }} />
      <div className="fmp-skel" style={{ height: 30, width: "55%", borderRadius: 8, marginBottom: 10 }} />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="fmp-skel" style={{ height: 64, borderRadius: 12, marginBottom: 8 }} />
      ))}
    </div>
  );
}
