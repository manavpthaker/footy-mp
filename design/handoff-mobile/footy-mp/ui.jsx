/* footy-mp — shared mobile UI chrome + fixture primitives.
   Composes the Quant Desk DS bundle (window.WC26VisualizerDesignSystem_b4eaf5). */

const DS = window.WC26VisualizerDesignSystem_b4eaf5;
const F = window.FMP;

/* ---------- tokens-in-JS shortcuts ---------- */
const mono = { fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" };
const eyebrowStyle = {
  fontSize: "var(--fs-2xs)", textTransform: "uppercase", letterSpacing: "var(--tracking-label)",
  color: "var(--text-faint)", fontWeight: "var(--fw-semibold)",
};

/* ---------- app header (root tabs) ---------- */
function AppHeader({ right = null }) {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 20,
      display: "flex", alignItems: "center", gap: 9,
      padding: "10px 16px 9px", background: "var(--grad-header)",
      borderBottom: "1px solid var(--border)",
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: "var(--radius-sm)", background: "var(--grad-gold)",
        display: "grid", placeItems: "center", color: "var(--text-on-gold)",
        fontWeight: 700, fontSize: 13, flex: "0 0 auto",
      }}>◆</div>
      <div style={{ fontWeight: 700, fontSize: "var(--fs-h2)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
        MPFC
      </div>
      <div style={{ flex: 1 }}></div>
      {right || (
        <div style={{ ...eyebrowStyle, ...mono }}>WED JUL 9</div>
      )}
    </header>
  );
}

/* ---------- pushed-screen header ---------- */
function ScreenHeader({ title, eyebrow, onBack, right = null }) {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 20,
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 12px 8px 6px", background: "var(--grad-header)",
      borderBottom: "1px solid var(--border)", minHeight: 46,
    }}>
      <button onClick={onBack} aria-label="Back" style={{
        background: "transparent", border: "none", color: "var(--accent-2)",
        fontSize: 22, lineHeight: 1, padding: "8px 10px", cursor: "pointer",
        fontFamily: "var(--font-mono)",
      }}>‹</button>
      <div style={{ minWidth: 0, flex: 1 }}>
        {eyebrow && <div style={eyebrowStyle}>{eyebrow}</div>}
        <div style={{
          fontWeight: 700, fontSize: "var(--fs-h2)", textTransform: "uppercase",
          letterSpacing: "0.04em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{title}</div>
      </div>
      {right}
    </header>
  );
}

/* ---------- bottom tab bar ---------- */
const TABS = [
  { id: "today", glyph: "◆", label: "Today" },
  { id: "matches", glyph: "⏱", label: "Matches" },
  { id: "tables", glyph: "≣", label: "Tables" },
  { id: "following", glyph: "★", label: "Following" },
];

function TabBar({ active, onSelect, showLabels = true }) {
  return (
    <nav style={{
      position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 30,
      display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
      background: "rgba(19,17,16,0.96)", backdropFilter: "blur(6px)",
      borderTop: "1px solid var(--border)", paddingBottom: 18,
    }}>
      {TABS.map(t => {
        const on = t.id === active;
        return (
          <button key={t.id} onClick={() => onSelect(t.id)} style={{
            background: "transparent", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            padding: "9px 0 6px", minHeight: 48,
            color: on ? "var(--accent)" : "var(--text-faint)",
            fontFamily: "var(--font-ui)",
          }}>
            <span style={{ fontSize: 17, lineHeight: 1, filter: on ? "none" : "grayscale(1)" }}>{t.glyph}</span>
            {showLabels && (
              <span style={{
                fontSize: "var(--fs-micro)", textTransform: "uppercase",
                letterSpacing: "var(--tracking-label)", fontWeight: on ? 700 : 600,
              }}>{t.label}</span>
            )}
            <span style={{
              width: 22, height: 2, borderRadius: 1, marginTop: 1,
              background: on ? "var(--accent)" : "transparent",
            }}></span>
          </button>
        );
      })}
    </nav>
  );
}

