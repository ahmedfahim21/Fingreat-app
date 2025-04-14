
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
        <DialogContent className="max-w-7xl w-[90vw] h-[90vh] bg-gray-800 text-white rounded-2xl border border-gray-900 shadow-lg">
            <DialogHeader>
                <DialogTitle className="flex items-center justify-center">
                    <Image
                    src="/fingreat.png"
                    alt="FinGReaT Logo"
                    width={30}
                    height={30}
                    className="mx-2"
                /> FinGReaT AI Agent</DialogTitle>
                <DialogDescription className="relative">
                    <div className="absolute right-0 top-0 flex flex-row gap-3 items-center">
                        <h2 className="text-sm font-semibold tracking-tight">
                            Trade with
                        </h2>
                        <Image
                            src="/Upstox.avif"
                            alt="Upstox"
                            height={15}
                            width={90}
                            className="rounded-sm w-20 h-6"
                        />
                    </div>
                </DialogDescription>
            </DialogHeader>
            <hr className="border-gray-700 mt-1" />
            <AgentChatUI companyTicker={company} />

        </DialogContent >
    )
}
