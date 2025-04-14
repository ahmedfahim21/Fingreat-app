"use client"

import { useEffect, useState } from "react"
import { Stock, StockList } from "@/components/stock-list"
import { ChatInterface } from "@/components/chat-interface"
import { fetchStocksData } from "@/lib/stock-data"
import Image from "next/image"

export function StockDashboard() {
  const [stockData, setStockData] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStock, setSelectedStock] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchStocksData(); 
      setStockData(data);
      setLoading(false);
    };

    fetchData(); // Initial fetch on load

    const intervalId = setInterval(fetchData, 10000); // Fetch every 10 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  return (
    <div className="flex w-full h-full m-2 p-2 flex-col bg-zinc-950 text-white rounded-2xl shadow-lg">
      <div className="sticky top-0 z-10  flex items-center justify-center bg-zinc-900 p-2 rounded-t-2xl border-b border-zinc-800">
        <Image src="/fingreat.png" alt="FinGReaT Logo" width={30} height={30} className="mx-2"/>
        <h2 className="text-md font-bold tracking-wider drop-shadow-md">
          FinGReaT
        </h2>
      </div>

      <div className="flex flex-row gap-2 p-2 h-full overflow-y-auto">
        <div className="relative w-1/4 h-full overflow-y-auto border-r border-zinc-800">
        {loading? (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 bg-opacity-50">
            <div className="loader"></div>
          </div>
        )
        : (

          <StockList
            stocks={stockData}
            onSelectStock={(symbol) => setSelectedStock(symbol)}
            selectedStock={selectedStock}
          />
        )}
        </div>

        <div className="w-3/4 bg-zinc-900 p-4">
          <ChatInterface selectedStock={selectedStock} />
        </div>
      </div>
    </div>
  )
}
