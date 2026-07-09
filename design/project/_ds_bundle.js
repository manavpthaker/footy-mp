/* @ds-bundle: {"format":4,"namespace":"WC26VisualizerDesignSystem_b4eaf5","components":[{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"FollowButton","sourcePath":"components/core/FollowButton.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"SectionHeading","sourcePath":"components/core/SectionHeading.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"BarMeter","sourcePath":"components/data/BarMeter.jsx"},{"name":"FactorBar","sourcePath":"components/data/FactorBar.jsx"},{"name":"FormPills","sourcePath":"components/data/FormPills.jsx"},{"name":"ProbabilityBar","sourcePath":"components/data/ProbabilityBar.jsx"},{"name":"RatingRing","sourcePath":"components/data/RatingRing.jsx"},{"name":"ScorelineGrid","sourcePath":"components/data/ScorelineGrid.jsx"},{"name":"StatCard","sourcePath":"components/data/StatCard.jsx"},{"name":"CompetitionBadge","sourcePath":"components/football/CompetitionBadge.jsx"},{"name":"FixtureGroup","sourcePath":"components/football/FixtureGroup.jsx"},{"name":"GroupStandings","sourcePath":"components/football/GroupStandings.jsx"},{"name":"LeagueTable","sourcePath":"components/football/LeagueTable.jsx"},{"name":"MatchRow","sourcePath":"components/football/MatchRow.jsx"},{"name":"PlayerCard","sourcePath":"components/football/PlayerCard.jsx"},{"name":"PlayerStatRow","sourcePath":"components/football/PlayerStatRow.jsx"}],"sourceHashes":{"components/core/Button.jsx":"546921a5c3e4","components/core/FollowButton.jsx":"0b048f062d7e","components/core/IconButton.jsx":"43b36428420e","components/core/SectionHeading.jsx":"4e3793478b4f","components/core/Tag.jsx":"aec4c5399158","components/data/BarMeter.jsx":"6a1ce46c21b0","components/data/FactorBar.jsx":"23a31540edd6","components/data/FormPills.jsx":"d051c4208e8c","components/data/ProbabilityBar.jsx":"ad770e7aad4d","components/data/RatingRing.jsx":"66a80d9f08ae","components/data/ScorelineGrid.jsx":"dbe3687f0081","components/data/StatCard.jsx":"ad62fce577dc","components/football/CompetitionBadge.jsx":"bc31a98a553b","components/football/FixtureGroup.jsx":"16cb32ba45a9","components/football/GroupStandings.jsx":"b402626b5b17","components/football/LeagueTable.jsx":"be877ce194cf","components/football/MatchRow.jsx":"0e1cf53df43a","components/football/PlayerCard.jsx":"fc4a710de3b4","components/football/PlayerStatRow.jsx":"5d5d951caab4","ui_kits/visualizer/app.jsx":"5ca000986caa","ui_kits/visualizer/bracket.jsx":"f5001a3d4246","ui_kits/visualizer/data.js":"bcfb09d1434b","ui_kits/visualizer/kit.jsx":"c5c87d719429","ui_kits/visualizer/match.jsx":"ed4210479f97","ui_kits/visualizer/model.js":"dfc9d348cb8e"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.WC26VisualizerDesignSystem_b4eaf5 = window.WC26VisualizerDesignSystem_b4eaf5 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Button — the system's primary action control.
 * Variants map to the visualizer's CTAs: pitch-green primary ("Auto-fill by model"),
 * trophy gold ("champion" actions), secondary (panel + border), ghost (bare).
 */
function Button({
  variant = 'secondary',
  size = 'md',
  iconLeft = null,
  iconRight = null,
  disabled = false,
  children,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: {
      padding: '6px 11px',
      fontSize: 'var(--fs-xs)'
    },
    md: {
      padding: '8px 14px',
      fontSize: 'var(--fs-sm)'
    },
    lg: {
      padding: '11px 18px',
      fontSize: 'var(--fs-body)'
    }
  };
  const variants = {
    primary: {
      background: 'var(--grad-pitch)',
      color: 'var(--text-on-pitch)',
      border: '1px solid transparent',
      boxShadow: 'var(--shadow-accent)'
    },
    gold: {
      background: 'var(--grad-gold)',
      color: 'var(--text-on-gold)',
      border: '1px solid transparent'
    },
    secondary: {
      background: 'var(--surface-panel)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-muted)',
      border: '1px solid transparent'
    }
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    disabled: disabled,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '7px',
      fontFamily: 'var(--font-ui)',
      fontWeight: 'var(--fw-bold)',
      borderRadius: 'var(--radius-md)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      whiteSpace: 'nowrap',
      lineHeight: 1,
      transition: 'transform var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)',
      ...sizes[size],
      ...variants[variant],
      ...style
    },
    onMouseEnter: e => {
      if (disabled) return;
      if (variant === 'secondary' || variant === 'ghost') e.currentTarget.style.borderColor = 'var(--accent-2)';
      if (variant === 'secondary') e.currentTarget.style.color = 'var(--text-primary)';
    },
    onMouseLeave: e => {
      if (variant === 'secondary') e.currentTarget.style.borderColor = 'var(--border)';
      if (variant === 'ghost') e.currentTarget.style.borderColor = 'transparent';
    }
  }, rest), iconLeft && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      fontSize: '1.05em'
    }
  }, iconLeft), children, iconRight && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      fontSize: '1.05em'
    }
  }, iconRight));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/FollowButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * FollowButton — the personalization primitive: a gold-star toggle for
 * following a player, team, or league. Idle = hollow ☆ outline pill;
 * following = gold-tint fill with ★. `label` adds "Follow"/"Following"
 * text; omit it for the compact icon-only form in dense rows.
 */
function FollowButton({
  following = false,
  onToggle,
  label = true,
  style = {},
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", _extends({
    onClick: e => {
      e.stopPropagation();
      onToggle && onToggle(!following);
    },
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    "aria-pressed": following,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: label ? '5px 11px' : '5px 7px',
      borderRadius: 'var(--radius-pill)',
      cursor: 'pointer',
      fontFamily: 'var(--font-ui)',
      fontSize: 'var(--fs-xs)',
      fontWeight: 'var(--fw-bold)',
      lineHeight: 1,
      background: following ? 'var(--follow-tint)' : 'transparent',
      color: following ? 'var(--follow)' : hover ? 'var(--text-primary)' : 'var(--text-muted)',
      border: `1px solid ${following ? 'rgba(255,206,83,0.45)' : hover ? 'var(--accent-2)' : 'var(--border)'}`,
      transition: 'border-color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12px',
      lineHeight: 1
    }
  }, following ? '★' : '☆'), label && (following ? 'Following' : 'Follow'));
}
Object.assign(__ds_scope, { FollowButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/FollowButton.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * IconButton — square 34px control used in the header rail (sync ⟳, gear ⚙, search).
 * `active` gives the pitch-green spinning/engaged state.
 */
function IconButton({
  size = 34,
  active = false,
  title,
  children,
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    title: title,
    "aria-label": title,
    style: {
      width: size,
      height: size,
      flex: '0 0 auto',
      display: 'grid',
      placeItems: 'center',
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface-panel)',
      border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
      color: active ? 'var(--accent)' : 'var(--text-muted)',
      fontSize: '16px',
      cursor: 'pointer',
      transition: 'color var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)',
      ...style
    },
    onMouseEnter: e => {
      e.currentTarget.style.color = 'var(--text-primary)';
      e.currentTarget.style.borderColor = 'var(--accent-2)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.color = active ? 'var(--accent)' : 'var(--text-muted)';
      e.currentTarget.style.borderColor = active ? 'var(--accent)' : 'var(--border)';
    }
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/SectionHeading.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * SectionHeading — the uppercase divider with a pitch-green tick that opens
 * each analytical block ("Pre-match forecast", "Full squad", …).
 * `tick` color can change to mark a different accent (sky for forecasts, etc).
 */
function SectionHeading({
  children,
  tick = 'var(--accent)',
  trailing = null,
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '9px',
      margin: '22px 0 11px',
      fontFamily: 'var(--font-ui)',
      fontSize: 'var(--fs-sm)',
      fontWeight: 'var(--fw-bold)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wide)',
      color: 'var(--text-muted)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: '4px',
      height: '14px',
      borderRadius: '3px',
      background: tick,
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, children), trailing && /*#__PURE__*/React.createElement("span", {
    style: {
      flex: '0 0 auto',
      textTransform: 'none',
      letterSpacing: 0
    }
  }, trailing));
}
Object.assign(__ds_scope, { SectionHeading });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SectionHeading.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Tag — small status chip carrying tournament meaning.
 * tones:
 *   qualified  → pitch-green "Q"
 *   out        → red "OUT"
 *   pill       → neutral panel pill (e.g. "1st in Group A")
 *   accent     → sky-blue filled chip (the rounded "tag2" style)
 *   gold       → champion / key
 */
function Tag({
  tone = 'pill',
  children,
  style = {},
  ...rest
}) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontFamily: 'var(--font-ui)',
    fontWeight: 'var(--fw-bold)',
    lineHeight: 1,
    verticalAlign: 'middle',
    whiteSpace: 'nowrap'
  };
  const tones = {
    qualified: {
      fontSize: 'var(--fs-micro)',
      padding: '2px 6px',
      borderRadius: 'var(--radius-xs)',
      background: 'var(--pitch-tint)',
      color: 'var(--accent)',
      letterSpacing: '0.03em'
    },
    out: {
      fontSize: 'var(--fs-micro)',
      padding: '2px 6px',
      borderRadius: 'var(--radius-xs)',
      background: 'var(--red-tint)',
      color: 'var(--status-out)',
      letterSpacing: '0.03em'
    },
    pill: {
      fontSize: 'var(--fs-micro)',
      padding: '2px 7px',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--surface-raised)',
      color: 'var(--text-muted)'
    },
    accent: {
      fontSize: 'var(--fs-sm)',
      padding: '6px 12px',
      borderRadius: 'var(--radius-pill)',
      background: '#241f1c',
      color: 'var(--accent)',
      border: '1px solid #3a3129',
      fontWeight: 'var(--fw-semibold)'
    },
    gold: {
      fontSize: 'var(--fs-micro)',
      padding: '2px 7px',
      borderRadius: 'var(--radius-xs)',
      background: 'var(--follow-tint)',
      color: 'var(--gold)',
      letterSpacing: '0.03em'
    }
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      ...base,
      ...tones[tone],
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/data/BarMeter.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * BarMeter — a thin horizontal magnitude bar (Monte-Carlo title odds, generic
 * proportions). Defaults to the pitch→sky gradient fill of the odds table.
 */
function BarMeter({
  value,
  max = 100,
  height = 7,
  fill = 'linear-gradient(90deg, var(--accent), var(--accent-2))',
  track = 'var(--track)',
  style = {},
  ...rest
}) {
  const w = Math.max(0, Math.min(100, value / max * 100));
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      height,
      borderRadius: '4px',
      background: track,
      overflow: 'hidden',
      minWidth: '60px',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'block',
      height: '100%',
      width: `${w}%`,
      background: fill,
      transition: 'width var(--dur-bar) var(--ease-out)'
    }
  }));
}
Object.assign(__ds_scope, { BarMeter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/BarMeter.jsx", error: String((e && e.message) || e) }); }

// components/data/FactorBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * FactorBar — one driver of the composite rating, shown as a signed z-score.
 * The bar grows from a center midline: right = above field average (pitch-green),
 * left = below (red), near-zero = neutral slate. This is the "why" behind a rating.
 */
function FactorBar({
  label,
  z,
  style = {},
  ...rest
}) {
  const w = Math.max(4, Math.min(100, 50 + 18 * z));
  const color = z >= 0.15 ? 'var(--accent)' : z <= -0.15 ? 'var(--status-out)' : '#8a7d6d';
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'grid',
      gridTemplateColumns: '74px 1fr 42px',
      gap: '9px',
      alignItems: 'center',
      marginBottom: '6px',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)',
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      fontSize: 'var(--fs-micro)',
      fontWeight: 'var(--fw-bold)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      height: '9px',
      borderRadius: '5px',
      background: 'var(--track)',
      overflow: 'hidden',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: '50%',
      top: '-2px',
      width: '1px',
      height: '13px',
      background: 'var(--ink-700)',
      zIndex: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      height: '100%',
      borderRadius: '5px',
      width: `${w}%`,
      background: color,
      transition: 'width var(--dur-bar) var(--ease-out)'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      textAlign: 'right',
      fontFamily: 'var(--font-mono)',
      fontVariantNumeric: 'tabular-nums',
      color: 'var(--text-primary)',
      fontWeight: 'var(--fw-bold)',
      fontSize: 'var(--fs-xs)'
    }
  }, z > 0 ? '+' : '', z.toFixed(2)));
}
Object.assign(__ds_scope, { FactorBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/FactorBar.jsx", error: String((e && e.message) || e) }); }

// components/data/FormPills.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONE = {
  W: {
    background: 'var(--status-win)',
    color: 'var(--pitch-900)'
  },
  D: {
    background: 'var(--status-draw)',
    color: 'var(--slate-300)'
  },
  L: {
    background: 'var(--status-loss)',
    color: '#fff'
  }
};

/**
 * FormPills — the W/D/L streak row. Pass a string ("WWDLW") or an array of
 * results; optionally pass `titles` (parallel array) for per-pill tooltips.
 */
function FormPills({
  results,
  size = 22,
  titles = [],
  style = {},
  ...rest
}) {
  const list = Array.isArray(results) ? results : String(results).split('');
  if (!list.length) return /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-faint)'
    }
  }, "\u2014");
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      gap: '5px',
      ...style
    }
  }, rest), list.map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    title: titles[i] || '',
    style: {
      width: size,
      height: size,
      borderRadius: 'var(--radius-sm)',
      display: 'grid',
      placeItems: 'center',
      fontSize: `${Math.round(size * 0.5)}px`,
      fontWeight: 'var(--fw-extrabold)',
      fontFamily: 'var(--font-ui)',
      ...(TONE[r] || TONE.D)
    }
  }, r)));
}
Object.assign(__ds_scope, { FormPills });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/FormPills.jsx", error: String((e && e.message) || e) }); }

// components/data/ProbabilityBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * ProbabilityBar — the win/draw/loss forecast as a single 3-segment bar.
 * Home = sky-blue, Draw = slate, Away = pitch-green. Percentages render in mono
 * inside each segment; optional labels sit beneath.
 */
