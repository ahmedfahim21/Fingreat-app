"use client"

import {
  AreaChart,
  Area,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { useEffect, useState } from "react"
import { fetchStockPriceHistory } from "@/lib/stock-data"

export interface StockHistory{
  date : string
  open : number
  high : number
  low : number
  close : number
  volume : number
}


export function StockChart({ symbol }: { symbol: string }) {
  const [history, setHistory] = useState<StockHistory[]>([])
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  )
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  )
  const [loading, setLoading] = useState<boolean>(true)

  // Fetch data whenever symbol/startDate/endDate changes
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      const historyData = await fetchStockPriceHistory(symbol, startDate, endDate)
      setHistory(historyData.reverse()) // Reverse to chronological
      setLoading(false)
    }

    fetchHistory()
  }, [symbol, startDate, endDate])

  // Prepare chart data
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const data = history.map(([date, open, high, low, close, volume]) => ({
    time: date,
    price: close,
  }))

  const isUptrend = data.length >= 2 && data[0].price < data[data.length - 1].price
  // console.log(data[0].price, data[data.length - 1].price, isUptrend, data[0].time, data[data.length - 1].time)
  const strokeColor = isUptrend ? "#16a34a" : "#dc2626"

  return (
    <div className="w-full rounded-xl bg-zinc-900 p-4 shadow-md">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm font-semibold text-zinc-300">{symbol.toUpperCase()}</div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-md bg-zinc-500 px-2 py-1 text-sm text-white"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-md bg-zinc-500 px-2 py-1 text-sm text-white"
          />
        </div>
      </div>

      <div className="h-48 w-full">
        {loading ? (
          <div className="text-center text-zinc-400 text-sm">Loading chart...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <defs>
              <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#16a34a" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#dc2626" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#dc2626" stopOpacity={0} />
              </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
              <XAxis dataKey="time" hide />
              <YAxis hide domain={["auto", "auto"]} />
              <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: 8 }}
              labelStyle={{ color: "#9ca3af" }}
              itemStyle={{ color: "#e5e7eb" }}
              formatter={(value: number) => [`₹${value.toFixed(2)}`, "Price"]}
              />
              <Area
              type="monotone"
              dataKey="price"
              stroke={strokeColor}
              fill={isUptrend ? "url(#greenGradient)" : "url(#redGradient)"}
              strokeWidth={2.5}
              dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
