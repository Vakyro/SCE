"use client"

import { useRef, useEffect } from "react"
import type { Charge } from "@/app/simulator/page"

type FieldCanvasProps = {
  charges: Charge[]
}

export default function FieldCanvas({ charges }: FieldCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size to match window
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (charges.length === 0) return

    // Draw field lines
    drawElectricField(ctx, charges, canvas.width, canvas.height)
  }, [charges])

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawElectricField(ctx, charges, canvas.width, canvas.height)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [charges])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

function drawElectricField(ctx: CanvasRenderingContext2D, charges: Charge[], width: number, height: number) {
  // Grid density for field lines
  const gridStep = 30
  const arrowLength = 15
  const arrowWidth = 5

  // Draw field lines at grid points
  for (let x = 0; x < width; x += gridStep) {
    for (let y = 0; y < height; y += gridStep) {
      // Skip points too close to charges
      const tooClose = charges.some((charge) => {
        const dx = x - charge.x
        const dy = y - charge.y
        return Math.sqrt(dx * dx + dy * dy) < 20
      })

      if (tooClose) continue

      // Calculate electric field at this point
      const field = calculateElectricField(x, y, charges)
      const magnitude = Math.sqrt(field.x * field.x + field.y * field.y)

      if (magnitude < 1e-20) continue // Skip very weak fields

      // Normalize and scale for visualization
      const normalizedX = field.x / magnitude
      const normalizedY = field.y / magnitude

      // Draw arrow
      drawArrow(
        ctx,
        x,
        y,
        x + normalizedX * arrowLength,
        y + normalizedY * arrowLength,
        arrowWidth,
        getFieldColor(magnitude),
      )
    }
  }
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

function drawArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  headSize: number,
  color: string,
) {
  const angle = Math.atan2(toY - fromY, toX - fromX)

  // Draw line
  ctx.beginPath()
  ctx.moveTo(fromX, fromY)
  ctx.lineTo(toX, toY)
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.stroke()

  // Draw arrowhead
  ctx.beginPath()
  ctx.moveTo(toX, toY)
  ctx.lineTo(toX - headSize * Math.cos(angle - Math.PI / 6), toY - headSize * Math.sin(angle - Math.PI / 6))
  ctx.lineTo(toX - headSize * Math.cos(angle + Math.PI / 6), toY - headSize * Math.sin(angle + Math.PI / 6))
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
}

function getFieldColor(magnitude: number) {
  // Normalize magnitude to a reasonable range for visualization
  const normalizedMagnitude = Math.min(1, magnitude / 1e-10)

  // Color gradient from blue (weak) to purple (strong)
  const r = Math.floor(normalizedMagnitude * 128 + 127)
  const g = Math.floor((1 - normalizedMagnitude) * 100)
  const b = Math.floor(normalizedMagnitude * 128 + 127)

  return `rgb(${r}, ${g}, ${b})`
}