function ProbabilityBar({
  home,
  draw,
  away,
  homeLabel = null,
  awayLabel = null,
  height = 34,
  style = {},
  ...rest
}) {
  const seg = (w, bg, color, text, show = true) => /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${w}%`,
      minWidth: '34px',
      display: 'grid',
      placeItems: 'center',
      background: bg,
      color,
      transition: 'width var(--dur-bar) var(--ease-out)',
      fontFamily: 'var(--font-mono)',
      fontVariantNumeric: 'tabular-nums',
      fontWeight: 'var(--fw-bold)',
      fontSize: 'var(--fs-sm)'
    }
  }, show ? text : '');
  return /*#__PURE__*/React.createElement("div", _extends({
    style: style
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      height,
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      display: 'flex',
      border: '1px solid var(--border)'
    }
  }, seg(home, 'var(--grad-sky)', 'var(--text-on-sky)', `${home}%`), seg(draw, '#2e2722', '#d6cabb', `${draw}%`, draw > 7), seg(away, 'var(--grad-pitch)', 'var(--text-on-pitch)', `${away}%`)), (homeLabel || awayLabel) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 'var(--fs-xs)',
      color: 'var(--text-faint)',
      marginTop: '6px'
    }
  }, /*#__PURE__*/React.createElement("span", null, homeLabel), /*#__PURE__*/React.createElement("span", null, "Draw"), /*#__PURE__*/React.createElement("span", null, awayLabel)));
}
Object.assign(__ds_scope, { ProbabilityBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ProbabilityBar.jsx", error: String((e && e.message) || e) }); }

// components/data/RatingRing.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * RatingRing — the conic-gradient strength dial (0–99 composite rating).
 * Fills pitch-green up to `value`% of the circle with the figure in the hub.
 */
function RatingRing({
  value,
  max = 99,
  size = 64,
  color = 'var(--accent)',
  label = null,
  style = {},
  ...rest
}) {
  const pct = Math.max(0, Math.min(100, value / max * 100));
  const hub = Math.round(size * 0.78);
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '5px',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      width: size,
      height: size,
      borderRadius: '50%',
      display: 'grid',
      placeItems: 'center',
      flex: '0 0 auto',
      background: `conic-gradient(${color} ${pct}%, var(--track) 0)`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: hub,
      height: hub,
      borderRadius: '50%',
      background: 'var(--surface-panel)',
      display: 'grid',
      placeItems: 'center',
      fontFamily: 'var(--font-mono)',
      fontVariantNumeric: 'tabular-nums',
      fontSize: `${Math.round(size * 0.3)}px`,
      fontWeight: 'var(--fw-bold)',
      color: 'var(--text-primary)'
    }
  }, value)), label && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-micro)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-faint)',
      fontWeight: 'var(--fw-bold)'
    }
  }, label));
}
Object.assign(__ds_scope, { RatingRing });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/RatingRing.jsx", error: String((e && e.message) || e) }); }

// components/data/ScorelineGrid.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * ScorelineGrid — the Poisson scoreline-distribution matrix: home goals down,
 * away goals across, each cell tinted pitch-green by probability. The modal
 * scoreline gets a solid fill + border. Probabilities in [0,1]; cells render
 * as whole-number percentages.
 */
function ScorelineGrid({
  home = 'Home',
  away = 'Away',
  matrix,
  max = null,
  style = {},
  ...rest
}) {
  const peak = max != null ? max : Math.max(...matrix.flat());
  const label = {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--fs-micro)',
    color: 'var(--text-faint)',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 'var(--fw-semibold)'
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      fontFamily: 'var(--font-ui)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '6px',
      fontSize: 'var(--fs-micro)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-faint)',
      fontWeight: 'var(--fw-bold)'
    }
  }, /*#__PURE__*/React.createElement("span", null, home, " \u2193"), /*#__PURE__*/React.createElement("span", null, away, " \u2192")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: `18px repeat(${matrix[0].length}, 1fr)`,
      gap: '3px'
    }
  }, /*#__PURE__*/React.createElement("span", null), matrix[0].map((_, c) => /*#__PURE__*/React.createElement("span", {
    key: c,
    style: label
  }, c)), matrix.map((row, r) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: r
  }, /*#__PURE__*/React.createElement("span", {
    style: label
  }, r), row.map((p, c) => {
    const isPeak = p === peak;
    const t = peak > 0 ? p / peak : 0;
    return /*#__PURE__*/React.createElement("div", {
      key: c,
      style: {
        padding: '5px 2px',
        textAlign: 'center',
        borderRadius: 'var(--radius-xs)',
        fontFamily: 'var(--font-mono)',
        fontVariantNumeric: 'tabular-nums',
        fontSize: 'var(--fs-2xs)',
        fontWeight: isPeak ? 'var(--fw-extrabold)' : 'var(--fw-medium)',
        background: isPeak ? 'var(--grad-pitch)' : `rgba(255, 157, 46, ${(t * 0.32).toFixed(3)})`,
        color: isPeak ? 'var(--text-on-pitch)' : t > 0.45 ? 'var(--text-primary)' : 'var(--text-faint)',
        border: `1px solid ${isPeak ? 'var(--accent)' : 'var(--border-soft)'}`
      }
    }, Math.round(p * 100));
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '6px',
      fontSize: 'var(--fs-micro)',
      color: 'var(--text-faint)',
      fontFamily: 'var(--font-ui)'
    }
  }, "% chance of each scoreline \xB7 Poisson on expected goals"));
}
Object.assign(__ds_scope, { ScorelineGrid });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ScorelineGrid.jsx", error: String((e && e.message) || e) }); }

// components/data/StatCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * StatCard — a labelled metric tile (FIFA rank, points, goals…).
 * The value uses the mono/tabular voice; `unit` is a small dim suffix.
 */
function StatCard({
  label,
  value,
  unit = null,
  accent = 'var(--text-primary)',
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: 'var(--surface-panel)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)',
      padding: '12px 14px',
      transition: 'transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
      ...style
    },
    onMouseEnter: e => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = 'var(--shadow-lift)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.boxShadow = 'none';
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-2xs)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-faint)',
      fontWeight: 'var(--fw-semibold)',
      lineHeight: 1.25
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontVariantNumeric: 'tabular-nums',
      fontSize: 'var(--fs-stat)',
      fontWeight: 'var(--fw-bold)',
      marginTop: '3px',
      color: accent
    }
  }, value, unit != null && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-sm)',
      color: 'var(--text-muted)',
      fontWeight: 'var(--fw-semibold)'
    }
  }, unit)));
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StatCard.jsx", error: String((e && e.message) || e) }); }

// components/football/CompetitionBadge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const marks = {
  pitch: {
    bg: 'var(--grad-pitch)',
    ink: 'var(--text-on-pitch)'
  },
  sky: {
    bg: 'var(--grad-sky)',
    ink: 'var(--text-on-sky)'
  },
  gold: {
    bg: 'var(--grad-gold)',
    ink: 'var(--text-on-gold)'
  },
  neutral: {
    bg: 'var(--surface-raised)',
    ink: 'var(--text-muted)'
  }
};

/**
 * CompetitionBadge — identifies which competition a fixture/table belongs to:
 * a lettermark square (2–3 char code) + optional full name. Tones map to the
 * accent gradients — gold for cups/UCL, sky for leagues, pitch for
 * international, neutral for everything else.
 */
function CompetitionBadge({
  code,
  name,
  tone = 'neutral',
  size = 'sm',
  style = {},
  ...rest
}) {
  const m = marks[tone] || marks.neutral;
  const box = size === 'md' ? 22 : 17;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      fontFamily: 'var(--font-ui)',
      whiteSpace: 'nowrap',
      verticalAlign: 'middle',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: `${box}px`,
      height: `${box}px`,
      borderRadius: 'var(--radius-xs)',
      background: m.bg,
      color: m.ink,
      display: 'inline-grid',
      placeItems: 'center',
      fontSize: size === 'md' ? 'var(--fs-2xs)' : '8px',
      fontWeight: 'var(--fw-extrabold)',
      letterSpacing: '0.02em',
      fontFamily: 'var(--font-display)',
      flex: '0 0 auto'
    }
  }, code), name && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: size === 'md' ? 'var(--fs-sm)' : 'var(--fs-xs)',
      color: 'var(--text-muted)',
      fontWeight: 'var(--fw-semibold)'
    }
  }, name));
}
Object.assign(__ds_scope, { CompetitionBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/football/CompetitionBadge.jsx", error: String((e && e.message) || e) }); }

// components/football/FixtureGroup.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * FixtureGroup — grouping shell for fixture rails: an uppercase label
 * (a date, "LIVE", "TODAY") with an optional right-side slot (usually a
 * CompetitionBadge), over its MatchRow children. Composes; renders nothing
 * itself but the header.
 */
function FixtureGroup({
  label,
  right = null,
  children,
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      marginBottom: '14px',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '10px',
      padding: '0 2px',
      marginBottom: '7px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-2xs)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-faint)',
      fontWeight: 'var(--fw-bold)',
      fontFamily: 'var(--font-ui)'
    }
  }, label), right), children);
}
Object.assign(__ds_scope, { FixtureGroup });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/football/FixtureGroup.jsx", error: String((e && e.message) || e) }); }

// components/football/GroupStandings.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const railFor = (i, status) => status === 'eliminated' ? 'var(--status-out)' : i === 0 ? 'var(--status-through)' : i === 1 ? 'var(--status-runner)' : i === 2 ? 'var(--status-playoff)' : 'transparent';

/**
 * GroupStandings — the signature group card: a letter badge header over a dense
 * standings table. Rows carry the qualification rail (1st green / 2nd sky /
 * 3rd amber / out red), a Q/OUT tag, the FIFA rank subline, and tabular figures.
 * Pass teams ALREADY ordered; GD is derived. onSelect(team) fires on row click.
 */
function GroupStandings({
  group,
  teams,
  onSelect,
  style = {},
  ...rest
}) {
  const th = {
    fontSize: 'var(--fs-micro)',
    color: 'var(--text-faint)',
    fontWeight: 'var(--fw-semibold)',
    textAlign: 'center',
    padding: '5px 3px',
    textTransform: 'uppercase'
  };
  const td = {
    padding: '6px 3px',
    textAlign: 'center',
    borderTop: '1px solid var(--border-soft)',
    fontFamily: 'var(--font-mono)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: 'var(--fs-sm)'
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: 'var(--surface-panel)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)',
      marginBottom: '12px',
      overflow: 'hidden',
      transition: 'transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '9px 13px',
      fontSize: 'var(--fs-sm)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      fontWeight: 'var(--fw-bold)',
      fontFamily: 'var(--font-ui)',
      background: 'var(--surface-raised)',
      borderBottom: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '20px',
      height: '20px',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--grad-sky)',
      color: 'var(--text-on-sky)',
      display: 'grid',
      placeItems: 'center',
      fontWeight: 'var(--fw-extrabold)',
      fontSize: 'var(--fs-xs)'
    }
  }, group), "Group ", group), /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      textAlign: 'left',
      paddingLeft: '13px'
    }
  }, "Team"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "P"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "W"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "D"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "L"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "GF:GA"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "GD"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Pts"))), /*#__PURE__*/React.createElement("tbody", null, teams.map((r, i) => {
    const gd = r.GF - r.GA;
    const rail = railFor(i, r.status);
    const dim = r.status === 'eliminated';
    return /*#__PURE__*/React.createElement("tr", {
      key: r.team,
      onClick: () => onSelect && onSelect(r.team),
      style: {
        cursor: onSelect ? 'pointer' : 'default',
        boxShadow: rail !== 'transparent' ? `inset 3px 0 0 ${rail}` : 'none',
        opacity: dim ? 0.62 : 1,
        transition: 'background var(--dur-fast) var(--ease-out)'
      },
      onMouseEnter: e => {
        if (onSelect) e.currentTarget.style.background = 'var(--surface-hover)';
      },
      onMouseLeave: e => {
        e.currentTarget.style.background = 'transparent';
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        fontFamily: 'var(--font-ui)',
        textAlign: 'left',
        paddingLeft: '9px',
        fontWeight: 'var(--fw-semibold)',
        whiteSpace: 'nowrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-block',
        width: '15px',
        color: 'var(--text-faint)',
        fontSize: 'var(--fs-2xs)',
        fontFamily: 'var(--font-mono)'
      }
    }, i + 1), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-block',
        width: '20px',
        textAlign: 'center',
        marginRight: '6px',
        fontSize: '14px'
      }
    }, r.flag || '⚽'), r.team, r.status === 'qualified' && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 'var(--fs-micro)',
        padding: '1px 5px',
        borderRadius: 'var(--radius-xs)',
        marginLeft: '5px',
        fontWeight: 'var(--fw-bold)',
        background: 'var(--pitch-tint)',
        color: 'var(--accent)'
      }
    }, "Q"), r.status === 'eliminated' && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 'var(--fs-micro)',
        padding: '1px 5px',
        borderRadius: 'var(--radius-xs)',
        marginLeft: '5px',
        fontWeight: 'var(--fw-bold)',
        background: 'var(--red-tint)',
        color: 'var(--status-out)'
      }
    }, "OUT"), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 'var(--fs-micro)',
        color: 'var(--text-faint)',
        marginLeft: '21px',
        fontFamily: 'var(--font-mono)'
      }
    }, "FIFA #", r.rank)), /*#__PURE__*/React.createElement("td", {
      style: td
    }, r.P), /*#__PURE__*/React.createElement("td", {
      style: td
    }, r.W), /*#__PURE__*/React.createElement("td", {
      style: td
    }, r.D), /*#__PURE__*/React.createElement("td", {
      style: td
    }, r.L), /*#__PURE__*/React.createElement("td", {
      style: td
    }, r.GF, ":", r.GA), /*#__PURE__*/React.createElement("td", {
      style: td
    }, gd > 0 ? '+' : '', gd), /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        fontWeight: 'var(--fw-extrabold)',
        color: 'var(--text-primary)'
      }
    }, r.Pts));
  }))));
}
Object.assign(__ds_scope, { GroupStandings });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/football/GroupStandings.jsx", error: String((e && e.message) || e) }); }

// components/football/LeagueTable.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const zoneColor = zone => zone === 'ucl' ? 'var(--zone-ucl)' : zone === 'uel' ? 'var(--zone-uel)' : zone === 'conf' ? 'var(--zone-conf)' : zone === 'releg' ? 'var(--zone-releg)' : 'transparent';
const formColor = r => r === 'W' ? 'var(--status-win)' : r === 'D' ? 'var(--slate-300)' : 'var(--status-loss)';

/**
 * LeagueTable — full-season standings for a league. Extends the GroupStandings
 * anatomy to 18–20 rows: the 3px inset rail now marks LEAGUE ZONES
 * (ucl green / uel sky / conf amber / releg red), rows carry an optional
 * last-5 form string, and followed teams get a gold ★. Pass rows ordered.
 */
function LeagueTable({
  rows,
  onSelect,
  showForm = true,
  style = {},
  ...rest
}) {
  const th = {
    fontSize: 'var(--fs-micro)',
    color: 'var(--text-faint)',
    fontWeight: 'var(--fw-semibold)',
    textAlign: 'center',
    padding: '5px 3px',
    textTransform: 'uppercase'
  };
  const td = {
    padding: '6px 3px',
    textAlign: 'center',
    borderTop: '1px solid var(--border-soft)',
    fontFamily: 'var(--font-mono)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: 'var(--fs-sm)'
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: 'var(--surface-panel)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      textAlign: 'left',
      paddingLeft: '13px'
    }
  }, "Team"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "P"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "W"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "D"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "L"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "GD"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      minWidth: '30px'
    }
  }, "Pts"), showForm && /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      minWidth: '58px'
    }
  }, "Form"))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => {
    const rail = zoneColor(r.zone);
    return /*#__PURE__*/React.createElement("tr", {
      key: r.team,
      onClick: () => onSelect && onSelect(r.team),
      style: {
        cursor: onSelect ? 'pointer' : 'default',
        boxShadow: rail !== 'transparent' ? `inset 3px 0 0 ${rail}` : 'none',
        transition: 'background var(--dur-fast) var(--ease-out)'
      },
      onMouseEnter: e => {
        if (onSelect) e.currentTarget.style.background = 'var(--surface-hover)';
      },
      onMouseLeave: e => {
        e.currentTarget.style.background = 'transparent';
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        fontFamily: 'var(--font-ui)',
        textAlign: 'left',
        paddingLeft: '9px',
        fontWeight: 'var(--fw-semibold)',
        whiteSpace: 'nowrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-block',
        width: '19px',
        color: 'var(--text-faint)',
        fontSize: 'var(--fs-2xs)',
        fontFamily: 'var(--font-mono)'
      }
    }, r.pos != null ? r.pos : i + 1), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-block',
        width: '20px',
        textAlign: 'center',
        marginRight: '6px',
        fontSize: '14px'
      }
    }, r.flag || '⚽'), r.team, r.followed && /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: '5px',
        color: 'var(--follow)',
        fontSize: 'var(--fs-xs)'
      }
    }, "\u2605")), /*#__PURE__*/React.createElement("td", {
      style: td
    }, r.P), /*#__PURE__*/React.createElement("td", {
      style: td
    }, r.W), /*#__PURE__*/React.createElement("td", {
      style: td
    }, r.D), /*#__PURE__*/React.createElement("td", {
      style: td
    }, r.L), /*#__PURE__*/React.createElement("td", {
      style: td
    }, r.GD > 0 ? '+' : '', r.GD), /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        fontWeight: 'var(--fw-extrabold)',
        color: 'var(--text-primary)'
      }
    }, r.Pts), showForm && /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        letterSpacing: '0.14em',
        fontSize: 'var(--fs-2xs)',
        fontWeight: 'var(--fw-bold)'
      }
    }, (r.form || []).map((f, j) => /*#__PURE__*/React.createElement("span", {
      key: j,
      style: {
        color: formColor(f)
      }
    }, f))));
  }))));
}
Object.assign(__ds_scope, { LeagueTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/football/LeagueTable.jsx", error: String((e && e.message) || e) }); }

// components/football/MatchRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * MatchRow — a tappable fixture / result line. Date on the left, the matchup in
 * the middle, and a flexible `right` slot for the readout: a score, a W/D/L pill,
 * a "54% win" favorite, a live badge, or a "PREVIEW →" affordance.
 */
function MatchRow({
  date,
  homeFlag,
  home,
  awayFlag,
  away,
  right = null,
  onClick,
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    onClick: onClick,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      background: 'var(--surface-panel)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '9px 12px',
      marginBottom: '7px',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out)',
      ...style
    },
    onMouseEnter: e => {
      if (onClick) {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.borderColor = 'var(--accent-2)';
        e.currentTarget.style.background = 'var(--surface-hover)';
      }
    },
    onMouseLeave: e => {
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.borderColor = 'var(--border)';
      e.currentTarget.style.background = 'var(--surface-panel)';
    }
  }, rest), date != null && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-2xs)',
      color: 'var(--text-faint)',
      width: '44px',
      flex: '0 0 auto',
      lineHeight: 1.25,
      fontFamily: 'var(--font-mono)'
    }
  }, date), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      fontWeight: 'var(--fw-semibold)',
      fontSize: 'var(--fs-sm)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      marginRight: '5px'
    }
  }, homeFlag), home, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-faint)',
      fontWeight: 'var(--fw-regular)',
      margin: '0 6px'
    }
  }, "v"), away, /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: '5px'
    }
  }, awayFlag)), right && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '2px',
      flex: '0 0 auto'
    }
  }, right));
}
Object.assign(__ds_scope, { MatchRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/football/MatchRow.jsx", error: String((e && e.message) || e) }); }

// components/football/PlayerCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * PlayerCard — squad member tile. The lead box shows a figure (age or shirt #),
 * then name + club, with caps on the right. `isKey` marks a star player
 * (green border, pitch-green lead box, ★ badge).
 */
function PlayerCard({
  lead,
  name,
  club,
  caps,
  isKey = false,
  onClick,
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    onClick: onClick,
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: '9px',
      background: isKey ? 'linear-gradient(135deg, #241a0c, var(--surface-panel))' : 'var(--surface-panel)',
      border: `1px solid ${isKey ? '#4a3a20' : 'var(--border)'}`,
      borderRadius: 'var(--radius-lg)',
      padding: '9px 11px',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)',
      ...style
    },
    onMouseEnter: e => {
      if (onClick) {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.borderColor = isKey ? 'var(--accent)' : 'var(--accent-2)';
      }
    },
    onMouseLeave: e => {
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.borderColor = isKey ? '#4a3a20' : 'var(--border)';
    }
  }, rest), isKey && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '-6px',
      right: '-6px',
      fontSize: '13px'
    }
  }, "\u2B50"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '26px',
      height: '26px',
      borderRadius: 'var(--radius-sm)',
      display: 'grid',
      placeItems: 'center',
      flex: '0 0 auto',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-2xs)',
      fontWeight: 'var(--fw-extrabold)',
      background: isKey ? 'var(--accent)' : 'var(--surface-raised)',
      color: isKey ? 'var(--pitch-900)' : 'var(--text-muted)'
    }
  }, lead), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 'var(--fw-bold)',
      fontSize: 'var(--fs-sm)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-xs)',
      color: 'var(--text-faint)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, club)), caps != null && /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      textAlign: 'right',
      flex: '0 0 auto',
      fontFamily: 'var(--font-mono)',
      fontVariantNumeric: 'tabular-nums',
      fontSize: 'var(--fs-xs)',
      color: 'var(--text-muted)'
    }
  }, caps, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-micro)'
    }
  }, " caps")));
}
Object.assign(__ds_scope, { PlayerCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/football/PlayerCard.jsx", error: String((e && e.message) || e) }); }

// components/football/PlayerStatRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * PlayerStatRow — a player line for leaderboards, followed-player modules,
 * and squad stat lists: rank, name + meta (club · pos), then up to three
 * mono figures with micro-labels. Gold ★ marks a followed player.
 */
function PlayerStatRow({
  rank,
  flag,
  name,
  meta,
  figures = [],
  followed = false,
  onClick,
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    onClick: onClick,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '9px',
      background: 'var(--surface-panel)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '8px 11px',
      marginBottom: '6px',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)',
      ...style
    },
    onMouseEnter: e => {
      if (onClick) {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.borderColor = 'var(--accent-2)';
      }
    },
    onMouseLeave: e => {
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.borderColor = 'var(--border)';
    }
  }, rest), rank != null && /*#__PURE__*/React.createElement("span", {
    style: {
      width: '18px',
      flex: '0 0 auto',
      textAlign: 'right',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-2xs)',
      color: 'var(--text-faint)'
    }
  }, rank), flag && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '15px',
      flex: '0 0 auto'
    }
  }, flag), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 'var(--fw-bold)',
      fontSize: 'var(--fs-sm)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, name, followed && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: '5px',
      color: 'var(--follow)',
      fontSize: 'var(--fs-xs)'
    }
  }, "\u2605")), meta && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-xs)',
      color: 'var(--text-faint)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, meta)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '14px',
      flex: '0 0 auto'
    }
  }, figures.map((f, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      textAlign: 'right',
      minWidth: '30px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontVariantNumeric: 'tabular-nums',
      fontSize: 'var(--fs-h2)',
      fontWeight: 'var(--fw-extrabold)',
      color: f.accent ? 'var(--accent)' : 'var(--text-primary)'
    }
  }, f.value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-micro)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-faint)',
      fontWeight: 'var(--fw-semibold)'
    }
  }, f.label)))));
}
Object.assign(__ds_scope, { PlayerStatRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/football/PlayerStatRow.jsx", error: String((e && e.message) || e) }); }

// ui_kits/visualizer/app.jsx
try { (() => {
/* WC26 Visualizer UI kit — App shell, tab routing, search. */
const DSa = window.WC26VisualizerDesignSystem_b4eaf5;
const {
  IconButton: IBtn,
  MatchRow: MRow
} = DSa;
const Da = window.WCDATA,
  Ma = window.WCMODEL;

/* ---------- Matches browser ---------- */
function MatchesView({
  onMatch
}) {
  const recent = [...Da.results].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12);
  const upcoming = [...Da.fixtures].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 12);
  const Col = ({
    title,
    items,
    kind
  }) => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-xs)',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: 'var(--text-faint)',
      margin: '0 4px 8px',
      fontWeight: 'var(--fw-bold)'
    }
  }, title), items.map((m, i) => {
    const right = kind === 'result' ? /*#__PURE__*/React.createElement("b", {
      style: {
        fontFamily: 'var(--font-mono)'
      }
    }, m.hs, "\u2013", m.as) : /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--accent-2)',
        fontWeight: 700,
        fontSize: 'var(--fs-2xs)'
      }
    }, "PREVIEW \u2192");
    return /*#__PURE__*/React.createElement(MRow, {
      key: i,
      date: window.fmtDate(m.date),
      homeFlag: window.flag(m.home),
      home: window.shrt(m.home),
      awayFlag: window.flag(m.away),
      away: window.shrt(m.away),
      right: right,
      onClick: () => onMatch(m.home, m.away)
    });
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
      gap: '22px',
      maxWidth: '1100px'
    }
  }, /*#__PURE__*/React.createElement(Col, {
    title: "Recent results",
    items: recent,
    kind: "result"
  }), /*#__PURE__*/React.createElement(Col, {
    title: "\u23F1 Upcoming fixtures",
    items: upcoming,
    kind: "fixture"
  }));
}
function App() {
  const [tab, setTab] = React.useState('groups');
  const [sel, setSel] = React.useState(null);
  const onTeam = team => {
    setSel({
      type: 'team',
      team
    });
    setTab('groups');
    window.scrollDetailTop && window.scrollDetailTop();
  };
  const onMatch = (home, away) => {
    setSel({
      type: 'match',
      home,
      away
    });
    setTab('groups');
  };
  const search = q => {
    q = q.trim().toLowerCase();
    if (!q) return;
    let tt = Object.keys(Ma.teamRow).find(t => t.toLowerCase().includes(q));
    if (!tt) for (const t of Object.keys(Da.squads)) {
      if (Da.squads[t].p.some(p => p[0].toLowerCase().includes(q))) {
        tt = t;
        break;
      }
    }
    if (tt) onTeam(tt);
  };
  const Tab = ({
    id,
    children
  }) => /*#__PURE__*/React.createElement("button", {
    onClick: () => setTab(id),
    style: {
      padding: '7px 16px',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      fontWeight: 'var(--fw-semibold)',
      fontSize: 'var(--fs-sm)',
      border: 'none',
      fontFamily: 'var(--font-ui)',
      transition: 'all var(--dur-base) var(--ease-out)',
      background: tab === id ? 'var(--grad-pitch)' : 'transparent',
      color: tab === id ? 'var(--text-on-pitch)' : 'var(--text-muted)',
      boxShadow: tab === id ? 'var(--shadow-accent)' : 'none'
    }
  }, children);
  const detail = !sel ? /*#__PURE__*/React.createElement(window.EmptyDetail, null) : sel.type === 'team' ? /*#__PURE__*/React.createElement(window.TeamDetail, {
    team: sel.team,
    onTeam: onTeam,
    onMatch: onMatch
  }) : /*#__PURE__*/React.createElement(window.MatchPreview, {
    home: sel.home,
    away: sel.away,
    onTeam: onTeam
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '18px',
      padding: '10px 18px',
      background: 'var(--grad-header)',
      borderBottom: '1px solid var(--border)',
      flex: '0 0 auto',
      zIndex: 30
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '11px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '34px',
      height: '34px',
      borderRadius: '9px',
      background: 'var(--grad-gold)',
      display: 'grid',
      placeItems: 'center',
      fontSize: '19px',
      boxShadow: 'var(--shadow-gold)'
    }
  }, "\uD83C\uDFC6"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: '15px',
      margin: 0,
      letterSpacing: '.3px',
      fontWeight: 800
    }
  }, "MP\u2019S WORLD CUP VISUALIZER"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-xs)',
      color: 'var(--text-muted)',
      marginTop: '1px'
    }
  }, "2026 \xB7 USA \xB7 Canada \xB7 Mexico \xB7 48 teams"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '4px',
      background: 'var(--surface-panel)',
      padding: '4px',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement(Tab, {
    id: "groups"
  }, "Groups"), /*#__PURE__*/React.createElement(Tab, {
    id: "matches"
  }, "Matches"), /*#__PURE__*/React.createElement(Tab, {
    id: "bracket"
  }, "Bracket")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    style: {
      position: 'absolute',
      left: '10px',
      top: '9px',
      opacity: .5
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m21 21-4-4"
  })), /*#__PURE__*/React.createElement("input", {
    placeholder: "Search team or player\u2026",
    autoComplete: "off",
    onKeyDown: e => {
      if (e.key === 'Enter') {
        search(e.target.value);
        e.target.blur();
      }
    },
    style: {
      background: 'var(--surface-panel)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      color: 'var(--text-primary)',
      padding: '8px 12px 8px 32px',
      width: '210px',
      fontSize: 'var(--fs-sm)',
      outline: 'none',
      fontFamily: 'var(--font-ui)'
    },
    onFocus: e => e.target.style.borderColor = 'var(--accent-2)',
    onBlur: e => e.target.style.borderColor = 'var(--border)'
  })), /*#__PURE__*/React.createElement(IBtn, {
    title: "Sync latest scores"
  }, "\u27F3"), /*#__PURE__*/React.createElement(IBtn, {
    title: "Model controls"
  }, "\u2699")), tab === 'groups' && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      minHeight: 0,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 460px',
      overflowY: 'auto',
      padding: '14px',
      borderRight: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement(window.GroupsRail, {
    onTeam: onTeam,
    onMatch: onMatch
  })), /*#__PURE__*/React.createElement("div", {
    id: "detailPane",
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '18px 22px',
      minWidth: 0
    }
  }, detail)), tab === 'matches' && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '18px 22px'
    }
  }, /*#__PURE__*/React.createElement(MatchesView, {
    onMatch: onMatch
  })), tab === 'bracket' && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '18px 22px'
    }
  }, /*#__PURE__*/React.createElement(window.BracketView, {
    onTeam: onTeam
  })));
}
window.scrollDetailTop = () => {
  const p = document.getElementById('detailPane');
  if (p) p.scrollTop = 0;
};
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/visualizer/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/visualizer/bracket.jsx
try { (() => {
/* WC26 Visualizer UI kit — Knockout bracket + Monte-Carlo title odds. */
const DSb = window.WC26VisualizerDesignSystem_b4eaf5;
const {
  Button: BBtn,
  Tag: BTag,
  SectionHeading: BHead,
  BarMeter: BMeter
} = DSb;
const Mb = window.WCMODEL;
function Tie({
  m,
  B,
  onTeam
}) {
  const mt = Mb.MT[m];
  const t = Mb.teamsOf(m, B);
  const w = Mb.winnerOf(m, B);
  const Slot = ({
    team,
    tok
  }) => {
    if (!team) return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        padding: '7px 9px',
        fontSize: 'var(--fs-sm)',
        borderLeft: '3px solid transparent',
        color: 'var(--text-faint)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: '18px',
        textAlign: 'center'
      }
    }, "\xB7"), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }, "TBD"));
    const isW = w === team;
    const lbl = mt.r32 ? Mb.slotLabel(tok, B) : '';
    return /*#__PURE__*/React.createElement("div", {
      onClick: e => {
        e.stopPropagation();
        Mb.setPick('M' + m, team);
        onTeam.bump();
      },
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        padding: '7px 9px',
        fontSize: 'var(--fs-sm)',
        cursor: 'pointer',
        borderLeft: `3px solid ${isW ? 'var(--accent)' : 'transparent'}`,
        fontWeight: isW ? 800 : 400,
        opacity: isW ? 1 : 0.45,
        transition: 'background var(--dur-fast) var(--ease-out)'
      },
      onMouseEnter: e => e.currentTarget.style.background = 'var(--surface-hover)',
      onMouseLeave: e => e.currentTarget.style.background = 'transparent'
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '14px',
        width: '18px',
        textAlign: 'center'
      }
    }, window.flag(team)), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, window.shrt(team)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 'var(--fs-2xs)',
        color: 'var(--text-faint)',
        fontFamily: 'var(--font-mono)'
      }
    }, lbl));
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-panel)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '8px',
      color: 'var(--text-faint)',
      padding: '3px 8px 0',
      textAlign: 'right',
      letterSpacing: '0.3px',
      fontFamily: 'var(--font-mono)'
    }
  }, "M", m), /*#__PURE__*/React.createElement(Slot, {
    team: t[0],
    tok: mt.h
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--border-soft)'
    }
  }, /*#__PURE__*/React.createElement(Slot, {
    team: t[1],
    tok: mt.a
  })));
}
function Round({
  name,
  order,
  B,
  onTeam
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-around',
      gap: '6px',
      minWidth: '170px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-2xs)',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: 'var(--text-faint)',
      fontWeight: 'var(--fw-bold)',
      textAlign: 'center',
      marginBottom: '2px'
    }
  }, name), order.map(m => /*#__PURE__*/React.createElement(Tie, {
    key: m,
    m: m,
    B: B,
    onTeam: onTeam
  })));
}
function BracketView({
  onTeam
}) {
  const [, setN] = React.useState(0);
  const bump = () => setN(n => n + 1);
  const B = Mb.bracketTeams();
  const odds = Mb.simulate(2000);
  const champ = Mb.winnerOf(104, B);
  const handle = {
    bump
  };
  const rounds = [['Round of 32', Mb.R32m], ['Round of 16', Mb.R16m], ['Quarter-finals', Mb.QFm], ['Semi-finals', Mb.SFo], ['Final', Mb.FINo]];
  const maxOdds = odds.length ? odds[0].pct : 100;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      marginBottom: '6px',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--fs-title)',
      fontWeight: 800
    }
  }, "\uD83C\uDFC6 Knockout Predictor"), /*#__PURE__*/React.createElement(BBtn, {
    variant: "primary",
    iconLeft: "\u26A1",
    onClick: () => {
      Mb.autoFill();
      bump();
    }
  }, "Auto-fill by model"), /*#__PURE__*/React.createElement(BBtn, {
    variant: "secondary",
    iconLeft: "\u21BA",
    onClick: () => {
      Mb.resetPicks();
      bump();
    }
  }, "Reset"), /*#__PURE__*/React.createElement(BTag, {
    tone: "pill"
  }, "Official 2026 bracket")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-xs)',
      color: 'var(--text-muted)',
      margin: '2px 0 14px',
      maxWidth: '900px',
      lineHeight: 1.5
    }
  }, "Slots are fixed by group finish (1A, 2B, \u2026) and the eight third-placed teams are slotted per FIFA's Annex C table. Teams fill in from the ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--text-primary)'
    }
  }, "live standings"), ". ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--text-primary)'
    }
  }, "Tap any team to advance them"), "; unpicked ties auto-resolve to the model favorite. Title odds = 2,000-run Monte-Carlo."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '16px',
      overflowX: 'auto',
      paddingBottom: '14px',
      alignItems: 'stretch'
    }
  }, rounds.map(([nm, ord]) => /*#__PURE__*/React.createElement(Round, {
    key: nm,
    name: nm,
    order: ord,
    B: B,
    onTeam: handle
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      placeItems: 'center',
      minWidth: '180px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(135deg,#1d2b1f,#142033)',
      border: '1px solid var(--accent)',
      borderRadius: 'var(--radius-2xl)',
      padding: '20px 16px',
      textAlign: 'center',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-2xs)',
      color: 'var(--gold)',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      fontWeight: 'var(--fw-bold)'
    }
  }, "Projected Champion"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '46px'
    }
  }, champ ? window.flag(champ) : '🏆'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: '16px',
      marginTop: '6px'
    }
  }, champ || '—')))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
      gap: '14px',
      marginTop: '22px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-panel)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)',
      padding: '16px'
    }
  }, /*#__PURE__*/React.createElement(BHead, {
    style: {
      marginTop: 0
    }
  }, "Title odds \u2014 Monte Carlo"), /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '6px'
    }
  }, /*#__PURE__*/React.createElement("tbody", null, odds.slice(0, 14).map(o => /*#__PURE__*/React.createElement("tr", {
    key: o.team,
    onClick: () => onTeam(o.team),
    style: {
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      width: '22px',
      padding: '7px 8px',
      borderTop: '1px solid var(--border-soft)'
    }
  }, window.flag(o.team)), /*#__PURE__*/React.createElement("td", {
    style: {
      fontWeight: 700,
      padding: '7px 8px',
      borderTop: '1px solid var(--border-soft)'
    }
  }, window.shrt(o.team)), /*#__PURE__*/React.createElement("td", {
    style: {
      width: '90px',
      padding: '7px 8px',
      borderTop: '1px solid var(--border-soft)'
    }
  }, /*#__PURE__*/React.createElement(BMeter, {
    value: o.pct,
    max: maxOdds
  })), /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: 'right',
      fontWeight: 800,
      color: 'var(--accent)',
      fontFamily: 'var(--font-mono)',
      padding: '7px 8px',
      borderTop: '1px solid var(--border-soft)'
    }
  }, o.pct.toFixed(1), "%")))))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-panel)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)',
      padding: '16px'
    }
  }, /*#__PURE__*/React.createElement(BHead, {
    style: {
      marginTop: 0
    }
  }, "How the model works"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-muted)',
      fontSize: 'var(--fs-sm)',
      lineHeight: 1.55
    }
  }, "Each team gets a ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--text-primary)'
    }
  }, "composite strength rating"), " (FIFA base, Form, Attack, Defense, Momentum). The rating gap sets each side's ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--text-primary)'
    }
  }, "expected goals"), " and a ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--text-primary)'
    }
  }, "Poisson"), " grid gives win/draw/loss \u2014 so even big favorites leak real upset probability. ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--text-primary)'
    }
  }, "Backtested on Qatar 2022.")), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-faint)',
      fontSize: 'var(--fs-xs)'
    }
  }, "A strength model for analysis & entertainment \u2014 not betting advice."))));
}
window.BracketView = BracketView;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/visualizer/bracket.jsx", error: String((e && e.message) || e) }); }

// ui_kits/visualizer/data.js
try { (() => {
/* WC26 Visualizer UI kit — data (extracted verbatim from the source app). */
window.WCDATA = {
  "updated": "2026-06-26",
  "groups": {
    "A": [{
      "team": "Mexico",
      "rank": 14,
      "pts": 1687.48,
      "P": 3,
      "W": 3,
      "D": 0,
      "L": 0,
      "GF": 6,
      "GA": 0,
      "Pts": 9,
      "status": "qualified"
    }, {
      "team": "South Korea",
      "rank": 25,
      "pts": 1592,
      "P": 3,
      "W": 1,
      "D": 0,
      "L": 2,
      "GF": 2,
      "GA": 3,
      "Pts": 3,
      "status": "active"
    }, {
      "team": "Czech Republic",
      "rank": 40,
      "pts": 1506,
      "P": 3,
      "W": 0,
      "D": 1,
      "L": 2,
      "GF": 2,
      "GA": 6,
      "Pts": 1,
      "status": "eliminated"
    }, {
      "team": "South Africa",
      "rank": 60,
      "pts": 1428,
      "P": 3,
      "W": 1,
      "D": 1,
      "L": 1,
      "GF": 2,
      "GA": 3,
      "Pts": 4,
      "status": "qualified"
    }],
    "B": [{
      "team": "Switzerland",
      "rank": 19,
      "pts": 1650.75,
      "P": 3,
      "W": 2,
      "D": 1,
      "L": 0,
      "GF": 7,
      "GA": 3,
      "Pts": 7,
      "status": "qualified"
    }, {
      "team": "Canada",
      "rank": 30,
      "pts": 1559,
      "P": 3,
      "W": 1,
      "D": 1,
      "L": 1,
      "GF": 8,
      "GA": 3,
      "Pts": 4,
      "status": "qualified"
    }, {
      "team": "Bosnia and Herzegovina",
      "rank": 64,
      "pts": 1387,
      "P": 3,
      "W": 1,
      "D": 1,
      "L": 1,
      "GF": 5,
      "GA": 6,
      "Pts": 4,
      "status": "qualified"
    }, {
      "team": "Qatar",
      "rank": 56,
      "pts": 1450,
      "P": 3,
      "W": 0,
      "D": 1,
      "L": 2,
      "GF": 2,
      "GA": 10,
      "Pts": 1,
      "status": "eliminated"
    }],
    "C": [{
      "team": "Brazil",
      "rank": 6,
      "pts": 1762.66,
      "P": 3,
      "W": 2,
      "D": 1,
      "L": 0,
      "GF": 7,
      "GA": 1,
      "Pts": 7,
      "status": "qualified"
    }, {
      "team": "Morocco",
      "rank": 7,
      "pts": 1756.94,
      "P": 3,
      "W": 2,
      "D": 1,
      "L": 0,
      "GF": 6,
      "GA": 3,
      "Pts": 7,
      "status": "qualified"
    }, {
      "team": "Scotland",
      "rank": 42,
      "pts": 1503,
      "P": 3,
      "W": 1,
      "D": 0,
      "L": 2,
      "GF": 1,
      "GA": 4,
      "Pts": 3,
      "status": "active"
    }, {
      "team": "Haiti",
      "rank": 83,
      "pts": 1293,
      "P": 3,
      "W": 0,
      "D": 0,
      "L": 3,
      "GF": 2,
      "GA": 8,
      "Pts": 0,
      "status": "eliminated"
    }],
    "D": [{
      "team": "United States",
      "rank": 17,
      "pts": 1675.7,
      "P": 3,
      "W": 2,
      "D": 0,
      "L": 1,
      "GF": 8,
      "GA": 4,
      "Pts": 6,
      "status": "qualified"
    }, {
      "team": "Australia",
      "rank": 27,
      "pts": 1579,
      "P": 3,
      "W": 1,
      "D": 1,
      "L": 1,
      "GF": 2,
      "GA": 2,
      "Pts": 4,
      "status": "qualified"
    }, {
      "team": "Paraguay",
      "rank": 41,
      "pts": 1505,
      "P": 3,
      "W": 1,
      "D": 1,
      "L": 1,
      "GF": 2,
      "GA": 4,
      "Pts": 4,
      "status": "qualified"
    }, {
      "team": "Türkiye",
      "rank": 22,
      "pts": 1606,
      "P": 3,
      "W": 1,
      "D": 0,
      "L": 2,
      "GF": 3,
      "GA": 5,
      "Pts": 3,
      "status": "eliminated"
    }],
    "E": [{
      "team": "Germany",
      "rank": 10,
      "pts": 1731.3,
      "P": 3,
      "W": 2,
      "D": 0,
      "L": 1,
      "GF": 10,
      "GA": 4,
      "Pts": 6,
      "status": "qualified"
    }, {
      "team": "Ivory Coast",
      "rank": 33,
      "pts": 1541,
      "P": 3,
      "W": 2,
      "D": 0,
      "L": 1,
      "GF": 4,
      "GA": 2,
      "Pts": 6,
      "status": "qualified"
    }, {
      "team": "Ecuador",
      "rank": 23,
      "pts": 1599,
      "P": 3,
      "W": 1,
      "D": 1,
      "L": 1,
      "GF": 2,
      "GA": 2,
      "Pts": 4,
      "status": "qualified"
    }, {
      "team": "Curaçao",
      "rank": 82,
      "pts": 1295,
      "P": 3,
      "W": 0,
      "D": 1,
      "L": 2,
      "GF": 1,
      "GA": 9,
      "Pts": 1,
      "status": "eliminated"
    }],
    "F": [{
      "team": "Netherlands",
      "rank": 8,
      "pts": 1751.1,
      "P": 3,
      "W": 2,
      "D": 1,
      "L": 0,
      "GF": 10,
      "GA": 4,
      "Pts": 7,
      "status": "qualified"
    }, {
      "team": "Japan",
      "rank": 18,
      "pts": 1661.58,
      "P": 3,
      "W": 1,
      "D": 2,
      "L": 0,
      "GF": 7,
      "GA": 3,
      "Pts": 5,
      "status": "qualified"
    }, {
      "team": "Sweden",
      "rank": 38,
      "pts": 1510,
      "P": 3,
      "W": 1,
      "D": 1,
      "L": 1,
      "GF": 7,
      "GA": 7,
      "Pts": 4,
      "status": "qualified"
    }, {
      "team": "Tunisia",
      "rank": 45,
      "pts": 1476,
      "P": 3,
      "W": 0,
      "D": 0,
      "L": 3,
      "GF": 2,
      "GA": 12,
      "Pts": 0,
      "status": "eliminated"
    }],
    "G": [{
      "team": "Egypt",
      "rank": 29,
      "pts": 1562,
      "P": 2,
      "W": 1,
      "D": 1,
      "L": 0,
      "GF": 4,
      "GA": 2,
      "Pts": 4,
      "status": "qualified"
    }, {
      "team": "Belgium",
      "rank": 9,
      "pts": 1742.24,
      "P": 2,
      "W": 0,
      "D": 2,
      "L": 0,
      "GF": 1,
      "GA": 1,
      "Pts": 2,
      "status": "active"
    }, {
      "team": "Iran",
      "rank": 20,
      "pts": 1619.58,
      "P": 2,
      "W": 0,
      "D": 2,
      "L": 0,
      "GF": 2,
      "GA": 2,
      "Pts": 2,
      "status": "active"
    }, {
      "team": "New Zealand",
      "rank": 85,
      "pts": 1276,
      "P": 2,
      "W": 0,
      "D": 1,
      "L": 1,
      "GF": 3,
      "GA": 5,
      "Pts": 1,
      "status": "active"
    }],
    "H": [{
      "team": "Spain",
      "rank": 2,
      "pts": 1873.01,
      "P": 3,
      "W": 2,
      "D": 1,
      "L": 0,
      "GF": 5,
      "GA": 0,
      "Pts": 7,
      "status": "qualified"
    }, {
      "team": "Uruguay",
      "rank": 16,
      "pts": 1672.62,
      "P": 3,
      "W": 0,
      "D": 2,
      "L": 1,
      "GF": 3,
      "GA": 4,
      "Pts": 2,
      "status": "eliminated"
    }, {
      "team": "Cape Verde",
      "rank": 67,
      "pts": 1371,
      "P": 3,
      "W": 0,
      "D": 3,
      "L": 0,
      "GF": 2,
      "GA": 2,
      "Pts": 3,
      "status": "qualified"
    }, {
      "team": "Saudi Arabia",
      "rank": 61,
      "pts": 1424,
      "P": 3,
      "W": 0,
      "D": 2,
      "L": 1,
      "GF": 1,
      "GA": 5,
      "Pts": 2,
      "status": "eliminated"
    }],
    "I": [{
      "team": "France",
      "rank": 3,
      "pts": 1869.43,
      "P": 3,
      "W": 3,
      "D": 0,
      "L": 0,
      "GF": 10,
      "GA": 2,
      "Pts": 9,
      "status": "qualified"
    }, {
      "team": "Norway",
      "rank": 31,
      "pts": 1557,
      "P": 3,
      "W": 2,
      "D": 0,
      "L": 1,
      "GF": 8,
      "GA": 7,
      "Pts": 6,
      "status": "qualified"
    }, {
      "team": "Senegal",
      "rank": 15,
      "pts": 1686.41,
      "P": 3,
      "W": 1,
      "D": 0,
      "L": 2,
      "GF": 8,
      "GA": 6,
      "Pts": 3,
      "status": "active"
    }, {
      "team": "Iraq",
      "rank": 57,
      "pts": 1446,
      "P": 3,
      "W": 0,
      "D": 0,
      "L": 3,
      "GF": 1,
      "GA": 12,
      "Pts": 0,
      "status": "eliminated"
    }],
    "J": [{
      "team": "Argentina",
      "rank": 1,
      "pts": 1874.81,
      "P": 2,
      "W": 2,
      "D": 0,
      "L": 0,
      "GF": 5,
      "GA": 0,
      "Pts": 6,
      "status": "qualified"
    }, {
      "team": "Austria",
      "rank": 24,
      "pts": 1597,
      "P": 2,
      "W": 1,
      "D": 0,
      "L": 1,
      "GF": 3,
      "GA": 3,
      "Pts": 3,
      "status": "active"
    }, {
      "team": "Algeria",
      "rank": 28,
      "pts": 1571,
      "P": 2,
      "W": 1,
      "D": 0,
      "L": 1,
      "GF": 2,
      "GA": 4,
      "Pts": 3,
      "status": "active"
    }, {
      "team": "Jordan",
      "rank": 63,
      "pts": 1388,
      "P": 2,
      "W": 0,
      "D": 0,
      "L": 2,
      "GF": 2,
      "GA": 5,
      "Pts": 0,
      "status": "active"
    }],
    "K": [{
      "team": "Portugal",
      "rank": 5,
      "pts": 1763.83,
      "P": 2,
      "W": 1,
      "D": 1,
      "L": 0,
      "GF": 6,
      "GA": 1,
      "Pts": 4,
      "status": "qualified"
    }, {
      "team": "Colombia",
      "rank": 13,
      "pts": 1695.99,
      "P": 2,
      "W": 2,
      "D": 0,
      "L": 0,
      "GF": 4,
      "GA": 1,
      "Pts": 6,
      "status": "qualified"
    }, {
      "team": "DR Congo",
      "rank": 58,
      "pts": 1445,
      "P": 2,
      "W": 0,
      "D": 1,
      "L": 1,
      "GF": 1,
      "GA": 2,
      "Pts": 1,
      "status": "active"
    }, {
      "team": "Uzbekistan",
      "rank": 50,
      "pts": 1459,
      "P": 2,
      "W": 0,
      "D": 0,
      "L": 2,
      "GF": 1,
      "GA": 8,
      "Pts": 0,
      "status": "active"
    }],
    "L": [{
      "team": "England",
      "rank": 4,
      "pts": 1825.97,
      "P": 2,
      "W": 1,
      "D": 1,
      "L": 0,
      "GF": 4,
      "GA": 2,
      "Pts": 4,
      "status": "qualified"
    }, {
      "team": "Ghana",
      "rank": 73,
      "pts": 1347,
      "P": 2,
      "W": 1,
      "D": 1,
      "L": 0,
      "GF": 1,
      "GA": 0,
      "Pts": 4,
      "status": "qualified"
    }, {
      "team": "Croatia",
      "rank": 11,
      "pts": 1712.24,
      "P": 2,
      "W": 1,
      "D": 0,
      "L": 1,
      "GF": 3,
      "GA": 4,
      "Pts": 3,
      "status": "active"
    }, {
      "team": "Panama",
      "rank": 34,
      "pts": 1539,
      "P": 2,
      "W": 0,
      "D": 0,
      "L": 2,
      "GF": 0,
      "GA": 2,
      "Pts": 0,
      "status": "active"
    }]
  },
  "results": [{
    "group": "A",
    "date": "2026-06-11",
    "home": "Mexico",
    "away": "South Africa",
    "hs": 2,
    "as": 0
  }, {
    "group": "A",
    "date": "2026-06-11",
    "home": "South Korea",
    "away": "Czech Republic",
    "hs": 2,
    "as": 1
  }, {
    "group": "B",
    "date": "2026-06-12",
    "home": "Canada",
    "away": "Bosnia and Herzegovina",
    "hs": 1,
    "as": 1
  }, {
    "group": "D",
    "date": "2026-06-12",
    "home": "United States",
    "away": "Paraguay",
    "hs": 4,
    "as": 1
  }, {
    "group": "B",
    "date": "2026-06-13",
    "home": "Qatar",
    "away": "Switzerland",
    "hs": 1,
    "as": 1
  }, {
    "group": "C",
    "date": "2026-06-13",
    "home": "Brazil",
    "away": "Morocco",
    "hs": 1,
    "as": 1
  }, {
    "group": "C",
    "date": "2026-06-13",
    "home": "Haiti",
    "away": "Scotland",
    "hs": 0,
    "as": 1
  }, {
    "group": "D",
    "date": "2026-06-14",
    "home": "Australia",
    "away": "Türkiye",
    "hs": 2,
    "as": 0
  }, {
    "group": "E",
    "date": "2026-06-14",
    "home": "Germany",
    "away": "Curaçao",
    "hs": 7,
    "as": 1
  }, {
    "group": "F",
    "date": "2026-06-14",
    "home": "Netherlands",
    "away": "Japan",
    "hs": 2,
    "as": 2
  }, {
    "group": "E",
    "date": "2026-06-14",
    "home": "Ivory Coast",
    "away": "Ecuador",
    "hs": 1,
    "as": 0
  }, {
    "group": "F",
    "date": "2026-06-14",
    "home": "Sweden",
    "away": "Tunisia",
    "hs": 5,
    "as": 1
  }, {
    "group": "H",
    "date": "2026-06-15",
    "home": "Spain",
    "away": "Cape Verde",
    "hs": 0,
    "as": 0
  }, {
    "group": "G",
    "date": "2026-06-15",
    "home": "Belgium",
    "away": "Egypt",
    "hs": 1,
    "as": 1
  }, {
    "group": "H",
    "date": "2026-06-15",
    "home": "Saudi Arabia",
    "away": "Uruguay",
    "hs": 1,
    "as": 1
  }, {
    "group": "G",
    "date": "2026-06-15",
    "home": "Iran",
    "away": "New Zealand",
    "hs": 2,
    "as": 2
  }, {
    "group": "I",
    "date": "2026-06-16",
    "home": "France",
    "away": "Senegal",
    "hs": 3,
    "as": 1
  }, {
    "group": "I",
    "date": "2026-06-16",
    "home": "Iraq",
    "away": "Norway",
    "hs": 1,
    "as": 4
  }, {
    "group": "J",
    "date": "2026-06-16",
    "home": "Argentina",
    "away": "Algeria",
    "hs": 3,
    "as": 0
  }, {
    "group": "J",
    "date": "2026-06-17",
    "home": "Austria",
    "away": "Jordan",
    "hs": 3,
    "as": 1
  }, {
    "group": "K",
    "date": "2026-06-17",
    "home": "Portugal",
    "away": "DR Congo",
    "hs": 1,
    "as": 1
  }, {
    "group": "L",
    "date": "2026-06-17",
    "home": "England",
    "away": "Croatia",
    "hs": 4,
    "as": 2
  }, {
    "group": "L",
    "date": "2026-06-17",
    "home": "Ghana",
    "away": "Panama",
    "hs": 1,
    "as": 0
  }, {
    "group": "K",
    "date": "2026-06-17",
    "home": "Uzbekistan",
    "away": "Colombia",
    "hs": 1,
    "as": 3
  }, {
    "group": "A",
    "date": "2026-06-18",
    "home": "Czech Republic",
    "away": "South Africa",
    "hs": 1,
    "as": 1
  }, {
    "group": "B",
    "date": "2026-06-18",
    "home": "Switzerland",
    "away": "Bosnia and Herzegovina",
    "hs": 4,
    "as": 1
  }, {
    "group": "B",
    "date": "2026-06-18",
    "home": "Canada",
    "away": "Qatar",
    "hs": 6,
    "as": 0
  }, {
    "group": "A",
    "date": "2026-06-18",
    "home": "Mexico",
    "away": "South Korea",
    "hs": 1,
    "as": 0
  }, {
    "group": "D",
    "date": "2026-06-19",
    "home": "United States",
    "away": "Australia",
    "hs": 2,
    "as": 0
  }, {
    "group": "C",
    "date": "2026-06-19",
    "home": "Scotland",
    "away": "Morocco",
    "hs": 0,
    "as": 1
  }, {
    "group": "C",
    "date": "2026-06-19",
    "home": "Brazil",
    "away": "Haiti",
    "hs": 3,
    "as": 0
  }, {
    "group": "D",
    "date": "2026-06-19",
    "home": "Türkiye",
    "away": "Paraguay",
    "hs": 0,
    "as": 1
  }, {
    "group": "F",
    "date": "2026-06-20",
    "home": "Netherlands",
    "away": "Sweden",
    "hs": 5,
    "as": 1
  }, {
    "group": "E",
    "date": "2026-06-20",
    "home": "Germany",
    "away": "Ivory Coast",
    "hs": 2,
    "as": 1
  }, {
    "group": "E",
    "date": "2026-06-20",
    "home": "Ecuador",
    "away": "Curaçao",
    "hs": 0,
    "as": 0
  }, {
    "group": "F",
    "date": "2026-06-21",
    "home": "Tunisia",
    "away": "Japan",
    "hs": 0,
    "as": 4
  }, {
    "group": "H",
    "date": "2026-06-21",
    "home": "Spain",
    "away": "Saudi Arabia",
    "hs": 4,
    "as": 0
  }, {
    "group": "G",
    "date": "2026-06-21",
    "home": "Belgium",
    "away": "Iran",
    "hs": 0,
    "as": 0
  }, {
    "group": "H",
    "date": "2026-06-21",
    "home": "Uruguay",
    "away": "Cape Verde",
    "hs": 2,
    "as": 2
  }, {
    "group": "G",
    "date": "2026-06-21",
    "home": "New Zealand",
    "away": "Egypt",
    "hs": 1,
    "as": 3
  }, {
    "group": "J",
    "date": "2026-06-22",
    "home": "Argentina",
    "away": "Austria",
    "hs": 2,
    "as": 0
  }, {
    "group": "I",
    "date": "2026-06-22",
    "home": "France",
    "away": "Iraq",
    "hs": 3,
    "as": 0
  }, {
    "group": "I",
    "date": "2026-06-22",
    "home": "Norway",
    "away": "Senegal",
    "hs": 3,
    "as": 2
  }, {
    "group": "J",
    "date": "2026-06-22",
    "home": "Jordan",
    "away": "Algeria",
    "hs": 1,
    "as": 2
  }, {
    "group": "K",
    "date": "2026-06-23",
    "home": "Portugal",
    "away": "Uzbekistan",
    "hs": 5,
    "as": 0
  }, {
    "group": "L",
    "date": "2026-06-23",
    "home": "England",
    "away": "Ghana",
    "hs": 0,
    "as": 0
  }, {
    "group": "L",
    "date": "2026-06-23",
    "home": "Panama",
    "away": "Croatia",
    "hs": 0,
    "as": 1
  }, {
    "group": "K",
    "date": "2026-06-23",
    "home": "Colombia",
    "away": "DR Congo",
    "hs": 1,
    "as": 0
  }, {
    "group": "B",
    "date": "2026-06-24",
    "home": "Bosnia and Herzegovina",
    "away": "Qatar",
    "hs": 3,
    "as": 1
  }, {
    "group": "B",
    "date": "2026-06-24",
    "home": "Switzerland",
    "away": "Canada",
    "hs": 2,
    "as": 1
  }, {
    "group": "C",
    "date": "2026-06-24",
    "home": "Morocco",
    "away": "Haiti",
    "hs": 4,
    "as": 2
  }, {
    "group": "C",
    "date": "2026-06-24",
    "home": "Scotland",
    "away": "Brazil",
    "hs": 0,
    "as": 3
  }, {
    "group": "A",
    "date": "2026-06-24",
    "home": "Czech Republic",
    "away": "Mexico",
    "hs": 0,
    "as": 3
  }, {
    "group": "A",
    "date": "2026-06-24",
    "home": "South Africa",
    "away": "South Korea",
    "hs": 1,
    "as": 0
  }, {
    "group": "E",
    "date": "2026-06-25",
    "home": "Curaçao",
    "away": "Ivory Coast",
    "hs": 0,
    "as": 2
  }, {
    "group": "E",
    "date": "2026-06-25",
    "home": "Ecuador",
    "away": "Germany",
    "hs": 2,
    "as": 1
  }, {
    "group": "F",
    "date": "2026-06-25",
    "home": "Japan",
    "away": "Sweden",
    "hs": 1,
    "as": 1
  }, {
    "group": "F",
    "date": "2026-06-25",
    "home": "Tunisia",
    "away": "Netherlands",
    "hs": 1,
    "as": 3
  }, {
    "group": "D",
    "date": "2026-06-25",
    "home": "Paraguay",
    "away": "Australia",
    "hs": 0,
    "as": 0
  }, {
    "group": "D",
    "date": "2026-06-25",
    "home": "Türkiye",
    "away": "United States",
    "hs": 3,
    "as": 2
  }, {
    "group": "I",
    "date": "2026-06-26",
    "home": "Norway",
    "away": "France",
    "hs": 1,
    "as": 4
  }, {
    "group": "I",
    "date": "2026-06-26",
    "home": "Senegal",
    "away": "Iraq",
    "hs": 5,
    "as": 0
  }, {
    "group": "H",
    "date": "2026-06-26",
    "home": "Cape Verde",
    "away": "Saudi Arabia",
    "hs": 0,
    "as": 0
  }, {
    "group": "H",
    "date": "2026-06-26",
    "home": "Uruguay",
    "away": "Spain",
    "hs": 0,
    "as": 1
  }],
  "fixtures": [{
    "group": "G",
    "date": "2026-06-26",
    "home": "Egypt",
    "away": "Iran"
  }, {
    "group": "G",
    "date": "2026-06-26",
    "home": "New Zealand",
    "away": "Belgium"
  }, {
    "group": "L",
    "date": "2026-06-27",
    "home": "Croatia",
    "away": "Ghana"
  }, {
    "group": "L",
    "date": "2026-06-27",
    "home": "Panama",
    "away": "England"
  }, {
    "group": "K",
    "date": "2026-06-27",
    "home": "Colombia",
    "away": "Portugal"
  }, {
    "group": "K",
    "date": "2026-06-27",
    "home": "DR Congo",
    "away": "Uzbekistan"
  }, {
    "group": "J",
    "date": "2026-06-27",
    "home": "Algeria",
    "away": "Austria"
  }, {
    "group": "J",
    "date": "2026-06-27",
    "home": "Jordan",
    "away": "Argentina"
  }, {
    "group": "",
    "date": "2026-06-28",
    "home": "South Africa",
    "away": "Canada"
  }, {
    "group": "",
    "date": "2026-06-29",
    "home": "Brazil",
    "away": "Japan"
  }, {
    "group": "",
    "date": "2026-06-29",
    "home": "Germany",
    "away": "Paraguay"
  }, {
    "group": "",
    "date": "2026-06-29",
    "home": "Netherlands",
    "away": "Morocco"
  }, {
    "group": "",
    "date": "2026-06-30",
    "home": "Ivory Coast",
    "away": "Norway"
  }, {
    "group": "",
    "date": "2026-06-30",
    "home": "France",
    "away": "Sweden"
  }, {
    "group": "",
    "date": "2026-07-01",
    "home": "United States",
    "away": "Bosnia and Herzegovina"
  }, {
    "group": "",
    "date": "2026-07-03",
    "home": "Argentina",
    "away": "Cape Verde"
  }],
  "marketValue": {
    "France": 1520,
    "England": 1360,
    "Spain": 1220,
    "Portugal": 1010,
    "Germany": 947,
    "Brazil": 928,
    "Argentina": 807,
    "Netherlands": 754,
    "Norway": 590,
    "Belgium": 548,
    "Ivory Coast": 522,
    "Senegal": 478,
    "Türkiye": 474,
    "Morocco": 448,
    "Sweden": 406,
    "Croatia": 387,
    "United States": 386,
    "Ecuador": 369,
    "Uruguay": 359,
    "Switzerland": 333,
    "Colombia": 302,
    "Japan": 271,
    "Algeria": 257,
    "Austria": 245,
    "Ghana": 235,
    "Canada": 199,
    "Mexico": 192,
    "Czech Republic": 188,
    "Scotland": 170,
    "Paraguay": 154,
    "Bosnia and Herzegovina": 146,
    "DR Congo": 144,
    "South Korea": 139,
    "Egypt": 116,
    "Uzbekistan": 85,
    "Australia": 77,
    "Tunisia": 70,
    "Haiti": 56,
    "Cape Verde": 49,
    "South Africa": 49,
    "Saudi Arabia": 41,
    "Panama": 35,
    "New Zealand": 34,
    "Iran": 32,
    "Curaçao": 26,
    "Iraq": 21,
    "Jordan": 20,
    "Qatar": 20
  },
  "squads": {
    "Mexico": {
      "coach": "Javier Aguirre",
      "f": "4-3-3",
      "p": [["Guillermo Ochoa", "GK", "AEL Limassol", 40, 152, 0], ["Raúl Rangel", "GK", "Guadalajara", 26, 13, 0], ["Carlos Acevedo", "GK", "Santos Laguna", 30, 7, 0], ["Jesús Gallardo", "DEF", "Toluca", 31, 120, 0], ["César Montes", "DEF", "Lokomotiv Moscow", 29, 66, 1], ["Jorge Sánchez", "DEF", "PAOK", 28, 58, 0], ["Johan Vásquez", "DEF", "Genoa", 27, 45, 1], ["Israel Reyes", "DEF", "América", 26, 33, 0], ["Mateo Chávez", "DEF", "AZ", 22, 9, 0], ["Edson Álvarez", "MID", "Fenerbahçe", 28, 97, 1], ["Orbelín Pineda", "MID", "AEK Athens", 30, 91, 1], ["Roberto Alvarado", "MID", "Guadalajara", 27, 66, 0], ["Luis Romo", "MID", "Guadalajara", 31, 62, 0], ["Luis Chávez", "MID", "Dynamo Moscow", 30, 44, 0], ["Érik Lira", "MID", "Cruz Azul", 26, 24, 0], ["Gilberto Mora", "MID", "Tijuana", 17, 7, 0], ["Brian Gutiérrez", "MID", "Guadalajara", 22, 6, 0], ["Obed Vargas", "MID", "Atlético Madrid", 20, 6, 0], ["Álvaro Fidalgo", "MID", "Real Betis", 29, 3, 0], ["Raúl Jiménez", "FWD", "Fulham", 35, 123, 1], ["Alexis Vega", "FWD", "Toluca", 28, 51, 0], ["Santiago Giménez", "FWD", "Milan", 25, 47, 1], ["César Huerta", "FWD", "Anderlecht", 25, 26, 0], ["Julián Quiñones", "FWD", "Al-Qadsiah", 29, 21, 0], ["Guillermo Martínez", "FWD", "UNAM", 31, 11, 0], ["Armando González", "FWD", "Guadalajara", 23, 7, 0]]
    },
    "South Korea": {
      "coach": "Hong Myung-bo",
      "f": "4-2-3-1",
      "p": [["Kim Seung-gyu", "GK", "FC Tokyo", 35, 86, 0], ["Jo Hyeon-woo", "GK", "Ulsan HD", 34, 48, 0], ["Song Bum-keun", "GK", "Jeonbuk", 28, 2, 0], ["Kim Min-jae", "DEF", "Bayern Munich", 29, 78, 1], ["Kim Moon-hwan", "DEF", "Daejeon Hana", 30, 35, 0], ["Seol Young-woo", "DEF", "Red Star Belgrade", 27, 33, 0], ["Lee Tae-seok", "DEF", "Austria Wien", 23, 14, 0], ["Park Jin-seob", "DEF", "Zhejiang", 30, 13, 0], ["Kim Tae-hyeon", "DEF", "Kashima Antlers", 25, 7, 0], ["Lee Han-beom", "DEF", "Midtjylland", 23, 7, 0], ["Jens Castrop", "DEF", "M'gladbach", 22, 6, 0], ["Lee Jae-sung", "MID", "Mainz 05", 33, 104, 1], ["Hwang Hee-chan", "MID", "Wolves", 30, 78, 1], ["Hwang In-beom", "MID", "Feyenoord", 29, 72, 0], ["Lee Kang-in", "MID", "Paris SG", 25, 46, 1], ["Paik Seung-ho", "MID", "Birmingham City", 29, 26, 0], ["Kim Jin-gyu", "MID", "Jeonbuk", 29, 21, 0], ["Lee Dong-gyeong", "MID", "Ulsan HD", 28, 17, 0], ["Bae Jun-ho", "MID", "Stoke City", 22, 13, 0], ["Eom Ji-sung", "MID", "Swansea City", 24, 9, 0], ["Yang Hyun-jun", "MID", "Celtic", 24, 8, 0], ["Son Heung-min", "FWD", "Los Angeles FC", 33, 143, 1], ["Cho Gue-sung", "FWD", "Midtjylland", 28, 43, 0], ["Oh Hyeon-gyu", "FWD", "Beşiktaş", 25, 26, 0]]
    },
    "Czech Republic": {
      "coach": "Miroslav Koubek",
      "f": "4-2-3-1",
      "p": [["Matěj Kovář", "GK", "PSV Eindhoven", 26, 19, 0], ["Jindřich Staněk", "GK", "Slavia Prague", 30, 14, 0], ["Lukáš Horníček", "GK", "Braga", 23, 1, 0], ["Vladimír Coufal", "DEF", "Hoffenheim", 33, 61, 0], ["Tomáš Holeš", "DEF", "Slavia Prague", 33, 40, 0], ["Ladislav Krejčí", "DEF", "Wolves", 27, 26, 1], ["David Zima", "DEF", "Slavia Prague", 25, 24, 0], ["Jaroslav Zelený", "DEF", "Sparta Prague", 33, 22, 0], ["David Jurásek", "DEF", "Slavia Prague", 25, 17, 0], ["David Douděra", "DEF", "Slavia Prague", 28, 16, 0], ["Robin Hranáč", "DEF", "Hoffenheim", 26, 13, 0], ["Štěpán Chaloupek", "DEF", "Slavia Prague", 23, 4, 0], ["Tomáš Souček", "MID", "West Ham", 31, 89, 1], ["Vladimír Darida", "MID", "Hradec Králové", 35, 78, 0], ["Lukáš Provod", "MID", "Slavia Prague", 29, 37, 0], ["Michal Sadílek", "MID", "Slavia Prague", 27, 34, 0], ["Pavel Šulc", "MID", "Lyon", 25, 20, 1], ["Lukáš Červ", "MID", "Viktoria Plzeň", 25, 16, 0], ["Hugo Sochůrek", "MID", "Sparta Prague", 18, 1, 0], ["Denis Višinský", "MID", "Viktoria Plzeň", 23, 1, 0], ["Patrik Schick", "FWD", "Bayer Leverkusen", 30, 52, 1], ["Adam Hložek", "FWD", "Hoffenheim", 23, 42, 1], ["Jan Kuchta", "FWD", "Sparta Prague", 29, 31, 0], ["Mojmír Chytil", "FWD", "Slavia Prague", 27, 22, 0], ["Tomáš Chorý", "FWD", "Slavia Prague", 31, 21, 0]]
    },
    "South Africa": {
      "coach": "Hugo Broos",
      "f": "4-3-3",
      "p": [["Ronwen Williams", "GK", "Mamelodi Sundowns", 34, 62, 1], ["Ricardo Goss", "GK", "Siwelele", 32, 4, 0], ["Sipho Chaine", "GK", "Orlando Pirates", 29, 3, 0], ["Aubrey Modiba", "DEF", "Mamelodi Sundowns", 30, 44, 0], ["Khuliso Mudau", "DEF", "Mamelodi Sundowns", 31, 32, 0], ["Nkosinathi Sibisi", "DEF", "Orlando Pirates", 30, 19, 0], ["Mbekezeli Mbokazi", "DEF", "Chicago Fire", 20, 10, 0], ["Ime Okon", "DEF", "Hannover 96", 22, 7, 0], ["Samukele Kabini", "DEF", "Molde", 22, 5, 0], ["Khulumani Ndamane", "DEF", "Mamelodi Sundowns", 22, 5, 0], ["Bradley Cross", "DEF", "Kaizer Chiefs", 25, 0, 0], ["Olwethu Makhanya", "DEF", "Philadelphia Union", 22, 0, 0], ["Teboho Mokoena", "MID", "Mamelodi Sundowns", 29, 51, 1], ["Sphephelo Sithole", "MID", "Tondela", 27, 27, 0], ["Thalente Mbatha", "MID", "Orlando Pirates", 26, 14, 0], ["Jayden Adams", "MID", "Mamelodi Sundowns", 25, 4, 0], ["Themba Zwane", "FWD", "Mamelodi Sundowns", 36, 53, 1], ["Lyle Foster", "FWD", "Burnley", 26, 26, 1], ["Evidence Makgopa", "FWD", "Orlando Pirates", 26, 26, 0], ["Oswin Appollis", "FWD", "Orlando Pirates", 24, 25, 0], ["Iqraam Rayners", "FWD", "Mamelodi Sundowns", 30, 13, 0], ["Relebohile Mofokeng", "FWD", "Orlando Pirates", 21, 12, 0], ["Thapelo Maseko", "FWD", "AEL Limassol", 22, 9, 0], ["Tshepang Moremi", "FWD", "Orlando Pirates", 25, 9, 0]]
    },
    "Switzerland": {
      "coach": "Murat Yakin",
      "f": "4-2-3-1",
      "p": [["Gregor Kobel", "GK", "Borussia Dortmund", 28, 20, 1], ["Yvon Mvogo", "GK", "Lorient", 32, 13, 0], ["Marvin Keller", "GK", "Young Boys", 23, 1, 0], ["Miro Muheim", "DEF", "Hamburger SV", 28, 9, 0], ["Silvan Widmer", "DEF", "Mainz 05", 33, 59, 0], ["Nico Elvedi", "DEF", "M'gladbach", 29, 66, 0], ["Manuel Akanji", "DEF", "Inter Milan", 30, 80, 1], ["Ricardo Rodriguez", "DEF", "Real Betis", 33, 137, 0], ["Eray Cömert", "DEF", "Valencia", 28, 21, 0], ["Aurèle Amenda", "DEF", "Eintracht Frankfurt", 22, 6, 0], ["Luca Jaquez", "DEF", "VfB Stuttgart", 23, 3, 0], ["Denis Zakaria", "MID", "Monaco", 29, 64, 1], ["Remo Freuler", "MID", "Bologna", 34, 87, 0], ["Johan Manzambi", "MID", "SC Freiburg", 20, 11, 0], ["Granit Xhaka", "MID", "Sunderland", 33, 145, 1], ["Ardon Jashari", "MID", "Milan", 23, 7, 0], ["Djibril Sow", "MID", "Sevilla", 29, 51, 0], ["Christian Fassnacht", "MID", "Young Boys", 32, 22, 0], ["Michel Aebischer", "MID", "Pisa", 29, 39, 0], ["Fabian Rieder", "MID", "FC Augsburg", 24, 27, 0], ["Breel Embolo", "FWD", "Rennes", 29, 86, 1], ["Dan Ndoye", "FWD", "Nottingham Forest", 25, 30, 0], ["Rubén Vargas", "FWD", "Sevilla", 27, 61, 0], ["Noah Okafor", "FWD", "Leeds United", 26, 24, 0], ["Zeki Amdouni", "FWD", "Burnley", 25, 28, 0], ["Cedric Itten", "FWD", "Fortuna Düsseldorf", 29, 14, 0]]
    },
    "Canada": {
      "coach": "Jesse Marsch",
      "f": "4-3-3",
      "p": [["Dayne St. Clair", "GK", "Inter Miami", 29, 19, 0], ["Maxime Crépeau", "GK", "Orlando City", 32, 30, 0], ["Owen Goodman", "GK", "Barnsley", 22, 0, 0], ["Alistair Johnston", "DEF", "Celtic", 27, 56, 1], ["Alphonso Davies", "DEF", "Bayern Munich", 25, 58, 1], ["Derek Cornelius", "DEF", "Rangers", 28, 42, 0], ["Moïse Bombito", "DEF", "Nice", 26, 19, 0], ["Richie Laryea", "DEF", "Toronto FC", 31, 73, 0], ["Joel Waterman", "DEF", "Chicago Fire", 30, 17, 0], ["Luc de Fougerolles", "DEF", "Dender", 20, 11, 0], ["Niko Sigur", "DEF", "Hajduk Split", 22, 17, 0], ["Stephen Eustáquio", "MID", "Los Angeles FC", 29, 54, 1], ["Ismaël Koné", "MID", "Sassuolo", 23, 38, 0], ["Mathieu Choinière", "MID", "Los Angeles FC", 27, 22, 0], ["Liam Millar", "MID", "Hull City", 26, 39, 0], ["Jacob Shaffelburg", "MID", "Los Angeles FC", 26, 31, 0], ["Tajon Buchanan", "MID", "Villarreal", 27, 58, 0], ["Ali Ahmed", "MID", "Norwich City", 25, 24, 0], ["Jonathan Osorio", "MID", "Toronto FC", 33, 89, 0], ["Nathan Saliba", "MID", "Anderlecht", 22, 13, 0], ["Jonathan David", "FWD", "Juventus", 26, 75, 1], ["Cyle Larin", "FWD", "Southampton", 31, 88, 0], ["Tani Oluwaseyi", "FWD", "Villarreal", 26, 22, 0], ["Promise David", "FWD", "Union SG", 24, 8, 0]]
    },
    "Bosnia and Herzegovina": {
      "coach": "Sergej Barbarez",
      "f": "4-2-3-1",
      "p": [["Nikola Vasilj", "GK", "FC St. Pauli", 30, 25, 0], ["Martin Zlomislić", "GK", "Rijeka", 27, 3, 0], ["Osman Hadžikić", "GK", "Slaven Belupo", 30, 0, 0], ["Sead Kolašinac", "DEF", "Atalanta", 32, 64, 1], ["Dennis Hadžikadunić", "DEF", "Sampdoria", 27, 31, 0], ["Amar Dedić", "DEF", "Benfica", 23, 27, 1], ["Nikola Katić", "DEF", "Schalke 04", 29, 16, 0], ["Tarik Muharemović", "DEF", "Sassuolo", 23, 13, 0], ["Nihad Mujakić", "DEF", "Gaziantep", 28, 11, 0], ["Stjepan Radeljić", "DEF", "Rijeka", 28, 5, 0], ["Amir Hadžiahmetović", "MID", "Hull City", 29, 35, 0], ["Benjamin Tahirović", "MID", "Brøndby", 23, 27, 0], ["Armin Gigović", "MID", "Young Boys", 24, 19, 0], ["Ivan Bašić", "MID", "Astana", 24, 16, 0], ["Esmir Bajraktarević", "MID", "PSV Eindhoven", 21, 15, 0], ["Amar Memić", "MID", "Viktoria Plzeň", 25, 12, 0], ["Ivan Šunjić", "MID", "Pafos", 29, 11, 0], ["Kerim Alajbegović", "MID", "Red Bull Salzburg", 18, 9, 0], ["Edin Džeko", "FWD", "Schalke 04", 40, 148, 1], ["Ermedin Demirović", "FWD", "VfB Stuttgart", 28, 39, 1], ["Samed Baždar", "FWD", "Jagiellonia", 22, 12, 0], ["Haris Tabaković", "FWD", "M'gladbach", 31, 10, 0], ["Jovo Lukić", "FWD", "Universitatea Cluj", 27, 2, 0]]
    },
    "Qatar": {
      "coach": "Julen Lopetegui",
      "f": "5-3-2",
      "p": [["Mahmud Abunada", "GK", "Al-Rayyan", 26, 4, 0], ["Meshaal Barsham", "GK", "Al-Sadd", 28, 52, 0], ["Salah Zakaria", "GK", "Al-Duhail", 27, 8, 0], ["Pedro Miguel", "DEF", "Al-Sadd", 35, 98, 0], ["Lucas Mendes", "DEF", "Al-Wakrah", 35, 25, 0], ["Homam Ahmed", "DEF", "Cultural Leonesa", 26, 67, 0], ["Boualem Khoukhi", "DEF", "Al-Sadd", 35, 115, 0], ["Sultan Al-Brake", "DEF", "Al-Duhail", 30, 16, 0], ["Ayoub Al-Oui", "DEF", "Al-Gharafa", 21, 5, 0], ["Issa Laye", "DEF", "Al-Arabi", 28, 3, 0], ["Jassem Gaber", "MID", "Al-Rayyan", 24, 31, 0], ["Abdulaziz Hatem", "MID", "Al-Rayyan", 35, 117, 0], ["Karim Boudiaf", "MID", "Al-Duhail", 35, 117, 0], ["Ahmed Fathy", "MID", "Al-Arabi", 33, 47, 0], ["Assim Madibo", "MID", "Al-Wakrah", 29, 50, 0], ["Mohamed Al-Mannai", "MID", "Al-Shamal", 22, 9, 0], ["Ahmed Alaaeldin", "FWD", "Al-Rayyan", 33, 67, 0], ["Edmilson Junior", "FWD", "Al-Duhail", 31, 15, 0], ["Mohammed Muntari", "FWD", "Al-Gharafa", 32, 67, 0], ["Hassan Al-Haydos", "FWD", "Al-Sadd", 35, 185, 1], ["Akram Afif", "FWD", "Al-Sadd", 29, 124, 1], ["Yusuf Abdurisag", "FWD", "Al-Wakrah", 26, 38, 0], ["Almoez Ali", "FWD", "Al-Duhail", 29, 115, 1], ["Tahsin Jamshid", "FWD", "Al-Duhail", 19, 2, 0]]
    },
    "Brazil": {
      "coach": "Carlo Ancelotti",
      "f": "4-3-3",
      "p": [["Alisson", "GK", "Liverpool", 33, 77, 1], ["Ederson", "GK", "Fenerbahçe", 32, 32, 0], ["Weverton", "GK", "Grêmio", 38, 10, 0], ["Wesley", "DEF", "Roma", 22, 7, 0], ["Gabriel Magalhães", "DEF", "Arsenal", 28, 17, 1], ["Marquinhos", "DEF", "Paris SG", 32, 104, 1], ["Bremer", "DEF", "Juventus", 29, 7, 0], ["Danilo", "DEF", "Flamengo", 34, 69, 0], ["Alex Sandro", "DEF", "Flamengo", 35, 44, 0], ["Léo Pereira", "DEF", "Flamengo", 30, 3, 0], ["Douglas Santos", "DEF", "Zenit", 32, 6, 0], ["Casemiro", "MID", "Manchester United", 34, 85, 0], ["Bruno Guimarães", "MID", "Newcastle", 28, 42, 1], ["Lucas Paquetá", "MID", "Flamengo", 28, 62, 0], ["Fabinho", "MID", "Al-Ittihad", 32, 32, 0], ["Vinícius Júnior", "FWD", "Real Madrid", 25, 48, 1], ["Neymar", "FWD", "Santos", 34, 128, 1], ["Raphinha", "FWD", "Barcelona", 29, 38, 1], ["Matheus Cunha", "FWD", "Manchester United", 27, 22, 0], ["Endrick", "FWD", "Lyon", 19, 16, 0], ["Luiz Henrique", "FWD", "Zenit", 25, 14, 0], ["Gabriel Martinelli", "FWD", "Arsenal", 24, 22, 0], ["Igor Thiago", "FWD", "Brentford", 24, 3, 0], ["Rayan", "FWD", "Bournemouth", 19, 2, 0]]
    },
    "Morocco": {
      "coach": "Mohamed Ouahbi",
      "f": "4-3-3",
      "p": [["Yassine Bounou", "GK", "Al-Hilal", 35, 89, 1], ["Munir Mohamedi", "GK", "RS Berkane", 37, 51, 0], ["Ahmed Reda Tagnaouti", "GK", "AS FAR", 30, 3, 0], ["Achraf Hakimi", "DEF", "Paris SG", 27, 95, 1], ["Nayef Aguerd", "DEF", "Marseille", 30, 64, 1], ["Noussair Mazraoui", "DEF", "Manchester United", 28, 43, 0], ["Youssef Belammari", "DEF", "Al Ahly", 27, 16, 0], ["Anass Salah-Eddine", "DEF", "PSV Eindhoven", 24, 8, 0], ["Chadi Riad", "DEF", "Crystal Palace", 22, 4, 0], ["Issa Diop", "DEF", "Fulham", 29, 2, 0], ["Zakaria El Ouahdi", "DEF", "Genk", 24, 2, 0], ["Sofyan Amrabat", "MID", "Real Betis", 29, 73, 1], ["Azzedine Ounahi", "MID", "Girona", 26, 47, 0], ["Bilal El Khannouss", "MID", "VfB Stuttgart", 22, 35, 0], ["Ismael Saibari", "MID", "PSV Eindhoven", 25, 28, 0], ["Neil El Aynaoui", "MID", "Roma", 24, 15, 0], ["Ayyoub Bouaddi", "MID", "Lille", 18, 1, 0], ["Ayoub El Kaabi", "FWD", "Olympiacos", 32, 57, 1], ["Soufiane Rahimi", "FWD", "Al-Ain", 30, 35, 0], ["Abde Ezzalzouli", "FWD", "Real Betis", 24, 35, 0], ["Brahim Díaz", "FWD", "Real Madrid", 26, 24, 1], ["Chemsdine Talbi", "FWD", "Sunderland", 21, 5, 0], ["Gessime Yassine", "FWD", "Strasbourg", 20, 3, 0], ["Soufiane Diop", "FWD", "Nice", 25, 3, 0]]
    },
    "Scotland": {
      "coach": "Steve Clarke",
      "f": "3-5-2",
      "p": [["Craig Gordon", "GK", "Hearts", 43, 84, 0], ["Angus Gunn", "GK", "Nottingham Forest", 30, 21, 1], ["Liam Kelly", "GK", "Rangers", 30, 3, 0], ["Andy Robertson", "DEF", "Liverpool", 32, 93, 1], ["Grant Hanley", "DEF", "Hibernian", 34, 67, 0], ["Kieran Tierney", "DEF", "Celtic", 29, 55, 1], ["Scott McKenna", "DEF", "Dinamo Zagreb", 29, 50, 0], ["Jack Hendry", "DEF", "Al-Ettifaq", 31, 37, 0], ["Nathan Patterson", "DEF", "Everton", 24, 26, 0], ["Anthony Ralston", "DEF", "Celtic", 27, 26, 0], ["John Souttar", "DEF", "Rangers", 29, 23, 0], ["Aaron Hickey", "DEF", "Brentford", 24, 20, 0], ["John McGinn", "MID", "Aston Villa", 31, 85, 1], ["Scott McTominay", "MID", "Napoli", 29, 69, 1], ["Ryan Christie", "MID", "Bournemouth", 31, 67, 0], ["Kenny McLean", "MID", "Norwich City", 34, 57, 0], ["Lewis Ferguson", "MID", "Bologna", 26, 23, 0], ["Ben Gannon-Doak", "MID", "Bournemouth", 20, 13, 0], ["Findlay Curtis", "MID", "Kilmarnock", 20, 2, 0], ["Lyndon Dykes", "FWD", "Charlton", 30, 51, 0], ["Ché Adams", "FWD", "Torino", 29, 46, 1], ["Lawrence Shankland", "FWD", "Hearts", 30, 19, 0], ["George Hirst", "FWD", "Ipswich Town", 27, 9, 0], ["Ross Stewart", "FWD", "Southampton", 29, 2, 0]]
    },
    "Haiti": {
      "coach": "Sébastien Migné",
      "f": "4-3-3",
      "p": [["Johny Placide", "GK", "Bastia", 38, 79, 0], ["Alexandre Pierre", "GK", "Sochaux", 25, 14, 0], ["Josué Duverger", "GK", "Cosmos Koblenz", 26, 6, 0], ["Ricardo Adé", "DEF", "LDU Quito", 36, 57, 0], ["Carlens Arcus", "DEF", "Angers", 29, 51, 0], ["Jean-Kévin Duverne", "DEF", "Gent", 28, 15, 0], ["Duke Lacroix", "DEF", "Colorado Springs", 32, 14, 0], ["Wilguens Paugain", "DEF", "Zulte Waregem", 24, 6, 0], ["Hannes Delcroix", "DEF", "Lugano", 27, 5, 0], ["Martin Expérience", "DEF", "Nancy", 27, 19, 0], ["Leverton Pierre", "MID", "Vizela", 28, 33, 0], ["Danley Jean Jacques", "MID", "Philadelphia Union", 26, 28, 1], ["Carl Sainté", "MID", "El Paso", 23, 25, 0], ["Jean-Ricner Bellegarde", "MID", "Wolves", 27, 8, 1], ["Woodensky Pierre", "MID", "Violette", 21, 1, 0], ["Duckens Nazon", "FWD", "Esteghlal", 32, 76, 1], ["Frantzdy Pierrot", "FWD", "Çaykur Rizespor", 31, 49, 1], ["Derrick Etienne Jr.", "FWD", "Toronto FC", 29, 46, 1], ["Louicius Deedson", "FWD", "FC Dallas", 25, 30, 0], ["Ruben Providence", "FWD", "Almere City", 24, 13, 0], ["Josué Casimir", "FWD", "Auxerre", 24, 5, 0], ["Wilson Isidor", "FWD", "Sunderland", 25, 2, 0], ["Lenny Joseph", "FWD", "Ferencváros", 25, 0, 0]]
    },
    "United States": {
      "coach": "Mauricio Pochettino",
      "f": "4-3-3",
      "p": [["Matt Turner", "GK", "New England", 31, 54, 0], ["Matt Freese", "GK", "New York City FC", 27, 14, 0], ["Chris Brady", "GK", "Chicago Fire", 22, 1, 0], ["Sergiño Dest", "DEF", "PSV Eindhoven", 25, 38, 0], ["Chris Richards", "DEF", "Crystal Palace", 26, 36, 0], ["Antonee Robinson", "DEF", "Fulham", 28, 53, 1], ["Auston Trusty", "DEF", "Celtic", 27, 7, 0], ["Miles Robinson", "DEF", "FC Cincinnati", 29, 39, 0], ["Tim Ream", "DEF", "Charlotte FC", 38, 81, 0], ["Alex Freeman", "DEF", "Villarreal", 21, 16, 0], ["Maximilian Arfsten", "DEF", "Columbus Crew", 25, 19, 0], ["Mark McKenzie", "DEF", "Toulouse", 27, 28, 0], ["Joe Scally", "DEF", "M'gladbach", 23, 25, 0], ["Tyler Adams", "MID", "Bournemouth", 27, 53, 1], ["Weston McKennie", "MID", "Juventus", 27, 65, 1], ["Giovanni Reyna", "MID", "M'gladbach", 23, 37, 0], ["Sebastian Berhalter", "MID", "Vancouver", 25, 12, 0], ["Cristian Roldan", "MID", "Seattle Sounders", 31, 46, 0], ["Malik Tillman", "MID", "Bayer Leverkusen", 24, 29, 0], ["Christian Pulisic", "FWD", "Milan", 27, 85, 1], ["Folarin Balogun", "FWD", "Monaco", 24, 26, 1], ["Ricardo Pepi", "FWD", "PSV Eindhoven", 23, 36, 0], ["Brenden Aaronson", "FWD", "Leeds United", 25, 57, 0], ["Haji Wright", "FWD", "Coventry City", 28, 20, 0], ["Timothy Weah", "FWD", "Marseille", 26, 50, 0], ["Alejandro Zendejas", "FWD", "América", 28, 14, 0]]
    },
    "Australia": {
      "coach": "Tony Popovic",
      "f": "4-2-3-1",
      "p": [["Mathew Ryan", "GK", "Levante", 34, 104, 1], ["Paul Izzo", "GK", "Randers", 31, 4, 0], ["Patrick Beach", "GK", "Melbourne City", 22, 1, 0], ["Miloš Degenek", "DEF", "APOEL", 32, 56, 0], ["Alessandro Circati", "DEF", "Parma", 22, 12, 1], ["Jordan Bos", "DEF", "Feyenoord", 23, 26, 0], ["Jason Geria", "DEF", "Albirex Niigata", 33, 13, 0], ["Kai Trewin", "DEF", "New York City FC", 25, 5, 0], ["Aziz Behich", "DEF", "Melbourne City", 35, 83, 0], ["Harry Souttar", "DEF", "Leicester City", 27, 37, 0], ["Cameron Burgess", "DEF", "Swansea City", 30, 26, 0], ["Jacob Italiano", "DEF", "GAK", 24, 4, 0], ["Connor Metcalfe", "MID", "FC St. Pauli", 26, 35, 0], ["Ajdin Hrustic", "MID", "Heracles", 29, 37, 0], ["Aiden O'Neill", "MID", "New York City FC", 27, 30, 0], ["Cammy Devlin", "MID", "Hearts", 28, 4, 0], ["Jackson Irvine", "MID", "FC St. Pauli", 33, 81, 1], ["Paul Okon-Engstler", "MID", "Sydney FC", 21, 5, 0], ["Mathew Leckie", "FWD", "Melbourne City", 35, 79, 0], ["Mohamed Touré", "FWD", "Norwich City", 22, 9, 0], ["Awer Mabil", "FWD", "Castellón", 30, 38, 0], ["Nestory Irankunda", "FWD", "Watford", 20, 14, 1], ["Cristian Volpato", "FWD", "Sassuolo", 22, 0, 0], ["Nishan Velupillay", "FWD", "Melbourne Victory", 25, 7, 0]]
    },
    "Paraguay": {
      "coach": "Gustavo Alfaro",
      "f": "4-4-2",
      "p": [["Gatito Fernández", "GK", "Cerro Porteño", 38, 30, 0], ["Orlando Gill", "GK", "San Lorenzo", 26, 5, 0], ["Gastón Olveira", "GK", "Olimpia", 33, 1, 0], ["Gustavo Gómez", "DEF", "Palmeiras", 33, 88, 1], ["Júnior Alonso", "DEF", "Atlético Mineiro", 33, 70, 0], ["Fabián Balbuena", "DEF", "Grêmio", 34, 47, 0], ["Omar Alderete", "DEF", "Sunderland", 29, 35, 0], ["Juan José Cáceres", "DEF", "Dynamo Moscow", 26, 16, 0], ["Gustavo Velázquez", "DEF", "Cerro Porteño", 35, 12, 0], ["José Canale", "DEF", "Lanús", 29, 1, 0], ["Alexandro Maidana", "DEF", "Talleres", 20, 1, 0], ["Miguel Almirón", "MID", "Atlanta United", 32, 75, 1], ["Kaku", "MID", "Al-Ain", 31, 32, 0], ["Andrés Cubas", "MID", "Vancouver", 30, 32, 0], ["Ramón Sosa", "MID", "Palmeiras", 26, 28, 0], ["Diego Gómez", "MID", "Brighton", 23, 23, 1], ["Damián Bobadilla", "MID", "São Paulo", 24, 19, 0], ["Braian Ojeda", "MID", "Orlando City", 25, 16, 0], ["Matías Galarza", "MID", "Atlanta United", 24, 14, 0], ["Antonio Sanabria", "FWD", "Cremonese", 30, 47, 0], ["Julio Enciso", "FWD", "Strasbourg", 22, 31, 1], ["Gabriel Ávalos", "FWD", "Independiente", 34, 22, 0], ["Álex Arce", "FWD", "Indep. Rivadavia", 30, 14, 0], ["Isidro Pitta", "FWD", "RB Bragantino", 26, 5, 0]]
    },
    "Türkiye": {
      "coach": "Vincenzo Montella",
      "f": "4-2-3-1",
      "p": [["Uğurcan Çakır", "GK", "Galatasaray", 30, 38, 0], ["Mert Günok", "GK", "Fenerbahçe", 37, 37, 0], ["Altay Bayındır", "GK", "Manchester United", 28, 11, 0], ["Merih Demiral", "DEF", "Al-Ahli", 28, 61, 0], ["Zeki Çelik", "DEF", "Roma", 29, 59, 0], ["Çağlar Söyüncü", "DEF", "Fenerbahçe", 30, 59, 0], ["Mert Müldür", "DEF", "Fenerbahçe", 27, 43, 0], ["Ferdi Kadıoğlu", "DEF", "Brighton", 26, 30, 0], ["Ozan Kabak", "DEF", "Hoffenheim", 26, 28, 0], ["Abdülkerim Bardakcı", "DEF", "Galatasaray", 31, 26, 0], ["Eren Elmalı", "DEF", "Galatasaray", 25, 21, 0], ["Hakan Çalhanoğlu", "MID", "Inter Milan", 32, 104, 1], ["Kaan Ayhan", "MID", "Galatasaray", 31, 72, 0], ["Orkun Kökçü", "MID", "Beşiktaş", 25, 48, 0], ["İsmail Yüksek", "MID", "Fenerbahçe", 27, 31, 0], ["Salih Özcan", "MID", "Borussia Dortmund", 28, 28, 0], ["Kerem Aktürkoğlu", "FWD", "Fenerbahçe", 27, 51, 0], ["İrfan Can Kahveci", "FWD", "Kasımpaşa", 30, 45, 0], ["Barış Alper Yılmaz", "FWD", "Galatasaray", 26, 33, 0], ["Arda Güler", "FWD", "Real Madrid", 21, 28, 1], ["Kenan Yıldız", "FWD", "Juventus", 21, 28, 1], ["Yunus Akgün", "FWD", "Galatasaray", 25, 17, 0], ["Can Uzun", "FWD", "Eintracht Frankfurt", 20, 4, 0], ["Deniz Gül", "FWD", "Porto", 21, 6, 0]]
    },
    "Germany": {
      "coach": "Julian Nagelsmann",
      "f": "4-2-3-1",
      "p": [["Manuel Neuer", "GK", "Bayern Munich", 40, 124, 0], ["Oliver Baumann", "GK", "Hoffenheim", 36, 12, 0], ["Alexander Nübel", "GK", "VfB Stuttgart", 29, 3, 0], ["Antonio Rüdiger", "DEF", "Real Madrid", 33, 82, 0], ["Waldemar Anton", "DEF", "Borussia Dortmund", 29, 12, 0], ["Jonathan Tah", "DEF", "Bayern Munich", 30, 46, 0], ["Nico Schlotterbeck", "DEF", "Borussia Dortmund", 26, 26, 0], ["Nathaniel Brown", "DEF", "Eintracht Frankfurt", 22, 4, 0], ["David Raum", "DEF", "RB Leipzig", 28, 36, 0], ["Malick Thiaw", "DEF", "Newcastle", 24, 5, 0], ["Joshua Kimmich", "MID", "Bayern Munich", 31, 109, 1], ["Aleksandar Pavlović", "MID", "Bayern Munich", 22, 10, 0], ["Leon Goretzka", "MID", "Bayern Munich", 31, 69, 0], ["Jamal Musiala", "MID", "Bayern Munich", 23, 41, 1], ["Pascal Groß", "MID", "Brighton", 34, 18, 0], ["Angelo Stiller", "MID", "VfB Stuttgart", 25, 7, 0], ["Florian Wirtz", "MID", "Liverpool", 23, 40, 1], ["Leroy Sané", "MID", "Galatasaray", 30, 75, 0], ["Nadiem Amiri", "MID", "Mainz 05", 29, 10, 0], ["Felix Nmecha", "MID", "Borussia Dortmund", 25, 7, 0], ["Lennart Karl", "MID", "Bayern Munich", 18, 3, 0], ["Kai Havertz", "FWD", "Arsenal", 27, 57, 1], ["Nick Woltemade", "FWD", "Newcastle", 24, 11, 0], ["Maximilian Beier", "FWD", "Borussia Dortmund", 23, 8, 0], ["Deniz Undav", "FWD", "VfB Stuttgart", 29, 8, 0]]
    },
    "Ivory Coast": {
      "coach": "Emerse Faé",
      "f": "4-3-3",
      "p": [["Yahia Fofana", "GK", "Çaykur Rizespor", 25, 34, 0], ["Alban Lafont", "GK", "Panathinaikos", 27, 4, 0], ["Mohamed Koné", "GK", "Charleroi", 24, 0, 0], ["Ghislain Konan", "DEF", "Gil Vicente", 30, 53, 0], ["Odilon Kossounou", "DEF", "Atalanta", 25, 35, 0], ["Wilfried Singo", "DEF", "Galatasaray", 25, 33, 1], ["Evan Ndicka", "DEF", "Roma", 26, 28, 0], ["Emmanuel Agbadou", "DEF", "Beşiktaş", 29, 19, 0], ["Guéla Doué", "DEF", "Strasbourg", 23, 19, 0], ["Ousmane Diomande", "DEF", "Sporting CP", 22, 14, 0], ["Christopher Opéri", "DEF", "Başakşehir", 29, 11, 0], ["Franck Kessié", "MID", "Al-Ahli", 29, 102, 1], ["Jean Michaël Seri", "MID", "Maribor", 34, 65, 0], ["Ibrahim Sangaré", "MID", "Nottingham Forest", 28, 57, 0], ["Seko Fofana", "MID", "Porto", 31, 31, 0], ["Christ Inao Oulaï", "MID", "Trabzonspor", 20, 8, 0], ["Nicolas Pépé", "FWD", "Villarreal", 31, 54, 0], ["Oumar Diakité", "FWD", "Cercle Brugge", 22, 28, 0], ["Simon Adingra", "FWD", "Monaco", 24, 28, 1], ["Evann Guessand", "FWD", "Crystal Palace", 24, 21, 0], ["Amad Diallo", "FWD", "Manchester United", 23, 18, 1], ["Yan Diomande", "FWD", "RB Leipzig", 19, 9, 0], ["Elye Wahi", "FWD", "Nice", 23, 1, 0], ["Ange-Yoan Bonny", "FWD", "Inter Milan", 22, 0, 0]]
    },
    "Ecuador": {
      "coach": "Sebastián Beccacece",
      "f": "4-3-3",
      "p": [["Hernán Galíndez", "GK", "Huracán", 39, 34, 0], ["Moisés Ramírez", "GK", "Kifisia", 25, 7, 0], ["Gonzalo Valle", "GK", "LDU Quito", 30, 3, 0], ["Félix Torres", "DEF", "Internacional", 29, 48, 0], ["Piero Hincapié", "DEF", "Arsenal", 24, 51, 1], ["Joel Ordóñez", "DEF", "Club Brugge", 22, 16, 0], ["Willian Pacho", "DEF", "Paris SG", 24, 34, 1], ["Pervis Estupiñán", "DEF", "Milan", 28, 53, 0], ["Ángelo Preciado", "DEF", "Atlético Mineiro", 28, 54, 0], ["Jackson Porozo", "DEF", "Tijuana", 25, 9, 0], ["Jordy Alcívar", "MID", "Indep. del Valle", 26, 10, 0], ["Denil Castillo", "MID", "Midtjylland", 22, 5, 0], ["John Yeboah", "MID", "Venezia", 25, 22, 0], ["Kendry Páez", "MID", "River Plate", 19, 25, 1], ["Pedro Vite", "MID", "UNAM", 24, 16, 0], ["Gonzalo Plata", "MID", "Flamengo", 25, 49, 0], ["Alan Franco", "MID", "Atlético Mineiro", 27, 57, 0], ["Moisés Caicedo", "MID", "Chelsea", 24, 60, 1], ["Alan Minda", "MID", "Atlético Mineiro", 23, 19, 0], ["Kevin Rodríguez", "FWD", "Union SG", 26, 31, 0], ["Enner Valencia", "FWD", "Pachuca", 36, 105, 1], ["Anthony Valencia", "FWD", "Antwerp", 22, 2, 0], ["Nilson Angulo", "FWD", "Sunderland", 22, 13, 0], ["Jeremy Arévalo", "FWD", "VfB Stuttgart", 21, 3, 0]]
    },
    "Curaçao": {
      "coach": "Dick Advocaat",
      "f": "4-3-3",
      "p": [["Eloy Room", "GK", "Miami FC", 37, 71, 0], ["Tyrick Bodak", "GK", "Telstar", 24, 4, 0], ["Trevor Doornbusch", "GK", "VVV-Venlo", 26, 7, 0], ["Shurandy Sambo", "DEF", "Sparta Rotterdam", 24, 7, 0], ["Juriën Gaari", "DEF", "Abha", 32, 59, 0], ["Roshon van Eijma", "DEF", "RKC Waalwijk", 28, 27, 0], ["Sherel Floranus", "DEF", "PEC Zwolle", 27, 27, 0], ["Armando Obispo", "DEF", "PSV Eindhoven", 27, 5, 0], ["Joshua Brenet", "DEF", "Kayserispor", 32, 17, 0], ["Riechedly Bazoer", "DEF", "Konyaspor", 29, 4, 0], ["Deveron Fonville", "DEF", "NEC", 23, 1, 0], ["Godfried Roemeratoe", "MID", "RKC Waalwijk", 26, 27, 0], ["Juninho Bacuna", "MID", "Volendam", 28, 48, 0], ["Livano Comenencia", "MID", "Zürich", 22, 19, 0], ["Leandro Bacuna", "MID", "Iğdır", 34, 71, 1], ["Tyrese Noslin", "MID", "Telstar", 23, 6, 0], ["Kevin Felida", "MID", "Den Bosch", 26, 19, 0], ["Jürgen Locadia", "FWD", "Miami FC", 32, 13, 0], ["Jeremy Antonisse", "FWD", "Kifisia", 24, 26, 0], ["Sontje Hansen", "FWD", "Middlesbrough", 24, 5, 0], ["Kenji Gorré", "FWD", "Maccabi Haifa", 31, 37, 0], ["Jearl Margaritha", "FWD", "Beveren", 26, 21, 0], ["Brandley Kuwas", "FWD", "Volendam", 33, 34, 1], ["Tahith Chong", "FWD", "Sheffield United", 26, 5, 1]]
    },
    "Netherlands": {
      "coach": "Ronald Koeman",
      "f": "4-3-3",
      "p": [["Bart Verbruggen", "GK", "Brighton", 23, 27, 0], ["Mark Flekken", "GK", "Bayer Leverkusen", 32, 11, 0], ["Robin Roefs", "GK", "Sunderland", 23, 0, 0], ["Virgil van Dijk", "DEF", "Liverpool", 34, 90, 1], ["Denzel Dumfries", "DEF", "Inter Milan", 30, 71, 0], ["Nathan Aké", "DEF", "Manchester City", 31, 58, 0], ["Jurriën Timber", "DEF", "Arsenal", 24, 23, 0], ["Micky van de Ven", "DEF", "Tottenham", 25, 19, 0], ["Mats Wieffer", "DEF", "Brighton", 26, 14, 0], ["Jan Paul van Hecke", "DEF", "Brighton", 26, 10, 0], ["Jorrel Hato", "DEF", "Chelsea", 20, 7, 0], ["Frenkie de Jong", "MID", "Barcelona", 29, 64, 1], ["Marten de Roon", "MID", "Atalanta", 35, 42, 0], ["Tijjani Reijnders", "MID", "Manchester City", 27, 30, 1], ["Teun Koopmeiners", "MID", "Juventus", 28, 27, 0], ["Ryan Gravenberch", "MID", "Liverpool", 24, 25, 0], ["Justin Kluivert", "MID", "Bournemouth", 27, 11, 0], ["Quinten Timber", "MID", "Marseille", 24, 10, 0], ["Memphis Depay", "FWD", "Corinthians", 32, 108, 1], ["Wout Weghorst", "FWD", "Ajax", 33, 51, 0], ["Donyell Malen", "FWD", "Roma", 27, 51, 0], ["Cody Gakpo", "FWD", "Liverpool", 27, 48, 1], ["Noa Lang", "FWD", "Galatasaray", 26, 15, 0], ["Brian Brobbey", "FWD", "Sunderland", 24, 10, 0]]
    },
    "Japan": {
      "coach": "Hajime Moriyasu",
      "f": "3-4-2-1",
      "p": [["Zion Suzuki", "GK", "Parma", 23, 24, 0], ["Keisuke Ōsako", "GK", "Sanfrecce", 26, 11, 0], ["Tomoki Hayakawa", "GK", "Kashima Antlers", 27, 4, 0], ["Yukinari Sugawara", "DEF", "Werder Bremen", 25, 21, 0], ["Shōgo Taniguchi", "DEF", "Sint-Truiden", 34, 38, 0], ["Kō Itakura", "DEF", "Ajax", 29, 40, 0], ["Yūto Nagatomo", "DEF", "FC Tokyo", 39, 145, 0], ["Tsuyoshi Watanabe", "DEF", "Feyenoord", 29, 11, 0], ["Ayumu Seko", "DEF", "Le Havre", 26, 14, 0], ["Hiroki Itō", "DEF", "Bayern Munich", 27, 24, 0], ["Takehiro Tomiyasu", "DEF", "Ajax", 27, 43, 0], ["Wataru Endo", "MID", "Liverpool", 33, 73, 1], ["Ao Tanaka", "MID", "Leeds United", 27, 38, 0], ["Takefusa Kubo", "MID", "Real Sociedad", 25, 49, 1], ["Ritsu Dōan", "MID", "Eintracht Frankfurt", 27, 65, 1], ["Keito Nakamura", "MID", "Reims", 25, 25, 0], ["Junya Itō", "MID", "Genk", 33, 69, 0], ["Daichi Kamada", "MID", "Crystal Palace", 29, 49, 0], ["Kaishū Sano", "MID", "Mainz 05", 25, 13, 0], ["Daizen Maeda", "FWD", "Celtic", 28, 27, 0], ["Ayase Ueda", "FWD", "Feyenoord", 27, 39, 0], ["Kōki Ogawa", "FWD", "NEC", 28, 15, 0], ["Keisuke Gotō", "FWD", "Sint-Truiden", 21, 4, 0], ["Yuito Suzuki", "FWD", "SC Freiburg", 24, 6, 0]]
    },
    "Sweden": {
      "coach": "Graham Potter",
      "f": "3-5-2",
      "p": [["Jacob Widell Zetterström", "GK", "Derby County", 27, 3, 0], ["Viktor Johansson", "GK", "Stoke City", 27, 12, 0], ["Kristoffer Nordfeldt", "GK", "AIK", 36, 20, 0], ["Gustaf Lagerbielke", "DEF", "Braga", 26, 10, 0], ["Victor Lindelöf", "DEF", "Aston Villa", 31, 76, 1], ["Isak Hien", "DEF", "Atalanta", 27, 28, 0], ["Gabriel Gudmundsson", "DEF", "Leeds United", 27, 23, 0], ["Daniel Svensson", "DEF", "Borussia Dortmund", 24, 12, 0], ["Hjalmar Ekdal", "DEF", "Burnley", 27, 12, 0], ["Carl Starfelt", "DEF", "Celta Vigo", 31, 17, 0], ["Eric Smith", "DEF", "FC St. Pauli", 29, 1, 0], ["Lucas Bergvall", "MID", "Tottenham", 20, 9, 1], ["Jesper Karlström", "MID", "Udinese", 30, 24, 0], ["Yasin Ayari", "MID", "Brighton", 22, 20, 0], ["Mattias Svanberg", "MID", "VfL Wolfsburg", 27, 40, 0], ["Besfort Zeneli", "MID", "Union SG", 23, 7, 0], ["Alexander Isak", "FWD", "Liverpool", 26, 57, 1], ["Viktor Gyökeres", "FWD", "Arsenal", 28, 32, 1], ["Anthony Elanga", "FWD", "Newcastle", 24, 29, 1], ["Benjamin Nygren", "FWD", "Celtic", 24, 10, 0], ["Ken Sema", "FWD", "Pafos", 32, 33, 0], ["Gustaf Nilsson", "FWD", "Club Brugge", 29, 9, 0], ["Alexander Bernhardsson", "FWD", "Holstein Kiel", 27, 10, 0], ["Taha Ali", "FWD", "Malmö FF", 27, 1, 0]]
    },
    "Tunisia": {
      "coach": "Sabri Lamouchi",
      "f": "4-3-3",
      "p": [["Aymen Dahmen", "GK", "CS Sfaxien", 29, 37, 0], ["Sabri Ben Hessen", "GK", "Étoile du Sahel", 29, 2, 0], ["Mouhib Chamakh", "GK", "Club Africain", 24, 1, 0], ["Montassar Talbi", "DEF", "Lorient", 28, 62, 0], ["Dylan Bronn", "DEF", "Servette", 30, 52, 0], ["Ali Abdi", "DEF", "Nice", 32, 45, 0], ["Yan Valery", "DEF", "Young Boys", 27, 21, 0], ["Mohamed Amine Ben Hamida", "DEF", "Espérance", 30, 12, 0], ["Moutaz Neffati", "DEF", "IFK Norrköping", 21, 5, 0], ["Omar Rekik", "DEF", "Maribor", 24, 4, 0], ["Adem Arous", "DEF", "Kasımpaşa", 21, 1, 0], ["Ellyes Skhiri", "MID", "Eintracht Frankfurt", 31, 81, 1], ["Hannibal Mejbri", "MID", "Burnley", 23, 44, 1], ["Anis Ben Slimane", "MID", "Norwich City", 25, 39, 0], ["Mortadha Ben Ouanes", "MID", "Kasımpaşa", 31, 17, 0], ["Ismaël Gharbi", "MID", "FC Augsburg", 22, 15, 0], ["Hadj Mahmoud", "MID", "Lugano", 26, 7, 0], ["Rani Khedira", "MID", "Union Berlin", 32, 2, 0], ["Elias Achouri", "FWD", "Copenhagen", 27, 29, 1], ["Firas Chaouat", "FWD", "Club Africain", 30, 28, 0], ["Hazem Mastouri", "FWD", "Dynamo Makhachkala", 28, 18, 0], ["Elias Saad", "FWD", "Hannover 96", 26, 14, 0], ["Sebastian Tounekti", "FWD", "Celtic", 23, 10, 0], ["Khalil Ayari", "FWD", "Paris SG", 21, 2, 0]]
    },
    "Belgium": {
      "coach": "Rudi Garcia",
      "f": "4-3-3",
      "p": [["Thibaut Courtois", "GK", "Real Madrid", 34, 107, 1], ["Senne Lammens", "GK", "Manchester United", 23, 2, 0], ["Mike Penders", "GK", "Strasbourg", 20, 0, 0], ["Thomas Meunier", "DEF", "Lille", 34, 78, 0], ["Timothy Castagne", "DEF", "Fulham", 30, 62, 0], ["Arthur Theate", "DEF", "Eintracht Frankfurt", 26, 32, 0], ["Zeno Debast", "DEF", "Sporting CP", 22, 26, 0], ["Maxim De Cuyper", "DEF", "Brighton", 25, 17, 0], ["Brandon Mechele", "DEF", "Club Brugge", 33, 7, 0], ["Koni De Winter", "DEF", "Milan", 23, 7, 0], ["Joaquin Seys", "DEF", "Club Brugge", 21, 4, 0], ["Axel Witsel", "MID", "Girona", 37, 136, 0], ["Kevin De Bruyne", "MID", "Napoli", 34, 110, 1], ["Youri Tielemans", "MID", "Aston Villa", 29, 80, 1], ["Amadou Onana", "MID", "Aston Villa", 24, 33, 0], ["Hans Vanaken", "MID", "Club Brugge", 33, 33, 0], ["Nicolas Raskin", "MID", "Rangers", 25, 9, 0], ["Romelu Lukaku", "FWD", "Napoli", 33, 124, 1], ["Jeremy Doku", "FWD", "Manchester City", 24, 33, 1], ["Leandro Trossard", "FWD", "Arsenal", 31, 47, 0], ["Charles De Ketelaere", "FWD", "Atalanta", 25, 30, 0], ["Dodi Lukebakio", "FWD", "Benfica", 28, 30, 0], ["Alexis Saelemaekers", "FWD", "Milan", 26, 25, 0], ["Diego Moreira", "FWD", "Strasbourg", 21, 2, 0]]
    },
    "Egypt": {
      "coach": "Hossam Hassan",
      "f": "4-2-3-1",
      "p": [["Mohamed Elshenawy", "GK", "Al Ahly", 37, 60, 0], ["Mahdy Soliman", "GK", "Zamalek", 39, 2, 0], ["Mostafa Shoubir", "GK", "Al Ahly", 28, 5, 0], ["Yasser Ibrahim", "DEF", "Al Ahly", 33, 25, 0], ["Mohamed Hany", "DEF", "Al Ahly", 30, 40, 0], ["Hossam Abdelmaguid", "DEF", "Zamalek", 25, 12, 0], ["Ramy Rabia", "DEF", "Al Ain", 33, 40, 0], ["Mohamed Abdelmoneim", "DEF", "OGC Nice", 27, 35, 0], ["Ahmed Fatouh", "DEF", "Zamalek", 28, 35, 0], ["Karim Hafez", "DEF", "Pyramids", 30, 25, 0], ["Tarek Alaa", "DEF", "ZED", 24, 5, 0], ["Emam Ashour", "MID", "Al Ahly", 28, 40, 1], ["Mostafa Zico", "MID", "Pyramids", 24, 8, 0], ["Hamdy Fathy", "MID", "Al-Wakrah", 31, 40, 0], ["Mohanad Lashin", "MID", "Pyramids", 23, 6, 0], ["Marawan Attia", "MID", "Al Ahly", 27, 10, 0], ["Mahmoud Saber", "MID", "ZED", 24, 6, 0], ["Trézéguet", "FWD", "Al Ahly", 31, 96, 1], ["Mohamed Salah", "FWD", "Liverpool", 34, 116, 1], ["Haissem Hassan", "FWD", "Real Oviedo", 24, 8, 0], ["Ibrahim Adel", "FWD", "Nordsjælland", 25, 15, 0], ["Omar Marmoush", "FWD", "Manchester City", 27, 50, 1], ["Zizo", "FWD", "Al Ahly", 30, 40, 0], ["Hamza Abdelkarim", "FWD", "Barcelona", 18, 3, 0]]
    },
    "Iran": {
      "coach": "Amir Ghalenoei",
      "f": "4-2-3-1",
      "p": [["Alireza Beiranvand", "GK", "Tractor", 33, 85, 1], ["Payam Niazmand", "GK", "Persepolis", 31, 15, 0], ["Hossein Hosseini", "GK", "Sepahan", 33, 13, 0], ["Ehsan Hajsafi", "DEF", "Sepahan", 36, 145, 1], ["Milad Mohammadi", "DEF", "Persepolis", 32, 75, 0], ["Ramin Rezaeian", "DEF", "Foolad", 36, 73, 0], ["Hossein Kanaanizadegan", "DEF", "Persepolis", 32, 64, 0], ["Shojae Khalilzadeh", "DEF", "Tractor", 37, 57, 0], ["Saleh Hardani", "DEF", "Esteghlal", 27, 17, 0], ["Ali Nemati", "DEF", "Foolad", 30, 16, 0], ["Danial Eiri", "DEF", "Malavan", 22, 0, 0], ["Alireza Jahanbakhsh", "MID", "FCV Dender", 32, 98, 1], ["Saeid Ezatolahi", "MID", "Shabab Al-Ahli", 29, 82, 0], ["Saman Ghoddos", "MID", "Al Ittihad Kalba", 32, 67, 1], ["Mehdi Torabi", "MID", "Tractor", 31, 52, 0], ["Rouzbeh Cheshmi", "MID", "Esteghlal", 32, 40, 0], ["Mohammad Mohebi", "MID", "FC Rostov", 27, 36, 0], ["Mehdi Ghayedi", "MID", "Al Nasr", 27, 29, 0], ["Mohammad Ghorbani", "MID", "Al Wahda", 25, 15, 0], ["Aria Yousefi", "MID", "Sepahan", 24, 13, 0], ["Mehdi Taremi", "FWD", "Olympiacos", 33, 104, 1], ["Shahriyar Moghanlou", "FWD", "Al Ittihad Kalba", 31, 20, 0], ["Amirhossein Hosseinzadeh", "FWD", "Tractor", 25, 17, 0], ["Ali Alipour", "FWD", "Persepolis", 30, 13, 0]]
    },
    "New Zealand": {
      "coach": "Darren Bazeley",
      "f": "3-4-3",
      "p": [["Max Crocombe", "GK", "Millwall", 33, 22, 0], ["Alex Paulsen", "GK", "Lechia Gdańsk", 23, 6, 0], ["Michael Woud", "GK", "Auckland FC", 27, 6, 0], ["Tim Payne", "DEF", "Wellington Phoenix", 31, 50, 0], ["Francis De Vries", "DEF", "Auckland FC", 33, 18, 0], ["Tyler Bindon", "DEF", "Nottingham Forest", 21, 23, 1], ["Michael Boxall", "DEF", "Minnesota United", 37, 61, 1], ["Liberato Cacace", "DEF", "Wrexham", 25, 35, 0], ["Nando Pijnaker", "DEF", "Auckland FC", 26, 23, 0], ["Finn Surman", "DEF", "Portland Timbers", 23, 17, 0], ["Callan Elliot", "DEF", "Auckland FC", 26, 9, 0], ["Tommy Smith", "DEF", "Braintree Town", 36, 56, 0], ["Joe Bell", "MID", "Viking FK", 27, 31, 0], ["Matt Garbett", "MID", "Peterborough", 24, 36, 0], ["Ben Old", "MID", "Saint-Étienne", 23, 22, 0], ["Alex Rufer", "MID", "Wellington Phoenix", 29, 24, 0], ["Sarpreet Singh", "MID", "Wellington Phoenix", 27, 26, 0], ["Marko Stamenić", "MID", "Swansea City", 24, 37, 1], ["Ryan Thomas", "MID", "PEC Zwolle", 31, 25, 0], ["Kosta Barbarouses", "FWD", "WS Wanderers", 36, 74, 0], ["Eli Just", "FWD", "Motherwell", 25, 42, 1], ["Callum McCowatt", "FWD", "Silkeborg", 26, 30, 0], ["Ben Waine", "FWD", "Port Vale", 24, 30, 0], ["Chris Wood", "FWD", "Nottingham Forest", 34, 88, 1]]
    },
    "Spain": {
      "coach": "Luis de la Fuente",
      "f": "4-3-3",
      "p": [["Unai Simón", "GK", "Athletic Club", 29, 45, 0], ["David Raya", "GK", "Arsenal", 30, 12, 0], ["Joan García", "GK", "Barcelona", 25, 2, 0], ["Marc Cucurella", "DEF", "Chelsea", 27, 35, 0], ["Alejandro Grimaldo", "DEF", "Bayer Leverkusen", 30, 12, 0], ["Pau Cubarsí", "DEF", "Barcelona", 19, 15, 1], ["Eric García", "DEF", "Barcelona", 25, 20, 0], ["Aymeric Laporte", "DEF", "Athletic Club", 32, 40, 0], ["Marc Pubill", "DEF", "Atlético Madrid", 22, 3, 0], ["Marcos Llorente", "DEF", "Atlético Madrid", 31, 25, 0], ["Pedro Porro", "DEF", "Tottenham", 25, 12, 0], ["Mikel Merino", "MID", "Arsenal", 29, 35, 0], ["Pedri", "MID", "Barcelona", 23, 35, 1], ["Fabián Ruiz", "MID", "Paris SG", 30, 35, 0], ["Martín Zubimendi", "MID", "Arsenal", 27, 18, 0], ["Gavi", "MID", "Barcelona", 22, 30, 0], ["Rodri", "MID", "Manchester City", 29, 60, 1], ["Álex Baena", "MID", "Atlético Madrid", 24, 10, 0], ["Mikel Oyarzabal", "FWD", "Real Sociedad", 29, 40, 0], ["Dani Olmo", "FWD", "Barcelona", 28, 45, 0], ["Nico Williams", "FWD", "Athletic Club", 23, 35, 1], ["Ferran Torres", "FWD", "Barcelona", 26, 50, 0], ["Yéremy Pino", "FWD", "Crystal Palace", 23, 12, 0], ["Lamine Yamal", "FWD", "Barcelona", 18, 25, 1]]
    },
    "Uruguay": {
      "coach": "Marcelo Bielsa",
      "f": "4-3-3",
      "p": [["Sergio Rochet", "GK", "Internacional", 33, 35, 0], ["Fernando Muslera", "GK", "Estudiantes", 39, 134, 0], ["Santiago Mele", "GK", "Monterrey", 28, 2, 0], ["Guillermo Varela", "DEF", "Flamengo", 33, 20, 0], ["Ronald Araújo", "DEF", "Barcelona", 27, 40, 1], ["José María Giménez", "DEF", "Atlético Madrid", 31, 99, 1], ["Santiago Bueno", "DEF", "Wolves", 27, 8, 0], ["Sebastián Cáceres", "DEF", "América", 26, 12, 0], ["Mathías Olivera", "DEF", "Napoli", 28, 25, 0], ["Matías Viña", "DEF", "River Plate", 28, 35, 0], ["Joaquín Piquerez", "DEF", "Palmeiras", 27, 20, 0], ["Manuel Ugarte", "MID", "Manchester United", 25, 35, 1], ["Rodrigo Bentancur", "MID", "Tottenham", 28, 55, 0], ["Federico Valverde", "MID", "Real Madrid", 27, 70, 1], ["Giorgian de Arrascaeta", "MID", "Flamengo", 32, 55, 1], ["Nicolás de la Cruz", "MID", "Flamengo", 29, 40, 0], ["Emiliano Martínez", "MID", "Palmeiras", 26, 8, 0], ["Facundo Pellistri", "MID", "Panathinaikos", 24, 25, 0], ["Maximiliano Araújo", "MID", "Sporting CP", 26, 15, 0], ["Darwin Núñez", "FWD", "Al-Hilal", 26, 40, 1], ["Rodrigo Aguirre", "FWD", "Tigres", 31, 15, 0], ["Federico Viñas", "FWD", "Real Oviedo", 27, 10, 0], ["Brian Rodríguez", "FWD", "América", 26, 25, 0], ["Agustín Canobbio", "FWD", "Fluminense", 27, 12, 0]]
    },
    "Cape Verde": {
      "coach": "Bubista",
      "f": "4-3-3",
      "p": [["Vozinha", "GK", "Chaves", 39, 50, 0], ["Márcio Rosa", "GK", "Montana", 29, 3, 0], ["CJ dos Santos", "GK", "San Diego FC", 25, 2, 0], ["Steven Moreira", "DEF", "Columbus Crew", 31, 20, 0], ["Wagner Pina", "DEF", "Trabzonspor", 24, 18, 0], ["João Paulo", "DEF", "FCSB", 29, 15, 0], ["Sidny Lopes Cabral", "DEF", "Benfica", 21, 6, 0], ["Logan Costa", "DEF", "Villarreal", 26, 20, 1], ["Roberto Lopes", "DEF", "Shamrock Rovers", 33, 40, 0], ["Kelvin Pires", "DEF", "SJK Seinäjoki", 24, 5, 0], ["Stopira", "DEF", "Torreense", 37, 78, 0], ["Diney", "DEF", "Al Bataeh", 31, 25, 0], ["Jamiro Monteiro", "MID", "PEC Zwolle", 32, 35, 0], ["Telmo Arcanjo", "MID", "Vitória SC", 24, 15, 0], ["Yannick Semedo", "MID", "Farense", 24, 8, 0], ["Laros Duarte", "MID", "Puskás Akadémia", 28, 20, 0], ["Deroy Duarte", "MID", "Ludogorets", 26, 30, 1], ["Kevin Pina", "MID", "Krasnodar", 27, 22, 0], ["Ryan Mendes", "FWD", "Iğdır FK", 36, 94, 1], ["Willy Semedo", "FWD", "Omonia", 33, 30, 0], ["Garry Rodrigues", "FWD", "Apollon Limassol", 35, 45, 0], ["Jovane Cabral", "FWD", "Estrela", 28, 35, 0], ["Dailon Livramento", "FWD", "Casa Pia", 24, 20, 1], ["Hélio Varela", "FWD", "Maccabi Tel Aviv", 33, 30, 0]]
    },
    "Saudi Arabia": {
      "coach": "Georgios Donis",
      "f": "4-2-3-1",
      "p": [["Nawaf Al-Aqidi", "GK", "Al-Nassr", 25, 10, 0], ["Mohammed Al-Owais", "GK", "Al-Ula", 34, 60, 0], ["Ahmed Al-Kassar", "GK", "Al-Qadsiah", 29, 2, 0], ["Ali Majrashi", "DEF", "Al-Ahli", 29, 15, 0], ["Ali Lajami", "DEF", "Al-Hilal", 28, 25, 0], ["Abdulelah Al-Amri", "DEF", "Al-Nassr", 28, 40, 0], ["Hassan Al-Tambakti", "DEF", "Al-Hilal", 26, 35, 1], ["Saud Abdulhamid", "DEF", "RC Lens", 26, 45, 1], ["Nawaf Boushal", "DEF", "Al-Nassr", 25, 8, 0], ["Hassan Kadesh", "DEF", "Al-Ittihad", 30, 20, 0], ["Moteb Al-Harbi", "DEF", "Al-Hilal", 24, 10, 0], ["Nasser Al-Dawsari", "MID", "Al-Hilal", 27, 30, 0], ["Musab Al-Juwayr", "MID", "Al-Qadsiah", 22, 15, 0], ["Ayman Yahya", "MID", "Al-Nassr", 24, 18, 0], ["Salem Al-Dawsari", "MID", "Al-Hilal", 34, 112, 1], ["Abdullah Al-Khaibari", "MID", "Al-Nassr", 29, 35, 0], ["Mohammed Kanno", "MID", "Al-Hilal", 31, 55, 0], ["Sultan Mandash", "MID", "Al-Hilal", 24, 10, 0], ["Firas Al-Buraikan", "FWD", "Al-Ahli", 26, 50, 1], ["Saleh Al-Shehri", "FWD", "Al-Ittihad", 32, 45, 0], ["Khalid Al-Ghannam", "FWD", "Al-Ettifaq", 25, 15, 0], ["Abdullah Al-Hamdan", "FWD", "Al-Nassr", 26, 30, 0]]
    },
    "France": {
      "coach": "Didier Deschamps",
      "f": "4-3-3",
      "p": [["Mike Maignan", "GK", "Milan", 30, 33, 1], ["Brice Samba", "GK", "Rennes", 32, 7, 0], ["Robin Risser", "GK", "Lens", 22, 0, 0], ["Jules Koundé", "DEF", "Barcelona", 27, 48, 0], ["Malo Gusto", "DEF", "Chelsea", 23, 8, 0], ["William Saliba", "DEF", "Arsenal", 25, 28, 1], ["Dayot Upamecano", "DEF", "Bayern Munich", 27, 38, 0], ["Ibrahima Konaté", "DEF", "Liverpool", 27, 30, 0], ["Lucas Hernández", "DEF", "Paris SG", 30, 40, 0], ["Theo Hernández", "DEF", "Al-Hilal", 28, 40, 0], ["Lucas Digne", "DEF", "Aston Villa", 32, 58, 0], ["Maxence Lacroix", "DEF", "Crystal Palace", 26, 4, 0], ["Aurélien Tchouaméni", "MID", "Real Madrid", 26, 45, 1], ["Adrien Rabiot", "MID", "Milan", 31, 55, 0], ["Manu Koné", "MID", "Roma", 25, 12, 0], ["Warren Zaïre-Emery", "MID", "Paris SG", 20, 12, 0], ["N'Golo Kanté", "MID", "Fenerbahçe", 35, 62, 0], ["Rayan Cherki", "MID", "Manchester City", 22, 8, 0], ["Maghnes Akliouche", "MID", "Monaco", 24, 3, 0], ["Kylian Mbappé", "FWD", "Real Madrid", 27, 98, 1], ["Ousmane Dembélé", "FWD", "Paris SG", 29, 58, 1], ["Michael Olise", "FWD", "Bayern Munich", 24, 18, 1], ["Marcus Thuram", "FWD", "Inter Milan", 28, 35, 0], ["Bradley Barcola", "FWD", "Paris SG", 23, 15, 0], ["Désiré Doué", "FWD", "Paris SG", 21, 8, 0]]
    },
    "Norway": {
      "coach": "Ståle Solbakken",
      "f": "4-3-3",
      "p": [["Ørjan Nyland", "GK", "Sevilla", 35, 45, 0], ["Egil Selvik", "GK", "Watford", 33, 3, 0], ["Sander Tangvik", "GK", "Hamburger SV", 25, 1, 0], ["Julian Ryerson", "DEF", "Borussia Dortmund", 28, 35, 0], ["Marcus Holmgren Pedersen", "DEF", "Torino", 25, 20, 0], ["David Møller Wolfe", "DEF", "Wolves", 23, 12, 0], ["Fredrik Bjørkan", "DEF", "Bodø/Glimt", 27, 15, 0], ["Kristoffer Ajer", "DEF", "Brentford", 28, 45, 0], ["Torbjørn Heggem", "DEF", "Bologna", 26, 8, 0], ["Leo Skiri Østigård", "DEF", "Genoa", 26, 35, 0], ["Sondre Langås", "DEF", "Derby County", 24, 3, 0], ["Martin Ødegaard", "MID", "Arsenal", 27, 60, 1], ["Sander Berge", "MID", "Fulham", 28, 50, 1], ["Fredrik Aursnes", "MID", "Benfica", 30, 35, 0], ["Patrick Berg", "MID", "Bodø/Glimt", 28, 30, 0], ["Kristian Thorstvedt", "MID", "Sassuolo", 27, 35, 0], ["Morten Thorsby", "MID", "Cremonese", 29, 40, 0], ["Thelo Aasgaard", "MID", "Rangers", 24, 10, 0], ["Erling Haaland", "FWD", "Manchester City", 25, 45, 1], ["Alexander Sørloth", "FWD", "Atlético Madrid", 30, 55, 1], ["Jørgen Strand Larsen", "FWD", "Crystal Palace", 26, 20, 0], ["Antonio Nusa", "FWD", "RB Leipzig", 21, 25, 1], ["Oscar Bobb", "FWD", "Fulham", 22, 15, 0], ["Andreas Schjelderup", "FWD", "Benfica", 21, 18, 0]]
    },
    "Senegal": {
      "coach": "Pape Thiaw",
      "f": "4-3-3",
      "p": [["Édouard Mendy", "GK", "Al-Ahli", 34, 45, 1], ["Yehvann Diouf", "GK", "Nice", 26, 6, 0], ["Mory Diaw", "GK", "Le Havre", 32, 4, 0], ["Kalidou Koulibaly", "DEF", "Al-Hilal", 35, 85, 1], ["Mamadou Sarr", "DEF", "Chelsea", 21, 4, 0], ["Abdoulaye Seck", "DEF", "Maccabi Haifa", 33, 20, 0], ["Ismail Jakobs", "DEF", "Galatasaray", 26, 20, 0], ["Krépin Diatta", "DEF", "Monaco", 27, 45, 0], ["Moussa Niakhaté", "DEF", "Lyon", 30, 15, 0], ["El Hadji Malick Diouf", "DEF", "West Ham", 21, 15, 0], ["Alpha Mendy", "DEF", "Nice", 22, 2, 0], ["Idrissa Gana Gueye", "MID", "Everton", 36, 120, 1], ["Pathé Ciss", "MID", "Rayo Vallecano", 31, 15, 0], ["Lamine Camara", "MID", "Monaco", 22, 18, 0], ["Pape Matar Sarr", "MID", "Tottenham", 23, 35, 0], ["Habib Diarra", "MID", "Sunderland", 22, 20, 0], ["Pape Gueye", "MID", "Villarreal", 27, 30, 0], ["Sadio Mané", "FWD", "Al-Nassr", 34, 115, 1], ["Nicolas Jackson", "FWD", "Bayern Munich", 25, 25, 1], ["Iliman Ndiaye", "FWD", "Everton", 26, 30, 1], ["Ismaïla Sarr", "FWD", "Crystal Palace", 28, 70, 1], ["Chérif Ndiaye", "FWD", "Samsunspor", 29, 10, 0], ["Bamba Dieng", "FWD", "Lorient", 26, 12, 0], ["Assane Diao", "FWD", "Como", 20, 3, 0]]
    },
    "Iraq": {
      "coach": "Graham Arnold",
      "f": "4-2-3-1",
      "p": [["Jalal Hassan", "GK", "Al-Zawraa", 31, 55, 1], ["Fahad Talib", "GK", "Al-Talaba", 30, 25, 0], ["Ahmed Basil", "GK", "Al-Shorta", 27, 5, 0], ["Rebin Sulaka", "DEF", "Port FC", 28, 30, 0], ["Hussein Ali", "DEF", "Pogoń Szczecin", 24, 25, 0], ["Zaid Tahseen", "DEF", "Pakhtakor", 26, 30, 0], ["Akam Hashim", "DEF", "Al-Zawraa", 25, 15, 0], ["Merchas Doski", "DEF", "Viktoria Plzeň", 25, 15, 0], ["Mustafa Sadoon", "DEF", "Al-Shorta", 26, 10, 0], ["Frans Putros", "DEF", "Persib", 32, 40, 0], ["Munaf Younis", "DEF", "Al-Shorta", 27, 12, 0], ["Ibrahim Bayesh", "MID", "Al-Dhafra", 28, 35, 0], ["Ahmed Qasem", "MID", "Nashville SC", 22, 20, 1], ["Zidane Iqbal", "MID", "FC Utrecht", 23, 20, 1], ["Amir Al-Ammari", "MID", "Cracovia", 28, 30, 0], ["Ali Jasim", "MID", "Al-Najma", 23, 25, 0], ["Kevin Yakob", "MID", "AGF", 26, 12, 0], ["Aimar Sher", "MID", "Sarpsborg 08", 25, 15, 0], ["Marko Farji", "MID", "Venezia", 23, 10, 0], ["Ali Al-Hamadi", "FWD", "Ipswich Town", 24, 25, 1], ["Mohanad Ali", "FWD", "Dibba FC", 26, 55, 1], ["Ali Yousif", "FWD", "Al-Talaba", 24, 12, 0], ["Aymen Hussein", "FWD", "Al-Karma", 30, 60, 0]]
    },
    "Argentina": {
      "coach": "Lionel Scaloni",
      "f": "4-3-3",
      "p": [["Emiliano Martínez", "GK", "Aston Villa", 33, 55, 1], ["Gerónimo Rulli", "GK", "Marseille", 34, 9, 0], ["Juan Musso", "GK", "Atlético Madrid", 32, 2, 0], ["Cristian Romero", "DEF", "Tottenham", 28, 55, 0], ["Lisandro Martínez", "DEF", "Manchester United", 28, 35, 0], ["Nicolás Otamendi", "DEF", "Benfica", 38, 125, 0], ["Nahuel Molina", "DEF", "Atlético Madrid", 28, 50, 0], ["Nicolás Tagliafico", "DEF", "Lyon", 33, 65, 0], ["Gonzalo Montiel", "DEF", "River Plate", 29, 35, 0], ["Leonardo Balerdi", "DEF", "Marseille", 27, 7, 0], ["Facundo Medina", "DEF", "Marseille", 27, 8, 0], ["Rodrigo De Paul", "MID", "Inter Miami", 32, 75, 1], ["Alexis Mac Allister", "MID", "Liverpool", 27, 45, 1], ["Enzo Fernández", "MID", "Chelsea", 25, 45, 0], ["Leandro Paredes", "MID", "Boca Juniors", 31, 70, 0], ["Giovani Lo Celso", "MID", "Real Betis", 30, 55, 0], ["Exequiel Palacios", "MID", "Bayer Leverkusen", 27, 35, 0], ["Thiago Almada", "MID", "Atlético Madrid", 25, 15, 0], ["Nico Paz", "MID", "Como", 21, 6, 0], ["Lionel Messi", "FWD", "Inter Miami", 38, 195, 1], ["Lautaro Martínez", "FWD", "Inter Milan", 28, 75, 1], ["Julián Álvarez", "FWD", "Atlético Madrid", 26, 50, 1], ["Nicolás González", "FWD", "Juventus", 28, 40, 0], ["Giuliano Simeone", "FWD", "Atlético Madrid", 23, 8, 0]]
    },
    "Austria": {
      "coach": "Ralf Rangnick",
      "f": "4-2-3-1",
      "p": [["Alexander Schlager", "GK", "Red Bull Salzburg", 30, 20, 0], ["Patrick Pentz", "GK", "Brøndby", 29, 15, 0], ["Florian Wiegele", "GK", "Viktoria Plzeň", 25, 1, 0], ["David Alaba", "DEF", "Real Madrid", 33, 111, 1], ["Kevin Danso", "DEF", "Tottenham", 27, 35, 1], ["David Affengruber", "DEF", "Elche", 26, 15, 0], ["Stefan Posch", "DEF", "Mainz 05", 29, 40, 0], ["Philipp Lienhart", "DEF", "SC Freiburg", 29, 25, 0], ["Phillipp Mwene", "DEF", "Mainz 05", 32, 20, 0], ["Alexander Prass", "DEF", "Hoffenheim", 25, 12, 0], ["Marco Friedl", "DEF", "Werder Bremen", 28, 25, 0], ["Konrad Laimer", "MID", "Bayern Munich", 29, 50, 1], ["Marcel Sabitzer", "MID", "Borussia Dortmund", 32, 85, 1], ["Christoph Baumgartner", "MID", "RB Leipzig", 26, 45, 1], ["Xaver Schlager", "MID", "RB Leipzig", 28, 45, 0], ["Nicolas Seiwald", "MID", "RB Leipzig", 24, 30, 0], ["Florian Grillitsch", "MID", "Braga", 30, 40, 0], ["Carney Chukwuemeka", "MID", "Borussia Dortmund", 22, 5, 0], ["Romano Schmid", "MID", "Werder Bremen", 26, 20, 0], ["Patrick Wimmer", "MID", "VfL Wolfsburg", 25, 15, 0], ["Paul Wanner", "MID", "PSV Eindhoven", 20, 5, 0], ["Marko Arnautović", "FWD", "Red Star Belgrade", 37, 132, 1], ["Michael Gregoritsch", "FWD", "FC Augsburg", 32, 50, 0], ["Sasa Kalajdzic", "FWD", "LASK", 28, 20, 0]]
    },
    "Algeria": {
      "coach": "Vladimir Petković",
      "f": "4-2-3-1",
      "p": [["Luca Zidane", "GK", "Granada", 28, 3, 0], ["Oussama Benbot", "GK", "USM Alger", 31, 4, 0], ["Melvin Mastil", "GK", "Stade Nyonnais", 25, 1, 0], ["Aïssa Mandi", "DEF", "Lille", 34, 116, 1], ["Ramy Bensebaini", "DEF", "Borussia Dortmund", 31, 50, 0], ["Rayan Aït-Nouri", "DEF", "Manchester City", 25, 30, 1], ["Rafik Belghali", "DEF", "Hellas Verona", 23, 8, 0], ["Jaouen Hadjam", "DEF", "Young Boys", 23, 12, 0], ["Zineddine Belaïd", "DEF", "JS Kabylie", 27, 6, 0], ["Mohamed Amine Tougai", "DEF", "Espérance", 26, 15, 0], ["Samir Chergui", "DEF", "Red Star FC", 27, 5, 0], ["Nabil Bentaleb", "MID", "Lille", 31, 45, 0], ["Hicham Boudaoui", "MID", "Nice", 26, 30, 0], ["Houssem Aouar", "MID", "Al-Ittihad", 27, 20, 1], ["Farès Chaïbi", "MID", "Eintracht Frankfurt", 25, 25, 0], ["Ibrahim Maza", "MID", "Bayer Leverkusen", 20, 10, 1], ["Ramiz Zerrouki", "MID", "FC Twente", 27, 25, 0], ["Yacine Titraoui", "MID", "Charleroi", 22, 6, 0], ["Riyad Mahrez", "FWD", "Al-Ahli", 35, 113, 1], ["Mohamed Amoura", "FWD", "VfL Wolfsburg", 25, 30, 1], ["Amine Gouiri", "FWD", "Marseille", 26, 30, 0], ["Anis Hadj Moussa", "FWD", "Feyenoord", 24, 12, 0], ["Adil Boulbina", "FWD", "Al-Duhail", 23, 8, 0], ["Farès Ghedjemis", "FWD", "Frosinone", 23, 6, 0]]
    },
    "Jordan": {
      "coach": "Jamal Sellami",
      "f": "3-5-2",
      "p": [["Yazeed Abulaila", "GK", "Al-Hussein", 33, 40, 0], ["Nour Bani Attiah", "GK", "Al-Faisaly", 27, 5, 0], ["Abdallah Al-Fakhouri", "GK", "Al-Wehdat", 29, 8, 0], ["Yazan Al-Arab", "DEF", "FC Seoul", 29, 45, 0], ["Mohammad Abualnadi", "DEF", "Corvinul Hunedoara", 30, 40, 0], ["Salim Obaid", "DEF", "Al-Hussein", 27, 12, 0], ["Mohammad Taha", "DEF", "Al-Hussein", 25, 10, 0], ["Saed Al-Rosan", "DEF", "Al-Hussein", 28, 20, 0], ["Ihsan Haddad", "DEF", "Al-Hussein", 32, 90, 1], ["Abdallah Nasib", "DEF", "Al-Zawraa", 28, 30, 0], ["Anas Badawi", "DEF", "Al-Faisaly", 26, 10, 0], ["Amer Jamous", "MID", "Al-Zawraa", 27, 20, 0], ["Noor Al-Rawabdeh", "MID", "Selangor FC", 26, 35, 1], ["Rajaei Ayed", "MID", "Al-Hussein", 29, 25, 0], ["Ibrahim Sa'deh", "MID", "Al-Karma", 27, 18, 0], ["Nizar Al-Rashdan", "MID", "Qatar SC", 28, 40, 0], ["Mohammad Al-Dawoud", "MID", "Al-Wehdat", 29, 30, 0], ["Mohannad Abu Taha", "MID", "Al-Quwa Al-Jawiya", 26, 15, 0], ["Mohammad Abu Zrayq", "FWD", "Raja Casablanca", 27, 25, 0], ["Ali Olwan", "FWD", "Al-Sailiya", 27, 40, 1], ["Mousa Al-Tamari", "FWD", "Rennes", 28, 65, 1], ["Odeh Al-Fakhouri", "FWD", "Pyramids FC", 27, 20, 0], ["Mahmoud Al-Mardi", "FWD", "Al-Hussein", 28, 25, 0], ["Ali Azaizeh", "FWD", "Al-Shabab", 28, 35, 0]]
    },
    "Portugal": {
      "coach": "Roberto Martínez",
      "f": "4-3-3",
      "p": [["Diogo Costa", "GK", "FC Porto", 26, 30, 0], ["Rui Silva", "GK", "Sporting CP", 32, 8, 0], ["José Sá", "GK", "Wolves", 33, 4, 0], ["Rúben Dias", "DEF", "Manchester City", 29, 70, 1], ["Gonçalo Inácio", "DEF", "Sporting CP", 24, 20, 0], ["João Cancelo", "DEF", "Barcelona", 31, 60, 0], ["Nuno Mendes", "DEF", "Paris SG", 23, 35, 1], ["Diogo Dalot", "DEF", "Manchester United", 27, 35, 0], ["Nélson Semedo", "DEF", "Fenerbahçe", 32, 30, 0], ["Tomás Araújo", "DEF", "Benfica", 23, 8, 0], ["Renato Veiga", "DEF", "Villarreal", 22, 10, 0], ["Vitinha", "MID", "Paris SG", 26, 35, 1], ["João Neves", "MID", "Paris SG", 21, 20, 0], ["Bruno Fernandes", "MID", "Manchester United", 31, 80, 1], ["Rúben Neves", "MID", "Al-Hilal", 29, 55, 0], ["Matheus Nunes", "MID", "Manchester City", 27, 25, 0], ["Bernardo Silva", "MID", "Manchester City", 31, 95, 1], ["João Félix", "FWD", "Al-Nassr", 26, 50, 0], ["Cristiano Ronaldo", "FWD", "Al-Nassr", 41, 222, 1], ["Francisco Trincão", "FWD", "Sporting CP", 26, 20, 0], ["Gonçalo Ramos", "FWD", "Paris SG", 24, 30, 0], ["Pedro Neto", "FWD", "Chelsea", 26, 30, 0], ["Francisco Conceição", "FWD", "Juventus", 23, 15, 0], ["Rafael Leão", "FWD", "Milan", 26, 35, 1]]
    },
    "Colombia": {
      "coach": "Néstor Lorenzo",
      "f": "4-2-3-1",
      "p": [["David Ospina", "GK", "Atlético Nacional", 37, 129, 0], ["Camilo Vargas", "GK", "Atlas", 37, 25, 0], ["Álvaro Montero", "GK", "Vélez Sarsfield", 30, 10, 0], ["Daniel Muñoz", "DEF", "Crystal Palace", 30, 50, 1], ["Davinson Sánchez", "DEF", "Galatasaray", 29, 70, 1], ["Jhon Lucumí", "DEF", "Bologna", 27, 35, 0], ["Johan Mojica", "DEF", "Mallorca", 33, 45, 0], ["Willer Ditta", "DEF", "Cruz Azul", 28, 20, 0], ["Santiago Arias", "DEF", "Independiente", 34, 60, 0], ["Déiver Machado", "DEF", "Nantes", 32, 20, 0], ["Yerry Mina", "DEF", "Cagliari", 31, 45, 0], ["James Rodríguez", "MID", "Minnesota United", 34, 111, 1], ["Jefferson Lerma", "MID", "Crystal Palace", 31, 55, 1], ["Richard Ríos", "MID", "Benfica", 25, 20, 1], ["Jhon Arias", "MID", "Palmeiras", 28, 40, 0], ["Jorge Carrascal", "MID", "Flamengo", 28, 20, 0], ["Juan Fernando Quintero", "MID", "River Plate", 33, 40, 0], ["Kevin Castaño", "MID", "River Plate", 25, 15, 0], ["Gustavo Puerta", "MID", "Racing Santander", 22, 8, 0], ["Luis Díaz", "FWD", "Bayern Munich", 29, 65, 1], ["Luis Suárez", "FWD", "Sporting CP", 28, 15, 0], ["Jhon Córdoba", "FWD", "Krasnodar", 33, 25, 0], ["Cucho Hernández", "FWD", "Real Betis", 27, 30, 0], ["Carlos Andrés Gómez", "FWD", "Vasco da Gama", 23, 5, 0]]
    },
    "DR Congo": {
      "coach": "Sébastien Desabre",
      "f": "3-5-2",
      "p": [["Lionel Mpasi", "GK", "Le Havre", 31, 20, 0], ["Timothy Fayulu", "GK", "FC Noah", 26, 12, 0], ["Matthieu Epolo", "GK", "Standard Liège", 21, 2, 0], ["Chancel Mbemba", "DEF", "Lille", 31, 107, 1], ["Aaron Wan-Bissaka", "DEF", "West Ham", 28, 5, 1], ["Axel Tuanzebe", "DEF", "Burnley", 28, 8, 0], ["Arthur Masuaku", "DEF", "Lens", 32, 40, 0], ["Gédéon Kalulu", "DEF", "Aris Limassol", 28, 15, 0], ["Joris Kayembe", "DEF", "Genk", 31, 25, 0], ["Dylan Batubinsika", "DEF", "AEL Larissa", 30, 30, 0], ["Steve Kapuadi", "DEF", "Widzew Łódź", 28, 10, 0], ["Meschak Elia", "MID", "Alanyaspor", 28, 40, 0], ["Samuel Moutoussamy", "MID", "Atromitos", 29, 30, 0], ["Edo Kayembe", "MID", "Watford", 27, 35, 0], ["Charles Pickel", "MID", "Espanyol", 28, 20, 0], ["Gaël Kakuta", "MID", "AEL Larissa", 34, 30, 0], ["Noah Sadiki", "MID", "Sunderland", 21, 8, 1], ["Nathanaël Mbuku", "MID", "Montpellier", 24, 12, 0], ["Ngal'ayel Mukau", "MID", "Lille", 21, 8, 0], ["Cédric Bakambu", "FWD", "Real Betis", 35, 70, 1], ["Théo Bongonda", "FWD", "Spartak Moscow", 30, 40, 0], ["Fiston Mayele", "FWD", "Pyramids FC", 31, 20, 0], ["Yoane Wissa", "FWD", "Newcastle", 29, 25, 1], ["Simon Banza", "FWD", "Al Jazira", 29, 25, 0]]
    },
    "Uzbekistan": {
      "coach": "Fabio Cannavaro",
      "f": "4-2-3-1",
      "p": [["Utkir Yusupov", "GK", "Navbahor", 35, 25, 0], ["Abduvohid Nematov", "GK", "Nasaf", 25, 5, 0], ["Botirali Ergashev", "GK", "Neftchi Fergana", 30, 10, 0], ["Abdukodir Khusanov", "DEF", "Manchester City", 22, 25, 1], ["Khojiakbar Alijonov", "DEF", "Pakhtakor", 29, 30, 0], ["Farrukh Sayfiev", "DEF", "Neftchi Fergana", 35, 40, 0], ["Rustam Ashurmatov", "DEF", "Esteghlal", 29, 40, 0], ["Sherzod Nasrullaev", "DEF", "Pakhtakor", 27, 20, 0], ["Umar Eshmurodov", "DEF", "Nasaf", 33, 30, 0], ["Abdulla Abdullaev", "DEF", "Dibba Al-Fujairah", 28, 15, 0], ["Jakhongir Urozov", "DEF", "Dinamo Samarqand", 22, 5, 0], ["Akmal Mozgovoy", "MID", "Pakhtakor", 27, 20, 0], ["Otabek Shukurov", "MID", "Baniyas", 29, 55, 0], ["Jamshid Iskanderov", "MID", "Neftchi Fergana", 32, 45, 0], ["Odiljon Hamrobekov", "MID", "Tractor", 30, 40, 0], ["Oston Urunov", "MID", "Persepolis", 25, 30, 0], ["Dostonbek Khamdamov", "MID", "Pakhtakor", 29, 40, 0], ["Abbosbek Fayzullaev", "MID", "Başakşehir", 22, 30, 1], ["Azizjon Ganiev", "MID", "Al Bataeh", 28, 25, 0], ["Ruslanbek Jiyanov", "FWD", "Navbahor", 25, 15, 0], ["Eldor Shomurodov", "FWD", "Başakşehir", 30, 92, 1], ["Azizbek Amonov", "FWD", "Dinamo Samarqand", 28, 20, 0], ["Igor Sergeev", "FWD", "Persepolis", 33, 45, 0]]
    },
    "England": {
      "coach": "Thomas Tuchel",
      "f": "4-2-3-1",
      "p": [["Jordan Pickford", "GK", "Everton", 32, 80, 0], ["Dean Henderson", "GK", "Crystal Palace", 29, 5, 0], ["James Trafford", "GK", "Manchester City", 23, 2, 0], ["Reece James", "DEF", "Chelsea", 26, 25, 0], ["Trevoh Chalobah", "DEF", "Chelsea", 26, 4, 0], ["Marc Guéhi", "DEF", "Manchester City", 25, 30, 1], ["Ezri Konsa", "DEF", "Aston Villa", 28, 15, 0], ["John Stones", "DEF", "Manchester City", 31, 75, 0], ["Jarell Quansah", "DEF", "Bayer Leverkusen", 23, 3, 0], ["Nico O'Reilly", "DEF", "Manchester City", 21, 3, 0], ["Dan Burn", "DEF", "Newcastle", 34, 6, 0], ["Djed Spence", "DEF", "Tottenham", 25, 5, 0], ["Declan Rice", "MID", "Arsenal", 27, 70, 1], ["Elliot Anderson", "MID", "Nottingham Forest", 23, 6, 0], ["Jude Bellingham", "MID", "Real Madrid", 22, 45, 1], ["Jordan Henderson", "MID", "Brentford", 35, 85, 0], ["Morgan Rogers", "MID", "Aston Villa", 23, 6, 0], ["Kobbie Mainoo", "MID", "Manchester United", 21, 12, 0], ["Eberechi Eze", "MID", "Arsenal", 28, 12, 0], ["Harry Kane", "FWD", "Bayern Munich", 32, 110, 1], ["Bukayo Saka", "FWD", "Arsenal", 24, 50, 1], ["Ollie Watkins", "FWD", "Aston Villa", 30, 20, 0], ["Marcus Rashford", "FWD", "Barcelona", 28, 65, 0], ["Anthony Gordon", "FWD", "Newcastle", 25, 10, 0], ["Noni Madueke", "FWD", "Arsenal", 24, 7, 0]]
    },
    "Croatia": {
      "coach": "Zlatko Dalić",
      "f": "4-3-3",
      "p": [["Dominik Livaković", "GK", "Dinamo Zagreb", 31, 60, 0], ["Dominik Kotarski", "GK", "Copenhagen", 26, 2, 0], ["Ivor Pandur", "GK", "Hull City", 26, 3, 0], ["Joško Gvardiol", "DEF", "Manchester City", 24, 40, 1], ["Duje Ćaleta-Car", "DEF", "Real Sociedad", 29, 25, 0], ["Josip Šutalo", "DEF", "Ajax", 26, 25, 0], ["Josip Stanišić", "DEF", "Bayern Munich", 26, 20, 0], ["Marin Pongračić", "DEF", "Fiorentina", 28, 12, 0], ["Martin Erlić", "DEF", "Midtjylland", 28, 8, 0], ["Luka Vušković", "DEF", "Hamburg", 19, 3, 0], ["Luka Modrić", "MID", "Milan", 40, 190, 1], ["Mateo Kovačić", "MID", "Manchester City", 32, 105, 1], ["Mario Pašalić", "MID", "Atalanta", 31, 45, 0], ["Nikola Vlašić", "MID", "Torino", 28, 50, 0], ["Luka Sučić", "MID", "Real Sociedad", 23, 20, 0], ["Martin Baturina", "MID", "Como", 23, 10, 0], ["Kristijan Jakić", "MID", "Augsburg", 28, 8, 0], ["Petar Sučić", "MID", "Inter Milan", 22, 8, 0], ["Nikola Moro", "MID", "Bologna", 27, 5, 0], ["Ivan Perišić", "FWD", "PSV Eindhoven", 37, 145, 1], ["Andrej Kramarić", "FWD", "Hoffenheim", 34, 105, 0], ["Ante Budimir", "FWD", "Osasuna", 34, 35, 0], ["Petar Musa", "FWD", "FC Dallas", 28, 20, 0], ["Marco Pašalić", "FWD", "Orlando City", 25, 6, 0]]
    },
    "Ghana": {
      "coach": "Carlos Queiroz",
      "f": "4-2-3-1",
      "p": [["Lawrence Ati-Zigi", "GK", "St. Gallen", 29, 30, 0], ["Joseph Anang", "GK", "St. Patrick's", 25, 3, 0], ["Benjamin Asare", "GK", "Hearts of Oak", 28, 2, 0], ["Alidu Seidu", "DEF", "Rennes", 26, 25, 0], ["Caleb Yirenkyi", "DEF", "Nordsjælland", 20, 4, 0], ["Jonas Adjetey", "DEF", "Basel", 22, 6, 0], ["Abdul Mumin", "DEF", "Rayo Vallecano", 27, 25, 0], ["Gideon Mensah", "DEF", "Auxerre", 27, 30, 0], ["Baba Rahman", "DEF", "PAOK", 31, 55, 0], ["Jerome Opoku", "DEF", "Başakşehir", 27, 10, 0], ["Christopher Bonsu Baah", "DEF", "Genk", 21, 5, 0], ["Thomas Partey", "MID", "Villarreal", 33, 55, 1], ["Kwasi Sibo", "MID", "Elche", 27, 6, 0], ["Elisha Owusu", "MID", "Auxerre", 28, 10, 0], ["Fatawu Issahaku", "MID", "Leicester City", 22, 20, 1], ["Kamaldeen Sulemana", "MID", "Atalanta", 24, 25, 0], ["Ernest Nuamah", "MID", "Lyon", 22, 15, 0], ["Jordan Ayew", "FWD", "Leicester City", 34, 100, 1], ["Brandon Thomas-Asante", "FWD", "Coventry City", 27, 8, 0], ["Antoine Semenyo", "FWD", "Bournemouth", 26, 20, 1], ["Iñaki Williams", "FWD", "Athletic Bilbao", 31, 25, 0], ["Kojo Oppong Peprah", "FWD", "Nordsjælland", 21, 2, 0], ["Prince Kwabena Adu", "FWD", "AS Trenčín", 22, 2, 0], ["Marvin Senaya", "DEF", "Strasbourg", 23, 3, 0]]
    },
    "Panama": {
      "coach": "Thomas Christiansen",
      "f": "4-4-2",
      "p": [["Luis Mejía", "GK", "Club Nacional", 35, 50, 0], ["César Samudio", "GK", "Marathón", 31, 15, 0], ["Orlando Mosquera", "GK", "Al-Fayha", 31, 20, 0], ["César Blackman", "DEF", "Slovan Bratislava", 27, 30, 0], ["José Córdoba", "DEF", "Norwich City", 24, 25, 1], ["Fidel Escobar", "DEF", "Saprissa", 30, 55, 0], ["Edgardo Fariña", "DEF", "Pari NN", 26, 10, 0], ["Jiovany Ramos", "DEF", "Puerto Cabello", 26, 15, 0], ["Eric Davis", "DEF", "Plaza Amador", 35, 80, 0], ["Andrés Andrade", "DEF", "LASK", 28, 40, 0], ["Amir Murillo", "DEF", "Beşiktaş", 30, 65, 1], ["Roderick Miller", "DEF", "Turan Tovuz", 33, 50, 0], ["Cristian Martínez", "MID", "Hapoel K. Shmona", 29, 50, 0], ["José Luis Rodríguez", "MID", "FC Juárez", 27, 40, 0], ["Adalberto Carrasquilla", "MID", "Pumas UNAM", 27, 50, 1], ["Yoel Bárcenas", "MID", "Mazatlán", 32, 60, 0], ["Alberto Quintero", "MID", "Plaza Amador", 38, 110, 0], ["Aníbal Godoy", "MID", "San Diego FC", 36, 157, 1], ["César Yanis", "MID", "Cobresal", 28, 15, 0], ["Carlos Harvey", "MID", "Minnesota United", 25, 20, 0], ["Ismael Díaz", "FWD", "Club León", 28, 40, 1], ["Tomás Rodríguez", "FWD", "Saprissa", 24, 12, 0], ["José Fajardo", "FWD", "U. Católica", 29, 30, 0], ["Cecilio Waterman", "FWD", "U. de Concepción", 34, 35, 0]]
    }
  },
  "flags": {
    "Mexico": "🇲🇽",
    "South Korea": "🇰🇷",
    "Czech Republic": "🇨🇿",
    "South Africa": "🇿🇦",
    "Switzerland": "🇨🇭",
    "Canada": "🇨🇦",
    "Bosnia and Herzegovina": "🇧🇦",
    "Qatar": "🇶🇦",
    "Brazil": "🇧🇷",
    "Morocco": "🇲🇦",
    "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    "Haiti": "🇭🇹",
    "United States": "🇺🇸",
    "Australia": "🇦🇺",
    "Paraguay": "🇵🇾",
    "Türkiye": "🇹🇷",
    "Germany": "🇩🇪",
    "Ivory Coast": "🇨🇮",
    "Ecuador": "🇪🇨",
    "Curaçao": "🇨🇼",
    "Netherlands": "🇳🇱",
    "Japan": "🇯🇵",
    "Sweden": "🇸🇪",
    "Tunisia": "🇹🇳",
    "Belgium": "🇧🇪",
    "Egypt": "🇪🇬",
    "Iran": "🇮🇷",
    "New Zealand": "🇳🇿",
    "Spain": "🇪🇸",
    "Uruguay": "🇺🇾",
    "Cape Verde": "🇨🇻",
    "Saudi Arabia": "🇸🇦",
    "France": "🇫🇷",
    "Norway": "🇳🇴",
    "Senegal": "🇸🇳",
    "Iraq": "🇮🇶",
    "Argentina": "🇦🇷",
    "Austria": "🇦🇹",
    "Algeria": "🇩🇿",
    "Jordan": "🇯🇴",
    "Portugal": "🇵🇹",
    "Colombia": "🇨🇴",
    "DR Congo": "🇨🇩",
    "Uzbekistan": "🇺🇿",
    "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    "Croatia": "🇭🇷",
    "Ghana": "🇬🇭",
    "Panama": "🇵🇦"
  }
};
window.WCDATA.hosts = {
  "United States": 1,
  "Canada": 1,
  "Mexico": 1
};
window.WCDATA.posLabel = {
  GK: "Goalkeepers",
  DEF: "Defenders",
  MID: "Midfielders",
  FWD: "Forwards"
};
window.WCDATA.flag = function (t) {
  return window.WCDATA.flags[t] || "⚽";
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/visualizer/data.js", error: String((e && e.message) || e) }); }

// ui_kits/visualizer/kit.jsx
try { (() => {
/* WC26 Visualizer UI kit — Groups rail, Team detail, Match preview.
   Composes the design-system components against the real model. */
const DS = window.WC26VisualizerDesignSystem_b4eaf5;
const {
  GroupStandings,
  MatchRow,
  PlayerCard,
  StatCard,
  RatingRing,
  FactorBar,
  ProbabilityBar,
  FormPills,
  SectionHeading,
  Tag,
  BarMeter
} = DS;
const D = window.WCDATA;
const M = window.WCMODEL;
const flag = t => D.flag(t);
const SHORT = {
  "Bosnia and Herzegovina": "Bosnia",
  "United States": "USA",
  "Czech Republic": "Czechia",
  "South Korea": "S. Korea",
  "South Africa": "S. Africa",
  "Saudi Arabia": "Saudi",
  "New Zealand": "N. Zealand"
};
const shrt = t => SHORT[t] || t;
const fmtDate = s => {
  const d = new Date(s + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};
const ord = i => i === 1 ? 'st' : i === 2 ? 'nd' : i === 3 ? 'rd' : 'th';

/* ---------- empty state ---------- */
function EmptyDetail() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      placeItems: 'center',
      height: '100%',
      color: 'var(--text-faint)',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '46px',
      marginBottom: '10px'
    }
  }, "\uD83D\uDC46"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: '18px',
      color: 'var(--accent-2)'
    }
  }, "Pick a team or a fixture"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '8px',
      maxWidth: '340px',
      fontSize: 'var(--fs-sm)',
      lineHeight: 1.6
    }
  }, "Click any team to see its full squad, form and win probability \u2014 or tap a fixture for a full match preview with model odds.")));
}

/* ---------- Groups rail ---------- */
function GroupsRail({
  onTeam,
  onMatch
}) {
  const legend = [['var(--status-through)', '1st — through'], ['var(--status-runner)', '2nd — through'], ['var(--status-playoff)', '3rd — playoff hunt'], ['var(--status-out)', 'eliminated']];
  const fxByDate = {};
  D.fixtures.forEach(f => {
    (fxByDate[f.date] = fxByDate[f.date] || []).push(f);
  });
  const dates = Object.keys(fxByDate).sort().slice(0, 6);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '13px',
      flexWrap: 'wrap',
      fontSize: 'var(--fs-2xs)',
      color: 'var(--text-muted)',
      margin: '2px 2px 12px'
    }
  }, legend.map(([c, t]) => /*#__PURE__*/React.createElement("span", {
    key: t,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      width: '9px',
      height: '9px',
      borderRadius: '3px',
      background: c,
      display: 'inline-block'
    }
  }), t))), Object.keys(D.groups).map(g => {
    const teams = M.orderGroup(g).map(r => ({
      ...r,
      flag: flag(r.team)
    }));
    return /*#__PURE__*/React.createElement(GroupStandings, {
      key: g,
      group: g,
      teams: teams,
      onSelect: onTeam
    });
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-xs)',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: 'var(--text-faint)',
      margin: '16px 4px 8px',
      fontWeight: 'var(--fw-bold)'
    }
  }, "\u23F1 Upcoming fixtures \u2014 tap to preview"), dates.map(dt => fxByDate[dt].map((f, i) => /*#__PURE__*/React.createElement(MatchRow, {
    key: dt + i,
    date: fmtDate(dt),
    homeFlag: flag(f.home),
    home: shrt(f.home),
    awayFlag: flag(f.away),
    away: shrt(f.away),
    right: /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--accent-2)',
        fontWeight: 700,
        fontSize: 'var(--fs-2xs)'
      }
    }, "PREVIEW \u2192"),
    onClick: () => onMatch(f.home, f.away)
  }))));
}

/* ---------- Team detail ---------- */
function TeamDetail({
  team,
  onTeam,
  onMatch
}) {
  const row = M.teamRow[team],
    g = M.teamGroup[team];
  const sq = D.squads[team] || {
    p: [],
    coach: '',
    f: ''
  };
  const form = M.teamForm(team);
  const rating = M.ratingIndex(team);
  const fb = M.factorBars(team);
  const order = M.orderGroup(g);
  const posn = order.findIndex(r => r.team === team) + 1;
  const gd = M.gd(row);
  const statusTag = row.status === 'qualified' ? /*#__PURE__*/React.createElement(Tag, {
    tone: "qualified",
    style: {
      fontSize: 'var(--fs-xs)',
      padding: '3px 8px'
    }
  }, "QUALIFIED \u2713") : row.status === 'eliminated' ? /*#__PURE__*/React.createElement(Tag, {
    tone: "out",
    style: {
      fontSize: 'var(--fs-xs)',
      padding: '3px 8px'
    }
  }, "ELIMINATED") : /*#__PURE__*/React.createElement(Tag, {
    tone: "pill"
  }, posn, ord(posn), " in Group ", g);

  // team's matches (played + upcoming)
  const played = D.results.filter(m => m.home === team || m.away === team).map(m => ({
    ...m,
    played: true
  }));
  const upcoming = D.fixtures.filter(m => m.home === team || m.away === team).map(m => ({
    ...m,
    played: false
  }));
  const matches = [...played, ...upcoming].sort((a, b) => a.date.localeCompare(b.date));
  const byPos = {
    GK: [],
    DEF: [],
    MID: [],
    FWD: []
  };
  sq.p.forEach(p => byPos[p[1]] && byPos[p[1]].push(p));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '18px',
      marginBottom: '18px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '54px',
      lineHeight: 1
    }
  }, flag(team)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--fs-hero)',
      fontWeight: 800,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      flexWrap: 'wrap'
    }
  }, team, " ", statusTag), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-muted)',
      fontSize: 'var(--fs-sm)',
      marginTop: '3px'
    }
  }, "Group ", g, " \xB7 Coach ", sq.coach || '—', " \xB7 ", sq.f || '', " \xB7 ", sq.p.length, "-man squad"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))',
      gap: '10px',
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    label: "FIFA World Rank",
    value: `#${row.rank}`
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Ranking Points",
    value: Math.round(row.pts)
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Group Record",
    value: `${row.W}-${row.D}-${row.L}`,
    unit: " W-D-L"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Goals",
    value: row.GF,
    unit: `:${row.GA}`
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Goal Diff",
    value: `${gd > 0 ? '+' : ''}${gd}`
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Points",
    value: row.Pts,
    accent: "var(--accent)"
  })), /*#__PURE__*/React.createElement(SectionHeading, {
    trailing: `${rating}/99`
  }, "Model rating \u2014 composite strength"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '18px',
      background: 'var(--surface-panel)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)',
      padding: '14px 16px'
    }
  }, /*#__PURE__*/React.createElement(RatingRing, {
    value: rating
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, Object.keys(M.FACTOR_LABEL).filter(k => k !== 'val' || Math.abs(fb.val) > 0.01).map(k => /*#__PURE__*/React.createElement(FactorBar, {
    key: k,
    label: M.FACTOR_LABEL[k],
    z: fb[k]
  })))), matches.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SectionHeading, null, "Matches \u2014 tap to preview"), matches.map((m, i) => {
    const home = m.home === team,
      opp = home ? m.away : m.home;
    let right;
    if (m.played) {
      const gf = home ? m.hs : m.as,
        ga = home ? m.as : m.hs,
        r = gf > ga ? 'W' : gf < ga ? 'L' : 'D';
      right = /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '7px'
        }
      }, /*#__PURE__*/React.createElement(FormPills, {
        results: [r],
        size: 20
      }), /*#__PURE__*/React.createElement("b", {
        style: {
          fontFamily: 'var(--font-mono)'
        }
      }, gf, "\u2013", ga));
    } else {
      const pr = M.matchProbs(team, opp);
      right = /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--accent)',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)'
        }
      }, Math.round(pr.h * 100), "% win");
    }
    return /*#__PURE__*/React.createElement(MatchRow, {
      key: i,
      date: fmtDate(m.date),
      homeFlag: home ? '' : flag(opp),
      home: home ? 'vs' : '@',
      awayFlag: home ? flag(opp) : '',
      away: shrt(opp),
      right: right,
      onClick: () => onMatch(m.home, m.away)
    });
  })), /*#__PURE__*/React.createElement(SectionHeading, null, "Full squad \u2014 \u2B50 = key player"), ['GK', 'DEF', 'MID', 'FWD'].map(pk => byPos[pk].length ? /*#__PURE__*/React.createElement("div", {
    key: pk,
    style: {
      marginBottom: '14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-xs)',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: 'var(--text-faint)',
      margin: '0 0 7px',
      fontWeight: 'var(--fw-bold)'
    }
  }, D.posLabel[pk], " \xB7 ", byPos[pk].length), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(186px,1fr))',
      gap: '8px'
    }
  }, byPos[pk].map((p, i) => {
    const [n, pos, club, age, caps, key] = p;
    return /*#__PURE__*/React.createElement(PlayerCard, {
      key: i,
      lead: age,
      name: n,
      club: club,
      caps: caps,
      isKey: !!key
    });
  }))) : null));
}
Object.assign(window, {
  EmptyDetail,
  GroupsRail,
  TeamDetail,
  flag,
  shrt,
  fmtDate,
  ord
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/visualizer/kit.jsx", error: String((e && e.message) || e) }); }

// ui_kits/visualizer/match.jsx
try { (() => {
/* WC26 Visualizer UI kit — Match preview. */
const DSm = window.WC26VisualizerDesignSystem_b4eaf5;
const {
  ProbabilityBar: PBar,
  FactorBar: FBar,
  PlayerCard: PCard,
  SectionHeading: SHead
} = DSm;
const Dm = window.WCDATA,
  Mm = window.WCMODEL;
function MatchSide({
  team,
  onClick
}) {
  const row = Mm.teamRow[team];
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      flex: 1,
      background: 'var(--surface-panel)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-2xl)',
      padding: '16px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'border-color var(--dur-base) var(--ease-out)'
    },
    onMouseEnter: e => e.currentTarget.style.borderColor = 'var(--accent-2)',
    onMouseLeave: e => e.currentTarget.style.borderColor = 'var(--border)'
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '40px'
    }
  }, window.flag(team)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: '16px',
      margin: '6px 0 2px'
    }
  }, team), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-xs)',
      color: 'var(--text-muted)',
      fontFamily: 'var(--font-mono)'
    }
  }, "FIFA #", row.rank, " \xB7 Rating ", Mm.ratingIndex(team)));
}
function CmpRow({
  label,
  vh,
  va,
  better
}) {
  const cell = (v, side) => /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontFamily: 'var(--font-mono)',
      fontVariantNumeric: 'tabular-nums',
      textAlign: side === 'h' ? 'right' : 'left',
      color: better === side ? side === 'h' ? 'var(--accent-2)' : 'var(--accent)' : 'var(--text-primary)'
    }
  }, v);
  return /*#__PURE__*/React.createElement(React.Fragment, null, cell(vh, 'h'), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      fontSize: 'var(--fs-2xs)',
      color: 'var(--text-faint)',
      textTransform: 'uppercase',
      letterSpacing: '0.04em'
    }
  }, label), cell(va, 'a'));
}
function MatchPreview({
  home,
  away,
  onTeam
}) {
  const pr = Mm.matchProbs(home, away);
  const hh = Math.round(pr.h * 100),
    dd = Math.round(pr.d * 100),
    aa = 100 - hh - dd;
  const rh = Mm.teamRow[home],
    ra = Mm.teamRow[away];
  const fbH = Mm.factorBars(home),
    fbA = Mm.factorBars(away);
  const ko = (() => {
    const f = Dm.fixtures.find(x => x.home === home && x.away === away || x.home === away && x.away === home);
    return f ? `Group ${f.group || '—'} · ${window.fmtDate(f.date)}` : '';
  })();
  const keyH = (Dm.squads[home]?.p || []).filter(p => p[5]).slice(0, 5);
  const keyA = (Dm.squads[away]?.p || []).filter(p => p[5]).slice(0, 5);
  const formH = Mm.teamForm(home).slice(-3).map(f => f.r);
  const formA = Mm.teamForm(away).slice(-3).map(f => f.r);
  const gdH = Mm.gd(rh),
    gdA = Mm.gd(ra);
  const {
    FormPills
  } = window.WC26VisualizerDesignSystem_b4eaf5;
  const keyList = (arr, team) => arr.length ? arr.map((p, i) => /*#__PURE__*/React.createElement(PCard, {
    key: i,
    lead: p[1],
    name: p[0],
    club: p[2],
    isKey: true,
    onClick: () => onTeam(team),
    style: {
      marginBottom: '6px'
    }
  })) : /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-faint)'
    }
  }, "\u2014");
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'stretch',
      gap: '14px',
      marginBottom: '18px'
    }
  }, /*#__PURE__*/React.createElement(MatchSide, {
    team: home,
    onClick: () => onTeam(home)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      placeItems: 'center',
      fontWeight: 800,
      color: 'var(--text-faint)',
      fontFamily: 'var(--font-display)',
      fontSize: '14px',
      padding: '0 4px'
    }
  }, /*#__PURE__*/React.createElement("div", null, "VS"), ko && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-micro)',
      color: 'var(--text-faint)',
      marginTop: '6px',
      maxWidth: '72px',
      textAlign: 'center',
      fontFamily: 'var(--font-ui)'
    }
  }, ko)), /*#__PURE__*/React.createElement(MatchSide, {
    team: away,
    onClick: () => onTeam(away)
  })), /*#__PURE__*/React.createElement(SHead, {
    tick: "var(--accent-2)"
  }, "Pre-match forecast"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr auto 1fr',
      gap: '12px',
      alignItems: 'center',
      background: 'var(--surface-panel)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)',
      padding: '12px 16px',
      marginBottom: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-display-num)',
      fontWeight: 800
    }
  }, pr.la.toFixed(2)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-micro)',
      color: 'var(--text-faint)',
      textTransform: 'uppercase',
      letterSpacing: '0.04em'
    }
  }, "xG ", window.shrt(home))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      fontSize: 'var(--fs-2xs)',
      color: 'var(--text-faint)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }
  }, "likeliest", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("b", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: '20px',
      color: 'var(--gold)',
      display: 'block',
      marginTop: '2px'
    }
  }, pr.score[0], "\u2013", pr.score[1])), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-display-num)',
      fontWeight: 800
    }
  }, pr.lb.toFixed(2)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-micro)',
      color: 'var(--text-faint)',
      textTransform: 'uppercase',
      letterSpacing: '0.04em'
    }
  }, "xG ", window.shrt(away)))), /*#__PURE__*/React.createElement(PBar, {
    home: hh,
    draw: dd,
    away: aa,
    homeLabel: `${window.shrt(home)} win`,
    awayLabel: `${window.shrt(away)} win`
  }), /*#__PURE__*/React.createElement(SHead, null, "Head to head"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr auto 1fr',
      gap: '6px',
      alignItems: 'center',
      marginBottom: '8px'
    }
  }, /*#__PURE__*/React.createElement(CmpRow, {
    label: "World rank",
    vh: `#${rh.rank}`,
    va: `#${ra.rank}`,
    better: rh.rank < ra.rank ? 'h' : 'a'
  }), /*#__PURE__*/React.createElement(CmpRow, {
    label: "Rating pts",
    vh: Math.round(rh.pts),
    va: Math.round(ra.pts),
    better: rh.pts > ra.pts ? 'h' : 'a'
  }), /*#__PURE__*/React.createElement(CmpRow, {
    label: "Group pts",
    vh: rh.Pts,
    va: ra.Pts,
    better: rh.Pts > ra.Pts ? 'h' : rh.Pts < ra.Pts ? 'a' : ''
  }), /*#__PURE__*/React.createElement(CmpRow, {
    label: "Goal diff",
    vh: `${gdH > 0 ? '+' : ''}${gdH}`,
    va: `${gdA > 0 ? '+' : ''}${gdA}`,
    better: gdH > gdA ? 'h' : gdH < gdA ? 'a' : ''
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement(FormPills, {
    results: formH,
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      fontSize: 'var(--fs-2xs)',
      color: 'var(--text-faint)'
    }
  }, "FORM"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FormPills, {
    results: formA,
    size: 18
  }))), /*#__PURE__*/React.createElement(SHead, null, "Rating factors \u2014 what drives the forecast"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '14px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: 'var(--fs-xs)',
      color: 'var(--text-muted)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      margin: '0 0 8px'
    }
  }, window.flag(home), " ", window.shrt(home), " \xB7 ", Mm.ratingIndex(home)), Object.keys(Mm.FACTOR_LABEL).filter(k => k !== 'val' || Math.abs(fbH.val) > 0.01).map(k => /*#__PURE__*/React.createElement(FBar, {
    key: k,
    label: Mm.FACTOR_LABEL[k],
    z: fbH[k]
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: 'var(--fs-xs)',
      color: 'var(--text-muted)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      margin: '0 0 8px'
    }
  }, window.flag(away), " ", window.shrt(away), " \xB7 ", Mm.ratingIndex(away)), Object.keys(Mm.FACTOR_LABEL).filter(k => k !== 'val' || Math.abs(fbA.val) > 0.01).map(k => /*#__PURE__*/React.createElement(FBar, {
    key: k,
    label: Mm.FACTOR_LABEL[k],
    z: fbA[k]
  })))), /*#__PURE__*/React.createElement(SHead, null, "Key players"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '14px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: 'var(--fs-xs)',
      color: 'var(--text-muted)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      margin: '0 0 8px'
    }
  }, window.flag(home), " ", window.shrt(home)), keyList(keyH, home)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: 'var(--fs-xs)',
      color: 'var(--text-muted)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      margin: '0 0 8px'
    }
  }, window.flag(away), " ", window.shrt(away)), keyList(keyA, away))));
}
window.MatchPreview = MatchPreview;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/visualizer/match.jsx", error: String((e && e.message) || e) }); }

