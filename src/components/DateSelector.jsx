import React, { useEffect } from 'react'

export default function DateSelector({ startDate, setStartDate, endDate, setEndDate }) {
  // Prevent selecting sell date before buy date
  useEffect(() => {
    if (startDate && endDate && endDate < startDate) {
      setEndDate(startDate)
    }
  }, [startDate, endDate, setEndDate])

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 mb-6 justify-center">
      {/* Buy Date */}
      <div className="flex-1">
        <label className="block text-gray-700 font-semibold mb-1" title="Hypothetical Purchase Date">📅 Buy Date</label>
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="w-full bg-white border border-gray-300 px-4 py-2 rounded-2xl shadow-inner focus:outline-none focus:ring-2 focus:ring-iosBlue-400 transition"
          max={today}
        />
      </div>

      {/* Sell Date */}
      <div className="flex-1">
        <label className="block text-gray-700 font-semibold mb-1" title="Hypothetical Selling Date">📅 Sell Date</label>
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className="w-full bg-white border border-gray-300 px-4 py-2 rounded-2xl shadow-inner focus:outline-none focus:ring-2 focus:ring-iosBlue-400 transition"
          min={startDate || '2000-01-01'}
          max={today}
        />
      </div>
    </div>
  )
}
