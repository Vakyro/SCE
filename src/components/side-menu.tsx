"use client"

import { useDrop } from "react-dnd"
import { useRef } from "react"
import { useDrag } from "react-dnd"

type SideMenuProps = {
  onDrop: (type: "electron" | "proton" | "custom", x: number, y: number) => void
}

type DragItem = {
  type: "electron" | "proton" | "custom"
}

const ChargeSource = ({
  type,
  color,
  label,
}: { type: "electron" | "proton" | "custom"; color: string; label: string }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "CHARGE",
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return (
    <div ref={drag} className="flex flex-col items-center mb-6 cursor-grab" style={{ opacity: isDragging ? 0.5 : 1 }}>
      <div className="flex justify-center items-center mb-2 w-12 h-12 rounded-full" style={{ backgroundColor: color }}>
        {type === "electron" && <span className="text-lg font-bold text-black">-</span>}
        {type === "proton" && <span className="text-lg font-bold text-black">+</span>}
        {type === "custom" && <span className="text-lg font-bold text-black">?</span>}
      </div>
      <span className="text-sm">{label}</span>
    </div>
  )
}

export default function SideMenu({ onDrop }: SideMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  const [, drop] = useDrop(() => ({
    accept: "CHARGE",
    drop: (item: DragItem, monitor) => {
      const clientOffset = monitor.getClientOffset()
      if (clientOffset && menuRef.current) {
        // Get the position relative to the viewport
        const x = clientOffset.x
        const y = clientOffset.y
        onDrop(item.type, x, y)
      }
    },
  }))

  drop(document.body)

  return (
    <div
      ref={menuRef}
      className="flex absolute right-6 top-1/2 z-20 flex-col items-center px-6 py-8 text-gray-900 bg-white rounded-full shadow-lg transform -translate-y-1/2"
    >
      <h3 className="mb-6 font-semibold text-center text-purple-900">Charges</h3>
      <ChargeSource type="electron" color="yellow" label="Electron" />
      <ChargeSource type="proton" color="blue" label="Proton" />
      <ChargeSource type="custom" color="green" label="Custom" />
    </div>
  )
}

