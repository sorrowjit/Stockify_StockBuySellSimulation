// src/App.jsx
import React from 'react'
import StockSimulator from './components/StockSimulator'

export default function App() {
  return (
    <div className="min-h-screen bg-iosBlue-50 flex items-start justify-center py-10 px-6 maindiv" >
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-3xl p-8" >
        <h1 className="text-3xl font-extrabold text-center text-iosBlue-700 mb-6">
        🎲 What if you Bought & Sold that day?
        </h1>
        <StockSimulator />
      </div>
    </div>
  )
}

//style="background: linear-gradient(to right, #696eff, #f8acff); background-size: cover; background-attachment: fixed;">
