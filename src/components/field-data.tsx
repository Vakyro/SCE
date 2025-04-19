"use client"

import { useState, useEffect } from "react"
import type { Charge } from "@/app/simulator/page"

type FieldDataProps = {
  charges: Charge[]
  isPlaying: boolean
}

export default function FieldData({ charges, isPlaying }: FieldDataProps) {
  const [fieldStrength, setFieldStrength] = useState<number | null>(null)
  const [fieldPoint, setFieldPoint] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setFieldPoint({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    if (charges.length === 0) {
      setFieldStrength(null)
      return
    }

    // Calculate field strength at current mouse position
    const field = calculateElectricField(fieldPoint.x, fieldPoint.y, charges)
    const magnitude = Math.sqrt(field.x * field.x + field.y * field.y)
    setFieldStrength(magnitude)
  }, [charges, fieldPoint])

  return (
    <div className="absolute bottom-4 left-4 bg-gray-800/80 p-4 rounded-lg max-w-md z-10 border border-purple-500/30">
      <h3 className="font-semibold mb-2 text-lg text-purple-300">Electric Field Data</h3>

      <div className="space-y-2">
        <div>
          <h4 className="text-sm text-purple-200">Charges:</h4>
          {charges.length === 0 ? (
            <p className="text-sm">No charges placed</p>
          ) : (
            <ul className="text-sm">
              {charges.map((charge) => (
                <li key={charge.id} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: charge.color }}></div>
                  <span>
                    {charge.type.charAt(0).toUpperCase() + charge.type.slice(1)}: {formatCharge(charge.value)} C
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h4 className="text-sm text-purple-200">Field Strength at Cursor:</h4>
          {fieldStrength === null ? (
            <p className="text-sm">N/A</p>
          ) : (
            <p className="text-sm">{formatScientific(fieldStrength)} N/C</p>
          )}
        </div>

        {isPlaying && <div className="text-xs text-purple-400 animate-pulse">Animation running...</div>}
      </div>
    </div>
  )
}

function calculateElectricField(x: number, y: number, charges: Charge[]) {
  let fieldX = 0
  let fieldY = 0
  const k = 8.99e9 // Coulomb constant

  charges.forEach((charge) => {
    const dx = x - charge.x
    const dy = y - charge.y
    const distanceSquared = dx * dx + dy * dy
    const distance = Math.sqrt(distanceSquared)

    if (distance < 1) return // Avoid division by zero

    // Calculate field magnitude using Coulomb's law
    const fieldMagnitude = (k * Math.abs(charge.value)) / distanceSquared

    // Calculate field components
    const directionX = dx / distance
    const directionY = dy / distance

    // Add to total field (negative charges attract, positive repel)
    const sign = charge.value < 0 ? -1 : 1
    fieldX += sign * fieldMagnitude * directionX
    fieldY += sign * fieldMagnitude * directionY
  })

  return { x: fieldX, y: fieldY }
}

function formatCharge(value: number): string {
  return formatScientific(value)
}

function formatScientific(value: number): string {
  if (value === 0) return "0"

  const exponent = Math.floor(Math.log10(Math.abs(value)))
  const mantissa = value / Math.pow(10, exponent)

  return `${mantissa.toFixed(2)} × 10^${exponent}`
}

