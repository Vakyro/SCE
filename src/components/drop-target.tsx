import React from 'react';
import { useDrop } from 'react-dnd';

interface DropTargetProps {
  children: React.ReactNode;
  onDrop: (type: "electron" | "proton" | "custom", x: number, y: number, existingId?: string) => void;
}

export default function DropTarget({ children, onDrop }: DropTargetProps) {
  const [{ isOver }, drop] = useDrop({
    accept: ["CHARGE", "PLACED_CHARGE"],
    drop: (item: { type: "electron" | "proton" | "custom", id?: string }, monitor) => {
      const clientOffset = monitor.getClientOffset();
      if (clientOffset) {
        if (item.id) {
          // Es una carga existente que se está moviendo
          onDrop(item.type, clientOffset.x, clientOffset.y, item.id);
        } else {
          // Es una nueva carga que se está creando
          onDrop(item.type, clientOffset.x, clientOffset.y);
        }
      }
      return { dropped: true };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div 
      ref={drop} 
      className="w-full h-full"
      style={{ 
        position: 'relative',
        outline: isOver ? '2px dashed white' : 'none',
      }}
    >
      {children}
    </div>
  );
}