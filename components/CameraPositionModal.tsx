import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Image as ImageIcon, Crosshair, ScanLine, Ruler, Target } from 'lucide-react';
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
    const dy = target.y - position.y; // Inverted Y logic visually, but math is cartesian
    // NOTE: In screen coords, Y increases downwards.
    // Atan2(y, x). 
    // North (Up) is negative Y.
    const angleRad = Math.atan2(dy, dx);
    const angleDeg = (angleRad * 180) / Math.PI; // -180 to 180
    // Normalize to compass (0 = North/Up, 90 = East, 180 = South, 270 = West)
    // Screen Y is down. Up is -90 deg in standard math.
    
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

  // Cone End Points (at target distance for visual handle placement)
  // We can project them further if we want the cone to look 'infinite', but handles at target dist is good.
  const handleDist = Math.max(dist, 100); // Minimum distance to prevent glitches
  
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
      
      // Mouse in View Units
      const mxPct = (e.clientX - rect.left) / rect.width;
      const myPct = (e.clientY - rect.top) / rect.height;
      const mouseV = { x: mxPct * V_W, y: myPct * V_H };

      if (dragMode === 'camera') {
        // Clamp to bounds
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
        // Calculate new angle between Camera->Mouse vector and Camera->Target vector
        const camToMouseAngle = Math.atan2(mouseV.y - camV.y, mouseV.x - camV.x);
        
        // Difference from center axis
        let diff = camToMouseAngle - angleRad;
        
        // Normalize angles
        while (diff <= -Math.PI) diff += 2 * Math.PI;
        while (diff > Math.PI) diff -= 2 * Math.PI;

        // New FOV is 2 * abs(diff)
        let newFov = Math.abs(diff) * 2 * (180 / Math.PI);
        
        // Clamp FOV
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
  }, [dragMode, camV, angleRad]); // Depend on camV/angleRad for FOV calc stability

  // Preset Handlers
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
      
      <div className="relative w-full max-w-6xl h-[700px] bg-slate-900 border border-slate-700 rounded-lg shadow-2xl flex overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-white/10">
        
        {/* Header - Technical Style */}
        <div className="absolute top-0 left-0 right-0 h-14 bg-slate-900/90 border-b border-slate-700 flex items-center justify-between px-6 z-20 backdrop-blur-sm">
           <div className="flex items-center gap-3">
              <div className="bg-blue-600/20 p-1.5 rounded text-blue-400 border border-blue-500/30">
                 <ScanLine size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-100 tracking-wide uppercase">Camera Positioning System</h2>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                   <span>LENS: {currentLensMm}MM</span>
                   <span className="text-slate-600">|</span>
                   <span>FOV: {Math.round(fov)}°</span>
                </div>
              </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
             <X size={20} />
           </button>
        </div>

        {/* LEFT COLUMN: Map & Widget */}
        <div className="w-2/3 relative bg-slate-950 overflow-hidden flex items-center justify-center select-none group">
           {/* Technical Grid Background */}
           <div 
              className="absolute inset-0 opacity-20" 
              style={{ 
                  backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)', 
                  backgroundSize: '20px 20px' 
              }} 
           />
           <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/50 pointer-events-none" />

           {/* Floor Plan Container */}
           <div 
              ref={mapRef}
              className="relative w-[90%] aspect-[16/10] border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden cursor-crosshair"
           >
              {/* Floor Plan Image - Inverted for Blueprint Look */}
              <img 
                 src="https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?q=80&w=2574&auto=format&fit=crop" 
                 className="w-full h-full object-cover opacity-60 mix-blend-screen grayscale contrast-125"
                 style={{ filter: 'invert(1)' }}
                 alt="Blueprint"
              />

              {/* Context Markers (Targets) */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-800/80 border border-slate-600 text-[9px] text-slate-300 font-mono rounded pointer-events-none select-none">
                 NORTH WINDOW
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-800/80 border border-slate-600 text-[9px] text-slate-300 font-mono rounded pointer-events-none select-none">
                 ENTRY DOOR
              </div>

              {/* INTERACTIVE SVG LAYER */}
              <svg 
                 viewBox={`0 0 ${V_W} ${V_H}`} 
                 className="absolute inset-0 w-full h-full z-10 overflow-visible"
              >
                 <defs>
                    <radialGradient id="coneGradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform={`translate(${camV.x} ${camV.y}) rotate(${(angleRad * 180)/Math.PI}) scale(${handleDist})`}>
                       <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                       <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                    </radialGradient>
                 </defs>

                 {/* Field of View Cone */}
                 <path 
                    d={`M ${camV.x} ${camV.y} L ${leftHandle.x} ${leftHandle.y} A ${handleDist} ${handleDist} 0 0 1 ${rightHandle.x} ${rightHandle.y} Z`}
                    fill="url(#coneGradient)"
                    stroke="#3B82F6"
                    strokeWidth="1"
                    strokeOpacity="0.3"
                 />
                 
                 {/* Center Line (Camera to Target) */}
                 <line 
                    x1={camV.x} y1={camV.y} 
                    x2={tgtV.x} y2={tgtV.y} 
                    stroke="#94A3B8" 
                    strokeWidth="1" 
                    strokeDasharray="4 4" 
                    className="opacity-50"
                 />

                 {/* Target Handle (Crosshair) */}
                 <g 
                    transform={`translate(${tgtV.x}, ${tgtV.y})`} 
                    onMouseDown={(e) => handleMouseDown(e, 'target')}
                    className="cursor-move group/target"
                 >
                    <circle r="12" fill="transparent" /> {/* Hit area */}
                    <line x1="-8" y1="0" x2="8" y2="0" stroke="currentColor" strokeWidth="2" className="text-white drop-shadow-md group-hover/target:text-blue-400 transition-colors" />
                    <line x1="0" y1="-8" x2="0" y2="8" stroke="currentColor" strokeWidth="2" className="text-white drop-shadow-md group-hover/target:text-blue-400 transition-colors" />
                    <circle r="4" stroke="currentColor" strokeWidth="2" fill="none" className="text-white drop-shadow-md group-hover/target:text-blue-400 transition-colors" />
                    {/* Focus Label */}
                    <text y="-15" textAnchor="middle" className="text-[10px] fill-slate-300 font-mono opacity-0 group-hover/target:opacity-100 transition-opacity pointer-events-none bg-black">FOCUS POINT</text>
                 </g>

                 {/* FOV Handles (Left & Right) */}
                 {[leftHandle, rightHandle].map((pos, idx) => (
                    <g 
                       key={idx} 
                       transform={`translate(${pos.x}, ${pos.y})`}
                       onMouseDown={(e) => handleMouseDown(e, 'fov', idx === 0 ? 'left' : 'right')}
                       className="cursor-ew-resize group/fov"
                    >
                       <circle r="10" fill="transparent" /> {/* Hit Area */}
                       <circle r="4" fill="white" className="drop-shadow-[0_0_8px_rgba(59,130,246,0.8)] group-hover/fov:scale-150 transition-transform" />
                       <circle r="8" stroke="white" strokeWidth="1" strokeOpacity="0.3" fill="none" className="group-hover/fov:strokeOpacity-100 transition-all" />
                    </g>
                 ))}

                 {/* Camera Origin (Draggable) */}
                 <g 
                    transform={`translate(${camV.x}, ${camV.y})`}
                    onMouseDown={(e) => handleMouseDown(e, 'camera')}
                    className="cursor-move group/cam"
                 >
                     <circle r="15" fill="transparent" /> {/* Hit area */}
                     <circle r="6" className="fill-blue-500 stroke-white stroke-2 drop-shadow-lg group-hover/cam:fill-blue-400 transition-colors" />
                     {/* Lens Direction Indicator (Small notch) */}
                     <path 
                        d="M -3 -8 L 3 -8 L 0 -12 Z" 
                        fill="white" 
                        transform={`rotate(${(angleRad * 180)/Math.PI + 90})`}
                     />
                 </g>

              </svg>

              {/* Tooltip for Lens when dragging FOV */}
              {dragMode === 'fov' && (
                 <div 
                    className="absolute z-50 px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
                    style={{ 
                       left: activeFovHandle === 'left' ? toPct(leftHandle).x + '%' : toPct(rightHandle).x + '%', 
                       top: (activeFovHandle === 'left' ? toPct(leftHandle).y : toPct(rightHandle).y) + '%' 
                    }}
                 >
                    {currentLensMm}mm
                 </div>
              )}
           </div>
           
           {/* Legend/Info */}
           <div className="absolute bottom-6 left-6 text-xs text-slate-500 font-mono flex gap-4 pointer-events-none">
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Camera</span>
              <span className="flex items-center gap-2"><Target size={12} className="text-white" /> Focus Target</span>
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.5)]"></div> Lens Width</span>
           </div>
        </div>

        {/* RIGHT COLUMN: Controls */}
        <div className="w-1/3 bg-slate-900 border-l border-slate-700 flex flex-col z-20">
           <div className="mt-14 p-6 flex-1 overflow-y-auto">
              
              {/* Reference */}
              <div className="mb-8">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <ImageIcon size={12} /> Reference Match
                 </label>
                 <div className="border border-dashed border-slate-700 rounded bg-slate-800/50 hover:bg-slate-800 hover:border-slate-500 transition-all cursor-pointer p-6 flex flex-col items-center justify-center gap-2 group">
                    <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center border border-slate-700 group-hover:border-blue-500/50 transition-colors">
                       <Crosshair size={14} className="text-slate-400 group-hover:text-blue-400" />
                    </div>
                    <p className="text-xs text-slate-300 font-medium">Upload Site Photo</p>
                    <p className="text-[10px] text-slate-500">AI will match exact perspective</p>
                 </div>
              </div>

              {/* Prompt Preview */}
              <div className="space-y-3">
                 <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Ruler size={12} /> Generated Description
                    </label>
                    <span className="text-[9px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 font-mono">
                       LIVE SYNC
                    </span>
                 </div>
                 <div className="relative">
                    <textarea 
                       value={prompt}
                       onChange={(e) => setPrompt(e.target.value)}
                       className="w-full h-40 bg-slate-950 border border-slate-700 rounded p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 resize-none font-mono leading-relaxed"
                    />
                    <div className="absolute bottom-2 right-2 flex gap-1">
                       <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                 </div>
              </div>
              
              {/* Presets */}
              <div className="mt-6 pt-6 border-t border-slate-800">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">
                    Quick Presets
                 </label>
                 <div className="grid grid-cols-2 gap-2">
                    <button 
                       onClick={() => applyPreset({x: 50, y: 85}, {x: 50, y: 50}, 80)}
                       className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-left group"
                    >
                       <span className="font-bold text-white block group-hover:text-blue-400">Entry Wide</span>
                       <span className="text-[10px] opacity-60">16mm • 80° FOV</span>
                    </button>
                    <button 
                       onClick={() => applyPreset({x: 50, y: 20}, {x: 50, y: 80}, 50)}
                       className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-left group"
                    >
                        <span className="font-bold text-white block group-hover:text-blue-400">Window View</span>
                        <span className="text-[10px] opacity-60">35mm • 50° FOV</span>
                    </button>
                    <button 
                       onClick={() => applyPreset({x: 15, y: 15}, {x: 60, y: 60}, 90)}
                       className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-left group"
                    >
                        <span className="font-bold text-white block group-hover:text-blue-400">Corner (NW)</span>
                        <span className="text-[10px] opacity-60">14mm • 90° FOV</span>
                    </button>
                    <button 
                       onClick={() => applyPreset({x: 50, y: 50}, {x: 50, y: 20}, 110)}
                       className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-left group"
                    >
                        <span className="font-bold text-white block group-hover:text-blue-400">Center Room</span>
                        <span className="text-[10px] opacity-60">12mm • 110° FOV</span>
                    </button>
                 </div>
              </div>
           </div>

           {/* Footer */}
           <div className="p-6 border-t border-slate-800 bg-slate-900/50">
              <Button 
                 variant="primary" 
                 className="w-full bg-blue-600 hover:bg-blue-500 text-white border-none py-3 shadow-lg shadow-blue-900/20 font-medium"
                 onClick={() => onApply({ ...position, rotation: (Math.atan2(target.y - position.y, target.x - position.x) * 180)/Math.PI + 90, prompt })}
              >
                 Confirm Viewpoint
              </Button>
           </div>
        </div>

      </div>
    </div>
  );
};
