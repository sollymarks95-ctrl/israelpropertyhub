import Link from 'next/link'
export const metadata = { title: 'Live Charts | RepHuby Markets' }
const SYMBOLS = [
  { v:'CAPITALCOM:GOLD', l:'Gold', icon:'🥇', g:'Metals' },
  { v:'CAPITALCOM:SILVER', l:'Silver', icon:'⚪', g:'Metals' },
  { v:'CAPITALCOM:COPPER', l:'Copper', icon:'🔶', g:'Metals' },
  { v:'CAPITALCOM:OIL_CRUDE', l:'WTI Oil', icon:'🛢️', g:'Energy' },
  { v:'CAPITALCOM:BRENT', l:'Brent Oil', icon:'⛽', g:'Energy' },
  { v:'CAPITALCOM:NATURAL_GAS', l:'Natural Gas', icon:'🔥', g:'Energy' },
  { v:'FX:EURUSD', l:'EUR/USD', icon:'💱', g:'Forex' },
  { v:'FX:GBPUSD', l:'GBP/USD', icon:'💷', g:'Forex' },
  { v:'FX:USDJPY', l:'USD/JPY', icon:'🇯🇵', g:'Forex' },
  { v:'FX:AUDUSD', l:'AUD/USD', icon:'🇦🇺', g:'Forex' },
  { v:'NASDAQ:AAPL', l:'Apple', icon:'🍎', g:'Stocks' },
  { v:'NASDAQ:NVDA', l:'NVIDIA', icon:'🖥️', g:'Stocks' },
  { v:'NYSE:TSLA', l:'Tesla', icon:'⚡', g:'Stocks' },
  { v:'SP:SPX', l:'S&P 500', icon:'📊', g:'Indices' },
  { v:'CAPITALCOM:US30', l:'Dow Jones', icon:'🏦', g:'Indices' },
  { v:'CAPITALCOM:BITCOIN', l:'Bitcoin', icon:'₿', g:'Crypto' },
  { v:'CAPITALCOM:ETHEREUM', l:'Ethereum', icon:'Ξ', g:'Crypto' },
  { v:'CAPITALCOM:URANIUM', l:'Uranium', icon:'☢️', g:'Metals' },
]
export default function ChartsPage() {
  const groups = [...new Set(SYMBOLS.map(s => s.g))]
  return (
    <div style={{ minHeight:'100vh', background:'#0f172a', fontFamily:'sans-serif' }}>
      <div style={{ background:'#111827', padding:'14px 24px', display:'flex', alignItems:'center', gap:16, justifyContent:'space-between', borderBottom:'1px solid #1e293b' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <Link href="/news/global-trade-wire"><span style={{ color:'#64748b', fontSize:13, cursor:'pointer' }}>← RepHuby</span></Link>
          <span style={{ color:'#fff', fontWeight:900, fontSize:20 }}>📈 Live Charts</span>
        </div>
        <span style={{ color:'#475569', fontSize:12 }}>Powered by TradingView · Real-time data</span>
      </div>
      <div style={{ maxWidth:1400, margin:'0 auto', padding:20 }}>
        {/* Main TradingView Chart */}
        <div style={{ background:'#fff', borderRadius:8, overflow:'hidden', marginBottom:24 }}>
          <iframe
            src="https://s.tradingview.com/widgetembed/?frameElementId=tv_full&symbol=CAPITALCOM%3AGOLD&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%22RSI%40tv-basicstudies%22%2C%22MACD%40tv-basicstudies%22%5D&theme=light&style=1&timezone=exchange&withdateranges=1&show_popup_button=1"
            style={{ width:'100%', height:580, border:'none', display:'block' }}
            title="Full TradingView Chart"
            allow="fullscreen"
          />
        </div>
        {/* Symbol Grid */}
        {groups.map(g => (
          <div key={g} style={{ marginBottom:20 }}>
            <h2 style={{ color:'#94a3b8', fontSize:13, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>{g}</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:8 }}>
              {SYMBOLS.filter(s => s.g===g).map(sym => (
                <a key={sym.v} href={`https://www.tradingview.com/chart/?symbol=${encodeURIComponent(sym.v)}`} target="_blank" rel="noopener noreferrer">
                  <div style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:6, padding:'12px 14px', cursor:'pointer', display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:20 }}>{sym.icon}</span>
                    <div>
                      <div style={{ fontWeight:700, fontSize:13, color:'#fff' }}>{sym.l}</div>
                      <div style={{ fontSize:10, color:'#64748b', marginTop:2 }}>{sym.v.split(':')[1]}</div>
                    </div>
                    <span style={{ marginLeft:'auto', color:'#3b82f6', fontSize:12 }}>↗</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
        <div style={{ color:'#334155', fontSize:11, textAlign:'center', marginTop:20 }}>
          Charts powered by TradingView. Click any symbol to open full chart with all indicators. Data may be delayed.
        </div>
      </div>
    </div>
  )
}