// ui_kits/visualizer/model.js
try { (() => {
/* WC26 Visualizer UI kit — analytical model.
   Ported verbatim from the source app (composite-rating + Poisson + bracket sim).
   Reads window.WCDATA; exposes window.WCMODEL. */
(function () {
  const D = window.WCDATA;
  const HOSTS = D.hosts;
  const teamGroup = {},
    teamRow = {};
  Object.keys(D.groups).forEach(g => D.groups[g].forEach(r => {
    teamGroup[r.team] = g;
    teamRow[r.team] = r;
  }));
  let picks = {};

  /* ---- core strength + match model ---- */
  const WEIGHTS = {
    fifa: 0.45,
    val: 0.0,
    form: 0.15,
    att: 0.15,
    def: 0.15,
    mom: 0.10
  }; // composite rating mix
  const MATCH = {
    base: 1.30,
    gamma: 0.60,
    host: 0.15
  }; // Poisson goals model (tuned on 2022)
  let RAMP = 3; // games for tournament factors to reach full weight (small-sample guard)
  // Squad value defaults to 0 weight: the 2022 backtest found it redundant with FIFA (it dropped accuracy).
  // It's wired + tunable so you can dial it in; FIFA & value are anchors (full weight, never ramped).
  const FACTOR_LABEL = {
    fifa: "FIFA base",
    val: "Squad value",
    form: "Form",
    att: "Attack",
    def: "Defense",
    mom: "Momentum"
  };
  function wsum() {
    return WEIGHTS.fifa + WEIGHTS.form + WEIGHTS.att + WEIGHTS.def + WEIGHTS.mom || 1;
  }

  /* ===== Per-team component metrics (z-scored across all 48 teams) ===== */
  const M = {};
  let metricsReady = false;
  let _sc = {};
  const avg = a => a.reduce((x, y) => x + y, 0) / a.length;
  const sd = (a, m) => Math.sqrt(avg(a.map(x => (x - m) ** 2))) || 1;
  function zify(teams, raw) {
    const v = teams.map(t => M[t][raw]);
    const m = avg(v),
      s = sd(v, m);
    teams.forEach(t => M[t]['z_' + raw] = (M[t][raw] - m) / s);
  }
  function buildMetrics() {
    const teams = Object.keys(teamRow);
    teams.forEach(t => {
      const r = teamRow[t],
        P = Math.max(r.P, 1);
      M[t] = {
        fifa: r.pts,
        vlog: Math.log((D.marketValue || {})[t] || 1),
        gfpg: r.GF / P,
        gapg: r.GA / P,
        P: r.P
      };
    });
    // Attack/Defense: per-game goals, shrunk toward the field average (small sample)
    const muGF = avg(teams.map(t => M[t].gfpg)),
      muGA = avg(teams.map(t => M[t].gapg)),
      k0 = 1.2;
    teams.forEach(t => {
      const m = M[t],
        P = m.P || 1;
      m.att = (m.gfpg * P + muGF * k0) / (P + k0);
      m.gaShrunk = (m.gapg * P + muGA * k0) / (P + k0);
      m.defg = -m.gaShrunk;
    }); // defensive rating: higher = stingier
    zify(teams, 'fifa'); // needed before form (opponent weighting)
    zify(teams, 'vlog'); // squad market value (log-scaled) — an anchor like FIFA
    // Form: result quality, weighted by opponent strength (beating/drawing a good side counts more)
    teams.forEach(t => {
      const fm = teamForm(t);
      if (!fm.length) {
        M[t].form = 0;
        return;
      }
      M[t].form = avg(fm.map(g => {
        const base = g.r === 'W' ? 1 : g.r === 'D' ? 0.5 : 0;
        const oz = M[g.opp] ? M[g.opp].z_fifa : 0;
        const bonus = g.r === 'W' ? 0.30 * oz : g.r === 'D' ? 0.18 * oz : 0.10 * oz; // result vs strong opp = +, loss to strong = less bad
        return base + bonus;
      }));
    });
    // Momentum: trajectory of goal difference (latest match vs first)
    teams.forEach(t => {
      const fm = teamForm(t);
      if (fm.length < 2) {
        M[t].mom = 0;
        return;
      }
      const g = fm.map(x => x.gf - x.ga);
      M[t].mom = g[g.length - 1] - g[0];
    });
    zify(teams, 'att');
    zify(teams, 'defg');
    zify(teams, 'form');
    zify(teams, 'mom');
    metricsReady = true;
    _sc = {};
  }
  function strength(t) {
    if (!metricsReady) buildMetrics();
    if (_sc[t] != null) return _sc[t];
    const m = M[t];
    // Sample-size guard (backtested on 2022): tournament factors ramp from 0 to full weight over RAMP games,
    // so early-tournament noise can't swamp the FIFA anchor.
    const conf = Math.min((m.P || 0) / RAMP, 1);
    const wv = WEIGHTS.val || 0;
    const tw = WEIGHTS.form + WEIGHTS.att + WEIGHTS.def + WEIGHTS.mom;
    const anchor = WEIGHTS.fifa * m.z_fifa + wv * m.z_vlog; // FIFA + squad value: full weight, never ramped
    const num = anchor + conf * (WEIGHTS.form * m.z_form + WEIGHTS.att * m.z_att + WEIGHTS.def * m.z_defg + WEIGHTS.mom * m.z_mom);
    const den = WEIGHTS.fifa + wv + conf * tw || 1;
    return _sc[t] = num / den;
  }
  function factorBars(t) {
    if (!metricsReady) buildMetrics();
    const m = M[t];
    return {
      fifa: m.z_fifa,
      val: m.z_vlog,
      form: m.z_form,
      att: m.z_att,
      def: m.z_defg,
      mom: m.z_mom
    };
  }
  function ratingIndex(t) {
    return Math.max(1, Math.min(99, Math.round(50 + 18 * strength(t))));
  }

  /* ===== Match (goals) model: rating gap -> expected goals -> Poisson outcome ===== */
  const FACT = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800];
  const pois = (k, l) => Math.exp(-l) * Math.pow(l, k) / FACT[k];
  function expectedGoals(a, b) {
    const d = strength(a) - strength(b);
    let la = MATCH.base * Math.exp(MATCH.gamma * d / 2);
    let lb = MATCH.base * Math.exp(-MATCH.gamma * d / 2);
    if (HOSTS[a]) la += MATCH.host;
    if (HOSTS[b]) lb += MATCH.host; // host xG edge
    return [la, lb];
  }
  function matchProbs(a, b) {
    // {h,d,a, la,lb, score:[i,j]}
    const [la, lb] = expectedGoals(a, b);
    const MX = 8;
    const pa = [],
      pb = [];
    for (let i = 0; i <= MX; i++) {
      pa.push(pois(i, la));
      pb.push(pois(i, lb));
    }
    let h = 0,
      dr = 0,
      aw = 0,
      best = [0, 0, -1];
    for (let i = 0; i <= MX; i++) for (let j = 0; j <= MX; j++) {
      const p = pa[i] * pb[j];
      if (i > j) h += p;else if (i === j) dr += p;else aw += p;
      if (p > best[2]) best = [i, j, p];
    }
    return {
      h,
      d: dr,
      a: aw,
      la,
      lb,
      score: [best[0], best[1]]
    };
  }
  function koWin(a, b) {
    // P(a advances) — a drawn KO is settled by a strength-tilted shootout
    const pr = matchProbs(a, b);
    const pen = 1 / (1 + Math.exp(-1.1 * (strength(a) - strength(b))));
    return pr.h + pr.d * pen;
  }

  // Standings ordering: Pts, GD, GF, FIFA rank
  function gd(r) {
    return r.GF - r.GA;
  }
  function h2h(sub, g) {
    // mini-table among the tied teams only
    const names = new Set(sub.map(t => t.team)),
      st = {};
    sub.forEach(t => st[t.team] = {
      p: 0,
      gd: 0,
      gf: 0
    });
    D.results.forEach(m => {
      if (teamGroup[m.home] !== g || teamGroup[m.away] !== g) return;
      if (names.has(m.home) && names.has(m.away)) {
        const H = st[m.home],
          A = st[m.away];
        H.gf += m.hs;
        A.gf += m.as;
        H.gd += m.hs - m.as;
        A.gd += m.as - m.hs;
        if (m.hs > m.as) H.p += 3;else if (m.hs < m.as) A.p += 3;else {
          H.p++;
          A.p++;
        }
      }
    });
    return st;
  }
  function orderGroup(g) {
    // FIFA 2026 tiebreakers: points -> head-to-head (pts, GD, goals among tied) -> overall GD, goals -> FIFA rank
    const buckets = {};
    [...D.groups[g]].forEach(t => {
      (buckets[t.Pts] = buckets[t.Pts] || []).push(t);
    });
    const out = [];
    Object.keys(buckets).map(Number).sort((a, b) => b - a).forEach(p => {
      const grp = buckets[p];
      if (grp.length > 1) {
        const h = h2h(grp, g);
        grp.sort((x, y) => h[y.team].p - h[x.team].p || h[y.team].gd - h[x.team].gd || h[y.team].gf - h[x.team].gf || gd(y) - gd(x) || y.GF - x.GF || x.rank - y.rank);
      }
      out.push.apply(out, grp);
    });
    return out;
  }
  // Form from results (last matches chronological)
  function teamForm(t) {
    const ms = D.results.filter(m => m.home === t || m.away === t).sort((a, b) => a.date.localeCompare(b.date));
    return ms.map(m => {
      const home = m.home === t;
      const gf = home ? m.hs : m.as,
        ga = home ? m.as : m.hs;
      const opp = home ? m.away : m.home;
      const r = gf > ga ? 'W' : gf < ga ? 'L' : 'D';
      return {
        r,
        gf,
        ga,
        opp,
        home,
        date: m.date
      };
    });
  }
  function nextFixture(t) {
    return D.fixtures.find(f => f.home === t || f.away === t);
  }

  /* ---- knockout bracket structure + resolution ---- */
  const THIRD_TABLE = {
    "EFGHIJKL": "EJIFHGLK",
    "DFGHIJKL": "HGIDJFLK",
    "DEGHIJKL": "EJIDHGLK",
    "DEFHIJKL": "EJIDHFLK",
    "DEFGIJKL": "EGIDJFLK",
    "DEFGHJKL": "EGJDHFLK",
    "DEFGHIKL": "EGIDHFLK",
    "DEFGHIJL": "EGJDHFLI",
    "DEFGHIJK": "EGJDHFIK",
    "CFGHIJKL": "HGICJFLK",
    "CEGHIJKL": "EJICHGLK",
    "CEFHIJKL": "EJICHFLK",
    "CEFGIJKL": "EGICJFLK",
    "CEFGHJKL": "EGJCHFLK",
    "CEFGHIKL": "EGICHFLK",
    "CEFGHIJL": "EGJCHFLI",
    "CEFGHIJK": "EGJCHFIK",
    "CDGHIJKL": "HGICJDLK",
    "CDFHIJKL": "CJIDHFLK",
    "CDFGIJKL": "CGIDJFLK",
    "CDFGHJKL": "CGJDHFLK",
    "CDFGHIKL": "CGIDHFLK",
    "CDFGHIJL": "CGJDHFLI",
    "CDFGHIJK": "CGJDHFIK",
    "CDEHIJKL": "EJICHDLK",
    "CDEGIJKL": "EGICJDLK",
    "CDEGHJKL": "EGJCHDLK",
    "CDEGHIKL": "EGICHDLK",
    "CDEGHIJL": "EGJCHDLI",
    "CDEGHIJK": "EGJCHDIK",
    "CDEFIJKL": "CJEDIFLK",
    "CDEFHJKL": "CJEDHFLK",
    "CDEFHIKL": "CEIDHFLK",
    "CDEFHIJL": "CJEDHFLI",
    "CDEFHIJK": "CJEDHFIK",
    "CDEFGJKL": "CGEDJFLK",
    "CDEFGIKL": "CGEDIFLK",
    "CDEFGIJL": "CGEDJFLI",
    "CDEFGIJK": "CGEDJFIK",
    "CDEFGHKL": "CGEDHFLK",
    "CDEFGHJL": "CGJDHFLE",
    "CDEFGHJK": "CGJDHFEK",
    "CDEFGHIL": "CGEDHFLI",
    "CDEFGHIK": "CGEDHFIK",
    "CDEFGHIJ": "CGJDHFEI",
    "BFGHIJKL": "HJBFIGLK",
    "BEGHIJKL": "EJIBHGLK",
    "BEFHIJKL": "EJBFIHLK",
    "BEFGIJKL": "EJBFIGLK",
    "BEFGHJKL": "EJBFHGLK",
    "BEFGHIKL": "EGBFIHLK",
    "BEFGHIJL": "EJBFHGLI",
    "BEFGHIJK": "EJBFHGIK",
    "BDGHIJKL": "HJBDIGLK",
    "BDFHIJKL": "HJBDIFLK",
    "BDFGIJKL": "IGBDJFLK",
    "BDFGHJKL": "HGBDJFLK",
    "BDFGHIKL": "HGBDIFLK",
    "BDFGHIJL": "HGBDJFLI",
    "BDFGHIJK": "HGBDJFIK",
    "BDEHIJKL": "EJBDIHLK",
    "BDEGIJKL": "EJBDIGLK",
    "BDEGHJKL": "EJBDHGLK",
    "BDEGHIKL": "EGBDIHLK",
    "BDEGHIJL": "EJBDHGLI",
    "BDEGHIJK": "EJBDHGIK",
    "BDEFIJKL": "EJBDIFLK",
    "BDEFHJKL": "EJBDHFLK",
    "BDEFHIKL": "EIBDHFLK",
    "BDEFHIJL": "EJBDHFLI",
    "BDEFHIJK": "EJBDHFIK",
    "BDEFGJKL": "EGBDJFLK",
    "BDEFGIKL": "EGBDIFLK",
    "BDEFGIJL": "EGBDJFLI",
    "BDEFGIJK": "EGBDJFIK",
    "BDEFGHKL": "EGBDHFLK",
    "BDEFGHJL": "HGBDJFLE",
    "BDEFGHJK": "HGBDJFEK",
    "BDEFGHIL": "EGBDHFLI",
    "BDEFGHIK": "EGBDHFIK",
    "BDEFGHIJ": "HGBDJFEI",
    "BCGHIJKL": "HJBCIGLK",
    "BCFHIJKL": "HJBCIFLK",
    "BCFGIJKL": "IGBCJFLK",
    "BCFGHJKL": "HGBCJFLK",
    "BCFGHIKL": "HGBCIFLK",
    "BCFGHIJL": "HGBCJFLI",
    "BCFGHIJK": "HGBCJFIK",
    "BCEHIJKL": "EJBCIHLK",
    "BCEGIJKL": "EJBCIGLK",
    "BCEGHJKL": "EJBCHGLK",
    "BCEGHIKL": "EGBCIHLK",
    "BCEGHIJL": "EJBCHGLI",
    "BCEGHIJK": "EJBCHGIK",
    "BCEFIJKL": "EJBCIFLK",
    "BCEFHJKL": "EJBCHFLK",
    "BCEFHIKL": "EIBCHFLK",
    "BCEFHIJL": "EJBCHFLI",
    "BCEFHIJK": "EJBCHFIK",
    "BCEFGJKL": "EGBCJFLK",
    "BCEFGIKL": "EGBCIFLK",
    "BCEFGIJL": "EGBCJFLI",
    "BCEFGIJK": "EGBCJFIK",
    "BCEFGHKL": "EGBCHFLK",
    "BCEFGHJL": "HGBCJFLE",
    "BCEFGHJK": "HGBCJFEK",
    "BCEFGHIL": "EGBCHFLI",
    "BCEFGHIK": "EGBCHFIK",
    "BCEFGHIJ": "HGBCJFEI",
    "BCDHIJKL": "HJBCIDLK",
    "BCDGIJKL": "IGBCJDLK",
    "BCDGHJKL": "HGBCJDLK",
    "BCDGHIKL": "HGBCIDLK",
    "BCDGHIJL": "HGBCJDLI",
    "BCDGHIJK": "HGBCJDIK",
    "BCDFIJKL": "CJBDIFLK",
    "BCDFHJKL": "CJBDHFLK",
    "BCDFHIKL": "CIBDHFLK",
    "BCDFHIJL": "CJBDHFLI",
    "BCDFHIJK": "CJBDHFIK",
    "BCDFGJKL": "CGBDJFLK",
    "BCDFGIKL": "CGBDIFLK",
    "BCDFGIJL": "CGBDJFLI",
    "BCDFGIJK": "CGBDJFIK",
    "BCDFGHKL": "CGBDHFLK",
    "BCDFGHJL": "CGBDHFLJ",
    "BCDFGHJK": "HGBCJFDK",
    "BCDFGHIL": "CGBDHFLI",
    "BCDFGHIK": "CGBDHFIK",
    "BCDFGHIJ": "HGBCJFDI",
    "BCDEIJKL": "EJBCIDLK",
    "BCDEHJKL": "EJBCHDLK",
    "BCDEHIKL": "EIBCHDLK",
    "BCDEHIJL": "EJBCHDLI",
    "BCDEHIJK": "EJBCHDIK",
    "BCDEGJKL": "EGBCJDLK",
    "BCDEGIKL": "EGBCIDLK",
    "BCDEGIJL": "EGBCJDLI",
    "BCDEGIJK": "EGBCJDIK",
    "BCDEGHKL": "EGBCHDLK",
    "BCDEGHJL": "HGBCJDLE",
    "BCDEGHJK": "HGBCJDEK",
    "BCDEGHIL": "EGBCHDLI",
    "BCDEGHIK": "EGBCHDIK",
    "BCDEGHIJ": "HGBCJDEI",
    "BCDEFJKL": "CJBDEFLK",
    "BCDEFIKL": "CEBDIFLK",
    "BCDEFIJL": "CJBDEFLI",
    "BCDEFIJK": "CJBDEFIK",
    "BCDEFHKL": "CEBDHFLK",
    "BCDEFHJL": "CJBDHFLE",
    "BCDEFHJK": "CJBDHFEK",
    "BCDEFHIL": "CEBDHFLI",
    "BCDEFHIK": "CEBDHFIK",
    "BCDEFHIJ": "CJBDHFEI",
    "BCDEFGKL": "CGBDEFLK",
    "BCDEFGJL": "CGBDJFLE",
    "BCDEFGJK": "CGBDJFEK",
    "BCDEFGIL": "CGBDEFLI",
    "BCDEFGIK": "CGBDEFIK",
    "BCDEFGIJ": "CGBDJFEI",
    "BCDEFGHL": "CGBDHFLE",
    "BCDEFGHK": "CGBDHFEK",
    "BCDEFGHJ": "HGBCJFDE",
    "BCDEFGHI": "CGBDHFEI",
    "AFGHIJKL": "HJIFAGLK",
    "AEGHIJKL": "EJIAHGLK",
    "AEFHIJKL": "EJIFAHLK",
    "AEFGIJKL": "EJIFAGLK",
    "AEFGHJKL": "EGJFAHLK",
    "AEFGHIKL": "EGIFAHLK",
    "AEFGHIJL": "EGJFAHLI",
    "AEFGHIJK": "EGJFAHIK",
    "ADGHIJKL": "HJIDAGLK",
    "ADFHIJKL": "HJIDAFLK",
    "ADFGIJKL": "IGJDAFLK",
    "ADFGHJKL": "HGJDAFLK",
    "ADFGHIKL": "HGIDAFLK",
    "ADFGHIJL": "HGJDAFLI",
    "ADFGHIJK": "HGJDAFIK",
    "ADEHIJKL": "EJIDAHLK",
    "ADEGIJKL": "EJIDAGLK",
    "ADEGHJKL": "EGJDAHLK",
    "ADEGHIKL": "EGIDAHLK",
    "ADEGHIJL": "EGJDAHLI",
    "ADEGHIJK": "EGJDAHIK",
    "ADEFIJKL": "EJIDAFLK",
    "ADEFHJKL": "HJEDAFLK",
    "ADEFHIKL": "HEIDAFLK",
    "ADEFHIJL": "HJEDAFLI",
    "ADEFHIJK": "HJEDAFIK",
    "ADEFGJKL": "EGJDAFLK",
    "ADEFGIKL": "EGIDAFLK",
    "ADEFGIJL": "EGJDAFLI",
    "ADEFGIJK": "EGJDAFIK",
    "ADEFGHKL": "HGEDAFLK",
    "ADEFGHJL": "HGJDAFLE",
    "ADEFGHJK": "HGJDAFEK",
    "ADEFGHIL": "HGEDAFLI",
    "ADEFGHIK": "HGEDAFIK",
    "ADEFGHIJ": "HGJDAFEI",
    "ACGHIJKL": "HJICAGLK",
    "ACFHIJKL": "HJICAFLK",
    "ACFGIJKL": "IGJCAFLK",
    "ACFGHJKL": "HGJCAFLK",
    "ACFGHIKL": "HGICAFLK",
    "ACFGHIJL": "HGJCAFLI",
    "ACFGHIJK": "HGJCAFIK",
    "ACEHIJKL": "EJICAHLK",
    "ACEGIJKL": "EJICAGLK",
    "ACEGHJKL": "EGJCAHLK",
    "ACEGHIKL": "EGICAHLK",
    "ACEGHIJL": "EGJCAHLI",
    "ACEGHIJK": "EGJCAHIK",
    "ACEFIJKL": "EJICAFLK",
    "ACEFHJKL": "HJECAFLK",
    "ACEFHIKL": "HEICAFLK",
    "ACEFHIJL": "HJECAFLI",
    "ACEFHIJK": "HJECAFIK",
    "ACEFGJKL": "EGJCAFLK",
    "ACEFGIKL": "EGICAFLK",
    "ACEFGIJL": "EGJCAFLI",
    "ACEFGIJK": "EGJCAFIK",
    "ACEFGHKL": "HGECAFLK",
    "ACEFGHJL": "HGJCAFLE",
    "ACEFGHJK": "HGJCAFEK",
    "ACEFGHIL": "HGECAFLI",
    "ACEFGHIK": "HGECAFIK",
    "ACEFGHIJ": "HGJCAFEI",
    "ACDHIJKL": "HJICADLK",
    "ACDGIJKL": "IGJCADLK",
    "ACDGHJKL": "HGJCADLK",
    "ACDGHIKL": "HGICADLK",
    "ACDGHIJL": "HGJCADLI",
    "ACDGHIJK": "HGJCADIK",
    "ACDFIJKL": "CJIDAFLK",
    "ACDFHJKL": "HJFCADLK",
    "ACDFHIKL": "HFICADLK",
    "ACDFHIJL": "HJFCADLI",
    "ACDFHIJK": "HJFCADIK",
    "ACDFGJKL": "CGJDAFLK",
    "ACDFGIKL": "CGIDAFLK",
    "ACDFGIJL": "CGJDAFLI",
    "ACDFGIJK": "CGJDAFIK",
    "ACDFGHKL": "HGFCADLK",
    "ACDFGHJL": "CGJDAFLH",
    "ACDFGHJK": "HGJCAFDK",
    "ACDFGHIL": "HGFCADLI",
    "ACDFGHIK": "HGFCADIK",
    "ACDFGHIJ": "HGJCAFDI",
    "ACDEIJKL": "EJICADLK",
    "ACDEHJKL": "HJECADLK",
    "ACDEHIKL": "HEICADLK",
    "ACDEHIJL": "HJECADLI",
    "ACDEHIJK": "HJECADIK",
    "ACDEGJKL": "EGJCADLK",
    "ACDEGIKL": "EGICADLK",
    "ACDEGIJL": "EGJCADLI",
    "ACDEGIJK": "EGJCADIK",
    "ACDEGHKL": "HGECADLK",
    "ACDEGHJL": "HGJCADLE",
    "ACDEGHJK": "HGJCADEK",
    "ACDEGHIL": "HGECADLI",
    "ACDEGHIK": "HGECADIK",
    "ACDEGHIJ": "HGJCADEI",
    "ACDEFJKL": "CJEDAFLK",
    "ACDEFIKL": "CEIDAFLK",
    "ACDEFIJL": "CJEDAFLI",
    "ACDEFIJK": "CJEDAFIK",
    "ACDEFHKL": "HEFCADLK",
    "ACDEFHJL": "HJFCADLE",
    "ACDEFHJK": "HJECAFDK",
    "ACDEFHIL": "HEFCADLI",
    "ACDEFHIK": "HEFCADIK",
    "ACDEFHIJ": "HJECAFDI",
    "ACDEFGKL": "CGEDAFLK",
    "ACDEFGJL": "CGJDAFLE",
    "ACDEFGJK": "CGJDAFEK",
    "ACDEFGIL": "CGEDAFLI",
    "ACDEFGIK": "CGEDAFIK",
    "ACDEFGIJ": "CGJDAFEI",
    "ACDEFGHL": "HGFCADLE",
    "ACDEFGHK": "HGECAFDK",
    "ACDEFGHJ": "HGJCAFDE",
    "ACDEFGHI": "HGECAFDI",
    "ABGHIJKL": "HJBAIGLK",
    "ABFHIJKL": "HJBAIFLK",
    "ABFGIJKL": "IJBFAGLK",
    "ABFGHJKL": "HJBFAGLK",
    "ABFGHIKL": "HGBAIFLK",
    "ABFGHIJL": "HJBFAGLI",
    "ABFGHIJK": "HJBFAGIK",
    "ABEHIJKL": "EJBAIHLK",
    "ABEGIJKL": "EJBAIGLK",
    "ABEGHJKL": "EJBAHGLK",
    "ABEGHIKL": "EGBAIHLK",
    "ABEGHIJL": "EJBAHGLI",
    "ABEGHIJK": "EJBAHGIK",
    "ABEFIJKL": "EJBAIFLK",
    "ABEFHJKL": "EJBFAHLK",
    "ABEFHIKL": "EIBFAHLK",
    "ABEFHIJL": "EJBFAHLI",
    "ABEFHIJK": "EJBFAHIK",
    "ABEFGJKL": "EJBFAGLK",
    "ABEFGIKL": "EGBAIFLK",
    "ABEFGIJL": "EJBFAGLI",
    "ABEFGIJK": "EJBFAGIK",
    "ABEFGHKL": "EGBFAHLK",
    "ABEFGHJL": "HJBFAGLE",
    "ABEFGHJK": "HJBFAGEK",
    "ABEFGHIL": "EGBFAHLI",
    "ABEFGHIK": "EGBFAHIK",
    "ABEFGHIJ": "HJBFAGEI",
    "ABDHIJKL": "IJBDAHLK",
    "ABDGIJKL": "IJBDAGLK",
    "ABDGHJKL": "HJBDAGLK",
    "ABDGHIKL": "IGBDAHLK",
    "ABDGHIJL": "HJBDAGLI",
    "ABDGHIJK": "HJBDAGIK",
    "ABDFIJKL": "IJBDAFLK",
    "ABDFHJKL": "HJBDAFLK",
    "ABDFHIKL": "HIBDAFLK",
    "ABDFHIJL": "HJBDAFLI",
    "ABDFHIJK": "HJBDAFIK",
    "ABDFGJKL": "FJBDAGLK",
    "ABDFGIKL": "IGBDAFLK",
    "ABDFGIJL": "FJBDAGLI",
    "ABDFGIJK": "FJBDAGIK",
    "ABDFGHKL": "HGBDAFLK",
    "ABDFGHJL": "HGBDAFLJ",
    "ABDFGHJK": "HGBDAFJK",
    "ABDFGHIL": "HGBDAFLI",
    "ABDFGHIK": "HGBDAFIK",
    "ABDFGHIJ": "HGBDAFIJ",
    "ABDEIJKL": "EJBAIDLK",
    "ABDEHJKL": "EJBDAHLK",
    "ABDEHIKL": "EIBDAHLK",
    "ABDEHIJL": "EJBDAHLI",
    "ABDEHIJK": "EJBDAHIK",
    "ABDEGJKL": "EJBDAGLK",
    "ABDEGIKL": "EGBAIDLK",
    "ABDEGIJL": "EJBDAGLI",
    "ABDEGIJK": "EJBDAGIK",
    "ABDEGHKL": "EGBDAHLK",
    "ABDEGHJL": "HJBDAGLE",
    "ABDEGHJK": "HJBDAGEK",
    "ABDEGHIL": "EGBDAHLI",
    "ABDEGHIK": "EGBDAHIK",
    "ABDEGHIJ": "HJBDAGEI",
    "ABDEFJKL": "EJBDAFLK",
    "ABDEFIKL": "EIBDAFLK",
    "ABDEFIJL": "EJBDAFLI",
    "ABDEFIJK": "EJBDAFIK",
    "ABDEFHKL": "HEBDAFLK",
    "ABDEFHJL": "HJBDAFLE",
    "ABDEFHJK": "HJBDAFEK",
    "ABDEFHIL": "HEBDAFLI",
    "ABDEFHIK": "HEBDAFIK",
    "ABDEFHIJ": "HJBDAFEI",
    "ABDEFGKL": "EGBDAFLK",
    "ABDEFGJL": "EGBDAFLJ",
    "ABDEFGJK": "EGBDAFJK",
    "ABDEFGIL": "EGBDAFLI",
    "ABDEFGIK": "EGBDAFIK",
    "ABDEFGIJ": "EGBDAFIJ",
    "ABDEFGHL": "HGBDAFLE",
    "ABDEFGHK": "HGBDAFEK",
    "ABDEFGHJ": "HGBDAFEJ",
    "ABDEFGHI": "HGBDAFEI",
    "ABCHIJKL": "IJBCAHLK",
    "ABCGIJKL": "IJBCAGLK",
    "ABCGHJKL": "HJBCAGLK",
    "ABCGHIKL": "IGBCAHLK",
    "ABCGHIJL": "HJBCAGLI",
    "ABCGHIJK": "HJBCAGIK",
    "ABCFIJKL": "IJBCAFLK",
    "ABCFHJKL": "HJBCAFLK",
    "ABCFHIKL": "HIBCAFLK",
    "ABCFHIJL": "HJBCAFLI",
    "ABCFHIJK": "HJBCAFIK",
    "ABCFGJKL": "CJBFAGLK",
    "ABCFGIKL": "IGBCAFLK",
    "ABCFGIJL": "CJBFAGLI",
    "ABCFGIJK": "CJBFAGIK",
    "ABCFGHKL": "HGBCAFLK",
    "ABCFGHJL": "HGBCAFLJ",
    "ABCFGHJK": "HGBCAFJK",
    "ABCFGHIL": "HGBCAFLI",
    "ABCFGHIK": "HGBCAFIK",
    "ABCFGHIJ": "HGBCAFIJ",
    "ABCEIJKL": "EJBAICLK",
    "ABCEHJKL": "EJBCAHLK",
    "ABCEHIKL": "EIBCAHLK",
    "ABCEHIJL": "EJBCAHLI",
    "ABCEHIJK": "EJBCAHIK",
    "ABCEGJKL": "EJBCAGLK",
    "ABCEGIKL": "EGBAICLK",
    "ABCEGIJL": "EJBCAGLI",
    "ABCEGIJK": "EJBCAGIK",
    "ABCEGHKL": "EGBCAHLK",
    "ABCEGHJL": "HJBCAGLE",
    "ABCEGHJK": "HJBCAGEK",
    "ABCEGHIL": "EGBCAHLI",
    "ABCEGHIK": "EGBCAHIK",
    "ABCEGHIJ": "HJBCAGEI",
    "ABCEFJKL": "EJBCAFLK",
    "ABCEFIKL": "EIBCAFLK",
    "ABCEFIJL": "EJBCAFLI",
    "ABCEFIJK": "EJBCAFIK",
    "ABCEFHKL": "HEBCAFLK",
    "ABCEFHJL": "HJBCAFLE",
    "ABCEFHJK": "HJBCAFEK",
    "ABCEFHIL": "HEBCAFLI",
    "ABCEFHIK": "HEBCAFIK",
    "ABCEFHIJ": "HJBCAFEI",
    "ABCEFGKL": "EGBCAFLK",
    "ABCEFGJL": "EGBCAFLJ",
    "ABCEFGJK": "EGBCAFJK",
    "ABCEFGIL": "EGBCAFLI",
    "ABCEFGIK": "EGBCAFIK",
    "ABCEFGIJ": "EGBCAFIJ",
    "ABCEFGHL": "HGBCAFLE",
    "ABCEFGHK": "HGBCAFEK",
    "ABCEFGHJ": "HGBCAFEJ",
    "ABCEFGHI": "HGBCAFEI",
    "ABCDIJKL": "IJBCADLK",
    "ABCDHJKL": "HJBCADLK",
    "ABCDHIKL": "HIBCADLK",
    "ABCDHIJL": "HJBCADLI",
    "ABCDHIJK": "HJBCADIK",
    "ABCDGJKL": "CJBDAGLK",
    "ABCDGIKL": "IGBCADLK",
    "ABCDGIJL": "CJBDAGLI",
    "ABCDGIJK": "CJBDAGIK",
    "ABCDGHKL": "HGBCADLK",
    "ABCDGHJL": "HGBCADLJ",
    "ABCDGHJK": "HGBCADJK",
    "ABCDGHIL": "HGBCADLI",
    "ABCDGHIK": "HGBCADIK",
    "ABCDGHIJ": "HGBCADIJ",
    "ABCDFJKL": "CJBDAFLK",
    "ABCDFIKL": "CIBDAFLK",
    "ABCDFIJL": "CJBDAFLI",
    "ABCDFIJK": "CJBDAFIK",
    "ABCDFHKL": "HFBCADLK",
    "ABCDFHJL": "CJBDAFLH",
    "ABCDFHJK": "HJBCAFDK",
    "ABCDFHIL": "HFBCADLI",
    "ABCDFHIK": "HFBCADIK",
    "ABCDFHIJ": "HJBCAFDI",
    "ABCDFGKL": "CGBDAFLK",
    "ABCDFGJL": "CGBDAFLJ",
    "ABCDFGJK": "CGBDAFJK",
    "ABCDFGIL": "CGBDAFLI",
    "ABCDFGIK": "CGBDAFIK",
    "ABCDFGIJ": "CGBDAFIJ",
    "ABCDFGHL": "CGBDAFLH",
    "ABCDFGHK": "HGBCAFDK",
    "ABCDFGHJ": "HGBCAFDJ",
    "ABCDFGHI": "HGBCAFDI",
    "ABCDEJKL": "EJBCADLK",
    "ABCDEIKL": "EIBCADLK",
    "ABCDEIJL": "EJBCADLI",
    "ABCDEIJK": "EJBCADIK",
    "ABCDEHKL": "HEBCADLK",
    "ABCDEHJL": "HJBCADLE",
    "ABCDEHJK": "HJBCADEK",
    "ABCDEHIL": "HEBCADLI",
    "ABCDEHIK": "HEBCADIK",
    "ABCDEHIJ": "HJBCADEI",
    "ABCDEGKL": "EGBCADLK",
    "ABCDEGJL": "EGBCADLJ",
    "ABCDEGJK": "EGBCADJK",
    "ABCDEGIL": "EGBCADLI",
    "ABCDEGIK": "EGBCADIK",
    "ABCDEGIJ": "EGBCADIJ",
    "ABCDEGHL": "HGBCADLE",
    "ABCDEGHK": "HGBCADEK",
    "ABCDEGHJ": "HGBCADEJ",
    "ABCDEGHI": "HGBCADEI",
    "ABCDEFKL": "CEBDAFLK",
    "ABCDEFJL": "CJBDAFLE",
    "ABCDEFJK": "CJBDAFEK",
    "ABCDEFIL": "CEBDAFLI",
    "ABCDEFIK": "CEBDAFIK",
    "ABCDEFIJ": "CJBDAFEI",
    "ABCDEFHL": "HFBCADLE",
    "ABCDEFHK": "HEBCAFDK",
    "ABCDEFHJ": "HJBCAFDE",
    "ABCDEFHI": "HEBCAFDI",
    "ABCDEFGL": "CGBDAFLE",
    "ABCDEFGK": "CGBDAFEK",
    "ABCDEFGJ": "CGBDAFEJ",
    "ABCDEFGI": "CGBDAFEI",
    "ABCDEFGH": "HGBCAFDE"
  };
  const SLOTW = ['A', 'B', 'D', 'E', 'G', 'I', 'K', 'L'];
  const MT = {
    73: {
      r32: 1,
      h: '2A',
      a: '2B'
    },
    74: {
      r32: 1,
      h: '1E',
      a: '#E'
    },
    75: {
      r32: 1,
      h: '1F',
      a: '2C'
    },
    76: {
      r32: 1,
      h: '1C',
      a: '2F'
    },
    77: {
      r32: 1,
      h: '1I',
      a: '#I'
    },
    78: {
      r32: 1,
      h: '2E',
      a: '2I'
    },
    79: {
      r32: 1,
      h: '1A',
      a: '#A'
    },
    80: {
      r32: 1,
      h: '1L',
      a: '#L'
    },
    81: {
      r32: 1,
      h: '1D',
      a: '#D'
    },
    82: {
      r32: 1,
      h: '1G',
      a: '#G'
    },
    83: {
      r32: 1,
      h: '2K',
      a: '2L'
    },
    84: {
      r32: 1,
      h: '1H',
      a: '2J'
    },
    85: {
      r32: 1,
      h: '1B',
      a: '#B'
    },
    86: {
      r32: 1,
      h: '1J',
      a: '2H'
    },
    87: {
      r32: 1,
      h: '1K',
      a: '#K'
    },
    88: {
      r32: 1,
      h: '2D',
      a: '2G'
    },
    89: {
      h: 74,
      a: 77
    },
    90: {
      h: 73,
      a: 75
    },
    91: {
      h: 76,
      a: 78
    },
    92: {
      h: 79,
      a: 80
    },
    93: {
      h: 83,
      a: 84
    },
    94: {
      h: 81,
      a: 82
    },
    95: {
      h: 86,
      a: 88
    },
    96: {
      h: 85,
      a: 87
    },
    97: {
      h: 89,
      a: 90
    },
    98: {
      h: 93,
      a: 94
    },
    99: {
      h: 91,
      a: 92
    },
    100: {
      h: 95,
      a: 96
    },
    101: {
      h: 97,
      a: 98
    },
    102: {
      h: 99,
      a: 100
    },
    104: {
      h: 101,
      a: 102
    }
  };
  const R32o = [74, 77, 73, 75, 83, 84, 81, 82, 76, 78, 79, 80, 86, 88, 85, 87];
  const R16o = [89, 90, 93, 94, 91, 92, 95, 96],
    QFo = [97, 98, 99, 100],
    SFo = [101, 102],
    FINo = [104];
  const R32m = [73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88],
    R16m = [89, 90, 91, 92, 93, 94, 95, 96],
    QFm = [97, 98, 99, 100];
  let BRACKET_ORDER = 'tree';
  let bracketPairs = null; // legacy; unused (kept so stale assignments elsewhere are harmless)

  function bracketTeams() {
    const winners = {},
      runners = {},
      thirdByG = {},
      thirds = [];
    Object.keys(D.groups).forEach(g => {
      const o = orderGroup(g);
      winners[g] = o[0].team;
      runners[g] = o[1].team;
      thirdByG[g] = o[2].team;
      thirds.push({
        g,
        r: o[2]
      });
    });
    thirds.sort((x, y) => y.r.Pts - x.r.Pts || gd(y.r) - gd(x.r) || y.r.GF - x.r.GF || x.r.rank - y.r.rank);
    const best = thirds.slice(0, 8).map(t => t.g).sort();
    const assign = THIRD_TABLE[best.join('')] || best.join('');
    const thirdOpp = {};
    for (let i = 0; i < 8; i++) thirdOpp[SLOTW[i]] = assign[i];
    return {
      winners,
      runners,
      thirdByG,
      thirdOpp
    };
  }
  function resolveSlot(tok, B) {
    const t = tok[0],
      g = tok[1];
    if (t === '1') return B.winners[g];
    if (t === '2') return B.runners[g];
    if (t === '#') {
      const tg = B.thirdOpp[g];
      return tg ? B.thirdByG[tg] : null;
    }
    return null;
  }
  function slotLabel(tok, B) {
    return tok[0] === '#' ? '3' + (B.thirdOpp[tok[1]] || '?') : tok;
  }
  function teamsOf(m, B) {
    const mt = MT[m];
    return mt.r32 ? [resolveSlot(mt.h, B), resolveSlot(mt.a, B)] : [winnerOf(mt.h, B), winnerOf(mt.a, B)];
  }
  function winnerOf(m, B) {
    const t = teamsOf(m, B),
      h = t[0],
      a = t[1];
    if (!h) return a;
    if (!a) return h;
    const k = 'M' + m;
    if (picks[k] && (picks[k] === h || picks[k] === a)) return picks[k];
    return koWin(h, a) >= 0.5 ? h : a;
  }
  function loserOf(m, B) {
    const t = teamsOf(m, B),
      w = winnerOf(m, B);
    return t[0] === w ? t[1] : t[0];
  }
  function autoFill() {
    const B = bracketTeams();
    [].concat(R32o, R16o, QFo, SFo, FINo).forEach(m => {
      const t = teamsOf(m, B);
      if (t[0] && t[1]) picks['M' + m] = koWin(t[0], t[1]) >= 0.5 ? t[0] : t[1];
    });
  }

  /* ---- Monte-Carlo title odds ---- */
  function simulate(N) {
    const B = bracketTeams(),
      wins = {};
    for (let s = 0; s < N; s++) {
      const memo = {};
      const win = m => {
        if (memo[m]) return memo[m];
        const mt = MT[m];
        let h, a;
        if (mt.r32) {
          h = resolveSlot(mt.h, B);
          a = resolveSlot(mt.a, B);
        } else {
          h = win(mt.h);
          a = win(mt.a);
        }
        let w;
        if (!h) w = a;else if (!a) w = h;else w = Math.random() < koWin(h, a) ? h : a;
        return memo[m] = w;
      };
      const c = win(104);
      if (c) wins[c] = (wins[c] || 0) + 1;
    }
    return Object.keys(wins).map(t => ({
      team: t,
      pct: wins[t] / N * 100
    })).sort((a, b) => b.pct - a.pct);
  }
  window.WCMODEL = {
    teamRow,
    teamGroup,
    gd,
    strength,
    ratingIndex,
    factorBars,
    FACTOR_LABEL,
    expectedGoals,
    matchProbs,
    koWin,
    orderGroup,
    teamForm,
    nextFixture,
    bracketTeams,
    resolveSlot,
    slotLabel,
    teamsOf,
    winnerOf,
    loserOf,
    MT,
    R32o,
    R16o,
    QFo,
    SFo,
    FINo,
    R32m,
    R16m,
    QFm,
    simulate,
    autoFill,
    getPicks: () => picks,
    setPick: (m, team) => {
      picks[m] = team;
    },
    resetPicks: () => {
      picks = {};
    }
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/visualizer/model.js", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.FollowButton = __ds_scope.FollowButton;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.SectionHeading = __ds_scope.SectionHeading;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.BarMeter = __ds_scope.BarMeter;

__ds_ns.FactorBar = __ds_scope.FactorBar;

__ds_ns.FormPills = __ds_scope.FormPills;

__ds_ns.ProbabilityBar = __ds_scope.ProbabilityBar;

__ds_ns.RatingRing = __ds_scope.RatingRing;

__ds_ns.ScorelineGrid = __ds_scope.ScorelineGrid;

__ds_ns.StatCard = __ds_scope.StatCard;

__ds_ns.CompetitionBadge = __ds_scope.CompetitionBadge;

__ds_ns.FixtureGroup = __ds_scope.FixtureGroup;

__ds_ns.GroupStandings = __ds_scope.GroupStandings;

__ds_ns.LeagueTable = __ds_scope.LeagueTable;

__ds_ns.MatchRow = __ds_scope.MatchRow;

__ds_ns.PlayerCard = __ds_scope.PlayerCard;

__ds_ns.PlayerStatRow = __ds_scope.PlayerStatRow;

})();
