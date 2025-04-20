import React, { useState, useEffect, useRef } from 'react'
import nseStockList from './nseStockList.json'

export default function StockSearch({ ticker, setTicker }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const containerRef = useRef()

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }
    const filtered = nseStockList
      .filter(s =>
        s.symbol.toLowerCase().includes(query.toLowerCase()) ||
        s.name.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 8)
    setSuggestions(filtered)
  }, [query])

  // Close dropdown on click outside
  useEffect(() => {
    const onClick = e => {
      if (!containerRef.current.contains(e.target)) {
        setSuggestions([])
      }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-lg font-semibold mb-2 text-gray-700">
        🔍 Search NSE Stock
      </label>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Start typing e.g. INFY, RELIANCE"
        className="w-full border border-gray-300 px-5 py-3 rounded-2xl shadow-inner bg-white focus:outline-none focus:ring-2 focus:ring-iosBlue-400 text-gray-800 text-lg transition"
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full bg-white rounded-xl shadow-lg backdrop-blur-sm overflow-auto max-h-60 ring-1 ring-gray-200">
          {suggestions.map(s => (
            <li
              key={s.symbol}
              onClick={() => {
                setTicker(s.symbol)
                setQuery(s.symbol)
                setSuggestions([])
              }}
              className="px-5 py-3 hover:bg-iosBlue-100 cursor-pointer transition"
            >
              <div className="font-semibold text-iosBlue-800">{s.symbol}</div>
              <div className="text-sm text-gray-600 truncate">{s.name}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
