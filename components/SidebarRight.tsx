import React from 'react';
import { 
  Monitor, Box, DollarSign, ChevronsRight, ChevronsLeft,
  Camera, ChevronDown, Target, Move, User, Grid3X3,
  Sun, Sunset, Moon, Zap, Palette, Ban, Loader2,
  Scan, UploadCloud, Crown, Download, Plus, MousePointer2
} from 'lucide-react';
import { Button } from './Button';
import { RenderNode, RoomSettings, BOQItem } from '../types';

interface SidebarRightProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeTab: 'room' | 'selection' | 'boq';
  setActiveTab: (tab: 'room' | 'selection' | 'boq') => void;
  
  // Data Props
  selectedRender: RenderNode | null;
  roomSettings: RoomSettings;
  boqItems: BOQItem[];
  
  // Settings Handlers
  onUpdateSettings: (updates: Partial<RoomSettings>) => void;
  
  isGenerating: boolean;
  hasPendingChanges: boolean;
  onUpdateRender: () => void;
  onOpenMap: () => void;

  // Selection Tab State
  selectedObject: string;
  setSelectedObject: (v: string) => void;
}

export const SidebarRight: React.FC<SidebarRightProps> = ({
  isCollapsed,
  onToggle,
  activeTab,
  setActiveTab,
  selectedRender,
  roomSettings,
  boqItems,
  onUpdateSettings,
  isGenerating,
  hasPendingChanges,
  onUpdateRender,
  onOpenMap,
  selectedObject,
  setSelectedObject
}) => {
  // Static Data
  const viewpoints = ['Hero (Entry)', 'Reverse (Window)', 'Corner Perspective', 'Center Room'];
  const styles = ['Japandi', 'Modern Minimalist', 'Industrial', 'Bohemian', 'Scandinavian', 'Mid-Century'];
  const lightingOptions = [
     { id: 'Daylight', icon: Sun },
     { id: 'Golden Hour', icon: Sunset },
     { id: 'Evening', icon: Moon },
     { id: 'Studio', icon: Zap },
  ];
  const surfaceItems = [
    { id: 'wall', name: 'Accent Wall', current: 'Off-White Matte', type: 'Surface', icon: Box },
    { id: 'floor', name: 'Flooring', current: 'Light Oak Parquet', type: 'Surface', icon: Layers },
    { id: 'sofa', name: 'Harmony Sofa', current: 'Grey Fabric', type: 'Object', icon: SofaIcon },
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
  const rightSidebarWidth = isCollapsed 
    ? 'w-[60px]' 
    : (activeTab === 'room' ? 'w-80' : 'w-[480px]');

  // Total BOQ calculation
  const totalBOQ = boqItems.reduce((acc, item) => {
    const price = parseInt(item.price.replace(/[^\d]/g, ''));
    return acc + price;
  }, 0);
  const formattedTotal = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalBOQ);

  return (
    <aside className={`${rightSidebarWidth} bg-surfaceHighlight/5 border-l border-border flex flex-col z-20 shrink-0 transition-all duration-300 ease-in-out`}>
      {/* Header & Tabs */}
      <div className="flex items-center border-b border-border bg-surface shrink-0 h-12">
        {isCollapsed ? (
          <div className="w-full flex justify-center">
            <button 
              onClick={onToggle}
              className="p-1 text-textMuted hover:text-white"
            >
              <ChevronsLeft size={14} />
            </button>
          </div>
        ) : (
          <>
            <button 
              onClick={onToggle}
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
      {isCollapsed ? (
        <div className="flex-1 flex flex-col items-center gap-4 py-4 bg-surface">
          <button onClick={() => { onToggle(); setActiveTab('room'); }} className={`p-2 rounded-lg ${activeTab === 'room' ? 'text-indigo-400 bg-indigo-500/10' : 'text-textMuted hover:text-white'}`} title="Room"><Monitor size={18} /></button>
          <button onClick={() => { onToggle(); setActiveTab('selection'); }} className={`p-2 rounded-lg ${activeTab === 'selection' ? 'text-indigo-400 bg-indigo-500/10' : 'text-textMuted hover:text-white'}`} title="Selection"><Box size={18} /></button>
          <button onClick={() => { onToggle(); setActiveTab('boq'); }} className={`p-2 rounded-lg ${activeTab === 'boq' ? 'text-indigo-400 bg-indigo-500/10' : 'text-textMuted hover:text-white'}`} title="BOQ"><DollarSign size={18} /></button>
        </div>
      ) : (
        /* Content Area */
        <div className="flex-1 overflow-hidden bg-surfaceHighlight/5 relative flex flex-col animate-in fade-in duration-200">
          
          {/* EMPTY STATE - If no render is selected */}
          {!selectedRender ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-textMuted animate-in fade-in duration-300">
               <div className="w-16 h-16 rounded-2xl bg-surfaceHighlight/50 border border-border flex items-center justify-center mb-4 text-white/20">
                  <MousePointer2 size={32} />
               </div>
               <h3 className="text-sm font-medium text-white mb-1">No Image Selected</h3>
               <p className="text-xs max-w-[200px] leading-relaxed">
                 Select a render from the canvas to view details, adjust settings, or manage items.
               </p>
            </div>
          ) : (
            <>
              {/* ROOM TAB (Standard Width) */}
              {activeTab === 'room' && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-border">
                    {/* Camera & Perspective */}
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
                                value={roomSettings.viewpoint}
                                onChange={(e) => onUpdateSettings({ viewpoint: e.target.value })}
                                className="w-full bg-surfaceHighlight border border-border rounded pl-2 pr-6 py-1.5 text-xs text-white appearance-none focus:outline-none focus:border-indigo-500 cursor-pointer"
                              >
                                {viewpoints.map(vp => <option key={vp} value={vp}>{vp}</option>)}
                              </select>
                              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none group-hover:text-white" />
                            </div>
                            <button 
                              onClick={onOpenMap}
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
                                onClick={() => onUpdateSettings({ lens: l })} 
                                className={`flex-1 py-1 rounded-[2px] text-[10px] font-medium transition-all ${roomSettings.lens === l ? 'bg-indigo-600 text-white shadow-sm' : 'text-textMuted hover:text-white'}`}
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
                                onClick={() => onUpdateSettings({ angle: h.id })}
                                className={`flex-1 flex flex-col items-center justify-center py-2 rounded border transition-all ${roomSettings.angle === h.id ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' : 'bg-surfaceHighlight border-border text-textMuted hover:border-white/20 hover:text-white'}`}
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
                            onClick={() => onUpdateSettings({ lightingScenario: opt.id })}
                            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all ${roomSettings.lightingScenario === opt.id ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'bg-surface border-border text-textMuted hover:border-white/20 hover:text-white'}`}
                          >
                            <opt.icon size={18} className={roomSettings.lightingScenario === opt.id ? 'text-indigo-400' : 'text-current'} />
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
                              onClick={() => onUpdateSettings({ mood: m })}
                              className={`flex-1 py-1.5 text-[10px] font-medium rounded-md transition-all ${roomSettings.mood === m ? 'bg-surfaceHighlight text-white shadow-sm' : 'text-textMuted hover:text-white'}`}
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
                            value={roomSettings.style}
                            onChange={(e) => onUpdateSettings({ style: e.target.value })}
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
                          <span className="text-[10px] text-indigo-400">{roomSettings.creativity < 30 ? 'Strict' : roomSettings.creativity > 70 ? 'Creative' : 'Balanced'}</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={roomSettings.creativity} 
                          onChange={(e) => onUpdateSettings({ creativity: parseInt(e.target.value) })}
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
                          value={roomSettings.excludePrompt}
                          onChange={(e) => onUpdateSettings({ excludePrompt: e.target.value })}
                          placeholder="e.g. No plants, no dark wood..."
                          className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs text-white placeholder-textMuted/40 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border-t border-border bg-surface shrink-0 z-10">
                    <Button 
                      variant="primary" 
                      onClick={onUpdateRender}
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
                      <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">{formattedTotal}</h2>
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
            </>
          )}
        </div>
      )}
    </aside>
  );
};

// Icons needed due to extraction
const Layers = ({ size, className }: { size: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>
);
const SofaIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"/><path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0Z"/><path d="M4 18v2"/><path d="M20 18v2"/><path d="M12 4v9"/></svg>
);
