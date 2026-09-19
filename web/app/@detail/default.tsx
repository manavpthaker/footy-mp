import Link from "next/link";

export default function DetailPlaceholder() {
  return <div style={{ padding: "46px 36px", maxWidth: 760, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
    <div className="circle-kicker">Football with Azi</div>
    <h2 style={{ fontSize: 34, lineHeight: 1.15, margin: "12px 0" }}>Teammates at their club.<br />Different shirts for their countries.</h2>
    <p style={{ color: "var(--text-muted)", fontSize: 16, lineHeight: 1.7 }}>Start with the team on your screen. The players are your way into the rest of football.</p>
    <section className="circle-player"><h3>Recognise the player</h3><p>“Is that the player we saw for England?” Open their country connection and career history. A familiar face gives the next team a story.</p></section>
    <section className="circle-player"><h3>Follow the connection</h3><p>A Bayern player can play alongside someone from another club for their country. Those players may be opponents when club football returns.</p><p>Previous clubs are another link: a transfer changes where a player plays each week. It does not automatically change their national team.</p></section>
    <section className="circle-player"><h3>Understand the competition</h3><p>A domestic league is the regular points race. Continental club competitions bring clubs from different countries together. National-team competitions have their own teams, dates and tables.</p><p>In most leagues: 3 points for a win, 1 for a draw. Points don’t transfer between competitions.</p><Link className="circle-link" href="/map">See how it fits together →</Link></section>
    <p className="circle-small">Choose a team on the left, then open any player, country, club or competition. Follow only the connections that interest you.</p>
  </div>;
}
