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
  const { company, setCompany } = useCompany();

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
      <Dialog>
        <div className="sticky top-0 z-10  flex items-center justify-center bg-zinc-900 p-2 rounded-t-2xl border-b border-zinc-800">
          <Image src="/fingreat.png" alt="FinGReaT Logo" width={30} height={30} className="mx-2" />
          <h2 className="text-md font-bold tracking-wider drop-shadow-md">
            FinGReaT
          </h2>
          <div className="absolute right-1 ml-auto flex flex-row gap-3 align-middle justify-center">
            <h2 className="text-sm font-semibold tracking-tight my-auto">
              Trade with
            </h2>
            <Link
              href="https://zerodha.com/"
              className="my-auto"
            >
              <Image
                src="/Zerodha.png"
                alt="Zerodha"
                height={30}
                width={30}
                className="rounded-sm hover:scale-105"
              />
            </Link>
            <Link
              href="https://upstox.com/"
              className="my-auto"
            >
              <Image
                src="/Upstox.avif"
                alt="Upstox"
                height={15}
                width={90}
                className="rounded-sm w-20 h-6 hover:scale-105"
              />
            </Link>
            {/* <Image
              src="/Groww.png"
              alt="Groww"
              height={15}
              width={90}
              className="rounded-sm w-20 h-6 my-auto"
            /> */}
            <DialogTrigger asChild>

              <Button
                className="bg-blue-500 text-white hover:bg-green-400 hover:text-white"
                onClick={() => {
                }}
              >
                Talk to AI Agent
              </Button>
            </DialogTrigger>
          </div>
        </div>

        <div className="flex flex-row gap-2 p-2 h-full overflow-y-auto">
          <div className="relative w-1/4 h-full overflow-y-auto border-r border-zinc-800">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 bg-opacity-50">
                <div className="loader"></div>
              </div>
            )
              : (

                <StockList
                  stocks={stockData}
                  onSelectStock={(symbol) => setCompany(symbol)}
                  selectedStock={company}
                />
              )}
          </div>

          <div className="w-3/4 bg-zinc-900 p-4">
            <ChatInterface selectedStock={company} />
          </div>
        </div>
        <DialogBox />
      </Dialog>
    </div>
  )
}
