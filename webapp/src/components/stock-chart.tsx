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
import { useEffect, useState, useMemo, useRef } from "react"
import { fetchStockPriceHistory } from "@/lib/stock-data"
import { CalendarIcon, RefreshCw, AlertTriangle } from "lucide-react"

export interface StockHistory {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
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
  const [error, setError] = useState<string | null>(null)
  const [datePickerOpen, setDatePickerOpen] = useState<boolean>(false)

  // Add a ref to track component mount status
  const isMounted = useRef(true)

  useEffect(() => {
    // Set up component mount tracking
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

 
    // Fetch data whenever symbol/startDate/endDate changes
  useEffect(() => {
    if (!symbol) {
      setLoading(false)
      return
    }

    const fetchHistory = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const rawData = await fetchStockPriceHistory(symbol, startDate, endDate)
        
        if (!isMounted.current) return
        
        if (!rawData || rawData.length === 0) {
          console.warn("No data received")
          setError("No data available for selected period")
          setHistory([])
        } else {
          // Transform array data to objects according to the StockHistory interface
          const historyData = rawData.map((item: any[]) => ({
            date: item[0], // First element is date
            open: item[1], // Second element is open
            high: item[2], // Third element is high
            low: item[3],  // Fourth element is low
            close: item[4], // Fifth element is close
            volume: item[5] // Sixth element is volume
          }));
          
          // Sort chronologically
          historyData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          setHistory(historyData)
          setError(null)
        }
      } catch (err) {
        console.error("Error fetching stock history:", err)
        if (isMounted.current) {
          setError(`Failed to load chart data: ${err instanceof Error ? err.message : String(err)}`)
          setHistory([])
        }
      } finally {
        if (isMounted.current) {
          setLoading(false)
        }
      }
    }

    fetchHistory()
  }, [symbol, startDate, endDate])

  type Trend = 'up' | 'down' | 'sideways';

  function detectTrend(prices: number[]): Trend {
    if (prices.length < 2) {
      throw new Error('At least two price points are required.');
    }
  
    // Configuration thresholds
    const upThresholdPct = 0.02;       // 2% up
    const downThresholdPct = -0.02;    // 2% down 
    const slopeThreshold = 0.002;      // regression slope
  
    // ----- Percent-change method -----
    const startPrice = prices[0];
    const endPrice = prices[prices.length - 1];
    const pctChange = (endPrice - startPrice) / startPrice;
    if (pctChange > upThresholdPct) return 'up';
    if (pctChange < downThresholdPct) return 'down';
  
    // ----- Linear-regression slope method -----
    const n = prices.length;
    const xMean = (n - 1) / 2;
    const yMean = prices.reduce((sum, p) => sum + p, 0) / n;
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      num += (i - xMean) * (prices[i] - yMean);
      den += (i - xMean) ** 2;
    }
    const slope = num / den;
    if (slope > slopeThreshold) return 'up';
    if (slope < -slopeThreshold) return 'down';
  
