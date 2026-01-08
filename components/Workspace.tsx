import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Settings, 
  Layers, Sun, Palette, 
  Wand2, Download,
  Monitor, Box, Camera,
  ChevronDown, ChevronRight, ChevronLeft,
  ChevronsLeft, ChevronsRight,
  History, FileText,
  DollarSign, ShoppingBag,
  Share2, Save, Plus, Filter, MoreHorizontal,
  Eye, Minimize2, Edit2, RotateCw, Sparkles,
  Sofa, Crown, Scan, MousePointer2, Navigation, UploadCloud,
  User, Grid3X3, Check, Target,
  Sunset, Moon, Zap, Loader2, Ban,
  FolderOpen, Image as ImageIcon,
  Trash2, RefreshCw, Star, Move, Minus
} from 'lucide-react';
import { Project } from '../types';
import { Button } from './Button';
import { FloorPlanAnalysisOverlay } from './FloorPlanAnalysisOverlay';
import { CameraPositionModal } from './CameraPositionModal';

interface WorkspaceProps {
  project: Project;
  onBack: () => void;
  isNewProject?: boolean;
}

interface RenderNode {
  id: string;
  x: number;
  y: number;
  imageUrl: string;
  title: string;
  timestamp: string;
  status: 'saved' | 'draft';
  isActive: boolean;
}

