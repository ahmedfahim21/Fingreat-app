import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { AgentChatUI } from "./modal chat"
import { useCompany } from "@/hooks/use-company";
import Image from "next/image";

export function DialogBox() {
    const { company } = useCompany();

    return (
        <DialogContent className="max-w-7xl w-[90vw] h-[90vh] bg-zinc-900 text-white rounded-3xl border border-zinc-800 shadow-2xl backdrop-blur-sm">
            <DialogHeader className="pb-3">
                <DialogTitle className="flex items-center justify-center mt-2">
                    <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-600 p-2 px-4 rounded-full shadow-md">
                        <Image
                            src="/fingreat.png"
                            alt="FinGReaT Logo"
                            width={24}
                            height={24}
                            className="rounded-full"
                        />
                        <span className="text-lg font-bold tracking-wide">FinGReaT AI Agent</span>
                    </div>
                </DialogTitle>
                <DialogDescription className="relative mt-4">
                    <div className="absolute right-0 top-0 flex flex-row gap-3 items-center">
                        <h2 className="text-sm font-semibold tracking-tight text-zinc-300">
                            Trade with
                        </h2>
                        <div className="bg-zinc-800 p-1.5 rounded-full flex items-center hover:bg-zinc-700 transition-all duration-200">
                            <Image
                                src="/Upstox.avif"
                                alt="Upstox"
                                height={15}
                                width={80}
                                className="rounded-sm h-5"
                            />
                        </div>
                    </div>
                </DialogDescription>
            </DialogHeader>
            <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent my-1" />
            <div className="mt-2 flex-1 overflow-hidden rounded-2xl">
                <AgentChatUI companyTicker={company} />
            </div>
        </DialogContent>
    )
}