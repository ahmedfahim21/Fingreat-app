"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Trash2, Loader2, Bot, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "agent";
  content: string;
  id: string; // Add unique ID for animations
}

interface ChatUIProps {
  companyTicker?: string;
}

export function AgentChatUI({ companyTicker }: ChatUIProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isClient, setIsClient] = useState(false); // Fix hydration issues
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [storedContext, setStoredContext] = useState<{ movement_prediction: string, explanation: string, news: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fix hydration issues by confirming we're on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchStoredMessages = async () => {
      if (!companyTicker) return;
      
      const storedMessages = localStorage.getItem(companyTicker);
      if (storedMessages) {
        try {
          const parsedMessages = JSON.parse(storedMessages);
          setStoredContext({
            "movement_prediction": parsedMessages[13]?.content?.result || "",
            "explanation": parsedMessages[13]?.content?.explanation || "",
            "news": parsedMessages[0]?.content || ""
          });
        } catch (error) {
          console.error("Error parsing stored messages:", error);
        }
      }
    };

    if (isClient) {
      fetchStoredMessages();
    }
  }, [companyTicker, isClient]);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!companyTicker) return;
      
      try {
        setIsFetching(true);
        const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/${companyTicker}/agents/master_agent/conversations`);
        if (response.ok) {
          const data = await response.json();
          
          if (Array.isArray(data)) {
            const formattedMessages: Message[] = [];
            data.forEach((item: any, index: number) => {
              if (item.user) {
                formattedMessages.push({
                  role: "user",
                  content: item.user,
                  id: `user-${index}`
                });
              }
              
              if (item.assistant) {
                formattedMessages.push({
                  role: "agent",
                  content: item.assistant,
                  id: `agent-${index}`
                });
              }
            });
            
            setMessages(formattedMessages);
          } else {
            console.error("Unexpected data format:", data);
          }
        } else {
          console.error("Failed to fetch conversations");
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setIsFetching(false);
      }
    };
  
    if (companyTicker && isClient) {
      fetchConversations();
    }
  }, [companyTicker, isClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: inputValue,
      id: `user-${Date.now()}`
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/${companyTicker}/agents/master_agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company: companyTicker || "",
          query: userMessage.content,
          movement_prediction: storedContext?.movement_prediction || "",
          explanation: storedContext?.explanation || "",
          news: storedContext?.news || ""
        }),
      });

      if (response.ok) {
        const data = await response.text();
        const agentMessage: Message = {
          role: "agent",
          content: data || "No response from agent",
          id: `agent-${Date.now()}`
        };
        setMessages((prev) => [...prev, agentMessage]);
      } else {
        throw new Error("Failed to get response from agent");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        role: "agent",
        content: "Sorry, there was an error processing your request.",
        id: `error-${Date.now()}`
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleClearConversation = async () => {
    const isConfirmed = window.confirm("Are you sure you want to clear this conversation?");
    
    if (!isConfirmed) return;
    
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/${companyTicker}/agents/master_agent/conversations`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessages([]);
      } else {
        console.error("Failed to clear conversations");
      }
    } catch (error) {
      console.error("Error clearing conversations:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Don't render content until client-side hydration is complete
  if (!isClient) {
    return null;
  }

  return (
    <div className="flex flex-col h-full rounded-lg overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 backdrop-blur bg-zinc-900/30 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-blue-400" />
          <span className="text-sm font-medium text-zinc-200">FinGReaT Assistant</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClearConversation}
          title="Clear conversation"
          className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 rounded-full transition-all duration-200"
        >
          <Trash2 size={16} />
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.1),transparent_50%)]">
        {isFetching ? (
          <div className="flex flex-col justify-center items-center h-full space-y-3">
            <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
            <p className="text-sm text-zinc-400 animate-pulse">Loading conversation...</p>
          </div>
        ) : messages.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-3 p-6"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Bot size={30} className="text-white" />
            </div>
            <h3 className="text-lg font-medium text-zinc-300">How can I help you today?</h3>
            <p className="text-sm text-center max-w-sm text-zinc-500">
              Ask me anything about {companyTicker || "stocks"}, market predictions, or financial advice.
            </p>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.4,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "agent" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Bot size={16} className="text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[75%] px-4 py-3 rounded-xl text-sm shadow-lg",
                    message.role === "user" 
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-none" 
                      : "bg-gradient-to-br from-zinc-700 to-zinc-800 text-white rounded-tl-none"
                  )}
                >
                  <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <User size={14} className="text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        
        {/* Agent thinking indicator */}
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-white" />
            </div>
            <div className="max-w-[75%] px-4 py-3 rounded-xl text-sm shadow-lg bg-gradient-to-br from-zinc-700 to-zinc-800 text-white rounded-tl-none">
              <div className="flex items-center gap-2 min-w-[50px]">
                <span className="animate-bounce">·</span>
                <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>·</span>
                <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>·</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 py-4 bg-zinc-900/80 backdrop-blur border-t border-zinc-800">
        <div className="flex space-x-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask about ${companyTicker || "stocks"}...`}
            disabled={isLoading}
            className="flex-1 bg-zinc-800 border-zinc-700 text-gray-100 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 rounded-full py-6 transition-all duration-200"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className={cn(
              "rounded-full h-12 w-12 p-0 flex items-center justify-center transition-all duration-300",
              inputValue.trim()
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md shadow-blue-900/20"
                : "bg-zinc-700 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              <Send className="h-5 w-5 text-white" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}