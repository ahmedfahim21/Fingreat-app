import { memo } from "react"
import { Stock } from "./stock-list"
import { cn } from "@/lib/utils"
import { TrendingDown, TrendingUp } from "lucide-react"

interface StockCardProps {
  stock: Stock
  onClick: () => void
  isSelected: boolean
}

// Use memo to prevent unnecessary re-renders
export const StockCard = memo(function StockCard({ stock, onClick, isSelected }: StockCardProps) {
  const isPositive = stock.change >= 0
  
  return (
    <div
      className={cn(
        "flex cursor-pointer flex-col rounded-xl p-3 transition-all duration-200",
        isSelected 
          ? "bg-blue-600/10 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]" 
          : "bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/80"
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-semibold text-white">{stock.symbol}</span>
        <span 
          className={cn(
            "font-medium",
            isPositive ? "text-green-500" : "text-red-500"
          )}
        >
          ₹{stock.price.toFixed(2)}
        </span>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-xs text-zinc-400 truncate max-w-[60%] mr-2">{stock.name}</span>
        <div 
          className={cn(
            "text-xs px-2 py-0.5 rounded-full font-medium flex items-center",
            isPositive 
              ? "bg-green-500/10 text-green-500 border border-green-500/20" 
              : "bg-red-500/10 text-red-500 border border-red-500/20"
          )}
        >
          {isPositive 
            ? <TrendingUp className="mr-1 h-3 w-3" /> 
            : <TrendingDown className="mr-1 h-3 w-3" />
          }
          <span>
            {isPositive ? "+" : ""}{stock.change.toFixed(2)} ({isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%)
          </span>
        </div>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  // Only re-render if one of these conditions is true
  return (
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.stock.symbol === nextProps.stock.symbol &&
    prevProps.stock.name === nextProps.stock.name &&
    prevProps.stock.price === nextProps.stock.price &&
    prevProps.stock.change === nextProps.stock.change &&
    prevProps.stock.changePercent === nextProps.stock.changePercent
  )
})