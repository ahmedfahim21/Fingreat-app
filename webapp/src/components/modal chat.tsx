"use client";

import { useState, useEffect, useRef, use } from "react";
import { Send, Trash2, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface Message {
  role: "user" | "agent";
  content: string;
}

interface ChatUIProps {
  companyTicker?: string;
}

export function AgentChatUI({ companyTicker }: ChatUIProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [storedContext, setStoredContext] = useState<{ movement_prediction: string, explanation: string, news: string } | null>(null);

  useEffect(() => {
    const fetchStoredMessages = async () => {
      const storedMessages = localStorage.getItem(companyTicker);
      if (storedMessages) {
        const parsedMessages = await storedMessages ? JSON.parse(storedMessages) : [];
        await setStoredContext({
          "movement_prediction": parsedMessages[13]?.content?.result || "",
          "explanation": parsedMessages[13]?.content?.explanation || "",
          "news": parsedMessages[0]?.content || ""
        });
      }
    };

    fetchStoredMessages();
  }, [companyTicker]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsFetching(true);
        const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/${companyTicker}/agents/master_agent/conversations`);
        if (response.ok) {
          const data = await response.json();
          
          // Check if data is an array
          if (Array.isArray(data)) {
            // Map the data to your Message format
            const formattedMessages: Message[] = [];
            data.forEach((item: any) => {
              // Add user message first
              if (item.user) {
                formattedMessages.push({
                  role: "user",
                  content: item.user
                });
              }
              
              // Add assistant message second
              if (item.assistant) {
                formattedMessages.push({
                  role: "agent",
                  content: item.assistant
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
  
    if (companyTicker) {
      fetchConversations();
    }
  }, [companyTicker]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: inputValue
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
          content: data || "No response from agent"
        };
        setMessages((prev) => [...prev, agentMessage]);
      } else {
        throw new Error("Failed to get response from agent");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        role: "agent",
        content: "Sorry, there was an error processing your request."
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearConversation = async () => {
    // Ask for confirmation before clearing
    const isConfirmed = window.confirm("Are you sure you want to clear this conversation?");
    
    if (!isConfirmed) {
      return; // If user cancels, do nothing
    }
    
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

  return (
    <div className="flex flex-col h-full rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClearConversation}
          title="Clear conversation"
          className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700"
        >
          <Trash2 size={18} />
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isFetching ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 text-zinc-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-2">
            <p>No messages yet</p>
            <p className="text-sm">Ask something about {companyTicker || "stocks"}</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                }`}
            >
              <div
                className={`max-w-3/4 px-4 py-2 rounded-lg text-sm shadow-md ${message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-white"
                  }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 py-3">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask about ${companyTicker || "stocks"}...`}
            disabled={isLoading}
            className="flex-1 bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}