"use client";

import { useEffect, useState } from "react";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AgentChatUI } from "./modal_chat";
import { useCompany } from "@/hooks/use-company";
import Image from "next/image";
import { motion } from "framer-motion";
import { Bot, TrendingUp } from "lucide-react";

export function DialogBox() {
    const { company } = useCompany();
    const [isClient, setIsClient] = useState(false);
    
    // Fix hydration issues
    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return null;
    }

    return (
        <DialogContent className="max-w-7xl w-[90vw] h-[90vh] bg-gradient-to-b from-zinc-900 to-zinc-950 text-white rounded-3xl border border-zinc-800/50 shadow-2xl backdrop-blur-sm overflow-hidden">
            <DialogHeader className="pb-2 relative">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="absolute left-0 right-0 top-0 h-40 bg-gradient-radial from-blue-600/10 to-transparent pointer-events-none"
                />
                
                <DialogTitle className="flex items-center justify-center mt-2">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ 
                            type: "spring",
                            stiffness: 400,
                            damping: 15,
                            delay: 0.2
                        }}
                        className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-600 p-2 px-6 rounded-full shadow-lg shadow-blue-900/30"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20"></div>
                            <Image
                                src="/fingreat.png"
                                alt="FinGReaT Logo"
                                width={28}
                                height={28}
                                className="rounded-full border-2 border-white/20"
                            />
                        </div>
                        <span className="text-lg font-bold tracking-wide flex items-center gap-2 text-white">
                            <Bot size={18} className="text-white" />
                            FinGReaT AI Assistant
                        </span>
                    </motion.div>
                </DialogTitle>
                
                <div className="relative mt-4 text-sm text-muted-foreground">
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        className="absolute right-0 top-0 flex flex-row gap-3 items-center"
                    >
                        <span className="text-sm font-semibold tracking-tight text-zinc-300">
                            Trade with
                        </span>
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="bg-zinc-800 p-1.5 rounded-full flex items-center hover:bg-zinc-700 transition-all duration-200 cursor-pointer border border-zinc-700/50 shadow-md"
                        >
                            <Image
                                src="/upstox_logo.png"
                                alt="Upstox"
                                height={15}
                                width={80}
                                className="rounded-sm h-5"
                            />
                        </motion.div>
                    </motion.div>
                </div>
            </DialogHeader>
            
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent my-1"
            />
            
            {company && (
                <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="flex items-center gap-2 px-4 py-1.5 bg-zinc-800/50 backdrop-blur rounded-full w-fit mx-auto mb-2"
                >
                    <TrendingUp size={14} className="text-blue-400" />
                    <span className="text-xs font-medium text-zinc-200">Analyzing {company}</span>
                </motion.div>
            )}
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-1 flex-1 overflow-hidden rounded-2xl border border-zinc-800/50 shadow-inner shadow-zinc-900/50"
            >
                <AgentChatUI companyTicker={company} />
            </motion.div>
        </DialogContent>
    );
}