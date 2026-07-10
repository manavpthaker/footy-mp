"use client";
import React from "react";
// @ts-ignore  — DS FollowButton props are permissive
import { FollowButton } from "@/components/ds";
import type { EntityType } from "@/lib/supabase";

/**
 * Wraps the DS FollowButton with the actual Supabase POST/DELETE. Optimistic;
 * flips back on server failure. Icon-only when `label={false}`.
 */
export function FollowToggle({
  entityType, entityId, initialFollowed, label = true,
}: {
  entityType: EntityType; entityId: number;
  initialFollowed: boolean; label?: boolean;
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

  return <FollowButton following={followed} onToggle={toggle} label={label} />;
}
