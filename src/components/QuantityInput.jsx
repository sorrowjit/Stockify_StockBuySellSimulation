// src/components/QuantityInput.jsx

import React from 'react'

export default function QuantityInput({ quantity, setQuantity }) {
  // Update quantity, stripping leading zeros, allow empty input
  const handleChange = (e) => {
    const raw = e.target.value
    // Remove leading zeros
    const noLeading = raw.replace(/^0+/, '')
    if (noLeading === '') {
      // Empty field → set to empty string
      setQuantity('')
    } else {
      // Otherwise parse to integer
      const num = parseInt(noLeading, 10)
      setQuantity(isNaN(num) ? '' : num)
    }
  }

  return (
    <div className="mb-6">
      <label className="block text-gray-700 font-semibold mb-2" title="No. of Shares you would have purchased and sold">
        🔢 Quantity
      </label>
      <input
        type="number"
        min="1"
        value={quantity === 0 || quantity === '' ? '' : quantity}
        onChange={handleChange}
        placeholder="e.g. 100"
        className="
          w-full
          border border-gray-300
          px-5 py-3
          rounded-2xl
          shadow-inner
          bg-white
          focus:outline-none focus:ring-2 focus:ring-iosBlue-400
          transition
          text-gray-800 text-lg
        "
      />
    </div>
  )
}
