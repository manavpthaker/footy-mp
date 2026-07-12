/* footy-mp — app root: nav stack, follows state, tweaks, responsive shell.
   < 900px: single-column mobile app with bottom tab bar.
   ≥ 900px: two-pane "rail + detail" quant-desk layout (per DS spacing tokens). */

const Fa = window.FMP;

const FMP_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "rowReadout": "bar",
  "followedOnly": true,
  "density": "regular",
  "tabLabels": true
}/*EDITMODE-END*/;

/* ---------- follows state (persisted) ---------- */
function useFollows() {
  const [set, setSet] = React.useState(() => {
    try {
      const raw = localStorage.getItem("fmp-follows-v1");
      if (raw) return new Set(JSON.parse(raw));
    } catch (e) {}
    const init = [];
    Fa.FOLLOWS.teams.forEach(id => init.push("team:" + id));
    Fa.FOLLOWS.players.forEach(id => init.push("player:" + id));
    Fa.FOLLOWS.leagues.forEach(id => init.push("league:" + id));
    return new Set(init);
  });
  React.useEffect(() => {
    try { localStorage.setItem("fmp-follows-v1", JSON.stringify(Array.from(set))); } catch (e) {}
  }, [set]);
  return {
    has: (type, id) => set.has(type + ":" + id),
    toggle: (type, id) => setSet(prev => {
      const next = new Set(prev);
      const k = type + ":" + id;
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    }),
  };
}

/* ---------- nav (persisted) ---------- */
function useNav() {
  const [state, setState] = React.useState(() => {
    try {
      const raw = localStorage.getItem("fmp-nav-v1");
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { tab: "today", stack: [] };
  });
  React.useEffect(() => {
    try { localStorage.setItem("fmp-nav-v1", JSON.stringify(state)); } catch (e) {}
  }, [state]);
  const scrollDetail = () => {
    // desktop: detail pane; mobile: the single scroll container
    const el = document.getElementById("fmp-scroll-detail") || document.getElementById("fmp-scroll");
    if (el) el.scrollTop = 0;
  };
  const scrollAll = () => {
    ["fmp-scroll", "fmp-scroll-detail"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.scrollTop = 0;
    });
  };
  return {
    ...state,
    push: (screen) => { setState(s => ({ ...s, stack: [...s.stack, screen] })); scrollDetail(); },
    pop: () => { setState(s => ({ ...s, stack: s.stack.slice(0, -1) })); },
    setTab: (tab) => { setState({ tab, stack: [] }); scrollAll(); },
  };
}

