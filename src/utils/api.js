// src/utils/api.js

const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart'
const PROXY     = 'https://api.allorigins.win/raw?url='

function normalizeTicker(ticker) {
  // Append .NS if missing
  return ticker.includes('.') ? ticker : `${ticker}.NS`
}

/**
 * Fetch historical OHLC data from Yahoo Finance via a proxy.
 * Returns array of { date, open, high, low, close, volume } or null.
 */
export async function getHistoricalData(origTicker, from, to) {
  const symbol = normalizeTicker(origTicker)
  const fromTs = Math.floor(new Date(from).getTime() / 1000)
  const toTs   = Math.floor(new Date(to).getTime()   / 1000)

  const yahooUrl = [
    YAHOO_BASE,
    encodeURIComponent(symbol)
  ].join('/') +
    `?period1=${fromTs}&period2=${toTs}&interval=1d&includePrePost=false`

  const fetchUrl = PROXY + encodeURIComponent(yahooUrl)

  try {
    const res = await fetch(fetchUrl)
    const text = await res.text()
    const json = JSON.parse(text)
    const chart = json.chart?.result?.[0]
    if (!chart) throw new Error('No data for ' + symbol)

    const { timestamp, indicators } = chart
    const quote = indicators.quote?.[0]
    return timestamp.map((ts, i) => ({
      date: new Date(ts * 1000).toISOString().split('T')[0],
      open:  quote.open[i],
      high:  quote.high[i],
      low:   quote.low[i],
      close: quote.close[i],
      volume: quote.volume[i],
    }))
  } catch (err) {
    console.error('Historical fetch error:', err)
    return null
  }
}

/**
 * Fetch dividend history from FMP (free plan).
 * Returns array of { date, dividends }.
 */
export async function getDividendData(origTicker) {
  const symbol = normalizeTicker(origTicker)
  const url = `https://financialmodelingprep.com/api/v3/historical-price-full/stock_dividend/${symbol}?apikey=${import.meta.env.VITE_FMP_API_KEY}`
  try {
    const res = await fetch(url)
    const json = await res.json()
    return (json.historical || []).map(d => ({
      date: d.date,
      dividends: d.dividends
    }))
  } catch (err) {
    console.error('Dividend fetch error:', err)
    return []
  }
}
