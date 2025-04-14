"use client"

import { useState } from "react"
import { StockCard } from "@/components/stock-card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

interface StockListProps {
  stocks: Stock[]
  onSelectStock: (symbol: string) => void
  selectedStock: string | null
}

export function StockList({ stocks, onSelectStock, selectedStock }: StockListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [stockData, setStockData] = useState<Stock[]>(stocks)


  const filteredStocks = stockData.filter((stock) =>
    `${stock.name} ${stock.symbol}`.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex h-full flex-col bg-zinc-950 text-white">
      {/* Header and Search */}
      <div className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950 px-4 py-3">
        <h2 className="mb-3 text-md font-semibold tracking-tight">NIFTY 50 Stocks</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
        placeholder="Search by name or symbol..."
        className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-8 py-2 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Stock List */}
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-3">
          {filteredStocks.length > 0 ? (
            filteredStocks.map((stock) => (
              <StockCard
                key={stock.symbol}
                stock={stock}
                onClick={() => onSelectStock(stock.symbol)}
                isSelected={selectedStock === stock.symbol}
              />
            ))
          ) : (
            <div className="mt-6 text-center text-sm text-zinc-500">No stocks match your search.</div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