/* ---------- viewport ---------- */
function useIsDesktop() {
  const [is, setIs] = React.useState(() => window.matchMedia("(min-width: 900px)").matches);
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const fn = (e) => setIs(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return is;
}

/* ---------- error guard: a broken screen must never blank the app ---------- */
class ScreenBoundary extends React.Component {
  constructor(props) { super(props); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidUpdate(prev) { if (prev.resetKey !== this.props.resetKey && this.state.err) this.setState({ err: null }); }
  render() {
    if (this.state.err) {
      return (
        <div style={{ padding: "24px 16px" }}>
          <EmptyState>
            Something broke rendering this screen.
            <div style={{ marginTop: 10 }}>
              <button onClick={this.props.onReset} style={{
                background: "var(--ember-tint)", color: "var(--accent)",
                border: "1px solid var(--ember-600)", borderRadius: "var(--radius-md)",
                padding: "8px 14px", cursor: "pointer", fontWeight: 700,
              }}>↺ Back to Today</button>
            </div>
          </EmptyState>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ---------- desktop detail pane, empty state ---------- */
function DetailPlaceholder() {
  return (
    <div style={{ height: "100%", display: "grid", placeItems: "center", padding: "40px 32px" }}>
      <div style={{ textAlign: "center", maxWidth: 340 }}>
        <div style={{
          width: 38, height: 38, borderRadius: "var(--radius-sm)",
          background: "var(--surface-raised)", border: "1px solid var(--border)",
          display: "grid", placeItems: "center", margin: "0 auto 12px",
          color: "var(--text-faint)", fontSize: 16,
        }}>◆</div>
        <div style={{ fontWeight: 700, fontSize: "var(--fs-h2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Pick a team or a fixture
        </div>
        <div style={{ marginTop: 6, fontSize: "var(--fs-sm)", color: "var(--text-faint)", lineHeight: "var(--lh-snug)" }}>
          Matches, teams, players and tables you open land here.
        </div>
      </div>
    </div>
  );
}

/* ---------- root ---------- */
function FootyApp() {
  const [t, setTweak] = useTweaks(FMP_TWEAK_DEFAULTS);
  const follows = useFollows();
  const nav = useNav();
  const isDesktop = useIsDesktop();
  const tweaks = { rowReadout: t.rowReadout, followedOnly: t.followedOnly };

  const top = nav.stack[nav.stack.length - 1];
  const RootP = { today: TodayScreen, matches: MatchesScreen, tables: TablesScreen, following: FollowingScreen }[nav.tab];
  const rootScreen = <RootP nav={nav} follows={follows} tweaks={tweaks} />;
  let detailScreen = null;
  if (top) {
    const P = { match: MatchScreen, team: TeamScreen, player: PlayerScreen, league: LeagueScreen }[top.type];
    detailScreen = <P id={top.id} nav={nav} follows={follows} tweaks={tweaks} />;
  }

  const rootKey = `tab-${nav.tab}`;
  const detailKey = top ? `${top.type}-${top.id}-${nav.stack.length}` : "empty";
  const onReset = () => nav.setTab("today");

  const appStyle = {
    height: "100%", position: "relative", display: "flex", flexDirection: "column",
    background: "var(--grad-app)", color: "var(--text-primary)",
    fontFamily: "var(--font-ui)", fontSize: "var(--fs-body)",
    zoom: t.density === "dense" ? 0.92 : 1,
  };

  const tweaksEl = (
    <TweaksPanel>
      <TweakSection label="Fixtures" />
      <TweakRadio label="Prediction readout" value={t.rowReadout}
        options={["bar", "fav"]} onChange={(v) => setTweak("rowReadout", v)} />
      <TweakToggle label="Matches: ★ only by default" value={t.followedOnly}
        onChange={(v) => setTweak("followedOnly", v)} />
      <TweakSection label="Chrome" />
      <TweakRadio label="Density" value={t.density}
        options={["regular", "dense"]} onChange={(v) => setTweak("density", v)} />
      <TweakToggle label="Tab labels (mobile)" value={t.tabLabels}
        onChange={(v) => setTweak("tabLabels", v)} />
    </TweaksPanel>
  );

  /* ===== desktop: header tabs + rail | detail ===== */
  if (isDesktop) {
    return (
      <div style={appStyle}>
        <AppHeader tabs active={nav.tab} onSelect={nav.setTab} />
        <div style={{ flex: 1, minHeight: 0, display: "flex", justifyContent: "center" }}>
          <div style={{
            width: "100%", maxWidth: 1280, minHeight: 0,
            display: "grid", gridTemplateColumns: "var(--col-groups-w) minmax(0, 1fr)",
            borderInline: "1px solid var(--border)",
          }}>
            <div id="fmp-scroll" data-screen-label={`rail · ${nav.tab}`}
              style={{ overflowY: "auto", minHeight: 0, borderRight: "1px solid var(--border)", paddingBottom: 28 }}>
              <div key={rootKey} className="fmp-screen-enter">
                <ScreenBoundary resetKey={rootKey} onReset={onReset}>{rootScreen}</ScreenBoundary>
              </div>
            </div>
            <div id="fmp-scroll-detail" data-screen-label={top ? `detail · ${top.type} ${top.id}` : "detail · empty"}
              style={{ overflowY: "auto", minHeight: 0 }}>
              {detailScreen ? (
                <div key={detailKey} className="fmp-screen-enter" style={{ paddingBottom: 28 }}>
                  <ScreenBoundary resetKey={detailKey} onReset={onReset}>{detailScreen}</ScreenBoundary>
                </div>
              ) : <DetailPlaceholder />}
            </div>
          </div>
        </div>
        {tweaksEl}
      </div>
    );
  }

  /* ===== mobile: single column + bottom tab bar ===== */
  const isRoot = !top;
  const screen = detailScreen || rootScreen;
  const key = top ? detailKey : rootKey;
  return (
    <div style={appStyle}>
      {isRoot && <AppHeader />}
      <div id="fmp-scroll" style={{ flex: 1, overflowY: "auto", paddingBottom: 92 }}>
        <div className="fmp-cap" data-screen-label={top ? `${top.type} ${top.id}` : nav.tab}>
          <div key={key} className="fmp-screen-enter">
            <ScreenBoundary resetKey={key} onReset={onReset}>
              {screen}
            </ScreenBoundary>
          </div>
        </div>
      </div>
      <TabBar active={isRoot ? nav.tab : "__none"} onSelect={nav.setTab} showLabels={t.tabLabels} />
      {tweaksEl}
    </div>
  );
}

function Root() {
  return (
    <div style={{ height: "100%", background: "var(--coal-950)" }}>
      <FootyApp />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
