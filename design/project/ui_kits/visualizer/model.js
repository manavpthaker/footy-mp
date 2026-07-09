/* WC26 Visualizer UI kit — analytical model.
   Ported verbatim from the source app (composite-rating + Poisson + bracket sim).
   Reads window.WCDATA; exposes window.WCMODEL. */
(function(){
  const D = window.WCDATA;
  const HOSTS = D.hosts;
  const teamGroup = {}, teamRow = {};
  Object.keys(D.groups).forEach(g => D.groups[g].forEach(r => { teamGroup[r.team]=g; teamRow[r.team]=r; }));
  let picks = {};

/* ---- core strength + match model ---- */
const WEIGHTS={fifa:0.45, val:0.0, form:0.15, att:0.15, def:0.15, mom:0.10}; // composite rating mix
const MATCH={base:1.30, gamma:0.60, host:0.15};                     // Poisson goals model (tuned on 2022)
let RAMP=3;   // games for tournament factors to reach full weight (small-sample guard)
// Squad value defaults to 0 weight: the 2022 backtest found it redundant with FIFA (it dropped accuracy).
// It's wired + tunable so you can dial it in; FIFA & value are anchors (full weight, never ramped).
const FACTOR_LABEL={fifa:"FIFA base",val:"Squad value",form:"Form",att:"Attack",def:"Defense",mom:"Momentum"};
function wsum(){return WEIGHTS.fifa+WEIGHTS.form+WEIGHTS.att+WEIGHTS.def+WEIGHTS.mom||1;}

/* ===== Per-team component metrics (z-scored across all 48 teams) ===== */
const M={}; let metricsReady=false; let _sc={};
const avg=a=>a.reduce((x,y)=>x+y,0)/a.length;
const sd=(a,m)=>Math.sqrt(avg(a.map(x=>(x-m)**2)))||1;
function zify(teams,raw){const v=teams.map(t=>M[t][raw]);const m=avg(v),s=sd(v,m);
  teams.forEach(t=>M[t]['z_'+raw]=(M[t][raw]-m)/s);}
function buildMetrics(){
  const teams=Object.keys(teamRow);
  teams.forEach(t=>{const r=teamRow[t],P=Math.max(r.P,1);
    M[t]={fifa:r.pts, vlog:Math.log(((D.marketValue||{})[t])||1), gfpg:r.GF/P, gapg:r.GA/P, P:r.P};});
  // Attack/Defense: per-game goals, shrunk toward the field average (small sample)
  const muGF=avg(teams.map(t=>M[t].gfpg)), muGA=avg(teams.map(t=>M[t].gapg)), k0=1.2;
  teams.forEach(t=>{const m=M[t],P=m.P||1;
    m.att=(m.gfpg*P+muGF*k0)/(P+k0);
    m.gaShrunk=(m.gapg*P+muGA*k0)/(P+k0);
    m.defg=-m.gaShrunk;});            // defensive rating: higher = stingier
  zify(teams,'fifa');                 // needed before form (opponent weighting)
  zify(teams,'vlog');                 // squad market value (log-scaled) — an anchor like FIFA
  // Form: result quality, weighted by opponent strength (beating/drawing a good side counts more)
  teams.forEach(t=>{const fm=teamForm(t);
    if(!fm.length){M[t].form=0;return;}
    M[t].form=avg(fm.map(g=>{const base=g.r==='W'?1:g.r==='D'?0.5:0;
      const oz=M[g.opp]?M[g.opp].z_fifa:0;
      const bonus=g.r==='W'?0.30*oz:g.r==='D'?0.18*oz:0.10*oz; // result vs strong opp = +, loss to strong = less bad
      return base+bonus;}));});
  // Momentum: trajectory of goal difference (latest match vs first)
  teams.forEach(t=>{const fm=teamForm(t);
    if(fm.length<2){M[t].mom=0;return;}
    const g=fm.map(x=>x.gf-x.ga);M[t].mom=g[g.length-1]-g[0];});
  zify(teams,'att'); zify(teams,'defg'); zify(teams,'form'); zify(teams,'mom');
  metricsReady=true; _sc={};
}
function strength(t){if(!metricsReady)buildMetrics();if(_sc[t]!=null)return _sc[t];const m=M[t];
  // Sample-size guard (backtested on 2022): tournament factors ramp from 0 to full weight over RAMP games,
  // so early-tournament noise can't swamp the FIFA anchor.
  const conf=Math.min((m.P||0)/RAMP,1);
  const wv=WEIGHTS.val||0;
  const tw=WEIGHTS.form+WEIGHTS.att+WEIGHTS.def+WEIGHTS.mom;
  const anchor=WEIGHTS.fifa*m.z_fifa + wv*m.z_vlog;                 // FIFA + squad value: full weight, never ramped
  const num=anchor + conf*(WEIGHTS.form*m.z_form+WEIGHTS.att*m.z_att+WEIGHTS.def*m.z_defg+WEIGHTS.mom*m.z_mom);
  const den=(WEIGHTS.fifa + wv + conf*tw)||1;
  return _sc[t]=num/den;}
function factorBars(t){if(!metricsReady)buildMetrics();const m=M[t];
  return {fifa:m.z_fifa, val:m.z_vlog, form:m.z_form, att:m.z_att, def:m.z_defg, mom:m.z_mom};}
function ratingIndex(t){return Math.max(1,Math.min(99,Math.round(50+18*strength(t))));}

/* ===== Match (goals) model: rating gap -> expected goals -> Poisson outcome ===== */
const FACT=[1,1,2,6,24,120,720,5040,40320,362880,3628800];
const pois=(k,l)=>Math.exp(-l)*Math.pow(l,k)/FACT[k];
function expectedGoals(a,b){
  const d=strength(a)-strength(b);
  let la=MATCH.base*Math.exp(MATCH.gamma*d/2);
  let lb=MATCH.base*Math.exp(-MATCH.gamma*d/2);
  if(HOSTS[a])la+=MATCH.host; if(HOSTS[b])lb+=MATCH.host;   // host xG edge
  return [la,lb];
}
function matchProbs(a,b){ // {h,d,a, la,lb, score:[i,j]}
  const [la,lb]=expectedGoals(a,b);const MX=8;
  const pa=[],pb=[];for(let i=0;i<=MX;i++){pa.push(pois(i,la));pb.push(pois(i,lb));}
  let h=0,dr=0,aw=0,best=[0,0,-1];
  for(let i=0;i<=MX;i++)for(let j=0;j<=MX;j++){const p=pa[i]*pb[j];
    if(i>j)h+=p;else if(i===j)dr+=p;else aw+=p;
    if(p>best[2])best=[i,j,p];}
  return {h,d:dr,a:aw,la,lb,score:[best[0],best[1]]};
}
function koWin(a,b){ // P(a advances) — a drawn KO is settled by a strength-tilted shootout
  const pr=matchProbs(a,b);
  const pen=1/(1+Math.exp(-1.1*(strength(a)-strength(b))));
  return pr.h + pr.d*pen;
}

// Standings ordering: Pts, GD, GF, FIFA rank
function gd(r){return r.GF-r.GA;}
function h2h(sub,g){ // mini-table among the tied teams only
  const names=new Set(sub.map(t=>t.team)), st={};
  sub.forEach(t=>st[t.team]={p:0,gd:0,gf:0});
  D.results.forEach(m=>{if(teamGroup[m.home]!==g||teamGroup[m.away]!==g)return;
    if(names.has(m.home)&&names.has(m.away)){const H=st[m.home],A=st[m.away];
      H.gf+=m.hs;A.gf+=m.as;H.gd+=m.hs-m.as;A.gd+=m.as-m.hs;
      if(m.hs>m.as)H.p+=3;else if(m.hs<m.as)A.p+=3;else{H.p++;A.p++;}}});
  return st;}
function orderGroup(g){
  // FIFA 2026 tiebreakers: points -> head-to-head (pts, GD, goals among tied) -> overall GD, goals -> FIFA rank
  const buckets={};[...D.groups[g]].forEach(t=>{(buckets[t.Pts]=buckets[t.Pts]||[]).push(t);});
  const out=[];
  Object.keys(buckets).map(Number).sort((a,b)=>b-a).forEach(p=>{
    const grp=buckets[p];
    if(grp.length>1){const h=h2h(grp,g);
      grp.sort((x,y)=>(h[y.team].p-h[x.team].p)||(h[y.team].gd-h[x.team].gd)||(h[y.team].gf-h[x.team].gf)
        ||(gd(y)-gd(x))||(y.GF-x.GF)||(x.rank-y.rank));}
    out.push.apply(out,grp);});
  return out;
}
// Form from results (last matches chronological)
function teamForm(t){
  const ms=D.results.filter(m=>m.home===t||m.away===t).sort((a,b)=>a.date.localeCompare(b.date));
  return ms.map(m=>{const home=m.home===t;const gf=home?m.hs:m.as,ga=home?m.as:m.hs;
    const opp=home?m.away:m.home;const r=gf>ga?'W':gf<ga?'L':'D';
    return {r,gf,ga,opp,home,date:m.date};});
}
function nextFixture(t){return D.fixtures.find(f=>f.home===t||f.away===t);}

/* ---- knockout bracket structure + resolution ---- */
const THIRD_TABLE={"EFGHIJKL":"EJIFHGLK","DFGHIJKL":"HGIDJFLK","DEGHIJKL":"EJIDHGLK","DEFHIJKL":"EJIDHFLK","DEFGIJKL":"EGIDJFLK","DEFGHJKL":"EGJDHFLK","DEFGHIKL":"EGIDHFLK","DEFGHIJL":"EGJDHFLI","DEFGHIJK":"EGJDHFIK","CFGHIJKL":"HGICJFLK","CEGHIJKL":"EJICHGLK","CEFHIJKL":"EJICHFLK","CEFGIJKL":"EGICJFLK","CEFGHJKL":"EGJCHFLK","CEFGHIKL":"EGICHFLK","CEFGHIJL":"EGJCHFLI","CEFGHIJK":"EGJCHFIK","CDGHIJKL":"HGICJDLK","CDFHIJKL":"CJIDHFLK","CDFGIJKL":"CGIDJFLK","CDFGHJKL":"CGJDHFLK","CDFGHIKL":"CGIDHFLK","CDFGHIJL":"CGJDHFLI","CDFGHIJK":"CGJDHFIK","CDEHIJKL":"EJICHDLK","CDEGIJKL":"EGICJDLK","CDEGHJKL":"EGJCHDLK","CDEGHIKL":"EGICHDLK","CDEGHIJL":"EGJCHDLI","CDEGHIJK":"EGJCHDIK","CDEFIJKL":"CJEDIFLK","CDEFHJKL":"CJEDHFLK","CDEFHIKL":"CEIDHFLK","CDEFHIJL":"CJEDHFLI","CDEFHIJK":"CJEDHFIK","CDEFGJKL":"CGEDJFLK","CDEFGIKL":"CGEDIFLK","CDEFGIJL":"CGEDJFLI","CDEFGIJK":"CGEDJFIK","CDEFGHKL":"CGEDHFLK","CDEFGHJL":"CGJDHFLE","CDEFGHJK":"CGJDHFEK","CDEFGHIL":"CGEDHFLI","CDEFGHIK":"CGEDHFIK","CDEFGHIJ":"CGJDHFEI","BFGHIJKL":"HJBFIGLK","BEGHIJKL":"EJIBHGLK","BEFHIJKL":"EJBFIHLK","BEFGIJKL":"EJBFIGLK","BEFGHJKL":"EJBFHGLK","BEFGHIKL":"EGBFIHLK","BEFGHIJL":"EJBFHGLI","BEFGHIJK":"EJBFHGIK","BDGHIJKL":"HJBDIGLK","BDFHIJKL":"HJBDIFLK","BDFGIJKL":"IGBDJFLK","BDFGHJKL":"HGBDJFLK","BDFGHIKL":"HGBDIFLK","BDFGHIJL":"HGBDJFLI","BDFGHIJK":"HGBDJFIK","BDEHIJKL":"EJBDIHLK","BDEGIJKL":"EJBDIGLK","BDEGHJKL":"EJBDHGLK","BDEGHIKL":"EGBDIHLK","BDEGHIJL":"EJBDHGLI","BDEGHIJK":"EJBDHGIK","BDEFIJKL":"EJBDIFLK","BDEFHJKL":"EJBDHFLK","BDEFHIKL":"EIBDHFLK","BDEFHIJL":"EJBDHFLI","BDEFHIJK":"EJBDHFIK","BDEFGJKL":"EGBDJFLK","BDEFGIKL":"EGBDIFLK","BDEFGIJL":"EGBDJFLI","BDEFGIJK":"EGBDJFIK","BDEFGHKL":"EGBDHFLK","BDEFGHJL":"HGBDJFLE","BDEFGHJK":"HGBDJFEK","BDEFGHIL":"EGBDHFLI","BDEFGHIK":"EGBDHFIK","BDEFGHIJ":"HGBDJFEI","BCGHIJKL":"HJBCIGLK","BCFHIJKL":"HJBCIFLK","BCFGIJKL":"IGBCJFLK","BCFGHJKL":"HGBCJFLK","BCFGHIKL":"HGBCIFLK","BCFGHIJL":"HGBCJFLI","BCFGHIJK":"HGBCJFIK","BCEHIJKL":"EJBCIHLK","BCEGIJKL":"EJBCIGLK","BCEGHJKL":"EJBCHGLK","BCEGHIKL":"EGBCIHLK","BCEGHIJL":"EJBCHGLI","BCEGHIJK":"EJBCHGIK","BCEFIJKL":"EJBCIFLK","BCEFHJKL":"EJBCHFLK","BCEFHIKL":"EIBCHFLK","BCEFHIJL":"EJBCHFLI","BCEFHIJK":"EJBCHFIK","BCEFGJKL":"EGBCJFLK","BCEFGIKL":"EGBCIFLK","BCEFGIJL":"EGBCJFLI","BCEFGIJK":"EGBCJFIK","BCEFGHKL":"EGBCHFLK","BCEFGHJL":"HGBCJFLE","BCEFGHJK":"HGBCJFEK","BCEFGHIL":"EGBCHFLI","BCEFGHIK":"EGBCHFIK","BCEFGHIJ":"HGBCJFEI","BCDHIJKL":"HJBCIDLK","BCDGIJKL":"IGBCJDLK","BCDGHJKL":"HGBCJDLK","BCDGHIKL":"HGBCIDLK","BCDGHIJL":"HGBCJDLI","BCDGHIJK":"HGBCJDIK","BCDFIJKL":"CJBDIFLK","BCDFHJKL":"CJBDHFLK","BCDFHIKL":"CIBDHFLK","BCDFHIJL":"CJBDHFLI","BCDFHIJK":"CJBDHFIK","BCDFGJKL":"CGBDJFLK","BCDFGIKL":"CGBDIFLK","BCDFGIJL":"CGBDJFLI","BCDFGIJK":"CGBDJFIK","BCDFGHKL":"CGBDHFLK","BCDFGHJL":"CGBDHFLJ","BCDFGHJK":"HGBCJFDK","BCDFGHIL":"CGBDHFLI","BCDFGHIK":"CGBDHFIK","BCDFGHIJ":"HGBCJFDI","BCDEIJKL":"EJBCIDLK","BCDEHJKL":"EJBCHDLK","BCDEHIKL":"EIBCHDLK","BCDEHIJL":"EJBCHDLI","BCDEHIJK":"EJBCHDIK","BCDEGJKL":"EGBCJDLK","BCDEGIKL":"EGBCIDLK","BCDEGIJL":"EGBCJDLI","BCDEGIJK":"EGBCJDIK","BCDEGHKL":"EGBCHDLK","BCDEGHJL":"HGBCJDLE","BCDEGHJK":"HGBCJDEK","BCDEGHIL":"EGBCHDLI","BCDEGHIK":"EGBCHDIK","BCDEGHIJ":"HGBCJDEI","BCDEFJKL":"CJBDEFLK","BCDEFIKL":"CEBDIFLK","BCDEFIJL":"CJBDEFLI","BCDEFIJK":"CJBDEFIK","BCDEFHKL":"CEBDHFLK","BCDEFHJL":"CJBDHFLE","BCDEFHJK":"CJBDHFEK","BCDEFHIL":"CEBDHFLI","BCDEFHIK":"CEBDHFIK","BCDEFHIJ":"CJBDHFEI","BCDEFGKL":"CGBDEFLK","BCDEFGJL":"CGBDJFLE","BCDEFGJK":"CGBDJFEK","BCDEFGIL":"CGBDEFLI","BCDEFGIK":"CGBDEFIK","BCDEFGIJ":"CGBDJFEI","BCDEFGHL":"CGBDHFLE","BCDEFGHK":"CGBDHFEK","BCDEFGHJ":"HGBCJFDE","BCDEFGHI":"CGBDHFEI","AFGHIJKL":"HJIFAGLK","AEGHIJKL":"EJIAHGLK","AEFHIJKL":"EJIFAHLK","AEFGIJKL":"EJIFAGLK","AEFGHJKL":"EGJFAHLK","AEFGHIKL":"EGIFAHLK","AEFGHIJL":"EGJFAHLI","AEFGHIJK":"EGJFAHIK","ADGHIJKL":"HJIDAGLK","ADFHIJKL":"HJIDAFLK","ADFGIJKL":"IGJDAFLK","ADFGHJKL":"HGJDAFLK","ADFGHIKL":"HGIDAFLK","ADFGHIJL":"HGJDAFLI","ADFGHIJK":"HGJDAFIK","ADEHIJKL":"EJIDAHLK","ADEGIJKL":"EJIDAGLK","ADEGHJKL":"EGJDAHLK","ADEGHIKL":"EGIDAHLK","ADEGHIJL":"EGJDAHLI","ADEGHIJK":"EGJDAHIK","ADEFIJKL":"EJIDAFLK","ADEFHJKL":"HJEDAFLK","ADEFHIKL":"HEIDAFLK","ADEFHIJL":"HJEDAFLI","ADEFHIJK":"HJEDAFIK","ADEFGJKL":"EGJDAFLK","ADEFGIKL":"EGIDAFLK","ADEFGIJL":"EGJDAFLI","ADEFGIJK":"EGJDAFIK","ADEFGHKL":"HGEDAFLK","ADEFGHJL":"HGJDAFLE","ADEFGHJK":"HGJDAFEK","ADEFGHIL":"HGEDAFLI","ADEFGHIK":"HGEDAFIK","ADEFGHIJ":"HGJDAFEI","ACGHIJKL":"HJICAGLK","ACFHIJKL":"HJICAFLK","ACFGIJKL":"IGJCAFLK","ACFGHJKL":"HGJCAFLK","ACFGHIKL":"HGICAFLK","ACFGHIJL":"HGJCAFLI","ACFGHIJK":"HGJCAFIK","ACEHIJKL":"EJICAHLK","ACEGIJKL":"EJICAGLK","ACEGHJKL":"EGJCAHLK","ACEGHIKL":"EGICAHLK","ACEGHIJL":"EGJCAHLI","ACEGHIJK":"EGJCAHIK","ACEFIJKL":"EJICAFLK","ACEFHJKL":"HJECAFLK","ACEFHIKL":"HEICAFLK","ACEFHIJL":"HJECAFLI","ACEFHIJK":"HJECAFIK","ACEFGJKL":"EGJCAFLK","ACEFGIKL":"EGICAFLK","ACEFGIJL":"EGJCAFLI","ACEFGIJK":"EGJCAFIK","ACEFGHKL":"HGECAFLK","ACEFGHJL":"HGJCAFLE","ACEFGHJK":"HGJCAFEK","ACEFGHIL":"HGECAFLI","ACEFGHIK":"HGECAFIK","ACEFGHIJ":"HGJCAFEI","ACDHIJKL":"HJICADLK","ACDGIJKL":"IGJCADLK","ACDGHJKL":"HGJCADLK","ACDGHIKL":"HGICADLK","ACDGHIJL":"HGJCADLI","ACDGHIJK":"HGJCADIK","ACDFIJKL":"CJIDAFLK","ACDFHJKL":"HJFCADLK","ACDFHIKL":"HFICADLK","ACDFHIJL":"HJFCADLI","ACDFHIJK":"HJFCADIK","ACDFGJKL":"CGJDAFLK","ACDFGIKL":"CGIDAFLK","ACDFGIJL":"CGJDAFLI","ACDFGIJK":"CGJDAFIK","ACDFGHKL":"HGFCADLK","ACDFGHJL":"CGJDAFLH","ACDFGHJK":"HGJCAFDK","ACDFGHIL":"HGFCADLI","ACDFGHIK":"HGFCADIK","ACDFGHIJ":"HGJCAFDI","ACDEIJKL":"EJICADLK","ACDEHJKL":"HJECADLK","ACDEHIKL":"HEICADLK","ACDEHIJL":"HJECADLI","ACDEHIJK":"HJECADIK","ACDEGJKL":"EGJCADLK","ACDEGIKL":"EGICADLK","ACDEGIJL":"EGJCADLI","ACDEGIJK":"EGJCADIK","ACDEGHKL":"HGECADLK","ACDEGHJL":"HGJCADLE","ACDEGHJK":"HGJCADEK","ACDEGHIL":"HGECADLI","ACDEGHIK":"HGECADIK","ACDEGHIJ":"HGJCADEI","ACDEFJKL":"CJEDAFLK","ACDEFIKL":"CEIDAFLK","ACDEFIJL":"CJEDAFLI","ACDEFIJK":"CJEDAFIK","ACDEFHKL":"HEFCADLK","ACDEFHJL":"HJFCADLE","ACDEFHJK":"HJECAFDK","ACDEFHIL":"HEFCADLI","ACDEFHIK":"HEFCADIK","ACDEFHIJ":"HJECAFDI","ACDEFGKL":"CGEDAFLK","ACDEFGJL":"CGJDAFLE","ACDEFGJK":"CGJDAFEK","ACDEFGIL":"CGEDAFLI","ACDEFGIK":"CGEDAFIK","ACDEFGIJ":"CGJDAFEI","ACDEFGHL":"HGFCADLE","ACDEFGHK":"HGECAFDK","ACDEFGHJ":"HGJCAFDE","ACDEFGHI":"HGECAFDI","ABGHIJKL":"HJBAIGLK","ABFHIJKL":"HJBAIFLK","ABFGIJKL":"IJBFAGLK","ABFGHJKL":"HJBFAGLK","ABFGHIKL":"HGBAIFLK","ABFGHIJL":"HJBFAGLI","ABFGHIJK":"HJBFAGIK","ABEHIJKL":"EJBAIHLK","ABEGIJKL":"EJBAIGLK","ABEGHJKL":"EJBAHGLK","ABEGHIKL":"EGBAIHLK","ABEGHIJL":"EJBAHGLI","ABEGHIJK":"EJBAHGIK","ABEFIJKL":"EJBAIFLK","ABEFHJKL":"EJBFAHLK","ABEFHIKL":"EIBFAHLK","ABEFHIJL":"EJBFAHLI","ABEFHIJK":"EJBFAHIK","ABEFGJKL":"EJBFAGLK","ABEFGIKL":"EGBAIFLK","ABEFGIJL":"EJBFAGLI","ABEFGIJK":"EJBFAGIK","ABEFGHKL":"EGBFAHLK","ABEFGHJL":"HJBFAGLE","ABEFGHJK":"HJBFAGEK","ABEFGHIL":"EGBFAHLI","ABEFGHIK":"EGBFAHIK","ABEFGHIJ":"HJBFAGEI","ABDHIJKL":"IJBDAHLK","ABDGIJKL":"IJBDAGLK","ABDGHJKL":"HJBDAGLK","ABDGHIKL":"IGBDAHLK","ABDGHIJL":"HJBDAGLI","ABDGHIJK":"HJBDAGIK","ABDFIJKL":"IJBDAFLK","ABDFHJKL":"HJBDAFLK","ABDFHIKL":"HIBDAFLK","ABDFHIJL":"HJBDAFLI","ABDFHIJK":"HJBDAFIK","ABDFGJKL":"FJBDAGLK","ABDFGIKL":"IGBDAFLK","ABDFGIJL":"FJBDAGLI","ABDFGIJK":"FJBDAGIK","ABDFGHKL":"HGBDAFLK","ABDFGHJL":"HGBDAFLJ","ABDFGHJK":"HGBDAFJK","ABDFGHIL":"HGBDAFLI","ABDFGHIK":"HGBDAFIK","ABDFGHIJ":"HGBDAFIJ","ABDEIJKL":"EJBAIDLK","ABDEHJKL":"EJBDAHLK","ABDEHIKL":"EIBDAHLK","ABDEHIJL":"EJBDAHLI","ABDEHIJK":"EJBDAHIK","ABDEGJKL":"EJBDAGLK","ABDEGIKL":"EGBAIDLK","ABDEGIJL":"EJBDAGLI","ABDEGIJK":"EJBDAGIK","ABDEGHKL":"EGBDAHLK","ABDEGHJL":"HJBDAGLE","ABDEGHJK":"HJBDAGEK","ABDEGHIL":"EGBDAHLI","ABDEGHIK":"EGBDAHIK","ABDEGHIJ":"HJBDAGEI","ABDEFJKL":"EJBDAFLK","ABDEFIKL":"EIBDAFLK","ABDEFIJL":"EJBDAFLI","ABDEFIJK":"EJBDAFIK","ABDEFHKL":"HEBDAFLK","ABDEFHJL":"HJBDAFLE","ABDEFHJK":"HJBDAFEK","ABDEFHIL":"HEBDAFLI","ABDEFHIK":"HEBDAFIK","ABDEFHIJ":"HJBDAFEI","ABDEFGKL":"EGBDAFLK","ABDEFGJL":"EGBDAFLJ","ABDEFGJK":"EGBDAFJK","ABDEFGIL":"EGBDAFLI","ABDEFGIK":"EGBDAFIK","ABDEFGIJ":"EGBDAFIJ","ABDEFGHL":"HGBDAFLE","ABDEFGHK":"HGBDAFEK","ABDEFGHJ":"HGBDAFEJ","ABDEFGHI":"HGBDAFEI","ABCHIJKL":"IJBCAHLK","ABCGIJKL":"IJBCAGLK","ABCGHJKL":"HJBCAGLK","ABCGHIKL":"IGBCAHLK","ABCGHIJL":"HJBCAGLI","ABCGHIJK":"HJBCAGIK","ABCFIJKL":"IJBCAFLK","ABCFHJKL":"HJBCAFLK","ABCFHIKL":"HIBCAFLK","ABCFHIJL":"HJBCAFLI","ABCFHIJK":"HJBCAFIK","ABCFGJKL":"CJBFAGLK","ABCFGIKL":"IGBCAFLK","ABCFGIJL":"CJBFAGLI","ABCFGIJK":"CJBFAGIK","ABCFGHKL":"HGBCAFLK","ABCFGHJL":"HGBCAFLJ","ABCFGHJK":"HGBCAFJK","ABCFGHIL":"HGBCAFLI","ABCFGHIK":"HGBCAFIK","ABCFGHIJ":"HGBCAFIJ","ABCEIJKL":"EJBAICLK","ABCEHJKL":"EJBCAHLK","ABCEHIKL":"EIBCAHLK","ABCEHIJL":"EJBCAHLI","ABCEHIJK":"EJBCAHIK","ABCEGJKL":"EJBCAGLK","ABCEGIKL":"EGBAICLK","ABCEGIJL":"EJBCAGLI","ABCEGIJK":"EJBCAGIK","ABCEGHKL":"EGBCAHLK","ABCEGHJL":"HJBCAGLE","ABCEGHJK":"HJBCAGEK","ABCEGHIL":"EGBCAHLI","ABCEGHIK":"EGBCAHIK","ABCEGHIJ":"HJBCAGEI","ABCEFJKL":"EJBCAFLK","ABCEFIKL":"EIBCAFLK","ABCEFIJL":"EJBCAFLI","ABCEFIJK":"EJBCAFIK","ABCEFHKL":"HEBCAFLK","ABCEFHJL":"HJBCAFLE","ABCEFHJK":"HJBCAFEK","ABCEFHIL":"HEBCAFLI","ABCEFHIK":"HEBCAFIK","ABCEFHIJ":"HJBCAFEI","ABCEFGKL":"EGBCAFLK","ABCEFGJL":"EGBCAFLJ","ABCEFGJK":"EGBCAFJK","ABCEFGIL":"EGBCAFLI","ABCEFGIK":"EGBCAFIK","ABCEFGIJ":"EGBCAFIJ","ABCEFGHL":"HGBCAFLE","ABCEFGHK":"HGBCAFEK","ABCEFGHJ":"HGBCAFEJ","ABCEFGHI":"HGBCAFEI","ABCDIJKL":"IJBCADLK","ABCDHJKL":"HJBCADLK","ABCDHIKL":"HIBCADLK","ABCDHIJL":"HJBCADLI","ABCDHIJK":"HJBCADIK","ABCDGJKL":"CJBDAGLK","ABCDGIKL":"IGBCADLK","ABCDGIJL":"CJBDAGLI","ABCDGIJK":"CJBDAGIK","ABCDGHKL":"HGBCADLK","ABCDGHJL":"HGBCADLJ","ABCDGHJK":"HGBCADJK","ABCDGHIL":"HGBCADLI","ABCDGHIK":"HGBCADIK","ABCDGHIJ":"HGBCADIJ","ABCDFJKL":"CJBDAFLK","ABCDFIKL":"CIBDAFLK","ABCDFIJL":"CJBDAFLI","ABCDFIJK":"CJBDAFIK","ABCDFHKL":"HFBCADLK","ABCDFHJL":"CJBDAFLH","ABCDFHJK":"HJBCAFDK","ABCDFHIL":"HFBCADLI","ABCDFHIK":"HFBCADIK","ABCDFHIJ":"HJBCAFDI","ABCDFGKL":"CGBDAFLK","ABCDFGJL":"CGBDAFLJ","ABCDFGJK":"CGBDAFJK","ABCDFGIL":"CGBDAFLI","ABCDFGIK":"CGBDAFIK","ABCDFGIJ":"CGBDAFIJ","ABCDFGHL":"CGBDAFLH","ABCDFGHK":"HGBCAFDK","ABCDFGHJ":"HGBCAFDJ","ABCDFGHI":"HGBCAFDI","ABCDEJKL":"EJBCADLK","ABCDEIKL":"EIBCADLK","ABCDEIJL":"EJBCADLI","ABCDEIJK":"EJBCADIK","ABCDEHKL":"HEBCADLK","ABCDEHJL":"HJBCADLE","ABCDEHJK":"HJBCADEK","ABCDEHIL":"HEBCADLI","ABCDEHIK":"HEBCADIK","ABCDEHIJ":"HJBCADEI","ABCDEGKL":"EGBCADLK","ABCDEGJL":"EGBCADLJ","ABCDEGJK":"EGBCADJK","ABCDEGIL":"EGBCADLI","ABCDEGIK":"EGBCADIK","ABCDEGIJ":"EGBCADIJ","ABCDEGHL":"HGBCADLE","ABCDEGHK":"HGBCADEK","ABCDEGHJ":"HGBCADEJ","ABCDEGHI":"HGBCADEI","ABCDEFKL":"CEBDAFLK","ABCDEFJL":"CJBDAFLE","ABCDEFJK":"CJBDAFEK","ABCDEFIL":"CEBDAFLI","ABCDEFIK":"CEBDAFIK","ABCDEFIJ":"CJBDAFEI","ABCDEFHL":"HFBCADLE","ABCDEFHK":"HEBCAFDK","ABCDEFHJ":"HJBCAFDE","ABCDEFHI":"HEBCAFDI","ABCDEFGL":"CGBDAFLE","ABCDEFGK":"CGBDAFEK","ABCDEFGJ":"CGBDAFEJ","ABCDEFGI":"CGBDAFEI","ABCDEFGH":"HGBCAFDE"};
const SLOTW=['A','B','D','E','G','I','K','L'];
const MT={
 73:{r32:1,h:'2A',a:'2B'},74:{r32:1,h:'1E',a:'#E'},75:{r32:1,h:'1F',a:'2C'},76:{r32:1,h:'1C',a:'2F'},
 77:{r32:1,h:'1I',a:'#I'},78:{r32:1,h:'2E',a:'2I'},79:{r32:1,h:'1A',a:'#A'},80:{r32:1,h:'1L',a:'#L'},
 81:{r32:1,h:'1D',a:'#D'},82:{r32:1,h:'1G',a:'#G'},83:{r32:1,h:'2K',a:'2L'},84:{r32:1,h:'1H',a:'2J'},
 85:{r32:1,h:'1B',a:'#B'},86:{r32:1,h:'1J',a:'2H'},87:{r32:1,h:'1K',a:'#K'},88:{r32:1,h:'2D',a:'2G'},
 89:{h:74,a:77},90:{h:73,a:75},91:{h:76,a:78},92:{h:79,a:80},93:{h:83,a:84},94:{h:81,a:82},95:{h:86,a:88},96:{h:85,a:87},
 97:{h:89,a:90},98:{h:93,a:94},99:{h:91,a:92},100:{h:95,a:96},
 101:{h:97,a:98},102:{h:99,a:100},104:{h:101,a:102}};
const R32o=[74,77,73,75,83,84,81,82,76,78,79,80,86,88,85,87];
const R16o=[89,90,93,94,91,92,95,96], QFo=[97,98,99,100], SFo=[101,102], FINo=[104];
const R32m=[73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88], R16m=[89,90,91,92,93,94,95,96], QFm=[97,98,99,100];
let BRACKET_ORDER='tree';
let bracketPairs=null; // legacy; unused (kept so stale assignments elsewhere are harmless)

function bracketTeams(){
  const winners={},runners={},thirdByG={},thirds=[];
  Object.keys(D.groups).forEach(g=>{const o=orderGroup(g);
    winners[g]=o[0].team;runners[g]=o[1].team;thirdByG[g]=o[2].team;thirds.push({g,r:o[2]});});
  thirds.sort((x,y)=>y.r.Pts-x.r.Pts||gd(y.r)-gd(x.r)||y.r.GF-x.r.GF||x.r.rank-y.r.rank);
  const best=thirds.slice(0,8).map(t=>t.g).sort();
  const assign=THIRD_TABLE[best.join('')]||best.join('');
  const thirdOpp={}; for(let i=0;i<8;i++)thirdOpp[SLOTW[i]]=assign[i];
  return {winners,runners,thirdByG,thirdOpp};
}
function resolveSlot(tok,B){const t=tok[0],g=tok[1];
  if(t==='1')return B.winners[g];
  if(t==='2')return B.runners[g];
  if(t==='#'){const tg=B.thirdOpp[g];return tg?B.thirdByG[tg]:null;}
  return null;}
function slotLabel(tok,B){return tok[0]==='#'?('3'+(B.thirdOpp[tok[1]]||'?')):tok;}
function teamsOf(m,B){const mt=MT[m];
  return mt.r32?[resolveSlot(mt.h,B),resolveSlot(mt.a,B)]:[winnerOf(mt.h,B),winnerOf(mt.a,B)];}
function winnerOf(m,B){const t=teamsOf(m,B),h=t[0],a=t[1];
  if(!h)return a;if(!a)return h;
  const k='M'+m;if(picks[k]&&(picks[k]===h||picks[k]===a))return picks[k];
  return koWin(h,a)>=0.5?h:a;}
function loserOf(m,B){const t=teamsOf(m,B),w=winnerOf(m,B);return t[0]===w?t[1]:t[0];}


function autoFill(){const B=bracketTeams();
  [].concat(R32o,R16o,QFo,SFo,FINo).forEach(m=>{const t=teamsOf(m,B);
    if(t[0]&&t[1])picks['M'+m]=koWin(t[0],t[1])>=0.5?t[0]:t[1];});}

/* ---- Monte-Carlo title odds ---- */
function simulate(N){
  const B=bracketTeams(),wins={};
  for(let s=0;s<N;s++){const memo={};
    const win=m=>{if(memo[m])return memo[m];const mt=MT[m];let h,a;
      if(mt.r32){h=resolveSlot(mt.h,B);a=resolveSlot(mt.a,B);}else{h=win(mt.h);a=win(mt.a);}
      let w;if(!h)w=a;else if(!a)w=h;else w=Math.random()<koWin(h,a)?h:a;return memo[m]=w;};
    const c=win(104);if(c)wins[c]=(wins[c]||0)+1;}
  return Object.keys(wins).map(t=>({team:t,pct:wins[t]/N*100})).sort((a,b)=>b.pct-a.pct);
}


  window.WCMODEL = {
    teamRow, teamGroup, gd,
    strength, ratingIndex, factorBars, FACTOR_LABEL,
    expectedGoals, matchProbs, koWin,
    orderGroup, teamForm, nextFixture,
    bracketTeams, resolveSlot, slotLabel, teamsOf, winnerOf, loserOf,
    MT, R32o, R16o, QFo, SFo, FINo, R32m, R16m, QFm,
    simulate, autoFill,
    getPicks: () => picks,
    setPick: (m, team) => { picks[m] = team; },
    resetPicks: () => { picks = {}; },
  };
})();
