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
// import { generateStockPriceHistory } from "@/lib/stock-data"

interface StockChartProps {
  symbol: string
}

export function StockChart({ symbol }: StockChartProps) {
  // const data = generateStockPriceHistory(symbol)

  // const isUptrend =
  //   data[0].price < data[data.length - 1].price

  // const strokeColor = isUptrend ? "#16a34a" : "#dc2626" // green/red
  // const gradientId = isUptrend ? "greenGradient" : "redGradient"

  return (
    <div className="w-full rounded-xl bg-zinc-900 p-4 shadow-md">
      <div className="mb-2 text-sm font-semibold text-zinc-300">
        {symbol.toUpperCase()}
      </div>
      <div className="h-48 w-full">
        {/* <ResponsiveContainer width="100%" height="100%">
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
              formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={strokeColor}
              fill={`url(#${gradientId})`}
              strokeWidth={2.5}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer> */}
      </div>
    </div>
  )
}
