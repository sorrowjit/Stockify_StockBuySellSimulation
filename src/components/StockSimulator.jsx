// src/components/StockSimulator.jsx
import React, { useState } from 'react'
import StockSearch from './StockSearch'
import DateSelector from './DateSelector'
import QuantityInput from './QuantityInput'
import ResultPanel from './ResultPanel'

export default function StockSimulator() {
  const [ticker, setTicker] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [quantity, setQuantity] = useState('')
  const [result, setResult] = useState(null)

  return (
    <div className="space-y-6">
      <StockSearch ticker={ticker} setTicker={setTicker} />

      {ticker && (
        <>
          <DateSelector
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />

          {startDate && endDate && (
            <>
              <QuantityInput
                quantity={quantity}
                setQuantity={setQuantity}
              />

              {quantity > 0 && (
                
                <ResultPanel
                  ticker={ticker}
                  startDate={startDate}
                  endDate={endDate}
                  quantity={quantity}
                  result={result}
                  setResult={setResult}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
