"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"
import { useChat } from "ai/react"
import { ArrowUpIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { AutoResizeTextarea } from "@/components/autoresize-textarea"

export function ChatForm({ className, ...props }: React.ComponentProps<"form">) {
  const { messages, input, setInput, append } = useChat({ api: "/api/chat" })
  const scrollRef = useRef<HTMLDivElement | null>(null)

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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const EmptyHeader = (
    <div className="m-auto max-w-md space-y-3 text-center">
      <h1 className="text-2xl font-bold">Start chatting with AI</h1>
      <p className="text-sm text-muted-foreground">
        Built with <span className="text-foreground">Next.js</span>,{" "}
        <span className="text-foreground">Vercel AI SDK</span> and{" "}
        <span className="text-foreground">Vercel KV</span>.
      </p>
    </div>
  )

  const Messages = (
    <div className="flex flex-col gap-3 p-4">
      {messages.map((msg, i) => (
        <div
          key={i}
          data-role={msg.role}
          className={cn(
            "max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm",
            msg.role === "user"
              ? "self-end bg-blue-500 text-white"
              : "self-start bg-gray-100 text-black"
          )}
        >
          {msg.content}
        </div>
      ))}
    </div>
  )

  return (
    <main
      className={cn(
        "relative mx-auto flex h-svh max-h-svh w-full max-w-2xl flex-col bg-background",
        className,
      )}
      {...props}
    >
      {/* Chat Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-thumb-rounded-md"
      >
        {messages.length ? Messages : EmptyHeader}
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="border-input bg-background focus-within:ring-ring/10 sticky bottom-0 z-10 mx-4 mb-6 flex items-center rounded-xl border px-4 py-2 text-sm shadow-md focus-within:outline-none focus-within:ring-2"
        aria-label="Chat input"
      >
        <AutoResizeTextarea
          onKeyDown={handleKeyDown}
          onChange={(v) => setInput(v)}
          value={input}
          placeholder="Type your message..."
          className="placeholder:text-muted-foreground flex-1 bg-transparent resize-none focus:outline-none"
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="ml-2 size-8 rounded-full hover:bg-muted"
              aria-label="Send"
            >
              <ArrowUpIcon size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={12}>Send</TooltipContent>
        </Tooltip>
      </form>
    </main>
  )
}
