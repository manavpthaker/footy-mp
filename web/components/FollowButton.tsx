"use client";
import React from "react";
import type { EntityType } from "@/lib/supabase";

/**
 * Gold ★ = followed. Neutral outline = not followed. Never green.
 * Optimistic — POST/DELETE happens on click; no reload.
 */
export function FollowButton({
  entityType, entityId, initialFollowed,
}: {
  entityType: EntityType; entityId: number; initialFollowed: boolean;
}) {
  const [followed, setFollowed] = React.useState(initialFollowed);
  const [busy, setBusy] = React.useState(false);

  async function toggle() {
    if (busy) return;
    const next = !followed;
    setFollowed(next); setBusy(true);
    try {
      const res = await fetch("/api/follows", {
        method: next ? "POST" : "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ entity_type: entityType, entity_id: entityId }),
      });
      if (!res.ok) setFollowed(!next);
    } catch {
      setFollowed(!next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button onClick={toggle} disabled={busy} aria-pressed={followed}
      title={followed ? "Following — click to unfollow" : "Follow"}
      style={{
        background: followed ? "var(--follow-tint)" : "transparent",
        color: followed ? "var(--follow)" : "var(--text-muted)",
        border: `1px solid ${followed ? "var(--follow)" : "var(--border)"}`,
        borderRadius: "var(--radius-md)",
        padding: "5px 10px", cursor: busy ? "wait" : "pointer",
        fontSize: "var(--fs-sm)", fontWeight: 600, letterSpacing: "0.02em",
        display: "inline-flex", alignItems: "center", gap: 6,
        transition: "all var(--dur-base) var(--ease-out)",
      }}>
      <span style={{ fontSize: 14, lineHeight: 1 }}>{followed ? "★" : "☆"}</span>
      {followed ? "Following" : "Follow"}
    </button>
  );
}
