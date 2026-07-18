import React from "react";

/** Skeleton for list panes — mirrors the fixture-row rhythm so nothing jumps. */
export default function RailLoading() {
  return (
    <div style={{ padding: "14px 16px" }} aria-busy="true" aria-label="Loading">
      <div className="fmp-skel" style={{ height: 118, borderRadius: 16, marginBottom: 10 }} />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="fmp-skel" style={{ height: 54, borderRadius: 12, marginBottom: 7 }} />
      ))}
    </div>
  );
}