/* ---------- fixture readouts ---------- */
function MiniProb({ pred }) {
  const h = Math.round(pred.h * 100), d = Math.round(pred.d * 100), a = 100 - h - d;
  const fav = pred.h >= pred.a && pred.h >= pred.d ? ["H", h, "var(--accent-2)"]
    : pred.a >= pred.h && pred.a >= pred.d ? ["A", a, "var(--accent)"]
    : ["D", d, "var(--slate-300)"];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
      <div style={{ display: "flex", width: 56, height: 5, borderRadius: 2, overflow: "hidden", border: "1px solid var(--border-soft)" }}>
        <span style={{ width: `${h}%`, background: "var(--steel-500)" }}></span>
        <span style={{ width: `${d}%`, background: "var(--track)" }}></span>
        <span style={{ width: `${a}%`, background: "var(--ember-500)" }}></span>
      </div>
      <span style={{ ...mono, fontSize: "var(--fs-2xs)", color: fav[2], fontWeight: 700 }}>{fav[0]} {fav[1]}%</span>
    </div>
  );
}

function FavReadout({ pred }) {
  const h = Math.round(pred.h * 100), d = Math.round(pred.d * 100), a = 100 - h - d;
  const fav = pred.h >= pred.a && pred.h >= pred.d ? ["H", h, "var(--accent-2)"]
    : pred.a >= pred.h && pred.a >= pred.d ? ["A", a, "var(--accent)"]
    : ["D", d, "var(--slate-300)"];
  return <span style={{ ...mono, fontSize: "var(--fs-sm)", fontWeight: 700, color: fav[2] }}>{fav[0]} {fav[1]}%</span>;
}

function matchReadout(m, mode) {
  if (m.status === "final") {
    return (
      <div style={{ textAlign: "right" }}>
        <span style={{ ...mono, fontSize: "var(--fs-h2)", fontWeight: 700 }}>
          {m.hg}–{m.ag}
        </span>
        {m.pens && (
          <div style={{ ...mono, fontSize: "var(--fs-micro)", color: "var(--text-muted)" }}>
            {m.pens[0]}–{m.pens[1]} pens
          </div>
        )}
      </div>
    );
  }
  if (m.status === "live") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
        <span style={{ ...mono, fontSize: "var(--fs-h2)", fontWeight: 700, color: "var(--status-live)" }}>
          {m.hg}–{m.ag}
        </span>
        <span style={{ ...mono, fontSize: "var(--fs-micro)", color: "var(--status-live)", fontWeight: 700 }}>
          <span className="fmp-live-dot"></span> {m.minute}′
        </span>
      </div>
    );
  }
  if (!m.pred) return <span style={{ ...mono, fontSize: "var(--fs-xs)", color: "var(--text-faint)" }}>—</span>;
  return mode === "bar" ? <MiniProb pred={m.pred} /> : <FavReadout pred={m.pred} />;
}

/* ---------- one fixture line (DS MatchRow composed for mobile) ---------- */
function teamLabel(id) {
  const t = F.team(id);
  return t ? t.name : "TBD";
}

