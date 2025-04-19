import type React from "react"
import './globals.css'
import DndProviderWrapper  from "@/components/dnd-provider"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Simulator de Cargas Eléctricas',
  description: 'An interactive electric charge simulator for physics education',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen antialiased bg-background">
        <DndProviderWrapper>
          {children}
        </DndProviderWrapper>
      </body>
    </html>
  )
}