export const Workspace: React.FC<WorkspaceProps> = ({ project, onBack, isNewProject = false }) => {
  // Sidebar State
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'room' | 'selection' | 'boq'>('room');
  
  const [selectedObject, setSelectedObject] = useState<string>('wall');
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  
  // Camera State
  const [viewpoint, setViewpoint] = useState('Hero (Entry)');
  const [lens, setLens] = useState('1x');
  const [angle, setAngle] = useState('Eye-Level');
  const [isViewpointOpen, setIsViewpointOpen] = useState(false);
  
  // Prompt Engine States
  const [lightingScenario, setLightingScenario] = useState('Daylight');
  const [mood, setMood] = useState('Standard');
  const [style, setStyle] = useState('Japandi');
  const [creativity, setCreativity] = useState(30); // 0-100
  const [excludePrompt, setExcludePrompt] = useState('');
  
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Canvas State
  const [canvasTransform, setCanvasTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [draggingRenderId, setDraggingRenderId] = useState<string | null>(null);
  const [cardDragOffset, setCardDragOffset] = useState({ x: 0, y: 0 });
  const [activeRenderId, setActiveRenderId] = useState<string>('1');
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Mock Render Data
  const [renders, setRenders] = useState<RenderNode[]>([
    { id: '1', x: 0, y: 0, imageUrl: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2700&auto=format&fit=crop', title: 'Draft #3', timestamp: '10:42 AM', status: 'saved', isActive: true },
    { id: '2', x: -380, y: 50, imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800', title: 'Draft #2', timestamp: '10:30 AM', status: 'saved', isActive: false },
    { id: '3', x: 380, y: -50, imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800', title: 'Draft #1', timestamp: '10:15 AM', status: 'draft', isActive: false },
  ]);

  // Canvas & Card Event Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Only drag canvas if clicking background (not a card)
    if ((e.target as HTMLElement).closest('.render-card')) return;
    
    setIsDraggingCanvas(true);
    dragStartRef.current = { x: e.clientX - canvasTransform.x, y: e.clientY - canvasTransform.y };
  };

  const handleCardMouseDown = (e: React.MouseEvent, render: RenderNode) => {
    e.stopPropagation();
    e.preventDefault();

    // Calculate mouse position in world space
    const worldMouseX = (e.clientX - canvasTransform.x) / canvasTransform.scale;
    const worldMouseY = (e.clientY - canvasTransform.y) / canvasTransform.scale;

    setDraggingRenderId(render.id);
    setCardDragOffset({
      x: worldMouseX - render.x,
      y: worldMouseY - render.y
    });

    // Set active immediately on click
    if (activeRenderId !== render.id) {
      setActiveRenderId(render.id);
      setRenders(prev => prev.map(r => ({ ...r, isActive: r.id === render.id })));
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDraggingCanvas) {
      setCanvasTransform(prev => ({
        ...prev,
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      }));
    } else if (draggingRenderId) {
      // Calculate new world position for the card
      const worldMouseX = (e.clientX - canvasTransform.x) / canvasTransform.scale;
      const worldMouseY = (e.clientY - canvasTransform.y) / canvasTransform.scale;

      setRenders(prev => prev.map(r => {
        if (r.id === draggingRenderId) {
          return {
            ...r,
            x: worldMouseX - cardDragOffset.x,
            y: worldMouseY - cardDragOffset.y
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

  const handleCenterOnRender = (render: RenderNode) => {
     setCanvasTransform({
        x: -render.x * canvasTransform.scale,
        y: -render.y * canvasTransform.scale,
        scale: canvasTransform.scale
     });
     setActiveRenderId(render.id);
     setRenders(prev => prev.map(r => ({ ...r, isActive: r.id === render.id })));
  };


  // Auto-trigger analysis for new projects
  useEffect(() => {
    if (isNewProject) {
      const timer = setTimeout(() => {
        setIsAnalysisOpen(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isNewProject]);

  // Mark changes as pending when settings change
  useEffect(() => {
    setHasPendingChanges(true);
  }, [viewpoint, lens, angle, lightingScenario, mood, style, creativity, excludePrompt]);

  const handleUpdateRender = () => {
    if (!hasPendingChanges) return;
    setIsGenerating(true);
    // Simulate generation delay
    setTimeout(() => {
       setIsGenerating(false);
       setHasPendingChanges(false);
       // Add new mock render
       const newId = Date.now().toString();
       const newRender: RenderNode = {
         id: newId,
         x: Math.random() * 200 - 100,
         y: Math.random() * 200 - 100,
         imageUrl: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2700&auto=format&fit=crop',
         title: `Draft #${renders.length + 1}`,
         timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
         status: 'draft',
         isActive: true
       };
       setRenders(prev => [...prev.map(r => ({...r, isActive: false})), newRender]);
       setActiveRenderId(newId);
    }, 2500);
  };

  const handleCameraApply = (data: any) => {
     setIsCameraModalOpen(false);
     setViewpoint('Custom');
     setHasPendingChanges(true);
  };

  const boqItems = [
    { name: 'Harmony Sofa', brand: 'West Elm', price: '₹1,25,000', commission: '₹4,500', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=100', sponsored: true },
    { name: 'Oak Parquet', brand: 'Tarkett', price: '₹85,000', commission: '₹2,100', img: 'https://images.unsplash.com/photo-1581858726768-fd8a652aeb56?auto=format&fit=crop&q=80&w=100' },
    { name: 'Noguchi Table', brand: 'Herman Miller', price: '₹1,12,000', commission: '₹5,000', img: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&q=80&w=100' },
    { name: 'Kelim Rug', brand: 'Jaipur Rugs', price: '₹28,000', commission: '₹800', img: 'https://images.unsplash.com/photo-1575414003591-ece8d141619a?auto=format&fit=crop&q=80&w=100' },
    { name: 'Floor Lamp', brand: 'Flos', price: '₹45,000', commission: '₹1,200', img: 'https://images.unsplash.com/photo-1513506003013-d5347e0f95d1?auto=format&fit=crop&q=80&w=100' },
  ];

  const contextItems = [
    { title: 'Floor Plan Level 1', type: 'PLAN', color: 'bg-indigo-500/20 text-indigo-300', time: '2h ago', img: 'https://images.unsplash.com/photo-1580820267682-426da823b514?auto=format&fit=crop&q=80&w=100' },
    { title: 'Client Brief v2', type: 'BRIEF', color: 'bg-emerald-500/20 text-emerald-300', time: 'Yesterday', icon: FileText },
    { title: 'Moodboard Ref', type: 'REF', color: 'bg-amber-500/20 text-amber-300', time: '2 days ago', img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=100' },
  ];

  const surfaceItems = [
    { id: 'wall', name: 'Accent Wall', current: 'Off-White Matte', type: 'Surface', icon: Box },
    { id: 'floor', name: 'Flooring', current: 'Light Oak Parquet', type: 'Surface', icon: Layers },
    { id: 'sofa', name: 'Harmony Sofa', current: 'Grey Fabric', type: 'Object', icon: Sofa },
    { id: 'table', name: 'Coffee Table', current: 'Glass & Wood', type: 'Object', icon: Box }
  ];

  const materials = [
    { id: 1, name: 'Matte White', color: '#f5f5f5' },
    { id: 2, name: 'Warm Beige', color: '#e5d0b1' },
    { id: 3, name: 'Cool Grey', color: '#9ca3af' },
    { id: 4, name: 'Charcoal', color: '#374151' },
    { id: 5, name: 'Navy Blue', color: '#1e3a8a', premium: true },
    { id: 6, name: 'Forest Green', color: '#14532d', premium: true },
    { id: 7, name: 'Terracotta', color: '#9a3412', premium: true },
    { id: 8, name: 'Concrete', color: '#57534e', premium: true },
    { id: 9, name: 'Light Oak', color: '#d8b998' },
    { id: 10, name: 'Walnut', color: '#5d4037' },
    { id: 11, name: 'Brass', color: '#b5a642', premium: true },
    { id: 12, name: 'Marble', color: '#e8e8e8', premium: true },
  ];

  const selectedItemData = surfaceItems.find(i => i.id === selectedObject);

  const viewpoints = ['Hero (Entry)', 'Reverse (Window)', 'Corner Perspective', 'Center Room'];
  const styles = ['Japandi', 'Modern Minimalist', 'Industrial', 'Bohemian', 'Scandinavian', 'Mid-Century'];

  const lightingOptions = [
     { id: 'Daylight', icon: Sun },
     { id: 'Golden Hour', icon: Sunset },
     { id: 'Evening', icon: Moon },
     { id: 'Studio', icon: Zap },
  ];

  // Dynamic Width Logic
  const leftSidebarWidth = isLeftCollapsed ? 'w-[60px]' : 'w-72';
  const rightSidebarWidth = isRightCollapsed 
    ? 'w-[60px]' 
    : (activeTab === 'room' ? 'w-80' : 'w-[480px]');

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden text-textMain">
      {/* Workspace Header */}
      <header className="h-12 border-b border-border bg-surface flex items-center justify-between px-4 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-1.5 hover:bg-surfaceHighlight rounded-lg text-textMuted hover:text-white transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="h-4 w-px bg-border mx-1" />
          <div>
            <h1 className="text-sm font-semibold text-white tracking-wide leading-none">{project.name}</h1>
            <p className="text-[10px] text-textMuted uppercase tracking-wider font-medium leading-none mt-1">{project.roomType} • Draft</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <Button variant="ghost" className="h-7 text-[10px] flex items-center gap-1.5 px-3">
              <Share2 size={12} />
              Share
           </Button>
           <Button variant="primary" className="h-7 px-3 text-[10px] flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white border-0">
              <Save size={12} />
              Save
           </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* LEFT SIDEBAR */}
        <aside className={`${leftSidebarWidth} bg-surface border-r border-border flex flex-col z-20 shrink-0 transition-all duration-300 ease-in-out`}>
           {/* Collapse Toggle */}
           <div className={`h-10 flex items-center border-b border-border ${isLeftCollapsed ? 'justify-center' : 'justify-between px-3'}`}>
              {!isLeftCollapsed && <span className="text-[10px] font-bold text-textMuted uppercase tracking-widest">Assets</span>}
              <button 
                onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
                className="p-1 text-textMuted hover:text-white hover:bg-surfaceHighlight rounded transition-colors"
              >
                 {isLeftCollapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
              </button>
           </div>

           {/* Collapsed Rail */}
           {isLeftCollapsed ? (
              <div className="flex-1 flex flex-col items-center gap-4 py-4">
                 <button className="p-2 rounded-lg bg-surfaceHighlight/50 text-indigo-400 border border-indigo-500/20" title="Project Context" onClick={() => setIsLeftCollapsed(false)}>
                    <FolderOpen size={18} />
                 </button>
                 <button className="p-2 rounded-lg text-textMuted hover:text-white hover:bg-surfaceHighlight" title="Renders" onClick={() => setIsLeftCollapsed(false)}>
                    <ImageIcon size={18} />
                 </button>
                 <div className="h-px w-8 bg-border" />
                 <button className="p-2 rounded-lg text-textMuted hover:text-white hover:bg-surfaceHighlight" title="History">
                    <History size={18} />
                 </button>
              </div>
           ) : (
             /* Expanded Content */
             <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
                {/* Context Section */}
                <div className="h-[40%] flex flex-col min-h-[200px] border-b border-border">
                    <div className="p-3 border-b border-border flex items-center justify-between bg-surfaceHighlight/5">
                        <h3 className="text-[10px] font-bold text-textMuted uppercase tracking-wider">Project Context</h3>
                        <button className="text-textMuted hover:text-white hover:bg-white/10 p-1 rounded transition-colors">
                            <Plus size={14} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {contextItems.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg group cursor-pointer transition-colors border border-transparent hover:border-white/5">
                                <div className="w-8 h-8 rounded bg-[#0f0f0f] shrink-0 overflow-hidden border border-white/10 flex items-center justify-center">
                                    {item.img ? (
                                        <img src={item.img} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" alt="Context" />
                                    ) : (
                                        <item.icon size={14} className="text-textMuted" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-medium text-white truncate">{item.title}</h4>
                                    <p className="text-[10px] text-textMuted">{item.time}</p>
                                </div>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium border border-white/5 ${item.color}`}>{item.type}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Saved Renders Section */}
                <div className="flex-1 flex flex-col bg-surface">
                    <div className="p-3 border-b border-border flex items-center justify-between bg-surfaceHighlight/5">
                        <h3 className="text-[10px] font-bold text-textMuted uppercase tracking-wider">Saved Renders</h3>
                        <button className="text-textMuted hover:text-white hover:bg-white/10 p-1 rounded transition-colors">
                            <Filter size={14} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 grid grid-cols-1 gap-4 content-start">
                        {renders.filter(r => r.status === 'saved').map((render) => (
                            <div 
                              key={render.id} 
                              className={`group cursor-pointer p-1 rounded-lg transition-all ${activeRenderId === render.id ? 'bg-indigo-500/10 ring-1 ring-indigo-500/30' : 'hover:bg-white/5'}`}
                              onClick={() => handleCenterOnRender(render)}
                            >
                                <div className="aspect-[4/3] bg-[#0f0f0f] rounded-lg border border-border overflow-hidden relative mb-2">
                                    <img src={render.imageUrl} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt="Render" />
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1 bg-black/60 text-white rounded hover:bg-black">
                                            <MoreHorizontal size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-start justify-between px-1">
                                    <div>
                                        <h4 className={`text-xs font-medium transition-colors ${activeRenderId === render.id ? 'text-indigo-400' : 'text-textMain group-hover:text-white'}`}>{render.title}</h4>
                                        <p className="text-[10px] text-textMuted mt-0.5">{render.timestamp}</p>
                                    </div>
                                    <span className="text-[9px] px-1.5 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                        SAVED
                                    </span>
                                </div>
                            </div>
                        ))}
                        {renders.filter(r => r.status === 'saved').length === 0 && (
                            <div className="text-center p-8 text-textMuted text-xs italic">
                                No saved renders yet.
                            </div>
                        )}
                    </div>
                </div>
             </div>
           )}
        </aside>

        {/* CENTER VIEWPORT - INFINITE CANVAS */}
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
                transform: `translate(${canvasTransform.x % 24}px, ${canvasTransform.y % 24}px)` // Parallax effect
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
              {renders.map((render) => (
                 <div 
                    key={render.id}
                    className={`render-card absolute transition-all duration-75 group bg-white shadow-2xl rounded-sm overflow-hidden select-none hover:z-30 cursor-move ${render.isActive ? 'z-20 ring-4 ring-indigo-500 ring-offset-4 ring-offset-[#050505]' : 'z-0 grayscale-[0.3] hover:grayscale-0'}`}
                    style={{ 
                      transform: `translate(${render.x}px, ${render.y}px)`,
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
                       {render.isActive && (
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
                       {render.status === 'saved' && (
                          <div className="bg-emerald-100 text-emerald-700 p-1.5 rounded-full">
                             <Check size={12} strokeWidth={3} />
                          </div>
                       )}
                    </div>
                 </div>
              ))}
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

        {/* RIGHT SIDEBAR: Controller */}
        <aside className={`${rightSidebarWidth} bg-surfaceHighlight/5 border-l border-border flex flex-col z-20 shrink-0 transition-all duration-300 ease-in-out`}>
           {/* Header & Tabs */}
           <div className="flex items-center border-b border-border bg-surface shrink-0 h-12">
               {isRightCollapsed ? (
                  <div className="w-full flex justify-center">
                      <button 
                        onClick={() => setIsRightCollapsed(false)}
                        className="p-1 text-textMuted hover:text-white"
                      >
                         <ChevronsLeft size={14} />
                      </button>
                  </div>
               ) : (
                  <>
                      <button 
                        onClick={() => setIsRightCollapsed(true)}
                        className="w-10 flex items-center justify-center text-textMuted hover:text-white border-r border-border h-full"
                      >
                         <ChevronsRight size={14} />
                      </button>
                      <div className="flex-1 flex h-full">
                        {[
                            { id: 'room', label: 'Room', icon: Monitor },
                            { id: 'selection', label: 'Selection', icon: Box },
                            { id: 'boq', label: 'BOQ', icon: DollarSign }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 flex items-center justify-center gap-2 text-[10px] font-medium uppercase tracking-wider transition-colors relative ${activeTab === tab.id ? 'text-indigo-400 bg-surfaceHighlight/30' : 'text-textMuted hover:text-white hover:bg-surfaceHighlight/10'}`}
                            >
                                <tab.icon size={14} />
                                {tab.label}
                                {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
                                )}
                            </button>
                        ))}
                      </div>
                  </>
               )}
           </div>

           {/* Collapsed Rail (Right) */}
           {isRightCollapsed ? (
               <div className="flex-1 flex flex-col items-center gap-4 py-4 bg-surface">
                   <button onClick={() => { setIsRightCollapsed(false); setActiveTab('room'); }} className={`p-2 rounded-lg ${activeTab === 'room' ? 'text-indigo-400 bg-indigo-500/10' : 'text-textMuted hover:text-white'}`} title="Room"><Monitor size={18} /></button>
                   <button onClick={() => { setIsRightCollapsed(false); setActiveTab('selection'); }} className={`p-2 rounded-lg ${activeTab === 'selection' ? 'text-indigo-400 bg-indigo-500/10' : 'text-textMuted hover:text-white'}`} title="Selection"><Box size={18} /></button>
                   <button onClick={() => { setIsRightCollapsed(false); setActiveTab('boq'); }} className={`p-2 rounded-lg ${activeTab === 'boq' ? 'text-indigo-400 bg-indigo-500/10' : 'text-textMuted hover:text-white'}`} title="BOQ"><DollarSign size={18} /></button>
               </div>
           ) : (
               /* Content Area */
               <div className="flex-1 overflow-hidden bg-surfaceHighlight/5 relative flex flex-col animate-in fade-in duration-200">
                    
                    {/* ROOM TAB (Standard Width) */}
                    {activeTab === 'room' && (
                        <div className="flex flex-col h-full">
                            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-border">
                                {/* Camera & Perspective (Moved Here) */}
                                <div className="bg-surface border border-border rounded-lg p-3">
                                   <h3 className="text-[10px] font-bold text-textMuted uppercase tracking-wider mb-3 flex items-center gap-2">
                                      <Camera size={12} /> Camera & Perspective
                                   </h3>
                                   <div className="space-y-4">
                                      {/* Viewpoint */}
                                      <div className="space-y-1.5">
                                          <label className="text-[9px] text-textMuted font-medium">VIEWPOINT</label>
                                          <div className="flex items-center gap-2">
                                            <div className="relative flex-1 group">
                                                <select 
                                                    value={viewpoint}
                                                    onChange={(e) => setViewpoint(e.target.value)}
                                                    className="w-full bg-surfaceHighlight border border-border rounded pl-2 pr-6 py-1.5 text-xs text-white appearance-none focus:outline-none focus:border-indigo-500 cursor-pointer"
                                                >
                                                    {viewpoints.map(vp => <option key={vp} value={vp}>{vp}</option>)}
                                                </select>
                                                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none group-hover:text-white" />
                                            </div>
                                            <button 
                                              onClick={() => setIsCameraModalOpen(true)}
                                              className="p-1.5 rounded bg-surfaceHighlight border border-border text-textMuted hover:text-white hover:border-indigo-500/50 transition-colors"
                                              title="Edit on Map"
                                            >
                                               <Target size={14} />
                                            </button>
                                          </div>
                                      </div>

                                      {/* Lens */}
                                      <div className="space-y-1.5">
                                          <label className="text-[9px] text-textMuted font-medium">LENS WIDTH</label>
                                          <div className="flex bg-surfaceHighlight border border-border rounded p-0.5">
                                              {['0.5x', '1x', '2x'].map(l => (
                                                  <button 
                                                      key={l}
                                                      onClick={() => setLens(l)} 
                                                      className={`flex-1 py-1 rounded-[2px] text-[10px] font-medium transition-all ${lens === l ? 'bg-indigo-600 text-white shadow-sm' : 'text-textMuted hover:text-white'}`}
                                                  >
                                                      {l === '0.5x' ? 'Wide' : l === '1x' ? 'Std' : 'Detail'}
                                                  </button>
                                              ))}
                                          </div>
                                      </div>

                                      {/* Height */}
                                      <div className="space-y-1.5">
                                          <label className="text-[9px] text-textMuted font-medium">HEIGHT</label>
                                          <div className="flex gap-2">
                                              {[
                                                  { id: 'Low', icon: Move, rotate: 180 }, 
                                                  { id: 'Eye-Level', icon: User }, 
                                                  { id: 'Top-Down', icon: Grid3X3 }
                                              ].map((h) => (
                                                  <button 
                                                      key={h.id}
                                                      onClick={() => setAngle(h.id)}
                                                      className={`flex-1 flex flex-col items-center justify-center py-2 rounded border transition-all ${angle === h.id ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' : 'bg-surfaceHighlight border-border text-textMuted hover:border-white/20 hover:text-white'}`}
                                                  >
                                                      <h.icon size={14} className={h.rotate ? 'transform rotate-180' : ''} />
                                                      <span className="text-[9px] mt-1">{h.id}</span>
                                                  </button>
                                              ))}
                                          </div>
                                      </div>
                                   </div>
                                </div>

                                {/* Lighting Scenario */}
                                <div className="space-y-4">
                                <div className="flex items-center gap-2 text-white font-medium mb-1 border-b border-border/50 pb-2">
                                    <Sun size={14} className="text-indigo-400" />
                                    <h2 className="text-xs">Lighting Scenario</h2>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {lightingOptions.map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setLightingScenario(opt.id)}
                                            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all ${lightingScenario === opt.id ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'bg-surface border-border text-textMuted hover:border-white/20 hover:text-white'}`}
                                        >
                                            <opt.icon size={18} className={lightingScenario === opt.id ? 'text-indigo-400' : 'text-current'} />
                                            <span className="text-[10px] font-medium">{opt.id}</span>
                                        </button>
                                    ))}
                                </div>
                                {/* Mood */}
                                <div className="space-y-2">
                                    <label className="text-[10px] text-textMuted uppercase tracking-wider font-semibold">Mood</label>
                                    <div className="flex bg-surface border border-border rounded-lg p-1">
                                        {['Airy', 'Standard', 'Moody'].map((m) => (
                                            <button
                                            key={m}
                                            onClick={() => setMood(m)}
                                            className={`flex-1 py-1.5 text-[10px] font-medium rounded-md transition-all ${mood === m ? 'bg-surfaceHighlight text-white shadow-sm' : 'text-textMuted hover:text-white'}`}
                                            >
                                            {m}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                </div>

                                {/* Style & Prompt */}
                                <div className="space-y-4">
                                <div className="flex items-center gap-2 text-white font-medium mb-1 border-b border-border/50 pb-2">
                                    <Palette size={14} className="text-indigo-400" />
                                    <h2 className="text-xs">Style & Prompt</h2>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-textMuted uppercase tracking-wider font-semibold">Architectural Style</label>
                                    <div className="relative group">
                                        <select 
                                            value={style}
                                            onChange={(e) => setStyle(e.target.value)}
                                            className="w-full bg-surface border border-border rounded-lg pl-3 pr-8 py-2.5 text-xs text-white appearance-none focus:outline-none focus:border-indigo-500 cursor-pointer"
                                        >
                                            {styles.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none group-hover:text-white" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] text-textMuted uppercase tracking-wider font-semibold">Creativity</label>
                                        <span className="text-[10px] text-indigo-400">{creativity < 30 ? 'Strict' : creativity > 70 ? 'Creative' : 'Balanced'}</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="100" 
                                        value={creativity} 
                                        onChange={(e) => setCreativity(parseInt(e.target.value))}
                                        className="w-full h-1.5 bg-surfaceHighlight rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                    />
                                    <div className="flex justify-between text-[8px] text-textMuted px-1">
                                        <span>Strict</span>
                                        <span>Balanced</span>
                                        <span>Creative</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-textMuted uppercase tracking-wider font-semibold flex items-center gap-1">
                                        <Ban size={10} /> Exclude
                                    </label>
                                    <input 
                                        type="text" 
                                        value={excludePrompt}
                                        onChange={(e) => setExcludePrompt(e.target.value)}
                                        placeholder="e.g. No plants, no dark wood..."
                                        className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs text-white placeholder-textMuted/40 focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                                </div>
                            </div>
                            
                            <div className="p-4 border-t border-border bg-surface shrink-0 z-10">
                                <Button 
                                    variant="primary" 
                                    onClick={handleUpdateRender}
                                    disabled={isGenerating || !hasPendingChanges}
                                    className={`w-full py-3 text-xs font-semibold border-none shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                                        isGenerating 
                                        ? 'bg-surfaceHighlight text-textMuted cursor-not-allowed' 
                                        : hasPendingChanges 
                                            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/20 animate-pulse' 
                                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-900/40'
                                    }`}
                                >
                                    {isGenerating ? (
                                        <><Loader2 size={14} className="animate-spin" /> Generating...</>
                                    ) : hasPendingChanges ? (
                                        'Apply Changes'
                                    ) : (
                                        'Render Up to Date'
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* SELECTION TAB (Wide Layout) */}
                    {activeTab === 'selection' && (
                        <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-200">
                             {/* Top: Detected Surfaces Chips */}
                             <div className="p-4 border-b border-border bg-surface shrink-0">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xs font-semibold text-textMuted uppercase tracking-wider flex items-center gap-2">
                                        <Scan size={12} /> Detected Surfaces
                                    </h3>
                                    <span className="text-[9px] bg-surfaceHighlight px-2 py-0.5 rounded text-textMuted">{surfaceItems.length} Found</span>
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                                    {surfaceItems.map((item) => (
                                        <button 
                                            key={item.id}
                                            onClick={() => setSelectedObject(item.id)}
                                            className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${selectedObject === item.id ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500/50' : 'bg-surfaceHighlight/50 border-border text-textMuted hover:border-white/20 hover:text-white'}`}
                                        >
                                            <item.icon size={14} className={selectedObject === item.id ? 'text-indigo-400' : ''} />
                                            <span className="text-xs font-medium whitespace-nowrap">{item.name}</span>
                                        </button>
                                    ))}
                                </div>
                             </div>

                             {/* Bottom: Material Library */}
                             <div className="flex-1 overflow-y-auto p-5">
                                <div className="flex items-center justify-between mb-4">
                                     <h3 className="text-xs font-bold text-white flex items-center gap-2">
                                         <Palette size={14} className="text-indigo-400" />
                                         Material Library
                                         <span className="text-[10px] font-normal text-textMuted ml-1">— {selectedItemData?.name}</span>
                                     </h3>
                                     <button className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
                                         <UploadCloud size={10} /> Upload Custom
                                     </button>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-3">
                                    {materials.map((mat) => (
                                        <div key={mat.id} className="group cursor-pointer relative">
                                            <div 
                                                className="aspect-square rounded-lg shadow-sm border border-white/10 group-hover:border-indigo-500/50 transition-all overflow-hidden relative"
                                                style={{ backgroundColor: mat.color }}
                                            >
                                                {/* Hover Overlay */}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <span className="px-2 py-1 bg-black/80 text-white text-[9px] rounded border border-white/10">Apply</span>
                                                </div>
                                                {mat.premium && (
                                                    <div className="absolute top-1 right-1 bg-amber-400 text-black p-0.5 rounded-full shadow-sm">
                                                        <Crown size={8} fill="currentColor" />
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-textMuted mt-1.5 font-medium truncate group-hover:text-white transition-colors">{mat.name}</p>
                                        </div>
                                    ))}
                                    {/* Add New Placeholder */}
                                    <div className="aspect-square rounded-lg border border-dashed border-border flex flex-col items-center justify-center gap-1 text-textMuted hover:text-white hover:bg-surfaceHighlight/20 hover:border-white/20 transition-all cursor-pointer">
                                        <Plus size={16} />
                                        <span className="text-[9px]">Add</span>
                                    </div>
                                </div>
                             </div>
                        </div>
                    )}

                    {/* BOQ TAB (Wide Layout) */}
                    {activeTab === 'boq' && (
                        <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-200">
                             <div className="p-4 bg-surface border-b border-border shrink-0 flex items-center justify-between">
                                 <div>
                                     <p className="text-[10px] text-textMuted uppercase tracking-wider">Total Estimate</p>
                                     <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">₹ 2,45,000</h2>
                                 </div>
                                 <Button variant="secondary" className="h-8 text-xs flex items-center gap-2">
                                     <Download size={14} /> Export PDF
                                 </Button>
                             </div>

                             <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {boqItems.map((item, idx) => (
                                    <div key={idx} className="bg-surface rounded-xl border border-border p-3 flex gap-4 hover:border-white/10 transition-colors group">
                                        {/* Thumbnail */}
                                        <div className="w-[80px] h-[80px] rounded-lg bg-[#0f0f0f] shrink-0 overflow-hidden border border-white/5 relative">
                                            <img src={item.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.name} />
                                            {item.sponsored && (
                                                <div className="absolute bottom-0 left-0 right-0 bg-indigo-600/90 text-[8px] text-white text-center py-0.5 font-medium backdrop-blur-sm">SPONSORED</div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 flex flex-col justify-between min-w-0">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h4 className="text-sm font-bold text-white truncate pr-2">{item.name}</h4>
                                                    <p className="text-xs font-semibold text-white shrink-0">{item.price}</p>
                                                </div>
                                                <p className="text-xs text-textMuted">{item.brand}</p>
                                            </div>

                                            <div className="flex items-end justify-between mt-2">
                                                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                                                    <DollarSign size={8} />
                                                    Earn {item.commission}
                                                </span>
                                                
                                                <div className="flex gap-2">
                                                    <button className="px-3 py-1.5 text-[10px] font-medium text-textMuted bg-surfaceHighlight hover:bg-white/10 hover:text-white rounded border border-transparent transition-all">Swap</button>
                                                    <button className="px-3 py-1.5 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded shadow-lg shadow-indigo-900/20 transition-all">Buy Now</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
               </div>
           )}
        </aside>

      </div>

      <FloorPlanAnalysisOverlay 
        isOpen={isAnalysisOpen}
        onClose={() => setIsAnalysisOpen(false)}
        onGenerate={() => setIsAnalysisOpen(false)}
      />

      <CameraPositionModal 
         isOpen={isCameraModalOpen} 
         onClose={() => setIsCameraModalOpen(false)}
         onApply={handleCameraApply}
      />
    </div>
  );
};

// Icons needed for this component
const CheckCircle2 = ({ size, className }: { size: number, className?: string }) => (
   <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
);
