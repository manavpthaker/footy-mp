/* footy-mp — app root: nav stack, follows state, tweaks, device mount. */

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
  const scrollTop = () => {
    const el = document.getElementById("fmp-scroll");
    if (el) el.scrollTop = 0;
  };
  return {
    ...state,
    push: (screen) => { setState(s => ({ ...s, stack: [...s.stack, screen] })); scrollTop(); },
    pop: () => { setState(s => ({ ...s, stack: s.stack.slice(0, -1) })); },
    setTab: (tab) => { setState({ tab, stack: [] }); scrollTop(); },
  };
}

/* ---------- error guard: a broken screen must never blank the phone ---------- */
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

/* ---------- root ---------- */
function FootyApp() {
  const [t, setTweak] = useTweaks(FMP_TWEAK_DEFAULTS);
  const follows = useFollows();
  const nav = useNav();
  const tweaks = { rowReadout: t.rowReadout, followedOnly: t.followedOnly };

  const top = nav.stack[nav.stack.length - 1];
  let screen, isRoot = !top;
  if (top) {
    const P = { match: MatchScreen, team: TeamScreen, player: PlayerScreen, league: LeagueScreen }[top.type];
    screen = <P id={top.id} nav={nav} follows={follows} tweaks={tweaks} />;
  } else {
    const P = { today: TodayScreen, matches: MatchesScreen, tables: TablesScreen, following: FollowingScreen }[nav.tab];
    screen = <P nav={nav} follows={follows} tweaks={tweaks} />;
  }

  const key = top ? `${top.type}-${top.id}-${nav.stack.length}` : `tab-${nav.tab}`;

  return (
    <div style={{
      height: "100%", display: "flex", flexDirection: "column",
      background: "var(--grad-app)", color: "var(--text-primary)",
      fontFamily: "var(--font-ui)", fontSize: "var(--fs-body)",
      zoom: t.density === "dense" ? 0.92 : 1,
    }}>
      {isRoot && <AppHeader />}
      <div id="fmp-scroll" style={{ flex: 1, overflowY: "auto", paddingBottom: 92 }}>
        <div key={key} className="fmp-screen-enter">
          <ScreenBoundary resetKey={key} onReset={() => nav.setTab("today")}>
            {screen}
          </ScreenBoundary>
        </div>
      </div>
      <TabBar active={isRoot ? nav.tab : "__none"} onSelect={nav.setTab} showLabels={t.tabLabels} />

      <TweaksPanel>
        <TweakSection label="Fixtures" />
        <TweakRadio label="Prediction readout" value={t.rowReadout}
          options={["bar", "fav"]} onChange={(v) => setTweak("rowReadout", v)} />
        <TweakToggle label="Matches: ★ only by default" value={t.followedOnly}
          onChange={(v) => setTweak("followedOnly", v)} />
        <TweakSection label="Chrome" />
        <TweakRadio label="Density" value={t.density}
          options={["regular", "dense"]} onChange={(v) => setTweak("density", v)} />
        <TweakToggle label="Tab labels" value={t.tabLabels}
          onChange={(v) => setTweak("tabLabels", v)} />
      </TweaksPanel>
    </div>
  );
}

function Root() {
  return (
    <div style={{
      minHeight: "100vh", display: "grid", placeItems: "center",
      background: "var(--coal-950)", padding: "24px 0",
    }}>
      <IOSDevice dark>
        <FootyApp />
      </IOSDevice>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
