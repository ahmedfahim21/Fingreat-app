"use client";

import { useEffect, useState } from "react";
import {
    DialogContent,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { AgentChatUI } from "./modal_chat";
import { useCompany } from "@/hooks/use-company";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export function DialogBox() {
    const { company } = useCompany();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return null;
    }

    return (
        <DialogContent
            // Increase rounding and hide default close button via className override
            className="max-w-7xl w-[90vw] h-[90vh] bg-gradient-to-br from-zinc-900/90 via-zinc-950/95 to-zinc-900/90 text-white !rounded-3xl border border-white/30 shadow-2xl backdrop-blur-2xl overflow-hidden p-0 [&>button]:hidden flex flex-col"
        >
            {/* Accessibility: Hidden DialogTitle for screen readers */}
            <VisuallyHidden>
                <DialogTitle>FinGReaT Agent</DialogTitle>
            </VisuallyHidden>
            
            {/* Streamlined header with minimal height */}
            <div className="flex items-center justify-between px-4 pt-6 pb-2">
                <div className="flex items-center">
                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 text-transparent bg-clip-text"
                    >
                        FinGReaT Agent
                    </motion.h1>
                </div>
                <DialogClose asChild>
                    <button
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-zinc-800/70 hover:bg-zinc-700/80 transition-all border border-zinc-700/40"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4 text-zinc-300 hover:text-white transition-all" />
                    </button>
                </DialogClose>
            </div> 
            
            {/* Chat area taking up all available space */}
            <div className="flex-1 h-[calc(90vh-32px)] overflow-hidden">
                <AgentChatUI companyTicker={company} />
            </div>
        </DialogContent>
    );
}