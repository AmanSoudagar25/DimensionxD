import React, { useState, useRef } from 'react';
import { 
  Move, MousePointer2, Plus, Minus, Star, RefreshCw, Trash2, Check
} from 'lucide-react';
import { RenderNode } from '../types';

interface InfiniteCanvasAreaProps {
  renders: RenderNode[];
  setRenders: React.Dispatch<React.SetStateAction<RenderNode[]>>;
  selectedRenderId: string | null;
  onSelect: (id: string) => void;
  canvasTransform: { x: number, y: number, scale: number };
  setCanvasTransform: React.Dispatch<React.SetStateAction<{ x: number, y: number, scale: number }>>;
}

export const InfiniteCanvasArea: React.FC<InfiniteCanvasAreaProps> = ({
  renders,
  setRenders,
  selectedRenderId,
  onSelect,
  canvasTransform,
  setCanvasTransform
}) => {
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [draggingRenderId, setDraggingRenderId] = useState<string | null>(null);
  const [cardDragOffset, setCardDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Canvas Event Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.render-card')) return;
    setIsDraggingCanvas(true);
    dragStartRef.current = { x: e.clientX - canvasTransform.x, y: e.clientY - canvasTransform.y };
  };

  const handleCardMouseDown = (e: React.MouseEvent, render: RenderNode) => {
    e.stopPropagation();
    e.preventDefault();

    const worldMouseX = (e.clientX - canvasTransform.x) / canvasTransform.scale;
    const worldMouseY = (e.clientY - canvasTransform.y) / canvasTransform.scale;

    setDraggingRenderId(render.id);
    setCardDragOffset({
      x: worldMouseX - render.position.x,
      y: worldMouseY - render.position.y
    });

    // Fire selection event
    onSelect(render.id);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDraggingCanvas) {
      setCanvasTransform(prev => ({
        ...prev,
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      }));
    } else if (draggingRenderId) {
      const worldMouseX = (e.clientX - canvasTransform.x) / canvasTransform.scale;
      const worldMouseY = (e.clientY - canvasTransform.y) / canvasTransform.scale;

      setRenders(prev => prev.map(r => {
        if (r.id === draggingRenderId) {
          return {
            ...r,
            position: {
              x: worldMouseX - cardDragOffset.x,
              y: worldMouseY - cardDragOffset.y
            }
          };
        }
        return r;
      }));
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingCanvas(false);
    setDraggingRenderId(null);
  };

  const handleCanvasWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const zoomSensitivity = 0.001;
    const newScale = Math.min(Math.max(0.2, canvasTransform.scale - e.deltaY * zoomSensitivity), 3);
    setCanvasTransform(prev => ({ ...prev, scale: newScale }));
  };

  const handleZoomIn = () => {
    setCanvasTransform(prev => ({ ...prev, scale: Math.min(prev.scale + 0.2, 3) }));
  };

  const handleZoomOut = () => {
    setCanvasTransform(prev => ({ ...prev, scale: Math.max(prev.scale - 0.2, 0.2) }));
  };

  return (
    <main 
      className="flex-1 relative bg-[#050505] overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-300"
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onMouseLeave={handleCanvasMouseUp}
      onWheel={handleCanvasWheel}
      ref={canvasRef}
    >
      {/* Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', 
          backgroundSize: '24px 24px', 
          opacity: 0.3,
          transform: `translate(${canvasTransform.x % 24}px, ${canvasTransform.y % 24}px)` 
        }} 
      />

      {/* World Space Container */}
      <div 
        className="absolute top-1/2 left-1/2 will-change-transform"
        style={{ 
          transform: `translate(${canvasTransform.x}px, ${canvasTransform.y}px) scale(${canvasTransform.scale})`,
          transformOrigin: '0 0'
        }}
      >
        <div style={{ transform: 'scale(1)', translate: '0px 0px' }}>
          {/* TODO: Replace this wrapper with <TransformComponent> from react-zoom-pan-pinch */}
          {renders.map((render) => {
            const isActive = selectedRenderId === render.id;
            return (
              <div 
                key={render.id}
                className={`render-card absolute transition-all duration-75 group bg-white shadow-2xl rounded-sm overflow-hidden select-none hover:z-30 cursor-move ${isActive ? 'z-20 ring-4 ring-indigo-500 ring-offset-4 ring-offset-[#050505]' : 'z-0 grayscale-[0.3] hover:grayscale-0'}`}
                style={{ 
                  transform: `translate(${render.position.x}px, ${render.position.y}px)`,
                  width: '400px',
                }}
                onMouseDown={(e) => handleCardMouseDown(e, render)}
              >
                {/* Render Image */}
                <div className="aspect-[4/3] bg-gray-200 relative">
                  <img 
                    src={render.imageUrl} 
                    className="w-full h-full object-cover pointer-events-none" 
                    alt={render.title}
                    draggable={false}
                  />
                  
                  {/* Context Toolbar (Visible only on Active) */}
                  {isActive && (
                    <div className="absolute top-2 right-2 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-200">
                      <button className="flex items-center gap-2 px-3 py-1.5 bg-black/80 backdrop-blur text-white text-[10px] font-medium rounded hover:bg-emerald-600 transition-colors shadow-lg">
                        <Star size={12} className="text-emerald-400" /> Save
                      </button>
                      <button className="flex items-center gap-2 px-3 py-1.5 bg-black/80 backdrop-blur text-white text-[10px] font-medium rounded hover:bg-indigo-600 transition-colors shadow-lg">
                        <RefreshCw size={12} /> Retry
                      </button>
                      <button className="flex items-center gap-2 px-3 py-1.5 bg-black/80 backdrop-blur text-white text-[10px] font-medium rounded hover:bg-red-600 transition-colors shadow-lg">
                        <Trash2 size={12} className="text-red-400" /> Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Minimal Footer */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-100">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{render.title}</h4>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5 uppercase tracking-wider">{render.timestamp}</p>
                  </div>
                  {render.isSaved && (
                    <div className="bg-emerald-100 text-emerald-700 p-1.5 rounded-full">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Canvas Controls Help */}
      <div className="absolute bottom-6 left-6 pointer-events-none bg-black/50 backdrop-blur px-3 py-2 rounded text-[10px] text-textMuted border border-white/5 z-50">
        <span className="flex items-center gap-2"><Move size={12} /> Pan: Drag Empty Space</span>
        <span className="flex items-center gap-2 mt-1"><MousePointer2 size={12} /> Drag Card to Move</span>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-1 bg-surface border border-border rounded-lg shadow-xl overflow-hidden z-50">
        <button 
          onClick={handleZoomIn} 
          className="p-2 text-white hover:bg-surfaceHighlight transition-colors"
          title="Zoom In"
        >
          <Plus size={16} />
        </button>
        <div className="h-px bg-border w-full" />
        <button 
          onClick={handleZoomOut} 
          className="p-2 text-white hover:bg-surfaceHighlight transition-colors"
          title="Zoom Out"
        >
          <Minus size={16} />
        </button>
      </div>
    </main>
  );
};