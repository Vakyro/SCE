import React, { useRef, useEffect } from 'react';
import { useDrag } from 'react-dnd';

interface ChargeItemProps {
  id: string;
  type: 'electron' | 'proton' | 'custom';
  value: number;
  x: number;
  y: number;
  color: string;
  onMove: (id: string, x: number, y: number) => void;
  onDelete?: (id: string) => void;
  isTestCharge?: boolean;
  containerRef: React.RefObject<HTMLDivElement>; // Nuevo prop necesario
}

// Asegúrate de que el componente acepte la propiedad isPlaying
export default function ChargeItem({ 
  id, 
  type, 
  value, 
  x, 
  y, 
  color, 
  onMove, 
  onDelete,
  isTestCharge = false,
  containerRef,
  isPlaying = false // Añadir esta propiedad
}: ChargeItemProps & { isPlaying?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  
  // Configuración mejorada del drag
  const [{ isDragging, diff }, drag, preview] = useDrag(() => ({
    type: "PLACED_CHARGE",
    item: { id, type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
      diff: monitor.getDifferenceFromInitialOffset()
    }),
    options: {
      dropEffect: 'move',
    },
  }), [id, type, onMove]);

  // Eliminar el listener de mousemove y usar el sistema nativo de react-dnd
  useEffect(() => {
    // Configurar preview transparente
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  // Mover la lógica de posición al evento de drag
  useEffect(() => {
    if (!isDragging) return;

    const handleDrag = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newX = e.clientX - rect.left;
        const newY = e.clientY - rect.top;
        onMove(id, newX, newY);
      }
    };

    document.addEventListener('mousemove', handleDrag);
    return () => document.removeEventListener('mousemove', handleDrag);
  }, [isDragging, containerRef, id, onMove]);

  // Símbolo de carga mejorado
  const chargeSymbol = value > 0 ? "+" : value < 0 ? "-" : "±";
  
  return (
    <div
      ref={node => {
        drag(node);
        ref.current = node;
      }}
      className={`absolute cursor-grab active:cursor-grabbing z-20 rounded-full charge-item
        ${isPlaying ? 'animating' : ''} 
        ${isTestCharge ? 'w-4 h-4' : 'w-7 h-7'}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
        backgroundColor: color,
        boxShadow: `0 0 8px ${color}`,
        opacity: isDragging ? 0.8 : 1,
      }}
    >
      {!isTestCharge && (
        <div className="flex absolute inset-0 justify-center items-center font-bold text-black">
          {chargeSymbol}
        </div>
      )}
    </div>
  );
}

// Función helper para imagen transparente
const getEmptyImage = () => {
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%220%22%20height%3D%220%22%3E%3C%2Fsvg%3E';
  return img;
};