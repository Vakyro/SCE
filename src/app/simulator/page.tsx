"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowDown, Play, Pause, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ChargeSource from "@/components/charge-source"
import ChargeItem from "@/components/charge-item"
import DndProviderWrapper from "@/components/dnd-provider"
import DropTarget from "@/components/drop-target"
import { useDrop } from "react-dnd"

export type Charge = {
  id: string
  type: "electron" | "proton" | "custom"
  value: number
  x: number
  y: number
  color: string
}

function TrashZone({ onDelete }: { onDelete: (id: string) => void }) {
  const [{ isOver }, drop] = useDrop({
    accept: "PLACED_CHARGE",
    drop: (item: { id: string }) => {
      onDelete(item.id)
      return { deleted: true }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  })

  return (
    <div ref={drop} className="absolute right-6 bottom-6 z-30">
      <div className="flex justify-center items-center p-4 rounded-full">
        <Trash2 size={28} className="text-white" />
      </div>
    </div>
  )
}

export default function SimulatorPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [charges, setCharges] = useState<Charge[]>([])
  const [showChargeDialog, setShowChargeDialog] = useState(false)
  const [customChargeValue, setCustomChargeValue] = useState("")
  const [pendingCharge, setPendingCharge] = useState<Omit<Charge, "value">>()
  const [fieldArrows, setFieldArrows] = useState<{ x: number; y: number; angle: number }[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [animationFrameId, setAnimationFrameId] = useState<number | null>(null)
  const [testPointField, setTestPointField] = useState<{ x: number, y: number, magnitude: number } | null>(null)

  const isPlayingRef = useRef(isPlaying)
  useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])

  // Mover carga (por drag)
  const handleChargeMove = (id: string, x: number, y: number) => {
    setCharges(prev => prev.map(charge => charge.id === id ? { ...charge, x, y } : charge))
  }

  // Control de drop para generar nueva carga o mover existente
  const handleDrop = (type: "electron" | "proton" | "custom", x: number, y: number, existingId?: string) => {
    if (existingId) {
      handleChargeMove(existingId, x, y)
      return
    }

    let value = 0
    let color = ""

    switch (type) {
      case "electron":
        value = -1.602e-19
        color = "#FFD166"
        break
      case "proton":
        value = 1.602e-19
        color = "#118AB2"
        break
      case "custom":
        setPendingCharge({ id: `custom-${Date.now()}`, type, x, y, color: "#06D6A0" })
        setShowChargeDialog(true)
        return
    }

    setCharges(prev => [
      ...prev,
      { id: `${type}-${Date.now()}`, type, value, x, y, color }
    ])
  }

  // Función original de cálculo del campo (para visualización)
  const calculateElectricFieldAtPoint = (pointX: number, pointY: number, currentCharges: Charge[] = charges) => {
    const k = 8.9875e9;
    let electricFieldX = 0;
    let electricFieldY = 0;
    
    currentCharges.filter(charge => charge.id !== "test-charge").forEach(charge => {
      const dx = pointX - charge.x;
      const dy = pointY - charge.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 10) return;
      const factor = k * charge.value / (distance ** 2);
      electricFieldX += factor * (dx / distance);
      electricFieldY += factor * (dy / distance);
    });
    
    return {
      x: electricFieldX,
      y: electricFieldY,
      magnitude: Math.hypot(electricFieldX, electricFieldY)
    }
  };

  // Añadir una carga de prueba en el centro
  useEffect(() => {
    if (!containerRef.current) return
    const { clientWidth, clientHeight } = containerRef.current
    const testCharge: Charge = {
      id: "test-charge",
      type: "custom",
      value: 1e-9,
      x: clientWidth / 2,
      y: clientHeight / 2,
      color: "#FF3B30",
    }
    setCharges(prev => prev.some(c => c.id === "test-charge") ? prev : [...prev, testCharge])
  }, [])

    // Recalcula el campo eléctrico en el punto de prueba siempre que charges cambie
  useEffect(() => {
    const testCharge = charges.find(c => c.id === "test-charge");
    if (testCharge) {
      setTestPointField(calculateElectricFieldAtPoint(testCharge.x, testCharge.y, charges));
    }
  }, [charges]);


  // Cálculo del campo eléctrico para visualización en un grid
  const calculateElectricField = () => {
    if (!containerRef.current) return
    const { clientWidth: width, clientHeight: height } = containerRef.current
    const gridSpacing = 50
    const arrows: { x: number; y: number; angle: number }[] = []

    for (let x = gridSpacing; x < width; x += gridSpacing) {
      for (let y = gridSpacing; y < height; y += gridSpacing) {
        let Ex = 0
        let Ey = 0
        const k = 8.9875e9

        charges.filter(charge => charge.id !== "test-charge").forEach(charge => {
          const dx = x - charge.x
          const dy = y - charge.y
          const distance = Math.hypot(dx, dy)
          if (distance < 10) return
          const factor = k * charge.value / (distance ** 2)
          Ex += factor * (dx / distance)
          Ey += factor * (dy / distance)
        })

        if (Ex !== 0 || Ey !== 0) {
          arrows.push({ x, y, angle: Math.atan2(Ey, Ex) - Math.PI / 2 })
        }
      }
    }

    setFieldArrows(arrows)
  }

  useEffect(() => { calculateElectricField() }, [charges])

  const handleDeleteCharge = (id: string) => {
    if (id === "test-charge") return
    setCharges(prev => prev.filter(charge => charge.id !== id))
  }

  // Función conceptual para calcular velocidades uniformes
  const calculateConceptualVelocities = (currentCharges: Charge[]) => {
    // Excluir la carga de prueba para determinar el dominante
    const nonTest = currentCharges.filter(c => c.id !== "test-charge")
    let dominant: Charge | null = null
    if (nonTest.length > 0) {
      dominant = nonTest.reduce((prev, curr) => (Math.abs(curr.value) > Math.abs(prev.value) ? curr : prev))
    }
    
    const speed = 10; // Velocidad fija en píxeles por frame
    const velocities: { [id: string]: { vx: number, vy: number } } = {}
    
    currentCharges.forEach(charge => {
      // La carga de prueba o la dominante se mantienen quietas
      if (charge.id === "test-charge" || (dominant && charge.id === dominant.id)) {
        velocities[charge.id] = { vx: 0, vy: 0 }
        return
      }
      
      let netX = 0;
      let netY = 0;
      
      // Solo se consideran influencias de cargas de mayor o igual magnitud
      currentCharges.forEach(other => {
        if (other.id === charge.id || other.id === "test-charge") return;
        if (Math.abs(other.value) >= Math.abs(charge.value)) {
          // Si las cargas tienen signos opuestos → atracción (moverse hacia la otra)
          // Si tienen el mismo signo → repulsión (moverse en dirección opuesta a la otra)
          if (charge.value * other.value < 0) {
            netX += other.x - charge.x;
            netY += other.y - charge.y;
          } else {
            netX += charge.x - other.x;
            netY += charge.y - other.y;
          }
        }
      });
      
      // Si el vector neto es cero, no hay movimiento
      const norm = Math.hypot(netX, netY);
      if (norm === 0) {
        velocities[charge.id] = { vx: 0, vy: 0 };
      } else {
        velocities[charge.id] = { vx: (netX / norm) * speed, vy: (netY / norm) * speed }
      }
    });
    
    return velocities;
  };

  // Animación conceptual: se actualizan las posiciones con la velocidad uniforme calculada
  const animateCharges = () => {
    if (!isPlayingRef.current) return;
    
    console.log("Animando cargas conceptualmente");
    
    setCharges(prevCharges => {
      // Calcular velocidades conceptuales basadas en direcciones
      const velocities = calculateConceptualVelocities(prevCharges);
      
      const updatedCharges = prevCharges.map(charge => {
        if (charge.id === "test-charge") return charge;
        if (!velocities[charge.id]) return charge;
        
        // Actualizar la posición con la velocidad conceptual
        const newX = charge.x + velocities[charge.id].vx;
        const newY = charge.y + velocities[charge.id].vy;
        
        // Verificar límites para mantener las cargas dentro del contenedor
        const container = containerRef.current;
        const padding = 30;
        let boundedX = newX;
        let boundedY = newY;
        if (container) {
          boundedX = Math.max(padding, Math.min(container.clientWidth - padding, newX));
          boundedY = Math.max(padding, Math.min(container.clientHeight - padding, newY));
        }
        
        return { ...charge, x: boundedX, y: boundedY };
      });
      
      // Actualizar el campo en el punto de prueba
      const testCharge = updatedCharges.find(charge => charge.id === "test-charge");
      if (testCharge) {
        setTestPointField(calculateElectricFieldAtPoint(testCharge.x, testCharge.y, updatedCharges));
      }
      
      return updatedCharges;
    });
    
    const frameId = requestAnimationFrame(animateCharges);
    setAnimationFrameId(frameId);
  };

  const handlePlayPause = () => {
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
  
    if (newPlayingState) {
      console.log("Iniciando animación conceptual");
      const frameId = requestAnimationFrame(animateCharges);
      setAnimationFrameId(frameId);
    } else if (animationFrameId) {
      console.log("Deteniendo animación");
      cancelAnimationFrame(animationFrameId);
      setAnimationFrameId(null);
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [animationFrameId])

  return (
    <DndProviderWrapper>
      <DropTarget onDrop={handleDrop}>
        <div ref={containerRef} className="overflow-hidden relative min-h-screen text-white bg-gray-900 simulator-container">
          <div className="flex absolute top-4 right-4 z-50 flex-col gap-2 p-3 bg-white rounded-lg shadow-lg">
            <h3 className="mb-2 font-semibold text-center text-purple-700">Charges</h3>
            <ChargeSource type="electron" onDrop={(type, offset) => offset && handleDrop(type, offset.x, offset.y)} />
            <ChargeSource type="proton" onDrop={(type, offset) => offset && handleDrop(type, offset.x, offset.y)} />
            <ChargeSource type="custom" onDrop={(type, offset) => offset && handleDrop(type, offset.x, offset.y)} />
          </div>

          {fieldArrows.map((arrow, index) => (
            <div
              key={`arrow-${index}`}
              className="absolute pointer-events-none"
              style={{
                left: arrow.x,
                top: arrow.y,
                transform: `translate(-50%, -50%) rotate(${arrow.angle}rad)`,
                opacity: 0.6,
                zIndex: 10,
              }}
            >
              <ArrowDown size={20} className="text-white" />
            </div>
          ))}

          {charges.map(charge => (
            <ChargeItem
              containerRef={containerRef}
              key={charge.id}
              id={charge.id}
              type={charge.type}
              value={charge.value}
              x={charge.x}
              y={charge.y}
              color={charge.color}
              onMove={handleChargeMove}
              isTestCharge={charge.id === "test-charge"}
              isPlaying={isPlaying}
            />
          ))}

          <div className="absolute top-4 left-1/2 z-20 transform -translate-x-1/2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-purple-400 hover:bg-transparent"
              onClick={handlePlayPause}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>
          </div>

          <div className={`overflow-hidden absolute bottom-6 left-6 z-20 px-4 py-3 text-gray-900 bg-white rounded-lg border border-gray-200 shadow-lg ${charges.filter(charge => charge.id !== "test-charge").length <= 1 ? 'w-[200px]' : charges.filter(charge => charge.id !== "test-charge").length <= 2 ? 'w-[280px]' : 'w-[360px]'}`}>
            <h3 className="mb-2 font-semibold text-center text-purple-700">Results</h3>
            <div className="mb-3">
              <div className="flex overflow-x-auto flex-nowrap gap-4 pb-2 mb-2 scrollbar-thin scrollbar-thumb-gray-300 max-w-full justify-center">
                {charges.filter(charge => charge.id !== "test-charge")
                  .map(charge => (
                    <div key={charge.id} className="flex-shrink-0 flex flex-col items-center w-[72px]">
                      <div 
                        className="flex justify-center items-center rounded-full w-6 h-6"
                        style={{ 
                          backgroundColor: charge.color,
                          boxShadow: `0 0 6px ${charge.color}`
                        }}
                      >
                        <div className="font-bold text-black">
                          {charge.value > 0 ? "+" : "-"}
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-center">
                        <div>{charge.type.charAt(0).toUpperCase() + charge.type.slice(1)}</div>
                        <div>{charge.value.toExponential(2)} C</div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
            
            <div className="pt-2 text-center border-t">
              {testPointField ? (
                <>
                  <span className="text-xs font-medium">
                    Field Magnitude: {testPointField.magnitude.toExponential(2)} N/C
                  </span>
                  {!isPlaying && (
                    <span className="block text-xs text-gray-500">(Paused)</span>
                  )}
                </>
              ) : (
                <span className="text-xs italic text-gray-500">Press play to calculate</span>
              )}
            </div>
          </div>

          <TrashZone onDelete={handleDeleteCharge} />
        </div>
      </DropTarget>

      <Dialog open={showChargeDialog} onOpenChange={setShowChargeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear carga personalizada</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 gap-4 items-center">
              <Label htmlFor="charge-value" className="text-right">Valor (C)</Label>
              <Input
                id="charge-value"
                value={customChargeValue}
                onChange={(e) => setCustomChargeValue(e.target.value)}
                placeholder="Ej: 1.6e-19"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              if (pendingCharge && customChargeValue) {
                const value = parseFloat(customChargeValue)
                if (!isNaN(value)) {
                  setCharges(prev => [...prev, { ...pendingCharge, value }])
                  setShowChargeDialog(false)
                  setCustomChargeValue("")
                }
              }
            }}>
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DndProviderWrapper>
  )
}
