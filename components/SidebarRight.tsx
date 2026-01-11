import React, { useState } from 'react';
import { 
  Monitor, Box, DollarSign, ChevronsRight, ChevronsLeft,
  Camera, ChevronDown, Target, Move, User, Grid3X3,
  Sun, Sunset, Moon, Zap, Palette, Ban, Loader2,
  Scan, UploadCloud, Crown, Download, Plus, MousePointer2,
  Layers, Armchair, Table, Sparkles, Filter,
  ArrowUp, ArrowDown, Eye
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

// Mock Data for Material Library
const MOCK_MATERIALS: Record<string, any[]> = {
  floor: [
    { id: 101, name: 'Royal Oak', category: 'Hardwood', texture: 'Matte Finish', img: 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&q=80&w=500', brand: 'Tarkett', sponsored: true },
    { id: 102, name: 'Carrara Marble', category: 'Stone/Tile', texture: 'Polished', img: 'https://images.unsplash.com/photo-1598551460773-8a39832207b5?auto=format&fit=crop&q=80&w=500', brand: null },
    { id: 103, name: 'Herringbone', category: 'Hardwood', texture: 'Satin', img: 'https://images.unsplash.com/photo-1622370701986-7a7024847250?auto=format&fit=crop&q=80&w=500', brand: null },
    { id: 104, name: 'Grey Slate', category: 'Stone/Tile', texture: 'Rough', img: 'https://images.unsplash.com/photo-1521406837071-6c24f6cb7d3a?auto=format&fit=crop&q=80&w=500', brand: 'Daltile', sponsored: true },
    { id: 105, name: 'Berber Wool', category: 'Carpet', texture: 'Soft', img: 'https://images.unsplash.com/photo-1628103630636-69485c2c7b50?auto=format&fit=crop&q=80&w=500', brand: null },
  ],
  wall: [
    { id: 201, name: 'Swiss Coffee', category: 'Paint', texture: 'Eggshell', img: 'https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&q=80&w=500', brand: 'Benjamin Moore', sponsored: true },
    { id: 202, name: 'Venetian Plaster', category: 'Plaster', texture: 'Smooth', img: 'https://images.unsplash.com/photo-1562916890-7d3550d53c7a?auto=format&fit=crop&q=80&w=500', brand: null },
    { id: 203, name: 'Exposed Brick', category: 'Masonry', texture: 'Raw', img: 'https://images.unsplash.com/photo-1592346765798-8f8379207865?auto=format&fit=crop&q=80&w=500', brand: null },
    { id: 204, name: 'Midnight Blue', category: 'Paint', texture: 'Matte', img: 'https://images.unsplash.com/photo-1572911993237-77443f550547?auto=format&fit=crop&q=80&w=500', brand: 'Farrow & Ball', sponsored: true },
  ],
  default: [
    { id: 901, name: 'Grey Fabric', category: 'Fabric', texture: 'Woven', img: 'https://images.unsplash.com/photo-1552554867-68b3e8c15694?auto=format&fit=crop&q=80&w=500', brand: null },
    { id: 902, name: 'Tan Leather', category: 'Leather', texture: 'Grain', img: 'https://images.unsplash.com/photo-1550254478-ead40cc54513?auto=format&fit=crop&q=80&w=500', brand: 'West Elm', sponsored: true },
    { id: 903, name: 'Velvet Green', category: 'Fabric', texture: 'Plush', img: 'https://images.unsplash.com/photo-1617103996702-96ff29b1c467?auto=format&fit=crop&q=80&w=500', brand: null },
  ]
};

const CATEGORIES: Record<string, string[]> = {
  floor: ['All', 'Hardwood', 'Stone/Tile', 'Carpet', 'Vinyl'],
  wall: ['All', 'Paint', 'Wallpaper', 'Plaster', 'Masonry'],
  sofa: ['All', 'Fabric', 'Leather', 'Velvet', 'Boucle'],
  table: ['All', 'Wood', 'Glass', 'Metal', 'Stone'],
  default: ['All', 'Standard', 'Premium', 'New']
};

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
  const [activeFilter, setActiveFilter] = useState('All');

  // Static Data for UI
  const viewpoints = ['Hero (Entry)', 'Reverse (Window)', 'Corner Perspective', 'Center Room'];
  const styles = ['Japandi', 'Modern Minimalist', 'Industrial', 'Bohemian', 'Scandinavian', 'Mid-Century'];
  const lightingOptions = [
     { id: 'Daylight', icon: Sun },
     { id: 'Golden Hour', icon: Sunset },
     { id: 'Evening', icon: Moon },
     { id: 'Studio', icon: Zap },
  ];
  const surfaceItems = [
    { id: 'wall', name: 'Accent Wall', type: 'Surface', icon: Box },
    { id: 'floor', name: 'Flooring', type: 'Surface', icon: Layers },
    { id: 'sofa', name: 'Harmony Sofa', type: 'Object', icon: Armchair },
    { id: 'table', name: 'Coffee Table', type: 'Object', icon: Table }
  ];

  const selectedItemData = surfaceItems.find(i => i.id === selectedObject);
  const currentMaterials = MOCK_MATERIALS[selectedObject] || MOCK_MATERIALS['default'];
  const currentCategories = CATEGORIES[selectedObject] || CATEGORIES['default'];

  // Filter Logic
  const filteredMaterials = activeFilter === 'All' 
    ? currentMaterials 
    : currentMaterials.filter(m => m.category === activeFilter);

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
              {/* ROOM TAB (Pro-Minimal Redesign) */}
              {activeTab === 'room' && (
                <div className="flex flex-col h-full relative">
                  <div className="flex-1 overflow-y-auto p-5 pb-24 space-y-8 scrollbar-thin scrollbar-thumb-border">
                    
                    {/* Camera & Perspective */}
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                         <Camera size={14} className="text-indigo-400" />
                         <h3 className="text-[11px] font-bold tracking-widest text-textMuted uppercase">Camera & Perspective</h3>
                      </div>

                      <div className="space-y-4">
                        {/* Viewpoint Input */}
                        <div className="relative group">
                          <select 
                            value={roomSettings.viewpoint}
                            onChange={(e) => onUpdateSettings({ viewpoint: e.target.value })}
                            className="w-full bg-white/5 border border-transparent rounded-lg pl-3 pr-10 py-2.5 text-xs text-white appearance-none focus:outline-none focus:bg-white/10 transition-colors cursor-pointer"
                          >
                            {viewpoints.map(vp => <option key={vp} value={vp} className="bg-surface">{vp}</option>)}
                          </select>
                          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                             <button onClick={(e) => { e.stopPropagation(); onOpenMap(); }} className="p-1.5 text-textMuted hover:text-white rounded-md hover:bg-white/10 pointer-events-auto" title="Edit on Map">
                                <Target size={14} />
                             </button>
                          </div>
                        </div>

                        {/* Combined Camera Specs */}
                        <div className="space-y-2">
                           <label className="text-[10px] text-textMuted font-medium uppercase">Camera Specs</label>
                           <div className="flex items-center bg-white/5 rounded-lg p-1 gap-1">
                              {/* Lens Control */}
                              <div className="flex-1 flex gap-0.5">
                                 {['0.5x', '1x', '2x'].map((l) => {
                                    const label = l === '0.5x' ? '16mm' : l === '1x' ? '35mm' : '85mm';
                                    return (
                                       <button 
                                         key={l}
                                         onClick={() => onUpdateSettings({ lens: l })} 
                                         className={`flex-1 py-1.5 rounded-md text-[10px] font-medium transition-all ${roomSettings.lens === l ? 'bg-indigo-600 text-white shadow-sm' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
                                       >
                                         {label}
                                       </button>
                                    )
                                 })}
                              </div>
                              <div className="w-px h-4 bg-white/10 mx-1" />
                              {/* Height Control */}
                              <div className="flex gap-0.5">
                                 {[
                                    { id: 'Low', icon: ArrowUp, label: 'Low' }, 
                                    { id: 'Eye-Level', icon: Eye, label: 'Eye' }, 
                                    { id: 'Top-Down', icon: ArrowDown, label: 'High' }
                                 ].map((h) => (
                                    <button 
                                      key={h.id}
                                      onClick={() => onUpdateSettings({ angle: h.id })}
                                      className={`p-1.5 px-2 rounded-md transition-all ${roomSettings.angle === h.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
                                      title={h.id}
                                    >
                                       <h.icon size={14} />
                                    </button>
                                 ))}
                              </div>
                           </div>
                        </div>
                      </div>
                    </section>

                    {/* Lighting Scenario */}
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                         <Sun size={14} className="text-indigo-400" />
                         <h3 className="text-[11px] font-bold tracking-widest text-textMuted uppercase">Lighting Scenario</h3>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
                         {lightingOptions.map((opt) => (
                            <button
                               key={opt.id}
                               onClick={() => onUpdateSettings({ lightingScenario: opt.id })}
                               className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border border-transparent ${
                                  roomSettings.lightingScenario === opt.id 
                                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                                  : 'bg-white/5 text-textMuted hover:text-white hover:bg-white/10'
                               }`}
                            >
                               <opt.icon size={12} />
                               {opt.id}
                            </button>
                         ))}
                      </div>
                    </section>

                    {/* Style & Prompt */}
                    <section>
                       <div className="flex items-center gap-2 mb-4">
                         <Palette size={14} className="text-indigo-400" />
                         <h3 className="text-[11px] font-bold tracking-widest text-textMuted uppercase">Style & Prompt</h3>
                      </div>
                      
                      <div className="space-y-6">
                         {/* Style Dropdown */}
                         <div className="relative group">
                            <select 
                               value={roomSettings.style}
                               onChange={(e) => onUpdateSettings({ style: e.target.value })}
                               className="w-full bg-white/5 border border-transparent rounded-lg pl-3 pr-10 py-2.5 text-xs text-white appearance-none focus:outline-none focus:bg-white/10 transition-colors cursor-pointer"
                            >
                               {styles.map(s => <option key={s} value={s} className="bg-surface">{s}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none" />
                         </div>

                         {/* Creativity Slider */}
                         <div className="space-y-3">
                            <div className="flex justify-between items-center text-[10px]">
                               <label className="text-textMuted font-medium uppercase">Creativity</label>
                               <span className="text-indigo-400 font-mono">{roomSettings.creativity}%</span>
                            </div>
                            <input 
                               type="range" 
                               min="0" 
                               max="100" 
                               value={roomSettings.creativity} 
                               onChange={(e) => onUpdateSettings({ creativity: parseInt(e.target.value) })}
                               className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
                            />
                         </div>

                         {/* Exclude Input */}
                         <div className="space-y-2">
                            <label className="text-[10px] text-textMuted font-medium uppercase flex items-center gap-1">
                               <Ban size={10} /> Negative Prompt
                            </label>
                            <input 
                               type="text" 
                               value={roomSettings.excludePrompt}
                               onChange={(e) => onUpdateSettings({ excludePrompt: e.target.value })}
                               placeholder="e.g. blur, watermark, low quality..."
                               className="w-full bg-white/5 border border-transparent rounded-lg px-3 py-2 text-xs text-white placeholder-textMuted/30 focus:outline-none focus:bg-white/10 transition-colors"
                            />
                         </div>
                      </div>
                    </section>

                  </div>
                  
                  {/* Floating Footer Button */}
                  <div className="absolute bottom-6 left-6 right-6 z-20">
                     <div className="absolute inset-0 bg-surface/50 backdrop-blur-md rounded-xl -z-10 blur-xl opacity-0"></div>
                     <Button 
                        variant="primary" 
                        onClick={onUpdateRender}
                        disabled={isGenerating}
                        className={`w-full py-3 text-xs font-bold uppercase tracking-wide border-none shadow-2xl backdrop-blur-md transition-all duration-300 flex items-center justify-center gap-2 rounded-xl ${
                           isGenerating 
                           ? 'bg-white/5 text-textMuted cursor-not-allowed' 
                           : hasPendingChanges 
                              ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-500/30' 
                              : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                     >
                        {isGenerating ? (
                           <><Loader2 size={14} className="animate-spin" /> Generating...</>
                        ) : (
                           <><Sparkles size={14} /> {hasPendingChanges ? 'Update View' : '✨ Update View'}</>
                        )}
                     </Button>
                  </div>
                </div>
              )}

              {/* SELECTION TAB (High-End Material Library Redesign) */}
              {activeTab === 'selection' && (
                <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-200">
                  
                  {/* Top: Horizontal Surface Selector */}
                  <div className="p-4 pb-2 border-b border-border bg-surface shrink-0">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-semibold text-textMuted uppercase tracking-wider flex items-center gap-2">
                        <Scan size={12} /> Surfaces & Objects
                      </h3>
                      <span className="text-[9px] text-textMuted">{surfaceItems.length} Detected</span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {surfaceItems.map((item) => {
                        const isSelected = selectedObject === item.id;
                        return (
                          <button 
                            key={item.id}
                            onClick={() => { setSelectedObject(item.id); setActiveFilter('All'); }}
                            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 ${
                              isSelected 
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/40' 
                                : 'bg-surfaceHighlight border-border text-textMuted hover:border-white/20 hover:text-white'
                            }`}
                          >
                            <item.icon size={14} className={isSelected ? 'text-white' : ''} />
                            <span className="text-xs font-medium whitespace-nowrap">{item.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Middle: Category Filters */}
                  <div className="px-4 py-3 bg-surfaceHighlight/10 border-b border-border flex items-center gap-2 overflow-x-auto scrollbar-hide shrink-0">
                    <Filter size={12} className="text-textMuted shrink-0" />
                    <div className="h-4 w-px bg-border shrink-0" />
                    {currentCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveFilter(cat)}
                        className={`text-[10px] font-medium px-3 py-1 rounded-full border transition-all whitespace-nowrap ${
                          activeFilter === cat
                          ? 'bg-white text-black border-white'
                          : 'bg-transparent text-textMuted border-transparent hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Main: Material Grid */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold text-white flex items-center gap-2">
                        <Sparkles size={14} className="text-amber-400" />
                        Premium Library
                      </h3>
                      <span className="text-[9px] text-textMuted uppercase tracking-wider">{filteredMaterials.length} Materials</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pb-8">
                      {/* 1. Upload Custom Card */}
                      <button className="aspect-[3/2] rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-textMuted hover:text-white hover:bg-surfaceHighlight/20 hover:border-white/20 transition-all group">
                         <div className="p-2 bg-surfaceHighlight rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <Plus size={18} />
                         </div>
                         <span className="text-[10px] font-medium">Upload Texture</span>
                      </button>

                      {/* Material Cards */}
                      {filteredMaterials.map((mat) => (
                        <div key={mat.id} className={`group cursor-pointer relative rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-lg ${mat.sponsored ? 'ring-1 ring-amber-500/30' : 'ring-1 ring-white/10'}`}>
                          
                          {/* Image */}
                          <div className="aspect-[3/2] w-full relative">
                            <img 
                              src={mat.img} 
                              alt={mat.name} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                            
                            {/* Brand Badge */}
                            {mat.brand && (
                               <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider backdrop-blur-md border shadow-sm ${
                                  mat.sponsored 
                                  ? 'bg-amber-500/90 text-black border-amber-400' 
                                  : 'bg-black/50 text-white border-white/20'
                               }`}>
                                  {mat.sponsored ? 'Sponsored' : mat.brand}
                               </div>
                            )}

                            {/* Active/Applied Indicator overlay on hover */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                               <button className="bg-white text-black text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                  Apply
                               </button>
                            </div>
                          </div>

                          {/* Footer Info */}
                          <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                             <div className="flex justify-between items-end">
                                <div>
                                   <p className="text-xs font-bold text-white leading-tight group-hover:text-indigo-300 transition-colors">{mat.name}</p>
                                   <p className="text-[9px] text-gray-400 mt-0.5">{mat.texture}</p>
                                </div>
                                {mat.sponsored && (
                                   <Crown size={10} className="text-amber-400 mb-0.5" fill="currentColor" />
                                )}
                             </div>
                          </div>

                        </div>
                      ))}
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