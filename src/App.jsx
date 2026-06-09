import { useState, useEffect, useCallback, useRef } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #080810;
    --surface:  #0f0f1a;
    --border:   #1e1e35;
    --violet:   #7c3aed;
    --violet2:  #a855f7;
    --green:    #22c55e;
    --red:      #ef4444;
    --amber:    #f59e0b;
    --text:     #e2e8f0;
    --muted:    #64748b;
    --mono:     'Space Mono', monospace;
    --sans:     'Space Grotesk', sans-serif;
  }

  html, body { background: var(--bg); color: var(--text); font-family: var(--sans); min-height: 100vh; }
  .app { max-width: 480px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; }

  .header {
    padding: 16px 16px 12px;
    background: var(--bg);
    border-bottom: 1px solid var(--border);
    position: sticky; top: 0; z-index: 10;
  }
  .header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .logo { font-family: var(--mono); font-size: 13px; font-weight: 700; letter-spacing: 0.15em; color: var(--violet2); }
  .logo span { color: var(--green); }
  .live-dot { display: flex; align-items: center; gap: 6px; font-family: var(--mono); font-size: 11px; color: var(--muted); }
  .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); animation: pulse-dot 1.4s ease-in-out infinite; }
  @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(0.7)} }

  .filter-bar { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
  .filter-bar::-webkit-scrollbar { display: none; }
  .filter-btn {
    flex-shrink: 0; padding: 5px 12px; border-radius: 20px; border: 1px solid var(--border);
    background: transparent; color: var(--muted); font-family: var(--mono); font-size: 11px; cursor: pointer;
    transition: all 0.15s;
  }
  .filter-btn.active { background: var(--violet); border-color: var(--violet); color: #fff; }

  .stats-bar {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 1px; background: var(--border);
    border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
  }
  .stat-cell { background: var(--surface); padding: 10px 12px; }
  .stat-label { font-family: var(--mono); font-size: 9px; color: var(--muted); letter-spacing: .1em; text-transform: uppercase; margin-bottom: 3px; }
  .stat-value { font-family: var(--mono); font-size: 14px; font-weight: 700; }
  .stat-value.green { color: var(--green); }
  .stat-value.amber { color: var(--amber); }
  .stat-value.violet { color: var(--violet2); }

  .feed { flex: 1; padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; overflow-y: auto; }

  .token-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 12px 14px;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.2s, transform 0.1s;
    animation: slide-in 0.3s ease;
  }
  .token-card:active { transform: scale(0.98); }
  @keyframes slide-in { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
  .token-card.hot { border-color: var(--violet); }
  .token-card.warn { border-color: var(--amber); }
  .token-card.rug { border-color: var(--red); }
  @keyframes new-flash { 0%{background:#1a0a2e} 100%{background:var(--surface)} }
  .token-card.new-flash { animation: new-flash 0.6s ease; }

  .signal-bar { position: absolute; left: 0; top: 0; bottom: 0; width: 3px; border-radius: 12px 0 0 12px; }
  .signal-bar.hot { background: var(--violet2); }
  .signal-bar.warn { background: var(--amber); }
  .signal-bar.rug  { background: var(--red); }
  .signal-bar.ok   { background: var(--green); }

  .card-row1 { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px; }
  .token-name { font-weight: 700; font-size: 15px; line-height: 1.2; }
  .token-sym  { font-family: var(--mono); font-size: 11px; color: var(--violet2); margin-top: 1px; }
  .token-age  { font-family: var(--mono); font-size: 10px; color: var(--muted); text-align: right; }
  .price-change { font-family: var(--mono); font-size: 13px; font-weight: 700; }
  .price-change.up { color: var(--green); }
  .price-change.down { color: var(--red); }

  .card-metrics { display: grid; grid-template-columns: repeat(3,1fr); gap: 6px; margin-bottom: 8px; }
  .metric { background: var(--bg); border-radius: 6px; padding: 5px 7px; }
  .metric-label { font-family: var(--mono); font-size: 9px; color: var(--muted); text-transform: uppercase; letter-spacing:.08em; }
  .metric-val   { font-family: var(--mono); font-size: 11px; font-weight: 700; margin-top: 1px; }

  .score-ring-wrap { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
  .score-ring { position: relative; width: 38px; height: 38px; flex-shrink: 0; }
  .score-ring svg { transform: rotate(-90deg); }
  .score-num { position: absolute; inset:0; display:flex; align-items:center; justify-content:center; font-family:var(--mono); font-size:10px; font-weight:700; }
  .score-labels { flex: 1; display: flex; flex-wrap: wrap; gap: 4px; }
  .tag { font-family: var(--mono); font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: 700; letter-spacing: .04em; }
  .tag.good  { background: rgba(34,197,94,.15);  color: var(--green); }
  .tag.bad   { background: rgba(239,68,68,.15);   color: var(--red); }
  .tag.warn  { background: rgba(245,158,11,.15);  color: var(--amber); }
  .tag.info  { background: rgba(168,85,247,.15);  color: var(--violet2); }

  .sheet-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.7); z-index: 50; display: flex; align-items: flex-end; animation: fade-in .15s ease; }
  @keyframes fade-in { from{opacity:0} to{opacity:1} }
  .sheet { width: 100%; max-width: 480px; margin: 0 auto; background: var(--surface); border-radius: 20px 20px 0 0; border-top: 1px solid var(--border); padding: 20px 18px 36px; animation: sheet-up .2s ease; max-height: 90vh; overflow-y: auto; }
  @keyframes sheet-up { from{transform:translateY(40px)} to{transform:translateY(0)} }
  .sheet-handle { width: 40px; height: 4px; background: var(--border); border-radius: 2px; margin: 0 auto 16px; }
  .sheet-name { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  .sheet-addr { font-family: var(--mono); font-size: 10px; color: var(--muted); margin-bottom: 16px; word-break:break-all; }
  .sheet-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
  .sheet-metric { background: var(--bg); border-radius: 8px; padding: 10px 12px; }
  .sheet-metric-label { font-family: var(--mono); font-size: 9px; color: var(--muted); text-transform:uppercase; letter-spacing:.1em; margin-bottom:4px; }
  .sheet-metric-val   { font-family: var(--mono); font-size: 15px; font-weight: 700; }
  .risk-section { margin-bottom: 14px; }
  .risk-title { font-family: var(--mono); font-size: 10px; color: var(--muted); text-transform:uppercase; letter-spacing:.1em; margin-bottom: 8px; }
  .risk-list { display: flex; flex-direction: column; gap: 5px; }
  .risk-item { display: flex; align-items: center; gap: 8px; font-size: 13px; }
  .risk-icon { font-size: 14px; }
  .dex-btn { width: 100%; padding: 13px; border-radius: 10px; border: none; background: var(--violet); color: #fff; font-family: var(--mono); font-size: 13px; font-weight: 700; cursor: pointer; letter-spacing: .05em; transition: background .15s; }
  .dex-btn:active { background: var(--violet2); }

  .loading { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; }
  .spinner { width:36px; height:36px; border:3px solid var(--border); border-top-color:var(--violet2); border-radius:50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to{transform:rotate(360deg)} }
  .loading-text { font-family: var(--mono); font-size:12px; color: var(--muted); }

  .refresh-btn { position: fixed; bottom: 24px; right: 16px; width: 48px; height: 48px; border-radius: 50%; background: var(--violet); border: none; color: #fff; font-size: 20px; cursor: pointer; box-shadow: 0 4px 20px rgba(124,58,237,.5); display: flex; align-items:center; justify-content:center; transition: transform .15s; z-index: 20; }
  .refresh-btn:active { transform: scale(0.9) rotate(180deg); }
  .refresh-btn.spinning { animation: spin 0.7s linear; }

  .disclaimer { padding: 10px 14px; font-size: 10px; color: var(--muted); text-align: center; font-family: var(--mono); line-height:1.5; border-top: 1px solid var(--border); }
`;

function fmt(n) {
  if (n >= 1e9) return "$" + (n/1e9).toFixed(2) + "B";
  if (n >= 1e6) return "$" + (n/1e6).toFixed(2) + "M";
  if (n >= 1e3) return "$" + (n/1e3).toFixed(1) + "K";
  return "$" + (n?.toFixed(2) ?? "0");
}
function fmtPrice(p) {
  if (!p) return "$0";
  if (p < 0.000001) return "$" + p.toExponential(2);
  if (p < 0.001) return "$" + p.toFixed(7);
  if (p < 1) return "$" + p.toFixed(5);
  return "$" + p.toFixed(4);
}
function timeAgo(ms) {
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return s + "s ago";
  if (s < 3600) return Math.floor(s/60) + "m ago";
  if (s < 86400) return Math.floor(s/3600) + "h ago";
  return Math.floor(s/86400) + "d ago";
}

function scoreToken(t) {
  let score = 50;
  const tags = [];
  const risks = [];
  const liq = t.liquidity?.usd ?? 0;
  const vol24 = t.volume?.h24 ?? 0;
  const mc = t.fdv ?? 0;
  const change5m = t.priceChange?.m5 ?? 0;
  const change1h = t.priceChange?.h1 ?? 0;
  const txns24 = (t.txns?.h24?.buys ?? 0) + (t.txns?.h24?.sells ?? 0);
  const buyRatio = txns24 > 0 ? (t.txns?.h24?.buys ?? 0) / txns24 : 0.5;
  const pairAge = t.pairCreatedAt ? Date.now() - t.pairCreatedAt : 999e9;
  const ageH = pairAge / 3600000;

  if (liq < 5000) { score -= 30; risks.push({ icon:"🚨", text:"Extremely low liquidity (<$5K)", bad:true }); tags.push({t:"ILLIQUID",c:"bad"}); }
  else if (liq < 20000) { score -= 10; risks.push({ icon:"⚠️", text:"Low liquidity (<$20K)", bad:true }); }
  else if (liq > 100000) { score += 10; tags.push({t:"LIQ OK",c:"good"}); risks.push({ icon:"✅", text:"Decent liquidity", bad:false }); }

  if (mc > 0 && vol24 / mc > 1.5) { score += 15; tags.push({t:"VOL SURGE",c:"info"}); risks.push({ icon:"🔥", text:"Volume > 150% of market cap", bad:false }); }
  else if (mc > 0 && vol24 / mc > 0.5) { score += 8; tags.push({t:"ACTIVE",c:"good"}); }

  if (buyRatio > 0.65) { score += 12; tags.push({t:"BUY SIDE",c:"good"}); risks.push({ icon:"📈", text:(buyRatio*100).toFixed(0) + "% buys vs sells", bad:false }); }
  else if (buyRatio < 0.35) { score -= 15; tags.push({t:"SELL SIDE",c:"bad"}); risks.push({ icon:"📉", text:"Heavy sell pressure (" + (buyRatio*100).toFixed(0) + "% buys)", bad:true }); }

  if (change5m > 20) { score += 10; tags.push({t:"+" + change5m.toFixed(0) + "% 5M",c:"good"}); }
  if (change5m < -20) { score -= 20; tags.push({t:change5m.toFixed(0) + "% 5M",c:"bad"}); risks.push({ icon:"💀", text:"Sharp 5m dump", bad:true }); }
  if (change1h > 100) { score += 8; tags.push({t:"MOONING",c:"info"}); }

  if (ageH < 1) { score -= 10; tags.push({t:"<1H OLD",c:"warn"}); risks.push({ icon:"⚠️", text:"Pair less than 1 hour old", bad:true }); }
  else if (ageH < 6) { tags.push({t:"FRESH",c:"info"}); risks.push({ icon:"🆕", text:"Fresh pair (< 6 hours)", bad:false }); }

  if (mc > 0 && mc < 500000) { score += 8; tags.push({t:"MICRO CAP",c:"info"}); }
  if (mc > 0 && mc > 50e6) { score -= 5; }

  score = Math.max(0, Math.min(100, Math.round(score)));
  let verdict = "ok";
  if (score >= 70) verdict = "hot";
  else if (score < 30) verdict = "rug";
  else if (score < 50) verdict = "warn";

  return { score, tags: tags.slice(0,4), risks, verdict };
}

function ScoreRing({ score, verdict }) {
  const r = 15;
  const c = 2 * Math.PI * r;
  const fill = (score / 100) * c;
  const color = verdict === "hot" ? "#a855f7" : verdict === "rug" ? "#ef4444" : verdict === "warn" ? "#f59e0b" : "#22c55e";
  return (
    <div className="score-ring">
      <svg width="38" height="38" viewBox="0 0 38 38">
        <circle cx="19" cy="19" r={r} fill="none" stroke="#1e1e35" strokeWidth="4"/>
        <circle cx="19" cy="19" r={r} fill="none" stroke={color} strokeWidth="4" strokeDasharray={fill + " " + c} strokeLinecap="round"/>
      </svg>
      <div className="score-num" style={{color}}>{score}</div>
    </div>
  );
}

function TokenCard({ token, onSelect, isNew }) {
  const { score, tags, verdict } = scoreToken(token);
  const ch1h = token.priceChange?.h1 ?? 0;
  const liq = token.liquidity?.usd ?? 0;
  const vol = token.volume?.h24 ?? 0;
  const mc  = token.fdv ?? 0;
  return (
    <div className={"token-card " + verdict + (isNew ? " new-flash" : "")} onClick={() => onSelect(token)}>
      <div className={"signal-bar " + verdict}/>
      <div className="card-row1">
        <div>
          <div className="token-name">{token.baseToken?.name ?? "Unknown"}</div>
          <div className="token-sym">${token.baseToken?.symbol ?? "???"}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div className={"price-change " + (ch1h >= 0 ? "up" : "down")}>
            {ch1h >= 0 ? "+" : ""}{ch1h?.toFixed(1) ?? "0"}% <span style={{fontSize:9,opacity:.6}}>1H</span>
          </div>
          <div className="token-age">{token.pairCreatedAt ? timeAgo(token.pairCreatedAt) : "—"}</div>
        </div>
      </div>
      <div className="card-metrics">
        <div className="metric"><div className="metric-label">LIQ</div><div className="metric-val">{fmt(liq)}</div></div>
        <div className="metric"><div className="metric-label">VOL 24H</div><div className="metric-val">{fmt(vol)}</div></div>
        <div className="metric"><div className="metric-label">MCAP</div><div className="metric-val">{mc > 0 ? fmt(mc) : "—"}</div></div>
      </div>
      <div className="score-ring-wrap">
        <ScoreRing score={score} verdict={verdict}/>
        <div className="score-labels">
          {tags.map((tg,i) => <span key={i} className={"tag " + tg.c}>{tg.t}</span>)}
        </div>
      </div>
    </div>
  );
}

function DetailSheet({ token, onClose }) {
  const { score, tags, risks, verdict } = scoreToken(token);
  const addr = token.baseToken?.address ?? "";
  const dexUrl = "https://dexscreener.com/solana/" + (token.pairAddress ?? addr);
  return (
    <div className="sheet-overlay" onClick={e => e.target.className.includes("overlay") && onClose()}>
      <div className="sheet">
        <div className="sheet-handle"/>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:4}}>
          <ScoreRing score={score} verdict={verdict}/>
          <div>
            <div className="sheet-name">{token.baseToken?.name ?? "Unknown"}</div>
            <div style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--violet2)"}}>${token.baseToken?.symbol}</div>
          </div>
        </div>
        <div className="sheet-addr">{addr || "Address unavailable"}</div>
        <div className="sheet-grid">
          {[
            ["Price", fmtPrice(token.priceUsd)],
            ["5m Change", (token.priceChange?.m5 >= 0 ? "+" : "") + (token.priceChange?.m5?.toFixed(2) ?? "0") + "%"],
            ["1h Change", (token.priceChange?.h1 >= 0 ? "+" : "") + (token.priceChange?.h1?.toFixed(2) ?? "0") + "%"],
            ["Liquidity", fmt(token.liquidity?.usd ?? 0)],
            ["Vol 24h", fmt(token.volume?.h24 ?? 0)],
            ["Market Cap", token.fdv > 0 ? fmt(token.fdv) : "—"],
            ["Buys 24h", token.txns?.h24?.buys ?? "—"],
            ["Sells 24h", token.txns?.h24?.sells ?? "—"],
          ].map(([l,v]) => (
            <div key={l} className="sheet-metric">
              <div className="sheet-metric-label">{l}</div>
              <div className="sheet-metric-val">{v}</div>
            </div>
          ))}
        </div>
        <div className="risk-section">
          <div className="risk-title">Signal Analysis</div>
          <div className="risk-list">
            {risks.length ? risks.map((r,i) => (
              <div key={i} className="risk-item">
                <span className="risk-icon">{r.icon}</span>
                <span style={{color: r.bad ? "var(--red)" : "var(--text)", fontSize:12}}>{r.text}</span>
              </div>
            )) : <div style={{color:"var(--muted)",fontSize:12}}>No strong signals detected.</div>}
          </div>
        </div>
        <div style={{marginBottom:12,display:"flex",flexWrap:"wrap",gap:5}}>
          {tags.map((tg,i) => <span key={i} className={"tag " + tg.c}>{tg.t}</span>)}
        </div>
        <button className="dex-btn" onClick={() => window.open(dexUrl,"_blank")}>VIEW ON DEXSCREENER</button>
      </div>
    </div>
  );
}

const FILTERS = ["ALL", "HOT", "RISKY", "RUG", "NEW"];

export default function SolanaScanner() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [newIds, setNewIds] = useState(new Set());
  const prevIds = useRef(new Set());

  const fetchTokens = useCallback(async () => {
    try {
      const res = await fetch("https://api.dexscreener.com/token-profiles/latest/v1", { headers: { accept: "application/json" } });
      const data = await res.json();
      const solTokens = (Array.isArray(data) ? data : []).filter(t => t.chainId === "solana").slice(0, 40);
      if (!solTokens.length) {
        const r2 = await fetch("https://api.dexscreener.com/latest/dex/search?q=solana+meme");
        const d2 = await r2.json();
        processPairs((d2.pairs ?? []).filter(p => p.chainId === "solana").slice(0, 30));
        return;
      }
      const addresses = solTokens.map(t => t.tokenAddress).join(",");
      const r2 = await fetch("https://api.dexscreener.com/tokens/v1/solana/" + addresses);
      const d2 = await r2.json();
      const pairs = Array.isArray(d2) ? d2.slice(0,30) : (d2.pairs ?? []).slice(0,30);
      processPairs(pairs);
    } catch (e) {
      try {
        const r = await fetch("https://api.dexscreener.com/latest/dex/search?q=sol+pump");
        const d = await r.json();
        processPairs((d.pairs ?? []).filter(p => p.chainId === "solana").slice(0,30));
      } catch { setLoading(false); }
    }
  }, []);

  function processPairs(pairs) {
    const fresh = new Set();
    pairs.forEach(p => { if (!prevIds.current.has(p.pairAddress)) fresh.add(p.pairAddress); });
    prevIds.current = new Set(pairs.map(p => p.pairAddress));
    setNewIds(fresh);
    setTokens(pairs);
    setLoading(false);
    setTimeout(() => setNewIds(new Set()), 1500);
  }

  useEffect(() => { fetchTokens(); }, [fetchTokens]);

  const handleRefresh = () => {
    setSpinning(true);
    setLoading(true);
    fetchTokens().finally(() => setSpinning(false));
  };

  const filtered = tokens.filter(t => {
    const { verdict } = scoreToken(t);
    const ageH = t.pairCreatedAt ? (Date.now() - t.pairCreatedAt)/3600000 : 999;
    if (filter === "HOT")   return verdict === "hot";
    if (filter === "RISKY") return verdict === "warn";
    if (filter === "RUG")   return verdict === "rug";
    if (filter === "NEW")   return ageH < 24;
    return true;
  });

  const hotCount = tokens.filter(t => scoreToken(t).verdict === "hot").length;
  const avgScore = tokens.length ? Math.round(tokens.reduce((a,t) => a + scoreToken(t).score, 0) / tokens.length) : 0;

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <div className="header">
          <div className="header-top">
            <div className="logo">SOL<span>RADAR</span></div>
            <div className="live-dot"><div className="dot"/>LIVE · SOLANA</div>
          </div>
          <div className="filter-bar">
            {FILTERS.map(f => (
              <button key={f} className={"filter-btn" + (filter === f ? " active" : "")} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
        </div>
        <div className="stats-bar">
          <div className="stat-cell"><div className="stat-label">Tracked</div><div className="stat-value violet">{tokens.length}</div></div>
          <div className="stat-cell"><div className="stat-label">Hot Signals</div><div className="stat-value green">{hotCount}</div></div>
          <div className="stat-cell"><div className="stat-label">Avg Score</div><div className="stat-value amber">{avgScore}</div></div>
        </div>
        <div className="feed">
          {loading ? (
            <div className="loading"><div className="spinner"/><div className="loading-text">Scanning Solana memecoins...</div></div>
          ) : filtered.length === 0 ? (
            <div className="loading"><div style={{fontSize:32}}>🔍</div><div className="loading-text">No tokens match this filter</div></div>
          ) : (
            filtered.map(t => <TokenCard key={t.pairAddress} token={t} onSelect={setSelected} isNew={newIds.has(t.pairAddress)}/>)
          )}
        </div>
        <div className="disclaimer">NOT FINANCIAL ADVICE · DYOR · Scores are signals, not guarantees</div>
      </div>
      <button className={"refresh-btn" + (spinning ? " spinning" : "")} onClick={handleRefresh}>↻</button>
      {selected && <DetailSheet token={selected} onClose={() => setSelected(null)}/>}
    </>
  );
}
