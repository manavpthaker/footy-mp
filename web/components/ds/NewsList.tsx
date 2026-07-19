import React from "react";
import type { NewsItem } from "@/lib/news";
import { timeAgo } from "@/lib/news";

/**
 * Headline list — external links, opens in a new tab. Server-renderable.
 * Compact: source + age eyebrow, then the headline.
 */
export function NewsList({ items }: { items: NewsItem[] }) {
  if (!items.length) return null;
  return (
    <div style={{
      background: "var(--surface-panel)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-xl)", overflow: "hidden",
    }}>
      {items.map((n, i) => {
        const age = timeAgo(n.publishedAt);
        return (
          <a key={n.url + i} href={n.url} target="_blank" rel="noopener noreferrer"
            style={{
              display: "block", padding: "10px 13px",
              borderTop: i ? "1px solid var(--border-soft)" : "none",
            }}>
            <div style={{
              fontSize: "var(--fs-2xs)", textTransform: "uppercase",
              letterSpacing: "var(--tracking-label)", color: "var(--text-faint)",
              fontWeight: "var(--fw-semibold)", marginBottom: 3,
            }}>
              {[n.source, age].filter(Boolean).join(" · ")}
            </div>
            <div style={{
              fontSize: "var(--fs-sm)", fontWeight: 600, lineHeight: 1.45,
              color: "var(--text-primary)",
            }}>
              {n.title}
              <span style={{ color: "var(--text-faint)", marginLeft: 5, fontSize: "var(--fs-xs)" }}>↗</span>
            </div>
          </a>
        );
      })}
    </div>
  );
}
