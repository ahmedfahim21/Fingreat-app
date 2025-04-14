"use client"

import React, { useEffect, useRef, useState } from "react"
import { ArrowUpIcon } from "lucide-react"
import Image from "next/image"

import { cn } from "@/lib/utils"
import { getStockData } from "@/lib/stock-data"

import { Button } from "@/components/ui/button"
import { AutoResizeTextarea } from "@/components/autoresize-textarea"
import { StockChart } from "@/components/stock-chart"

interface ChatInterfaceProps {
  selectedStock: string | null
}

type UIMessage =
  | {
    type: "user"
    role: "user"
    content: string
  }
  | {
    type: "stream"
    role: "assistant"
    content: {
      stage: number
      message: string
      total_stages: number
    }
  }
  | {
    type: "result"
    role: "assistant"
    content: {
      result: "UP" | "DOWN" | "NEUTRAL"
      explanation: string
    }
  }


export function ChatInterface({ selectedStock }: ChatInterfaceProps) {

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [stockData, setStockData] = useState<{
    symbol: string
    name: string
    price: number
    change: number
    changePercent: number
  } | null>(null)


  const [messages, setMessages] = useState<UIMessage[]>([]);

  useEffect(() => {
    if (!selectedStock) return;

    const stored = localStorage.getItem(selectedStock);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
        } else {
          setMessages([]); // fallback
        }
      } catch (e) {
        console.error("Error parsing localStorage data:", e);
        setMessages([]);
      }
    } else {
      setMessages([]); // No stored messages
    }
  }, [selectedStock]);

  useEffect(() => {
    if (!selectedStock) return;

    localStorage.setItem(selectedStock, JSON.stringify(messages));
  }, [messages, selectedStock]);


  // Scroll to the bottom of the chat when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Fetch stock info
  useEffect(() => {
    const fetchStockData = async () => {
      if (selectedStock) {
        const data = await getStockData(selectedStock)
        setStockData(data)
      }
    }

    fetchStockData()
  }, [selectedStock])

  // Pre-fill input prompt
  useEffect(() => {
    if (selectedStock && stockData) {
      setInput("")
    }
  }, [selectedStock, stockData, setInput])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add the user message to the chat
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: "user", role: "user", content: input }
    ])

    setIsLoading(true)
    setInput("Generating...")

    const date_of_publish = new Date().toISOString().replace("T", " ").split(".")[0] + ".000"

    await handleSend({
      news_article: input,
      company_ticker: selectedStock || "NIFTY-50",
      date_of_publish
    })

    setInput("")
  }

  // Handle key down event (for Enter key submission)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
    }
  }

  // Function to add parsed messages to the chat
  const addChatMessage = ({ type, content }: { type: "stream" | "result"; content: any }) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        type,
        role: "assistant",
        content
      }
    ])
  }

  async function handleSend({ news_article, company_ticker, date_of_publish }: { news_article: string, company_ticker: string, date_of_publish: string }) {
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/process_news", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      keepalive: true,
      body: JSON.stringify({
        news_article,
        company_ticker,
        date_of_publish,
      }),
    })

    if (!response.body) {
      console.error("Response body is null");
      return;
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8")
    let buffer = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const parts = buffer.split("\n")

      for (let i = 0; i < parts.length - 1; i++) {
        try {
          const parsed = JSON.parse(parts[i])
          console.log("Parsed message:", parsed)
          handleParsedMessage(parsed)
        } catch (error) {
          console.error("Failed to parse chunk:", parts[i], error)
        }
      }

      buffer = parts[parts.length - 1]
    }
    setIsLoading(false)
  }

  function handleParsedMessage(msg: UIMessage) {
    if ("result" in msg) {
      addChatMessage({ type: "result", content: msg })
    } else {
      addChatMessage({ type: "stream", content: msg })
    }
  }


  return (
    <div className="flex h-full flex-col">
      {/* Header */}
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
                {stockData.change.toFixed(2)} (
                {stockData.changePercent.toFixed(2)}%)
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
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-xl px-4 py-3 text-sm shadow",
                    msg.role === "user"
                      ? "bg-blue-500 text-white"
                      : msg.type === "stream"
                        ? "bg-gray-700 text-white"
                        : msg.type === "result" && msg.content.result == "UP"
                          ? "bg-green-500/30 text-white border border-green-500"
                          : msg.type === "result" && msg.content.result == "DOWN"
                            ? "bg-red-500/30 text-white border border-red-500"
                            : "bg-blue-400/30 text-white border border-blue-400"
                  )}
                >
                  {msg.role === "user" && <span>{msg.content}</span>}

                  {msg.type === "stream" && msg.role === "assistant" && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{msg.content.message}</span>
                      {msg.content.stage !== undefined &&
                        msg.content.total_stages !== undefined && (
                          <span className="text-xs text-gray-400">
                            ({msg.content.stage}/{msg.content.total_stages})
                          </span>
                        )}
                      {isLoading &&
                        (<svg
                          className="animate-spin h-4 w-4 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          ></path>
                        </svg>)}
                    </div>
                  )}

                  {msg.type === "result" && (
                    <>
                      <div className="font-semibold mb-1">
                        {msg.content.result} {msg.content.result === "UP" ? "📈" : "📉"}
                      </div>
                      <div className="text-sm">{msg.content.explanation}</div>
                    </>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="m-auto max-w-2xl space-y-4 text-center">
            <Image
              src="/fingreat.png"
              alt="FinGreat Logo"
              width={128}
              height={128}
              className="mx-auto h-32 w-32"
            />
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome to FinGReaT
            </h1>
            <p className="text-muted-foreground text-sm">
              Your personal assistant for stock market insights, trends, and
              investment advice. Start by selecting a stock or asking a
              question.
            </p>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="border-t p-2 border-zinc-700">
        <form
          onSubmit={handleSubmit}
          className="relative flex flex-col gap-2 sm:flex-row sm:items-center rounded-md border py-2 px-4 text-sm shadow-sm border-zinc-700"
          aria-label="Chat input form"
        >
          <select
            className="bg-zinc-800 text-white rounded-md px-3 py-2"
            value={selectedStock || ""}
            disabled
          >
            <option value={selectedStock || ""}>
              {selectedStock || "Select a stock"}
            </option>
          </select>
          <AutoResizeTextarea
            onKeyDown={handleKeyDown}
            onChange={(v) => setInput(v)}
            value={input}
            disabled={isLoading}
            placeholder="Ask about stocks, market trends, or investment advice..."
            className="placeholder:text-muted-foreground flex-1 bg-transparent focus:outline-none resize-none"
          />
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
        </form>
      </div>
    </div>
  )
}
