"use client"

import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StockCardProps {
  stock: {
    symbol: string
    name: string
    price: number
    change: number
    changePercent: number
  }
  onClick: () => void
  isSelected: boolean
}

export function StockCard({ stock, onClick, isSelected }: StockCardProps) {
  const isPositive = stock.change >= 0

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 shadow-sm transition-all hover:scale-[1.015] hover:border-zinc-700 hover:shadow-md",
        isSelected ? "bg-blue-400/20 ring-2 ring-blue-400" : "",
      )}
    >
      <div className="flex items-center justify-between">
        {/* Left: Stock Symbol and Name */}
        <div className="flex flex-col">
          <h3 className="text-md font-semibold tracking-wide text-white">{stock.symbol}</h3>
          <p className="truncate text-xs text-zinc-400">{stock.name}</p>
        </div>

        {/* Right: Price and Change */}
        <div className="flex flex-col items-end">
          <p className="text-base font-medium text-white">
            ₹{stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <div
            className={cn(
              "mt-0.5 flex items-center text-sm font-medium",
              isPositive ? "text-green-500" : "text-red-500",
            )}
          >
            {isPositive ? <TrendingUp className="mr-1 h-4 w-4" /> : <TrendingDown className="mr-1 h-4 w-4" />}
            {isPositive ? "+" : ""}
            {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
          </div>
        </div>
      </div>
    </div>
  )
}