    // ----- Sideways by default -----
    return 'sideways';
  }
  

  // Prepare chart data with useMemo to prevent unnecessary recalculations
  const data = useMemo(() => {
    if (!history || history.length === 0) {
      return []
    }
    
    return history.map(item => ({
      time: item.date,
      price: Number(item.close) // Ensure numeric values
    }))
  }, [history])

  // Use useMemo for derived values to prevent recalculation on re-render
  const { trendType, strokeColor, fillColor, gradientId } = useMemo(() => {
    // Default values in case of insufficient data
    if (data.length < 2) {
      return {
        trendType: "uptrend",
        strokeColor: "#15803d",
        fillColor: "#22c55e",
        gradientId: `greenGradient-${symbol || 'default'}-${Date.now()}`
      }
    }
  
    // Extract just prices from the data
    const prices = data.map(d => d.price)

    
    // Determine trend based on moving averages and strength
    let trendType = "sideways"
    let stroke = "#6366f1" // Purple for sideways
    let fill = "#818cf8"   // Lighter purple for sideways
    
    trendType = detectTrend(prices)

    if (trendType === "up") {
      trendType = "uptrend"
      stroke = "#15803d" // Green
      fill = "#22c55e"   // Lighter green
    } else if (trendType === "down") {
      trendType = "downtrend"
      stroke = "#b91c1c" // Red
      fill = "#ef4444"   // Lighter red
    }
  
    // Create unique gradient ID
    const colorPrefix = trendType === "uptrend" ? 'green' : (trendType === "downtrend" ? 'red' : 'purple')
    const gradId = `${colorPrefix}Gradient-${symbol || 'default'}-${Date.now()}`
  
    return {
      trendType,
      strokeColor: stroke,
      fillColor: fill,
      gradientId: gradId
    }
  }, [data, symbol])
  

  // Quick date range buttons
  const setDateRange = (days: number) => {
    try {
      const end = new Date()
      const start = new Date()
      start.setDate(end.getDate() - days)
      
      setEndDate(end.toISOString().split("T")[0])
      setStartDate(start.toISOString().split("T")[0])
    } catch (e) {
      console.error("Date range error:", e)
      // Use default date range on error
      setStartDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
      setEndDate(new Date().toISOString().split("T")[0])
    }
  }

  // Format the date range for display
  const formatDateRange = () => {
    try {
      const start = new Date(startDate)
      const end = new Date(endDate)
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    } catch (e) {
      console.error("Date formatting error:", e)
      return 'Select dates'
    }
  }

  const refreshData = () => {
    // Force a refresh with current date range
    const currentStart = startDate
    const currentEnd = endDate
    
    // Toggle one date to force a refetch
    setStartDate(currentStart === startDate ? 
      new Date(new Date(currentStart).getTime() - 86400000).toISOString().split("T")[0] : 
      currentStart
    )
    
    // Short timeout to ensure state updates properly
    setTimeout(() => {
      if (isMounted.current) {
        setStartDate(currentStart)
      }
    }, 10)
  }

  return (
    <div className="w-full rounded-xl bg-zinc-900 p-4 shadow-md border border-zinc-800">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="text-sm font-bold text-white">{symbol.toUpperCase()}</div>
          {data.length >= 2 && !loading && (
            <div className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              trendType === "uptrend" 
                ? 'bg-green-500/20 text-green-400' 
                : trendType === "downtrend"
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-indigo-500/20 text-indigo-400'
            }`}>
              {trendType === "uptrend" 
                ? 'UPTREND' 
                : trendType === "downtrend" 
                  ? 'DOWNTREND' 
                  : 'SIDEWAYS'}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex border border-zinc-700 rounded-md overflow-hidden">
            <button 
              onClick={() => setDateRange(7)} 
              className="text-xs px-2 py-1 hover:bg-zinc-700 text-zinc-300 transition-colors"
            >
              1W
            </button>
            <button 
              onClick={() => setDateRange(30)} 
              className="text-xs px-2 py-1 hover:bg-zinc-700 text-zinc-300 transition-colors"
            >
              1M
            </button>
            <button 
              onClick={() => setDateRange(90)} 
              className="text-xs px-2 py-1 hover:bg-zinc-700 text-zinc-300 transition-colors"
            >
              3M
            </button>
            <button 
              onClick={() => setDateRange(180)} 
              className="text-xs px-2 py-1 hover:bg-zinc-700 text-zinc-300 transition-colors"
            >
              6M
            </button>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setDatePickerOpen(!datePickerOpen)}
              className="flex items-center gap-1 text-xs px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md border border-zinc-700 transition-colors"
            >
              <CalendarIcon size={12} />
              {formatDateRange()}
            </button>
            
            {datePickerOpen && (
              <div className="absolute top-full right-0 mt-1 p-2 bg-zinc-800 rounded-md border border-zinc-700 z-10 shadow-lg">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-zinc-400">From:</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      max={endDate}
                      className="rounded-md bg-zinc-900 px-2 py-1 text-xs text-white border border-zinc-700"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-zinc-400">To:</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate}
                      max={new Date().toISOString().split("T")[0]}
                      className="rounded-md bg-zinc-900 px-2 py-1 text-xs text-white border border-zinc-700"
                    />
                  </div>
                  <button 
                    onClick={() => setDatePickerOpen(false)}
                    className="text-xs py-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-md transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={refreshData}
            className="p-1 rounded-md hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Refresh data"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="h-48 w-full">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error || data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <AlertTriangle className="text-amber-500 mb-2" size={24} />
            <p className="text-zinc-400 text-sm">
              {error || "No data available for selected period"}
            </p>
            <button
              onClick={refreshData}
              className="mt-3 text-xs py-1 px-3 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-md transition-colors flex items-center gap-1"
            >
              <RefreshCw size={12} />
              Try again
            </button>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={fillColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={fillColor} stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
              <XAxis 
                dataKey="time" 
                tick={{ fill: '#9ca3af', fontSize: 10 }} 
                tickLine={{ stroke: '#27272a' }}
                axisLine={{ stroke: '#27272a' }}
                tickFormatter={(value) => value.slice(5)} // Show only month and day
              />
              <YAxis 
                domain={["auto", "auto"]}
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                tickLine={{ stroke: '#27272a' }}
                axisLine={{ stroke: '#27272a' }}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: "#18181b",
                  border: `1px solid ${
                    trendType === "uptrend" 
                      ? '#22c55e33' 
                      : trendType === "downtrend" 
                        ? '#ef444433'
                        : '#818cf833'
                  }`, 
                  borderRadius: 8,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
                }}
                labelStyle={{ color: "#9ca3af", marginBottom: '4px' }}
                itemStyle={{ color: "#e5e7eb" }}
                formatter={(value: number) => [`₹${value.toFixed(2)}`, "Price"]}
                labelFormatter={(label) => {
                  try {
                    return new Date(label).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })
                  } catch (e) {
                    return label
                  }
                }}
                cursor={{
                  stroke: trendType === "uptrend" 
                    ? '#22c55e' 
                    : trendType === "downtrend"
                      ? '#ef4444'
                      : '#818cf8',
                  strokeWidth: 1,
                  strokeDasharray: '3 3',
                  strokeOpacity: 0.7
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={strokeColor}
                fill={`url(#${gradientId})`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: fillColor }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}