import React, { useRef, useEffect } from 'react';
import { useDrag } from 'react-dnd';

interface ChargeSourceProps {
  type: 'electron' | 'proton' | 'custom';
  color?: string;
  label?: string;
  onDrop: (type: 'electron' | 'proton' | 'custom', offset: { x: number; y: number } | null) => void;
}

export default function ChargeSource({ 
  type, 
  color, 
  label, 
  onDrop 
}: ChargeSourceProps) {
  const chargeRef = useRef<HTMLDivElement>(null);
  
  // Set default colors and labels based on type
  const getDefaultColor = () => {
    switch (type) {
      case "electron": return "#FFD166"; // Amarillo
      case "proton": return "#118AB2"; // Azul
      case "custom": return "#06D6A0"; // Verde
      default: return "#FFFFFF";
    }
  };

  const getDefaultLabel = () => {
    switch (type) {
      case "electron": return "Electron";
      case "proton": return "Proton";
      case "custom": return "Custom";
      default: return "";
    }
  };

  const finalColor = color || getDefaultColor();
  const finalLabel = label || getDefaultLabel();

  // Usar una referencia para la imagen de arrastre personalizada
  const dragPreviewRef = useRef<HTMLDivElement | null>(null);
  
  // Crear el elemento de vista previa al montar el componente
  useEffect(() => {
    const preview = document.createElement('div');
    preview.style.width = '28px';
    preview.style.height = '28px';
    preview.style.borderRadius = '50%';
    preview.style.backgroundColor = finalColor;
    preview.style.boxShadow = `0 0 8px ${finalColor}`;
    preview.style.position = 'absolute';
    preview.style.zIndex = '1000';
    preview.style.pointerEvents = 'none';
    preview.style.opacity = '0.8';
    preview.style.display = 'none';
    document.body.appendChild(preview);
    
    dragPreviewRef.current = preview;
    
    return () => {
      if (preview && document.body.contains(preview)) {
        document.body.removeChild(preview);
      }
    };
  }, [finalColor]);

  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: "CHARGE",
    item: () => {
      // Crear una imagen transparente para ocultar la vista previa predeterminada
      const img = new Image();
      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      
      // Mostrar nuestra vista previa personalizada
      if (dragPreviewRef.current) {
        dragPreviewRef.current.style.display = 'block';
      }
      
      return { type };
    },
    end: (item, monitor) => {
      const didDrop = monitor.didDrop();
      const dropResult = monitor.getDropResult();
      const clientOffset = monitor.getClientOffset();
      
      // Ocultar nuestra vista previa personalizada
      if (dragPreviewRef.current) {
        dragPreviewRef.current.style.display = 'none';
      }
      
      if (didDrop && onDrop && clientOffset) {
        onDrop(type, clientOffset);
      }
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [type, onDrop]);

  // Actualizar la posición de la vista previa durante el arrastre
  useEffect(() => {
    if (!isDragging || !dragPreviewRef.current) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (dragPreviewRef.current) {
        dragPreviewRef.current.style.left = `${e.clientX - 14}px`;
        dragPreviewRef.current.style.top = `${e.clientY - 14}px`;
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging]);

  return (
    <div className="flex flex-col items-center">
      <span className='text-gray-800 mb-1'>
        {finalLabel}
      </span>
      <div 
        ref={drag}
        className="flex justify-center items-center p-2 rounded-lg cursor-grab hover:bg-gray-100"
      >
        <div 
          className="flex justify-center items-center w-7 h-7 rounded-full" 
          style={{ 
            backgroundColor: finalColor,
            boxShadow: `0 0 8px ${finalColor}`,
            opacity: isDragging ? 0.5 : 1 
          }}
        >
          {type === "electron" && <span className="text-black font-bold">-</span>}
          {type === "proton" && <span className="text-black font-bold">+</span>}
          {type === "custom" && <span className="text-black font-bold">?</span>}
        </div>
      </div>
    </div>
  );
}

