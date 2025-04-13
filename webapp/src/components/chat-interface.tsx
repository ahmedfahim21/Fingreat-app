"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { useChat } from "ai/react"
import { ArrowUpIcon, BarChart3, Info, Briefcase, Newspaper } from "lucide-react"

import { cn } from "@/lib/utils"
import { getStockData } from "@/lib/stock-data"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AutoResizeTextarea } from "@/components/autoresize-textarea"
import { StockChart } from "@/components/stock-chart"

interface ChatInterfaceProps {
  selectedStock: string | null
}

export function ChatInterface({ selectedStock }: ChatInterfaceProps) {
  const { messages, input, setInput, append, isLoading } = useChat({ api: "/api/chat" })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const stockData = selectedStock ? getStockData(selectedStock) : null

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (selectedStock && stockData) {
      setInput(`Tell me about ${stockData.name} (${selectedStock})`)
    }
  }, [selectedStock, stockData, setInput])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return
    void append({ content: input.trim(), role: "user" })
    setInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
    }
  }



  return (
    <TooltipProvider>
      <div className="flex h-full flex-col">
        {/* Header Chart */}
        {selectedStock && stockData && (
          <div className="border-b p-4 border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold">
                {stockData.name} ({selectedStock})
              </h2>
              <div
                className={cn(
                  "flex items-center gap-2 text-sm font-medium",
                  stockData.change >= 0 ? "text-green-600" : "text-red-600"
                )}
              >
                ₹{stockData.price.toLocaleString()}
                <span>
                  {stockData.change >= 0 ? "+" : ""}
                  {stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
            <StockChart symbol={selectedStock} />
          </div>
        )}

        {/* Message List */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {messages.length ? (
            <div className="flex flex-col gap-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[80%] rounded-xl px-4 py-3 text-sm shadow",
                    msg.role === "assistant"
                      ? "self-start bg-muted text-white"
                      : "self-end bg-blue-400/30 text-white"
                  )}
                >
                  {msg.content}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="m-auto max-w-2xl space-y-4 text-center">
              <img
              src="/fingreat.png"
              alt="FinGreat Logo"
              className="mx-auto h-32 w-32"
              />
              <h1 className="text-2xl font-semibold tracking-tight">Welcome to FinGReaT</h1>
              <p className="text-muted-foreground text-sm">
              Your personal assistant for stock market insights, trends, and investment advice. Start by selecting a stock or asking a question.
              </p>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="border-t p-2 border-zinc-700">
          <form
            onSubmit={handleSubmit}
            className={cn(
              "relative flex items-center rounded-md border py-2 px-4 text-sm shadow-sm border-zinc-700 h-14"
            )}
            aria-label="Chat input form"
          >
            <AutoResizeTextarea
              onKeyDown={handleKeyDown}
              onChange={(v) => setInput(v)}
              value={input}
              disabled={isLoading}
              placeholder="Ask about stocks, market trends, or investment advice..."
              className="placeholder:text-muted-foreground flex-1 bg-transparent focus:outline-none resize-none"
            />
            <Tooltip>
              <TooltipTrigger asChild>
          <Button
            type="submit"
            size="sm"
            variant="ghost"
            className="absolute bottom-2 right-2 size-6 rounded-full bg-blue-400 text-white hover:bg-blue-600 disabled:bg-gray-300"
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
          >
            <ArrowUpIcon size={16} />
          </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={10}>Send</TooltipContent>
            </Tooltip>
          </form>
        </div>
      </div>
    </TooltipProvider>
  )
}
