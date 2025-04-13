import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Inter, Open_Sans } from "next/font/google"
import type { ReactNode } from "react"
import "./globals.css";

const inter = Inter({ subsets: ["latin"] })


const openSans = Open_Sans({
  subsets: ["latin"]
})



export const metadata = {
  title: "FinGReaT",
  icons: {
    icon: "/fingreat.png",
  },
  description: "FinGReaT - Your AI Stock Assistant",
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={cn("flex min-h-svh flex-col antialiased", openSans.className)}>
        <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
      </body>
    </html>
  )
}


import './globals.css'