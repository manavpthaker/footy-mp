"use client";
import React from "react";
import { useRouter } from "next/navigation";
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
  const [error, setError] = React.useState(false);
  const router = useRouter();
  React.useEffect(() => setFollowed(initialFollowed), [initialFollowed]);

  async function toggle() {
    if (busy) return;
    const next = !followed;
    setFollowed(next); setBusy(true); setError(false);
    try {
      const res = await fetch("/api/follows", {
        method: next ? "POST" : "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ entity_type: entityType, entity_id: entityId }),
      });
      if (!res.ok) { setFollowed(!next); setError(true); }
      else router.refresh();
    } catch {
      setFollowed(!next);
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return <span><FollowButton following={followed} onToggle={toggle} label={label}
    disabled={busy} aria-label={`${followed ? "Unfollow" : "Follow"} ${entityType}`} />
    {error && <span role="alert" style={{ display: "block", fontSize: 11, color: "var(--gold)" }}>Couldn’t save. Try again.</span>}
  </span>;
}
