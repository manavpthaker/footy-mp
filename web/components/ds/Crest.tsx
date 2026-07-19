"use client";
import React, { useState } from "react";
import { flagFor, crestUrlFor, CrestTeam } from "@/lib/format";

/**
 * Team crest: renders the club badge image (crest_url, or ESPN's logo CDN via
 * espn_id) and degrades gracefully — national teams prefer their flag emoji,
 * anything without an image falls back to flagFor()'s emoji. Client component
 * only for the onError fallback.
 */
export function Crest({
  team, name, fifa, size = 24,
}: {
  team?: CrestTeam | null;
  name?: string | null;       // fallback when we only know the name
  fifa?: string | null;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const displayName = name ?? team?.name;
  const flag = flagFor(displayName, fifa);
  const url = crestUrlFor(team);
  // National sides read better as flags (and ESPN "crests" for them are
  // often plain flags at worse quality) — use the emoji when we have one.
  const preferFlag = !!team?.is_national && flag !== "⚽";

  if (!url || failed || preferFlag) {
    return (
      <span aria-hidden style={{
        fontSize: Math.round(size * 0.8), lineHeight: 1,
        display: "inline-block", width: size, textAlign: "center",
      }}>{flag}</span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      aria-hidden
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      style={{ objectFit: "contain", display: "inline-block", verticalAlign: "middle" }}
    />
  );
}
