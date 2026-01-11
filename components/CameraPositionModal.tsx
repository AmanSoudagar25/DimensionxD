import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Image as ImageIcon, Crosshair, ScanLine, Ruler, Target, Terminal, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface CameraPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: { x: number; y: number; rotation: number; prompt: string }) => void;
}

// Fixed aspect ratio coordinate system for easier math (16:10 aspect ratio)
const V_W = 1000;
const V_H = 625;

export const CameraPositionModal: React.FC<CameraPositionModalProps> = ({ isOpen, onClose, onApply }) => {
  // State
  const [position, setPosition] = useState({ x: 50, y: 85 }); // Coordinates 0-100%
  const [target, setTarget] = useState({ x: 50, y: 50 });    // Coordinates 0-100%
  const [fov, setFov] = useState(60);                        // Degrees

  const [prompt, setPrompt] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);
  
  // Drag State
  const [dragMode, setDragMode] = useState<'camera' | 'target' | 'fov' | null>(null);
  const [activeFovHandle, setActiveFovHandle] = useState<'left' | 'right' | null>(null);

  // Derived Values for Display & Math
  const getMmFromFov = (degrees: number) => {
    // Approx formula for 35mm full frame sensor
    const sensorWidth = 36;
    const focalLength = sensorWidth / (2 * Math.tan((degrees * Math.PI) / 360));
    return Math.round(focalLength);
  };

  const currentLensMm = useMemo(() => getMmFromFov(fov), [fov]);

  // Update prompt based on geometry
  useEffect(() => {
    let loc = "center";
    if (position.y > 75) loc = "entry";
    else if (position.y < 25) loc = "window side";
    else if (position.x < 25) loc = "left wall";
    else if (position.x > 75) loc = "right wall";

    // Direction based on target relative to position
    const dx = target.x - position.x;
    const dy = target.y - position.y; 
    
    let dir = "custom angle";
    // Rough estimation
    if (Math.abs(target.x - 50) < 10 && target.y < position.y) dir = "North (Windows)";
    else if (Math.abs(target.x - 50) < 10 && target.y > position.y) dir = "South (Entry)";
    else if (target.x > position.x) dir = "East";
    else if (target.x < position.x) dir = "West";

    setPrompt(`Wide-angle shot with a ${currentLensMm}mm lens. Camera positioned at the ${loc}, focused on the ${dir}. Capturing the full spatial volume and architectural details.`);
  }, [position, target, currentLensMm]);

  // Helper: Convert Percent to SVG View Units
  const toView = (p: {x: number, y: number}) => ({ x: p.x * V_W / 100, y: p.y * V_H / 100 });
  const toPct = (v: {x: number, y: number}) => ({ x: v.x / V_W * 100, y: v.y / V_H * 100 });

  // Geometry Calculations
  const camV = toView(position);
  const tgtV = toView(target);
  
  const angleRad = Math.atan2(tgtV.y - camV.y, tgtV.x - camV.x);
  const dist = Math.sqrt(Math.pow(tgtV.x - camV.x, 2) + Math.pow(tgtV.y - camV.y, 2));
  
  // Cone Vectors
  const fovRad = (fov * Math.PI) / 180;
  const leftAngle = angleRad - fovRad / 2;
  const rightAngle = angleRad + fovRad / 2;

  // Cone End Points
  const handleDist = Math.max(dist, 100);
  
  const leftHandle = {
    x: camV.x + Math.cos(leftAngle) * handleDist,
    y: camV.y + Math.sin(leftAngle) * handleDist
  };
  const rightHandle = {
    x: camV.x + Math.cos(rightAngle) * handleDist,
    y: camV.y + Math.sin(rightAngle) * handleDist
  };

  // Interactions
  const handleMouseDown = (e: React.MouseEvent, mode: 'camera' | 'target' | 'fov', handle?: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    setDragMode(mode);
    if (handle) setActiveFovHandle(handle);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragMode || !mapRef.current) return;
      const rect = mapRef.current.getBoundingClientRect();
      
      const mxPct = (e.clientX - rect.left) / rect.width;
      const myPct = (e.clientY - rect.top) / rect.height;
      const mouseV = { x: mxPct * V_W, y: myPct * V_H };

      if (dragMode === 'camera') {
        const newX = Math.max(0, Math.min(100, mxPct * 100));
        const newY = Math.max(0, Math.min(100, myPct * 100));
        setPosition({ x: newX, y: newY });
      }
      else if (dragMode === 'target') {
         const newX = Math.max(0, Math.min(100, mxPct * 100));
         const newY = Math.max(0, Math.min(100, myPct * 100));
         setTarget({ x: newX, y: newY });
      }
      else if (dragMode === 'fov') {
        const camToMouseAngle = Math.atan2(mouseV.y - camV.y, mouseV.x - camV.x);
        let diff = camToMouseAngle - angleRad;
        
        while (diff <= -Math.PI) diff += 2 * Math.PI;
        while (diff > Math.PI) diff -= 2 * Math.PI;

        let newFov = Math.abs(diff) * 2 * (180 / Math.PI);
        newFov = Math.max(10, Math.min(170, newFov));
        setFov(newFov);
      }
    };

    const handleMouseUp = () => {
      setDragMode(null);
      setActiveFovHandle(null);
    };

    if (dragMode) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragMode, camV, angleRad]);

  const applyPreset = (p: {x:number, y:number}, t: {x:number, y:number}, f: number) => {
    setPosition(p);
    setTarget(t);
    setFov(f);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-5xl h-[650px] bg-[#0f0f0f] border border-white/10 rounded-lg shadow-2xl flex overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-white/5">
        
        {/* Header - Minimal Tech */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-[#0f0f0f]/90 border-b border-white/5 flex items-center justify-between px-5 z-20 backdrop-blur-sm">
           <div className="flex items-center gap-3">
              <div className="bg-white/5 p-1.5 rounded text-white/70 border border-white/5">
                 <ScanLine size={14} />
              </div>
              <h2 className="text-xs font-bold text-white tracking-widest uppercase opacity-80">Camera Positioning System</h2>
           </div>
           <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded text-white/50 hover:text-white transition-colors">
             <X size={18} />
           </button>
        </div>

        {/* LEFT COLUMN: Map & Viewfinder */}
        <div className="w-2/3 relative bg-[#050505] overflow-hidden flex items-center justify-center select-none group">
           
           {/* Technical Grid Background - Barely Visible */}
           <div 
              className="absolute inset-0 opacity-10 pointer-events-none" 
              style={{ 
                  backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', 
                  backgroundSize: '40px 40px' 
              }} 
           />

           {/* Floating HUD Badge */}
           <div className="absolute top-16 left-6 z-30 px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-3 text-xs font-mono text-white/80 pointer-events-none shadow-xl">
               <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>LENS: {currentLensMm}mm</span>
               <span className="opacity-20">|</span>
               <span>FOV: {Math.round(fov)}°</span>
           </div>

           {/* Floor Plan Container */}
           <div 
              ref={mapRef}
              className="relative w-[90%] aspect-[16/10] border border-white/5 bg-[#0a0a0a] shadow-2xl overflow-hidden cursor-crosshair rounded-sm"
           >
              {/* Floor Plan Image - Blueprint Style */}
              <img 
                 src="https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?q=80&w=2574&auto=format&fit=crop" 
                 className="w-full h-full object-cover opacity-40 mix-blend-screen grayscale contrast-125 invert"
                 alt="Blueprint"
              />

              {/* Context Markers (Targets) - Minimal */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/60 border border-white/10 text-[8px] text-white/50 font-mono rounded pointer-events-none">
                 NORTH WINDOW
              </div>

              {/* INTERACTIVE SVG LAYER */}
              <svg 
                 viewBox={`0 0 ${V_W} ${V_H}`} 
                 className="absolute inset-0 w-full h-full z-10 overflow-visible"
              >
                 <defs>
                    <radialGradient id="coneGradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform={`translate(${camV.x} ${camV.y}) rotate(${(angleRad * 180)/Math.PI}) scale(${handleDist})`}>
                       <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                       <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                    </radialGradient>
                 </defs>

                 {/* Field of View Cone */}
                 <path 
                    d={`M ${camV.x} ${camV.y} L ${leftHandle.x} ${leftHandle.y} A ${handleDist} ${handleDist} 0 0 1 ${rightHandle.x} ${rightHandle.y} Z`}
                    fill="url(#coneGradient)"
                    stroke="#3B82F6"
                    strokeWidth="1"
                    strokeOpacity="0.4"
                 />
                 
                 {/* Center Line (Camera to Target) */}
                 <line 
                    x1={camV.x} y1={camV.y} 
                    x2={tgtV.x} y2={tgtV.y} 
                    stroke="#fff" 
                    strokeWidth="1" 
                    strokeDasharray="2 4" 
                    className="opacity-30"
                 />

                 {/* Target Handle */}
                 <g 
                    transform={`translate(${tgtV.x}, ${tgtV.y})`} 
                    onMouseDown={(e) => handleMouseDown(e, 'target')}
                    className="cursor-move group/target"
                 >
                    <circle r="12" fill="transparent" />
                    <line x1="-6" y1="0" x2="6" y2="0" stroke="currentColor" strokeWidth="1.5" className="text-white group-hover/target:text-blue-400 transition-colors" />
                    <line x1="0" y1="-6" x2="0" y2="6" stroke="currentColor" strokeWidth="1.5" className="text-white group-hover/target:text-blue-400 transition-colors" />
                    <circle r="3" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-white group-hover/target:text-blue-400 transition-colors" />
                 </g>

                 {/* FOV Handles */}
                 {[leftHandle, rightHandle].map((pos, idx) => (
                    <g 
                       key={idx} 
                       transform={`translate(${pos.x}, ${pos.y})`}
                       onMouseDown={(e) => handleMouseDown(e, 'fov', idx === 0 ? 'left' : 'right')}
                       className="cursor-ew-resize group/fov"
                    >
                       <circle r="10" fill="transparent" />
                       <circle r="2.5" fill="white" className="drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] group-hover/fov:scale-150 transition-transform" />
                       <circle r="6" stroke="white" strokeWidth="1" strokeOpacity="0.2" fill="none" className="group-hover/fov:strokeOpacity-80 transition-all" />
                    </g>
                 ))}

                 {/* Camera Origin */}
                 <g 
                    transform={`translate(${camV.x}, ${camV.y})`}
                    onMouseDown={(e) => handleMouseDown(e, 'camera')}
                    className="cursor-move group/cam"
                 >
                     <circle r="15" fill="transparent" />
                     <circle r="5" className="fill-blue-600 stroke-white stroke-1 drop-shadow-md group-hover/cam:fill-blue-500 transition-colors" />
                     <path 
                        d="M -2.5 -7 L 2.5 -7 L 0 -10 Z" 
                        fill="white" 
                        transform={`rotate(${(angleRad * 180)/Math.PI + 90})`}
                     />
                 </g>

              </svg>
           </div>
           
           {/* Legend */}
           <div className="absolute bottom-6 left-6 text-[10px] text-white/30 font-mono flex gap-6 pointer-events-none uppercase tracking-wide">
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div> Camera Origin</span>
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full border border-white"></div> Focal Point</span>
           </div>
        </div>

        {/* RIGHT COLUMN: Technical Controls */}
        <div className="w-1/3 bg-[#0f0f0f] border-l border-white/5 flex flex-col z-20">
           <div className="mt-12 flex-1 overflow-y-auto">
              
              {/* SECTION 1: AI Terminal */}
              <div className="p-5 border-b border-white/5">
                 <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Terminal size={12} /> Live Interpretation
                 </label>
                 <div className="bg-black border border-white/10 rounded-lg p-3 h-32 overflow-y-auto font-mono text-xs text-green-400/90 shadow-inner scrollbar-none">
                    <span className="opacity-50 mr-2 select-none">$</span>
                    {prompt}
                    <span className="inline-block w-1.5 h-3 bg-green-400/50 ml-1 animate-pulse align-middle"/>
                 </div>
              </div>

              {/* SECTION 2: Quick Presets */}
              <div className="p-5 border-b border-white/5">
                 <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3 block">
                    Quick Presets
                 </label>
                 <div className="space-y-1">
                    {[
                      { l: 'Entry Wide', sub: '16mm • 80°', p: {x: 50, y: 85}, t: {x: 50, y: 50}, f: 80 },
                      { l: 'Window View', sub: '35mm • 50°', p: {x: 50, y: 20}, t: {x: 50, y: 80}, f: 50 },
                      { l: 'Corner (NW)', sub: '14mm • 90°', p: {x: 15, y: 15}, t: {x: 60, y: 60}, f: 90 },
                      { l: 'Center Room', sub: '12mm • 110°', p: {x: 50, y: 50}, t: {x: 50, y: 20}, f: 110 }
                    ].map((preset, idx) => (
                      <button 
                        key={idx}
                        onClick={() => applyPreset(preset.p, preset.t, preset.f)}
                        className="w-full flex items-center justify-between px-3 py-2 bg-white/5 border border-transparent rounded hover:bg-white/10 hover:border-white/5 transition-all group"
                      >
                         <span className="text-xs font-bold text-white/80 group-hover:text-white">{preset.l}</span>
                         <span className="text-[10px] text-white/30 font-mono group-hover:text-white/50">{preset.sub}</span>
                      </button>
                    ))}
                 </div>
              </div>

              {/* SECTION 3: Reference Match (Compact) */}
              <div className="p-5">
                 <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <ImageIcon size={12} /> Reference Match
                 </label>
                 <div className="flex items-center justify-between p-2.5 rounded bg-white/5 border border-white/5 group hover:bg-white/10 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded bg-black/50 text-white/50"><ImageIcon size={14}/></div>
                        <span className="text-xs text-white/60">Upload Photo...</span>
                    </div>
                    <span className="text-[9px] uppercase font-bold text-white/40 group-hover:text-white px-2 py-1 rounded bg-black/20">Browse</span>
                 </div>
              </div>
           </div>

           {/* Footer */}
           <div className="p-5 border-t border-white/5 bg-[#0f0f0f]">
              <Button 
                 variant="primary" 
                 className="w-full h-10 bg-white text-black hover:bg-gray-200 border-none font-bold text-xs uppercase tracking-wide shadow-lg"
                 onClick={() => onApply({ ...position, rotation: (Math.atan2(target.y - position.y, target.x - position.x) * 180)/Math.PI + 90, prompt })}
              >
                 ✓ Set View
              </Button>
           </div>
        </div>

      </div>
    </div>
  );
};