function FixtureItem({ m, onOpen, readout = "bar", showComp = true }) {
  const home = F.team(m.home), away = F.team(m.away);
  const followed = F.followedMatch(m);
  const comp = F.COMPS[m.comp];
  const dateEl = (
    <span>
      {m.status === "final" ? "FT" : m.status === "live"
        ? <span style={{ color: "var(--status-live)", fontWeight: 700 }}>LIVE</span>
        : <span>{F.fmtDate(m.date)}<br />{F.fmtTime(m.date)}</span>}
      {showComp && <><br /><span style={{ color: "var(--text-faint)" }}>{comp.code}</span></>}
    </span>
  );
  return (
    <DS.MatchRow
      date={dateEl}
      homeFlag={home && home.flag}
      home={<span>{teamLabel(m.home)}{F.isFollowedTeam(m.home) && <span style={{ color: "var(--follow)", marginLeft: 4, fontSize: "var(--fs-xs)" }}>★</span>}</span>}
      awayFlag={away && away.flag}
      away={<span>{teamLabel(m.away)}{F.isFollowedTeam(m.away) && <span style={{ color: "var(--follow)", marginLeft: 4, fontSize: "var(--fs-xs)" }}>★</span>}</span>}
      right={matchReadout(m, readout)}
      onClick={onOpen ? () => onOpen(m) : undefined}
      style={followed ? { boxShadow: "inset 3px 0 0 var(--follow)" } : {}}
      data-comment-anchor={`fixture-${m.id}`}
    />
  );
}

/* ---------- fixtures grouped by day ---------- */
function DayGroupedFixtures({ matches, onOpen, readout }) {
  const groups = [];
  matches.forEach(m => {
    const label = F.fmtDayLabel(m.date);
    let g = groups.find(x => x.label === label);
    if (!g) { g = { label, items: [] }; groups.push(g); }
    g.items.push(m);
  });
  return (
    <div>
      {groups.map(g => (
        <DS.FixtureGroup key={g.label} label={g.label}>
          {g.items.map(m => <FixtureItem key={m.id} m={m} onOpen={onOpen} readout={readout} />)}
        </DS.FixtureGroup>
      ))}
    </div>
  );
}

/* ---------- misc ---------- */
function EmptyState({ children }) {
  return (
    <div style={{
      border: "1px dashed var(--border)", borderRadius: "var(--radius-xl)",
      padding: "18px 14px", color: "var(--text-faint)", fontSize: "var(--fs-sm)",
      textAlign: "center",
    }}>{children}</div>
  );
}

function ChipRail({ children }) {
  return (
    <div className="fmp-chip-rail" style={{
      display: "flex", gap: 6, overflowX: "auto", padding: "2px 16px 4px",
      scrollbarWidth: "none",
    }}>{children}</div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      flex: "0 0 auto", cursor: "pointer",
      fontFamily: "var(--font-ui)", fontSize: "var(--fs-xs)", fontWeight: 600,
      padding: "7px 11px", borderRadius: "var(--radius-md)", lineHeight: 1,
      background: active ? "var(--ember-tint)" : "var(--surface-panel)",
      color: active ? "var(--accent)" : "var(--text-muted)",
      border: `1px solid ${active ? "var(--ember-600)" : "var(--border)"}`,
      whiteSpace: "nowrap",
    }}>{children}</button>
  );
}

function Segmented({ options, value, onChange }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: `repeat(${options.length}, 1fr)`,
      background: "var(--surface-tint)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)", padding: 2, gap: 2,
    }}>
      {options.map(o => {
        const on = o.value === value;
        return (
          <button key={o.value} onClick={() => onChange(o.value)} style={{
            border: "none", cursor: "pointer", padding: "7px 4px",
            borderRadius: "var(--radius-sm)", lineHeight: 1,
            fontFamily: "var(--font-ui)", fontSize: "var(--fs-xs)", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.06em",
            background: on ? "var(--surface-raised)" : "transparent",
            color: on ? "var(--accent)" : "var(--text-faint)",
            boxShadow: on ? "inset 0 0 0 1px var(--border)" : "none",
          }}>{o.label}</button>
        );
      })}
    </div>
  );
}

/* body padding wrapper */
function Pad({ children, style = {} }) {
  return <div style={{ padding: "0 16px", ...style }}>{children}</div>;
}

Object.assign(window, {
  AppHeader, ScreenHeader, TabBar, FixtureItem, DayGroupedFixtures,
  MiniProb, matchReadout, EmptyState, ChipRail, Chip, Segmented, Pad,
  fmpEyebrow: eyebrowStyle, fmpMono: mono,
});
