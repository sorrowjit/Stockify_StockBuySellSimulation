// src/utils/calculateGainLoss.js

export function calculateGainLoss({ buyPrice, sellPrice, quantity, buyDate, sellDate }) {
    const gross = (sellPrice - buyPrice) * quantity  // positive or negative
  
    // Compute holding period in days
    const buy = new Date(buyDate)
    const sell = new Date(sellDate)
    const diffTime = sell - buy
    const diffDays = diffTime / (1000 * 60 * 60 * 24)
  
    // Determine STCG vs LTCG
    let tax = 0
    let taxType = ''
    if (diffDays < 365) {
      taxType = 'STCG'
      if (gross > 0) tax = gross * 0.15
    } else {
      taxType = 'LTCG'
      if (gross > 100000) {
        tax = (gross - 100000) * 0.10
      }
    }
  
    const net = gross - tax  // post-tax gain (or loss)
  
    return {
      gross: Math.round(gross),
      tax: Math.round(tax),
      net: Math.round(net),
      taxType,
      holdingDays: Math.round(diffDays),
    }
  }
  