"use client"

import { useEffect, useState } from "react"
import { Stock, StockList } from "@/components/stock-list"
import { ChatInterface } from "@/components/chat-interface"
import { fetchStocksData } from "@/lib/stock-data"
import Image from "next/image"
import { Button } from "./ui/button"
import { Dialog, DialogTrigger } from "./ui/dialog"
import { DialogBox } from "./agent-dialog"
import { useCompany } from "@/hooks/use-company"
import Link from "next/link"

export function StockDashboard() {
  const [stockData, setStockData] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const { company, setCompany } = useCompany()

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchStocksData()
      setStockData(data)
      setLoading(false)
    }

    fetchData() // Initial fetch on load
    const intervalId = setInterval(fetchData, 10000) // Fetch every 10 seconds
    return () => clearInterval(intervalId) // Cleanup on unmount
  }, [])

  return (
    <div className="flex w-full h-full m-2 p-2 flex-col bg-zinc-950 text-white rounded-3xl shadow-xl">
      <Dialog>
        <div className="sticky top-0 z-10 flex items-center justify-between bg-zinc-900 p-3 rounded-2xl border-b border-zinc-800 shadow-md mb-2">
          <div className="flex items-center">
            <Image 
              src="/fingreat.png" 
              alt="FinGReaT Logo" 
              width={40} 
              height={40} 
              className="mx-2 rounded-full shadow-lg" 
            />
            <h2 className="text-lg font-bold tracking-wider drop-shadow-md bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text">
              FinGReaT
            </h2>
          </div>
          
          {/* Trade with section */}
          <div className="flex items-center space-x-5 ml-auto mr-3">
            <h2 className="text-sm font-semibold text-zinc-300">Trade with</h2>
            <div className="flex items-center group transition-all duration-300">
              <Link href="https://upstox.com/" target="_blank" rel="noopener noreferrer">
                <Image
                  src="/upstox_logo.png"
                  alt="Upstox"
                  width={42}
                  height={42}
                  className="transition-transform relative duration-300 transform group-hover:translate-x-0 -ml-2 z-40 hover:scale-110 rounded-full p-1 bg-zinc-800 hover:bg-zinc-700"
                />
              </Link>
              <Link href="https://kite.zerodha.com/" target="_blank" rel="noopener noreferrer">
                <Image
                  src="/kite_logo.png"
                  alt="Kite"
                  width={42}
                  height={42}
                  className="transition-transform relative right-4 duration-300 transform group-hover:translate-x-5 -ml-2 z-30 hover:scale-110 rounded-full p-1 bg-zinc-800 hover:bg-zinc-700"
                />
              </Link>
              <Link href="https://groww.in/" target="_blank" rel="noopener noreferrer">
                <Image
                  src="/groww_logo.png"
                  alt="Groww"
                  width={48}
                  height={48}
                  className="transition-transform relative right-8 duration-300 transform group-hover:translate-x-10 -ml-2 z-20 hover:scale-110 rounded-full p-1 bg-zinc-800 hover:bg-zinc-700"
                />
              </Link>
              <Link href="https://zerodha.com/" target="_blank" rel="noopener noreferrer">
                <Image
                  src="/zerodha_logo.png"
                  alt="Zerodha"
                  width={46}
                  height={46}
                  className="transition-transform relative right-12 duration-300 transform group-hover:translate-x-15 -ml-2 z-10 hover:scale-110 rounded-full p-1 bg-zinc-800 hover:bg-zinc-700"
                />
              </Link>
            </div>
          </div>
          {/* End of Trade with section */}
          <DialogTrigger asChild>
  <Button
    className="bg-gradient-to-r from-blue-500 to-indigo-600 active:from-blue-700 active:to-indigo-800 text-white rounded-full px-4 py-2 font-medium transition-all duration-300 border border-blue-400/20"
    onClick={() => {}}
  >
    <span className="flex items-center gap-2">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="text-white"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      Talk to AI Agent
    </span>
  </Button>
</DialogTrigger>



        </div>

        <div className="flex flex-row gap-3 p-2 h-full overflow-y-auto">
          <div className="relative w-1/4 h-full overflow-y-auto border-r border-zinc-800 rounded-2xl bg-zinc-900/50 shadow-inner">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 bg-opacity-60 rounded-2xl backdrop-blur-sm">
                <div className="loader"></div>
              </div>
            ) : (
              <StockList
                stocks={stockData}
                onSelectStock={(symbol) => setCompany(symbol)}
                selectedStock={company}
              />
            )}
          </div>

          <div className="w-3/4 bg-zinc-900 p-5 rounded-2xl shadow-lg">
            <ChatInterface selectedStock={company} />
          </div>
        </div>
        <DialogBox />
      </Dialog>
    </div>
  )
}