import { useState, useEffect, useCallback, useRef } from "react";

// ─── THEME ────────────────────────────────────────────────────────────────────
// Deep space black + electric violet + toxic green + amber warning
// Monospace data face + tight condensed display
// Signature: a live "signal strength" pulse ring on each token card
// ─────────────────────────────────────────────────────────────────────────────

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

  /* ── LAYOUT ── */
  .app { max-width: 480px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; }

  /* ── HEADER ── */
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

  /* ── FILTER BAR ── */
  .filter-bar { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
  .filter-bar::-webkit-scrollbar { display: none; }
  .filter-btn {
    flex-shrink: 0; padding: 5px 12px; border-radius: 20px; border: 1px solid var(--border);
    background: transparent; color: var(--muted); font-family: var(--mono); font-size: 11px; cursor: pointer;
    transition: all 0.15s;
  }
  .filter-btn.active { background: var(--violet); border-color: var(--violet); color: #fff; }

  /* ── STATS BAR ── */
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

  /* ── FEED ── */
  .feed { flex: 1; padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; overflow-y: auto; }

  /* ── TOKEN CARD ── */
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
  .token-card.new-flash { animation: new-flash 0.6s ease; }
  @keyframes new-flash { 0%{background:#1a0a2e} 100%{background:var(--surface)} }

  /* signal bar on left edge */
  .signal-bar {
    position: absolute; left: 0; top: 0; bottom: 0; width: 3px; border-radius: 12px 0 0 12px;
  }
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

  /* score ring — signature element */
  .score-ring-wrap { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
  .score-ring { position: relative; width: 38px; height: 38px; flex-shrink: 0; }
  .score-ring svg { transform: rotate(-90deg); }
  .score-num { position: absolute; inset:0; display:flex; align-items:center; justify-content:center; font-family:var(--mono); font-size:10px; font-weight:700; }

  .score-labels { flex: 1; display: flex; flex-wrap: wrap; gap: 4px; }
  .tag {
    font-family: var(--mono); font-size: 9px; padding: 2px 6px; border-radius: 4px;
    font-weight: 700; letter-spacing: .04em;
  }
  .tag.good  { background: rgba(34,197,94,.15);  color: var(--green); }
  .tag.bad   { background: rgba(239,68,68,.15);   color: var(--red); }
  .tag.warn  { background: rgba(245,158,11,.15);  color: var(--amber); }
  .tag.info  { background: rgba(168,85,247,.15);  color: var(--violet2); }

  /* ── DETAIL SHEET ── */
  .sheet-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,.7); z-index: 50;
    display: flex; align-items: flex-end;
    animation: fade-in .15s ease;
  }
  @keyframes fade-in { from{opacity:0} to{opacity:1} }
  .sheet {
    width: 100%; max-width: 480px; margin: 0 auto;
    background: var(--surface);
    border-radius: 20px 20px 0 0;
    border-top: 1px solid var(--border);
    padding: 20px 18px 36px;
    animation: sheet-up .2s ease;
    max-height: 90vh; overflow-y: auto;
  }
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
  .dex-btn {
    width: 100%; padding: 13px; border-radius: 10px; border: none;
    background: var(--violet); color: #fff; font-family: var(--mono); font-size: 13px; font-weight: 700;
    cursor: pointer; letter-spacing: .05em; transition: background .15s;
  }
  .dex-btn:active { background: var(--violet2); }

  /* ── EMPTY / LOADING ── */
  .loading { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; }
  .spinner { width:36px; height:36px; border:3px solid var(--border); border-top-color:var(--violet2); border-radius:50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to{transform:rotate(360deg)} }
  .loading-text { font-family: var(--mono); font-size:12px; color: var(--muted); }

  /* ── REFRESH BTN ── */
  .refresh-btn {
    position: fixed; bottom: 24px; right: 16px;
    width: 48px; height: 48px; border-radius: 50%;
    background: var(--violet); border: none; color: #fff;
    font-size: 20px; cursor: pointer; box-shadow: 0 4px 20px rgba(124,58,237,.5);
    display: flex; align-items:center; justify-content:center;
    transition: transform .15s; z-index: 20;
  }
  .refresh-btn:active { transform: scale(0.9) rotate(180deg); }
  .refresh-btn.spinning { animation: spin 0.7s linear; }

  /* ── DISCLAIMER ── */
< truncated lines 187-379 >
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
          {tags.map((tg,i) => <span key={i} className={`tag ${tg.c}`}>{tg.t}</span>)}
        </div>

        <button className="dex-btn" onClick={() => window.open(dexUrl,"_blank")}>
          VIEW ON DEXSCREENER ↗
        </button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

const FILTERS = ["ALL", "🔥 HOT", "⚠️ RISKY", "💀 RUG", "🆕 NEW"];

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
      const res = await fetch(
        "https://api.dexscreener.com/token-profiles/latest/v1",
        { headers: { accept: "application/json" } }
      );
      const data = await res.json();

      // data is an array of token profile objects; fetch pair details for first 30
      const solTokens = (Array.isArray(data) ? data : [])
        .filter(t => t.chainId === "solana")
        .slice(0, 40);

      if (!solTokens.length) {
        // fallback: use search endpoint for top trending Solana tokens
        const r2 = await fetch("https://api.dexscreener.com/latest/dex/search?q=solana+meme");
        const d2 = await r2.json();
        const pairs = (d2.pairs ?? [])
          .filter(p => p.chainId === "solana")
          .slice(0, 30);
        processPairs(pairs);
        return;
      }

      // Fetch pair data for tokens by address (batch of 30)
      const addresses = solTokens.map(t => t.tokenAddress).join(",");
      const r2 = await fetch(`https://api.dexscreener.com/tokens/v1/solana/${addresses}`);
      const d2 = await r2.json();
      const pairs = Array.isArray(d2) ? d2.slice(0,30) : (d2.pairs ?? []).slice(0,30);
      processPairs(pairs);

    } catch (e) {
      // Fallback: direct search
      try {
        const r = await fetch("https://api.dexscreener.com/latest/dex/search?q=sol+pump");
        const d = await r.json();
        processPairs((d.pairs ?? []).filter(p => p.chainId === "solana").slice(0,30));
      } catch { setLoading(false); }
    }
  }, []);

  function processPairs(pairs) {
    const fresh = new Set();
    pairs.forEach(p => {
      if (!prevIds.current.has(p.pairAddress)) fresh.add(p.pairAddress);
    });
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
    const { verdict, score } = scoreToken(t);
    const ageH = t.pairCreatedAt ? (Date.now() - t.pairCreatedAt)/3600000 : 999;
    if (filter === "🔥 HOT")   return verdict === "hot";
    if (filter === "⚠️ RISKY") return verdict === "warn";
    if (filter === "💀 RUG")   return verdict === "rug";
    if (filter === "🆕 NEW")   return ageH < 24;
    return true;
  });

  const hotCount  = tokens.filter(t => scoreToken(t).verdict === "hot").length;
  const rugCount  = tokens.filter(t => scoreToken(t).verdict === "rug").length;
  const avgScore  = tokens.length ? Math.round(tokens.reduce((a,t) => a+scoreToken(t).score, 0)/tokens.length) : 0;

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        {/* HEADER */}
        <div className="header">
          <div className="header-top">
            <div className="logo">SOL<span>RADAR</span></div>
            <div className="live-dot">
              <div className="dot"/>
              LIVE · SOLANA
            </div>
          </div>
          <div className="filter-bar">
            {FILTERS.map(f => (
              <button key={f} className={`filter-btn ${filter===f?"active":""}`} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* STATS */}
        <div className="stats-bar">
          <div className="stat-cell">
            <div className="stat-label">Tracked</div>
            <div className="stat-value violet">{tokens.length}</div>
          </div>
          <div className="stat-cell">
            <div className="stat-label">Hot Signals</div>
            <div className="stat-value green">{hotCount}</div>
          </div>
          <div className="stat-cell">
            <div className="stat-label">Avg Score</div>
            <div className="stat-value amber">{avgScore}</div>
          </div>
        </div>

        {/* FEED */}
        <div className="feed">
          {loading ? (
            <div className="loading">
              <div className="spinner"/>
              <div className="loading-text">Scanning Solana memecoins...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="loading">
              <div style={{fontSize:32}}>🔍</div>
              <div className="loading-text">No tokens match this filter</div>
            </div>
          ) : (
            filtered.map(t => (
              <TokenCard
                key={t.pairAddress}
                token={t}
                onSelect={setSelected}
                isNew={newIds.has(t.pairAddress)}
              />
            ))
          )}
        </div>

        {/* DISCLAIMER */}
        <div className="disclaimer">
          NOT FINANCIAL ADVICE · DYOR · Scores are signals, not guarantees
        </div>
      </div>

      {/* REFRESH */}
      <button className={`refresh-btn ${spinning?"spinning":""}`} onClick={handleRefresh}>↻</button>

      {/* DETAIL SHEET */}
      {selected && <DetailSheet token={selected} onClose={() => setSelected(null)}/>}
    </>
  );
        }
