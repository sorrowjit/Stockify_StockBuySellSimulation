// src/components/ResultPanel.jsx
import React, { useEffect, useState, useRef } from 'react'
import { getHistoricalData, getDividendData } from '../utils/api'
import { calculateGainLoss } from '../utils/calculateGainLoss'
import html2canvas from 'html2canvas'         // ← SHARE CARD: html2canvas import
import confetti from 'canvas-confetti'        // ← CONFETTI: canvas‑confetti import

export default function ResultPanel({
  ticker,
  startDate,
  endDate,
  quantity,
  result,
  setResult
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const cardRef = useRef(null)                      // ← SHARE CARD: ref to the card

  // Guard against too-short data
  function computeVolatilityMetrics(data) {
    if (data.length < 2) return { stdDev: 0 }
    const returns = data
      .map((d, i) =>
        i > 0 ? (d.close - data[i - 1].close) / data[i - 1].close : null
      )
      .filter(r => r != null)
    if (returns.length < 1) return { stdDev: 0 }
    const mean     = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const variance = returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / returns.length
    return { stdDev: Math.sqrt(variance) }
  }

  useEffect(() => {
    if (!ticker || !startDate || !endDate || !quantity) return

    async function fetchAndCalculate() {
      setLoading(true)
      setError('')
      try {
        // 1) Fetch historical OHLC for stock
        const data = await getHistoricalData(ticker, startDate, endDate)
        if (!data || data.length === 0) throw new Error('No price data found')

        // 2) Sort & extract prices
        const sorted    = data.sort((a, b) => new Date(a.date) - new Date(b.date))
        const buyPrice  = sorted[0].open.toFixed(4)
        const sellPrice = sorted[sorted.length - 1].close.toFixed(4)

        // 3) Gain/Loss & Tax
        const { gross, tax, net, taxType, holdingDays } = calculateGainLoss({
          buyPrice, sellPrice, quantity, buyDate: startDate, sellDate: endDate
        })

        // 4) Dividends
        const dividends = await getDividendData(ticker)
        const totalDiv  = dividends
          .filter(d => d.date >= startDate && d.date <= endDate)
          .reduce((sum, d) => sum + d.dividends * quantity, 0)

        // 5) Volatility (unchanged)
        const { stdDev }    = computeVolatilityMetrics(sorted)
        const volPctRaw     = stdDev * 100
        const volPct        = isFinite(volPctRaw) ? volPctRaw : 0
        let volEmoji        = '🚀 Steady Rocket'
        if (volPct >= 2)      volEmoji = '⚠️ Risky'
        else if (volPct >= 1) volEmoji = '😊 Balanced'
        const volatilityScore = `${volEmoji} (${volPct.toFixed(2)}%)`

        // 6) CAGR for Buffett & Personality
        const years    = holdingDays / 365
        const cagr     = years > 0
          ? Math.pow(sellPrice / buyPrice, 1 / years) - 1
          : 0
        const beatBuffett = cagr > 0.20

        // 7) Personality match (unchanged)
        let personality = "You would've been a 🤝 Balanced Investor"
        if (net < 0) {
          personality = "You would've been a 👻 The Ghost Trader"
        } else if (cagr > 0.30) {
          personality = " You would've been a 🚀 VC-Style Player"
        } else if (volPct < 1 && net > 0) {
          personality = " You would've been a 🐂 Silent Bull"
        } else if (volPct >= 2) {
          personality = "You would've been a 🎭 Drama Queen"
        }

        // ────────── NEW: Mood of the Market ──────────
        // Fetch NIFTY index data via Yahoo through proxy
        const idxFromTs = Math.floor(new Date(startDate).getTime() / 1000)
        const idxToTs   = Math.floor(new Date(endDate).getTime()   / 1000)
        const idxSymbol = '%5ENSEI'  // Yahoo’s NIFTY symbol encoded
        const idxUrl    = `https://api.allorigins.win/raw?url=${encodeURIComponent(
          `https://query1.finance.yahoo.com/v8/finance/chart/${idxSymbol}?period1=${idxFromTs}&period2=${idxToTs}&interval=1d`
        )}`
        let moodLabel = '😐 Choppy'
        try {
          const resIdx = await fetch(idxUrl)
          const txtIdx = await resIdx.text()
          const jsonIdx = JSON.parse(txtIdx)
          const chart = jsonIdx.chart?.result?.[0]
          if (chart) {
            const ts = chart.timestamp
            const closes = chart.indicators.quote[0].close
            const firstClose = closes[0]
            const lastClose  = closes[closes.length - 1]
            const pctChange  = ((lastClose - firstClose) / firstClose) * 100
            if (pctChange > 0) moodLabel = '📈 Optimistic'
            else if (pctChange < 0) moodLabel = '📉 Gloomy'
          }
        } catch {
          // if index fetch fails, default remains "Choppy"
        }
        const bp = Number(buyPrice)
        const sp = Number(sellPrice)
        const absoluteReturn = (((sp - bp) / bp) * 100).toFixed(2)

        // 8) Save all including mood
        setResult({
          buyPrice,
          sellPrice,
          gross,
          tax,
          net,
          taxType,
          holdingDays,
          totalDiv: Math.round(totalDiv),
          netTotal: Math.round(net + totalDiv),
          volatilityScore,
          beatBuffett,
          personality,
          moodLabel,   // ← new
          absoluteReturn
        })
        // ← CONFETTI: only now, if you really beat Buffett
        if (beatBuffett) {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
          }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAndCalculate()
  }, [ticker, startDate, endDate, quantity, setResult])

      // ─── SHARE CARD ──────────────────────────────────────────────────────────
   const generateShareCard = async () => {
    console.log('🖼️ [DEBUG] generateShareCard called')
    if (!cardRef.current) {
      console.warn('🖼️ [DEBUG] no cardRef.current — check ref on the container DIV')
      return
    }
    try {
      console.log('🖼️ [DEBUG] rendering html2canvas…')
      const canvas = await html2canvas(cardRef.current)
      const dataUrl = canvas.toDataURL('image/png')

      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `${ticker}_${startDate}_${endDate}.png`
      document.body.appendChild(link)

      // dispatch real click event
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }))
      console.log('🖼️ [DEBUG] dispatched click on link')

      document.body.removeChild(link)
    } catch (err) {
      console.error('🖼️ [DEBUG] share-card error:', err)
      alert('Failed to generate share card. See console for details.')
    }
  }

  if (loading)
    return <div className="text-center py-4 text-green-600 font-bold">⏳ Calculating...</div>
  if (error)
    return <div className="text-center py-4 text-red-500 font-bold">❌ Sorry, {error}</div>
  if (!result) return null

  const {
    buyPrice,
    sellPrice,
    gross,
    tax,
    net,
    taxType,
    holdingDays,
    totalDiv,
    netTotal,
    volatilityScore,
    beatBuffett,
    personality,
    moodLabel,   // ← destructure
    absoluteReturn
  } = result

  // Gamified conversions (unchanged)
  let conversions = null
  if (netTotal > 0) {
    const raw = {
      iPhones:      netTotal / 80000,
      GoaTrips:     netTotal / 40000,
      NetflixYears: netTotal / (799 * 12)
    }
    conversions = Object.entries(raw)
      .filter(([_, v]) => v >= 1)
      .map(([k, v]) => [k, (+v.toFixed(k === 'iPhones' ? 2 : 1)).toFixed(0)])
  }

  return (
    <div
      ref={cardRef}
      className="mt-6 bg-white rounded-3xl shadow-2xl p-6 space-y-4 max-w-xl mx-auto card"
    >
      <h2 className="text-2xl font-semibold text-center mb-2 heading">
        📈 <u className="text-2xl font-semibold text-center mb-2 heading">Simulation Outcome</u>
      </h2>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-white">
        <div className="flex justify-between">
          <span title="Opening price of the first day you held the stock">🛒 Buy Price:</span><span className='font-semibold'>₹{buyPrice.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between">
          <span title="Closing price of the last day you held the stock">💹 Sell Price:</span><span className='font-semibold'>₹{sellPrice.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between">
          <span title="Gross P&L = (Sell Price – Buy Price) × Quantity">💰 Gross P&L:</span>{' '}
          <span className={gross >= 0 ? 'text-green-500 font-semibold' : 'text-red-600 font-semibold'}>
            ₹{gross.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="flex justify-between">
          <span title="Taxes applied: LTCG at 10% (over ₹1 lakh) after 1 year, STCG 15% if <1 year. Ignoring Grandfathering Clause and Transfer Expenses">🧾 {taxType} Tax:</span><span className={tax > 0 ? 'text-red-600 font-semibold' : 'text-gray-600 font-semibold'}>₹{tax.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between"> 
          <span title="Absolute Return = (Sell - Buy) ÷ Buy × 100% ">🎯 Abs. Return %:</span><span className={absoluteReturn >= 0 ? 'text-green-500 font-semibold' : 'text-red-600 font-semibold'}>{absoluteReturn.toLocaleString('en-IN')} %</span>
        </div>
        <div className="flex justify-between">
          <span title="Net P&L = Gross P&L – Tax + Dividends. Dividend data is not always possible to fetch due to no accurate APIs">💵 Net P&L:</span>{' '}
          <span className={netTotal >= 0 ? 'text-green-500 font-bold' : 'text-red-600 font-bold'}>
            ₹{netTotal.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="flex justify-between">
          <span title="Number of days between your buy and sell dates">📆 Held Days:</span><span className='font-semibold'>{holdingDays} days</span>
        </div>
        <div className="flex justify-between">
          <span title="Which tax regime applied, based on your holding period">⚖️ Tax Type:</span><span className='font-semibold'>{taxType}</span>
        </div>

        {/* Buffett comparison */}
        <div className="col-span-2 flex justify-between pt-2 text-center">
          <span title="Did your CAGR during holding exceed Buffett’s ~20%? as per Bloomberg.com">🐂</span><span>Would you've been able to beat Mr.Buffett's CAGR?</span>
          <span className={beatBuffett ? 'text-green-400 font-semibold' : 'text-orange-500 font-semibold'}>
            {beatBuffett ? 'Yes! 🎉✅' : 'Nope!'}
          </span>
        </div>

        {/* Volatility (still present even if not shown; kept intact) */}
        <div className="col-span-2 pt-2 text-center border-t border-gray-200">
          <span title="How NIFTY moved overall from buy to sell dates">📊 How was the Volatility: </span><span className='font-semibold'>{volatilityScore}</span>
        </div>
      </div>

      {/* NEW: Mood of the Market */}
      <div className="bg-pink-200 rounded-2xl p-4 text-center">
        <p className="text-lg font-semibold" title="We fetched NIFTY’s closing price on your buy date and your sell date;
        compared them to get % change; if > 0 → Optimistic 📈, if < 0 → Gloomy 📉, otherwise Choppy 😐">Mood of the Market would've been {moodLabel}</p>
      </div>

      {/* Personality Match */}
      <div className="bg-gray-200 rounded-2xl p-4 text-center hover:bg-iosBlue-200">
        <p className="text-lg font-semibold hover:bg-yellow-200" title="A fun personality match based on your return & volatility">{personality}</p>
      </div>

      {conversions && conversions.length > 0 && (
        <div className="bg-iosBlue-200 rounded-2xl p-4 text-center space-y-1 mt-4 hover:bg-iosBlue-100">
          {conversions.map(([key, val]) => {
            let label = ''
            if (key === 'iPhones')      label = 'iPhones'
            if (key === 'GoaTrips')     label = 'trips to Goa'
            if (key === 'NetflixYears') label = 'years of Netflix'
            return (
              <p key={key} className="text-lg font-semibold text-iosBlue-900 hover:bg-yellow-200">
                🎉 You could've had {val} {label}
              </p>
            )
          })}
        </div>
      )}

        <div className="flex justify-center mt-4">
        <button
    onClick={generateShareCard}
    className="
      bg-green-600         
      hover:bg-green-900   
      text-white
      px-4 py-2
      rounded-2xl
      shadow
      transition-colors    
      duration-200 
      font-semibold        
    "
  >
          📸 Download this Result Card
        </button>
      </div>
    </div>
  )
}
