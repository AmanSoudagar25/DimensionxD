import React, { useState } from 'react';
import { 
  Monitor, Box, DollarSign, ChevronsRight, ChevronsLeft,
  Camera, ChevronDown, Target, Move, User, Grid3X3,
  Sun, Sunset, Moon, Zap, Palette, Ban, Loader2,
  Scan, UploadCloud, Crown, Download, Plus, MousePointer2,
  Layers, Armchair, Table, Sparkles, Filter,
  ArrowUp, ArrowDown, Eye, Pipette, ChevronUp,
  Link as LinkIcon, ExternalLink, ShoppingBag, Search,
  Image as ImageIcon, Lamp
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
    { id: 101, name: 'Royal Oak', category: 'Wood', texture: 'Matte Finish', img: 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&q=80&w=500', brand: 'Tarkett', sponsored: true },
    { id: 102, name: 'Carrara Marble', category: 'Stone', texture: 'Polished', img: 'https://images.unsplash.com/photo-1598551460773-8a39832207b5?auto=format&fit=crop&q=80&w=500', brand: null },
    { id: 103, name: 'Herringbone', category: 'Wood', texture: 'Satin', img: 'https://images.unsplash.com/photo-1622370701986-7a7024847250?auto=format&fit=crop&q=80&w=500', brand: null },
    { id: 104, name: 'Grey Slate', category: 'Stone', texture: 'Rough', img: 'https://images.unsplash.com/photo-1521406837071-6c24f6cb7d3a?auto=format&fit=crop&q=80&w=500', brand: 'Daltile', sponsored: true },
  ],
  wall: [
    { id: 201, name: 'Art Deco Pattern', category: 'Wallpaper', texture: 'Paper', img: 'https://images.unsplash.com/photo-1615800098779-1be8287d6b34?auto=format&fit=crop&q=80&w=500', brand: null },
    { id: 202, name: 'Venetian Plaster', category: 'Plaster', texture: 'Smooth', img: 'https://images.unsplash.com/photo-1562916890-7d3550d53c7a?auto=format&fit=crop&q=80&w=500', brand: null },
    { id: 203, name: 'Exposed Brick', category: 'Masonry', texture: 'Raw', img: 'https://images.unsplash.com/photo-1592346765798-8f8379207865?auto=format&fit=crop&q=80&w=500', brand: null },
  ],
  sofa: [
    { id: 901, name: 'Grey Fabric', category: 'Fabric', texture: 'Woven', img: 'https://images.unsplash.com/photo-1552554867-68b3e8c15694?auto=format&fit=crop&q=80&w=500', brand: null },
    { id: 902, name: 'Tan Leather', category: 'Leather', texture: 'Grain', img: 'https://images.unsplash.com/photo-1550254478-ead40cc54513?auto=format&fit=crop&q=80&w=500', brand: 'West Elm', sponsored: true },
  ]
};

// SECTION 1: ARCHITECTURAL SHELL
const SURFACE_ELEMENTS = [
  { id: 'floor', name: 'Flooring', category: 'floor', icon: Layers },
  { id: 'wall', name: 'Walls', category: 'wall', icon: Box },
  { id: 'ceiling', name: 'Ceiling', category: 'ceiling', icon: ArrowUp },
];

// SECTION 2: FURNISHING
const PRODUCT_ELEMENTS = [
  { id: 'sofa', name: 'Main Seating', category: 'sofa', icon: Armchair },
  { id: 'table', name: 'Tables', category: 'table', icon: Table },
  { id: 'lighting', name: 'Lighting', category: 'lighting', icon: Zap },
  { id: 'decor', name: 'Decor', category: 'decor', icon: Sparkles },
];

// Sub-categories for Catalog Tab
const CATALOG_FILTERS: Record<string, string[]> = {
  floor: ['All', 'Wood', 'Stone', 'Carpet', 'Tile'],
  wall: ['All', 'Wallpaper', 'Plaster', 'Masonry', 'Paneling'],
  ceiling: ['All', 'Paint', 'Wood', 'Plaster'],
  sofa: ['All', 'Fabric', 'Leather', 'Velvet'],
  table: ['All', 'Wood', 'Glass', 'Metal', 'Stone'],
  lighting: ['All', 'Pendant', 'Floor', 'Sconce'],
  decor: ['All', 'Vases', 'Rugs', 'Art']
};

const viewpoints = [
  'Hero (Entry)',
  'Center Room',
  'Window Side',
  'Corner View',
  'Top-Down',
  'Custom'
];

const lightingOptions = [
  { id: 'Daylight', icon: Sun },
  { id: 'Golden Hour', icon: Sunset },
  { id: 'Evening', icon: Moon },
  { id: 'Studio', icon: Zap }
];

const styles = [
  'Japandi',
  'Modern Minimalist',
  'Industrial',
  'Bohemian',
  'Scandinavian',
  'Luxury',
  'Mid-Century Modern'
];

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
  const [hexInput, setHexInput] = useState('#F5F5F5');
  
  // Selection Tab State
  const [expandedElement, setExpandedElement] = useState<string | null>('floor');
  const [activeElementTab, setActiveElementTab] = useState<'catalog' | 'color' | 'custom'>('catalog');
  const [activeCatalogFilter, setActiveCatalogFilter] = useState('All');
  
  // Custom Tab State
  const [urlInput, setUrlInput] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [fetchedProduct, setFetchedProduct] = useState<any | null>(null);

  // Helper to handle link fetch simulation
  const handleUrlFetch = () => {
    if (!urlInput) return;
    setIsFetchingUrl(true);
    setTimeout(() => {
      setFetchedProduct({
        title: "Poly & Bark Napa Right Sectional Sofa",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=300",
        price: "$1,299",
        site: "amazon.com"
      });
      setIsFetchingUrl(false);
    }, 1500);
  };

  const rightSidebarWidth = isCollapsed 
    ? 'w-[60px]' 
    : (activeTab === 'room' ? 'w-80' : 'w-[480px]');

  // Total BOQ calculation
  const totalBOQ = boqItems.reduce((acc, item) => {
    const price = parseInt(item.price.replace(/[^\d]/g, ''));
    return acc + price;
  }, 0);
  const formattedTotal = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalBOQ);

  const renderAccordionItem = (element: any, isProduct: boolean) => {
    const isExpanded = expandedElement === element.id;
    const currentFilters = CATALOG_FILTERS[element.category] || CATALOG_FILTERS['sofa'];
    
    // Fallback logic for mock materials
    const currentMats = activeCatalogFilter === 'All' 
        ? (MOCK_MATERIALS[element.category] || MOCK_MATERIALS['sofa'])
        : (MOCK_MATERIALS[element.category] || MOCK_MATERIALS['sofa']).filter(m => m.category === activeCatalogFilter);

    // Determine available tabs
    const showColorTab = element.category === 'wall';
    const tabs = [
        { id: 'catalog', label: isProduct ? 'Catalog' : (element.category === 'wall' ? 'Wallpapers' : 'Catalog'), icon: Grid3X3 },
        ...(showColorTab ? [{ id: 'color', label: 'Paint', icon: Palette }] : []),
        { id: 'custom', label: 'Custom', icon: Sparkles }
    ];

    return (
       <div key={element.id} className={`border-b border-border transition-colors ${isExpanded ? 'bg-surfaceHighlight/5' : ''}`}>
          {/* Accordion Trigger */}
          <button 
             onClick={() => {
                setExpandedElement(isExpanded ? null : element.id);
                setActiveElementTab('catalog'); // Reset tab on open
                setActiveCatalogFilter('All');
             }}
             className={`w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors ${isExpanded ? 'bg-white/5' : ''}`}
          >
             <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg border ${isExpanded ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-surfaceHighlight border-white/5 text-textMuted'}`}>
                   <element.icon size={16} />
                </div>
                <div className="text-left">
                   <p className={`text-sm font-medium ${isExpanded ? 'text-white' : 'text-textMain'}`}>{element.name}</p>
                   {/* <p className="text-[10px] text-textMuted">{isProduct ? 'Product' : 'Surface'}</p> */}
                </div>
             </div>
             {isExpanded ? <ChevronUp size={14} className="text-textMuted" /> : <ChevronDown size={14} className="text-textMuted" />}
          </button>

          {/* Expanded Panel */}
          {isExpanded && (
             <div className="px-4 pb-6 pt-2 animate-in slide-in-from-top-2 duration-200">
                
                {/* Tabs */}
                <div className="flex p-1 bg-[#0a0a0a] rounded-lg mb-4 border border-white/5">
                   {tabs.map((tab) => (
                      <button
                         key={tab.id}
                         onClick={() => setActiveElementTab(tab.id as any)}
                         className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${activeElementTab === tab.id ? 'bg-surfaceHighlight text-white shadow-sm' : 'text-textMuted hover:text-white'}`}
                      >
                         <tab.icon size={12} />
                         {tab.label}
                      </button>
                   ))}
                </div>

                {/* PANEL CONTENT: CATALOG */}
                {activeElementTab === 'catalog' && (
                   <div className="space-y-4">
                      {/* Filters */}
                      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                         {currentFilters.map((cat) => (
                            <button
                               key={cat}
                               onClick={() => setActiveCatalogFilter(cat)}
                               className={`text-[10px] font-medium px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${
                                  activeCatalogFilter === cat
                                  ? 'bg-white/10 text-white border-white/20'
                                  : 'bg-transparent text-gray-500 border-transparent hover:text-gray-300'
                               }`}
                            >
                               {cat}
                            </button>
                         ))}
                      </div>
                      
                      {/* Grid */}
                      <div className="grid grid-cols-2 gap-3">
                         {currentMats.map((mat) => (
                            <div key={mat.id} className="group cursor-pointer relative rounded-lg overflow-hidden border border-white/5 hover:border-white/20 transition-all bg-[#0a0a0a]">
                               <div className="aspect-[3/2] relative">
                                  <img src={mat.img} alt={mat.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                  {mat.sponsored && (
                                     <div className="absolute top-2 right-2 text-[9px] tracking-widest text-white/70 font-medium drop-shadow-md">
                                        SPONSORED
                                     </div>
                                  )}
                               </div>
                               <div className="p-3">
                                  <p className="text-sm font-medium text-white truncate">{mat.name}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">{mat.texture}</p>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                )}

                {/* PANEL CONTENT: COLOR (Only for Walls) */}
                {activeElementTab === 'color' && showColorTab && (
                   <div className="space-y-4 animate-in fade-in">
                      <div className="bg-[#0a0a0a] rounded-lg p-3 border border-white/5">
                         <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            Hex Code
                         </label>
                         <div className="flex gap-3">
                            <div className="w-10 h-10 rounded border border-white/10 relative overflow-hidden">
                               <input type="color" value={hexInput} onChange={(e) => setHexInput(e.target.value)} className="absolute inset-0 w-150% h-150% -top-1/4 -left-1/4 cursor-pointer" />
                            </div>
                            <div className="flex-1">
                               <input 
                                  type="text" 
                                  value={hexInput}
                                  onChange={(e) => setHexInput(e.target.value)}
                                  className="w-full h-10 bg-surfaceHighlight/50 border border-white/10 rounded px-3 text-xs font-mono text-white focus:outline-none focus:border-indigo-500 uppercase"
                               />
                            </div>
                         </div>
                      </div>
                      
                      {/* Preset Colors */}
                      <div>
                         <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Trending Palettes</label>
                         <div className="grid grid-cols-5 gap-2">
                            {['#F5F5F5', '#E0D0C0', '#B0B0B0', '#8DA399', '#5D4037', '#1F2937', '#7F1D1D', '#D4A373', '#9CA3AF', '#F3F4F6'].map(color => (
                               <button 
                                  key={color} 
                                  onClick={() => setHexInput(color)}
                                  className="aspect-square rounded-full border border-white/10 hover:scale-110 transition-transform shadow-sm"
                                  style={{ backgroundColor: color }}
                               />
                            ))}
                         </div>
                      </div>
                   </div>
                )}

                {/* PANEL CONTENT: CUSTOM (Power Tool) */}
                {activeElementTab === 'custom' && (
                   <div className="space-y-5 animate-in fade-in">
                      
                      {/* Input 1: Prompt */}
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">AI Description</label>
                         <textarea 
                            className="w-full h-24 bg-[#0f0f0f] border border-white/5 rounded-lg p-3 text-xs font-mono text-gray-300 placeholder-white/20 focus:outline-none focus:border-indigo-500/50 resize-none transition-colors"
                            placeholder={`// Describe material properties...\ntexture: "rough",\nfinish: "matte"`}
                         />
                      </div>

                      {/* Input 2: Upload */}
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Reference Image</label>
                         <div className="border border-dashed border-gray-700 rounded-lg p-4 bg-[#0f0f0f] hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center gap-3 group">
                            <ImageIcon size={14} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                            <span className="text-[10px] text-gray-500 group-hover:text-gray-400 transition-colors">Upload Reference</span>
                         </div>
                      </div>

                      {/* Input 3: URL Import (PRODUCTS ONLY) */}
                      {isProduct && (
                         <div className="space-y-2 animate-in fade-in">
                            <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                               <ShoppingBag size={10} /> E-Commerce Import
                            </label>
                            <div className="flex gap-2">
                               <div className="flex-1 relative">
                                  <LinkIcon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
                                  <input 
                                     type="text"
                                     value={urlInput}
                                     onChange={(e) => setUrlInput(e.target.value)}
                                     placeholder="Paste Amazon/Flipkart Link"
                                     className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-textMuted/40 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
                                  />
                               </div>
                               <Button 
                                  variant="secondary" 
                                  className="h-auto py-2 px-3 text-[10px] uppercase font-bold bg-blue-600/10 text-blue-400 border-blue-600/20 hover:bg-blue-600/20"
                                  onClick={handleUrlFetch}
                                  disabled={isFetchingUrl}
                               >
                                  {isFetchingUrl ? <Loader2 size={12} className="animate-spin" /> : 'Fetch'}
                               </Button>
                            </div>

                            {/* Link Preview Area */}
                            {(fetchedProduct || isFetchingUrl) && (
                               <div className="mt-2 bg-[#0a0a0a] border border-white/10 rounded-lg p-2 flex gap-3 animate-in fade-in">
                                  {isFetchingUrl ? (
                                     <div className="flex items-center justify-center w-full py-4 text-xs text-textMuted gap-2">
                                        <Loader2 size={14} className="animate-spin" /> Parsing Product Data...
                                     </div>
                                  ) : (
                                     <>
                                        <div className="w-12 h-12 rounded bg-white overflow-hidden shrink-0 border border-white/10">
                                           <img src={fetchedProduct.image} alt="Product" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                           <p className="text-[10px] font-bold text-white truncate">{fetchedProduct.title}</p>
                                           <p className="text-[10px] text-emerald-400 font-mono mt-0.5">{fetchedProduct.price}</p>
                                           <div className="flex items-center gap-1 mt-1">
                                              <span className="text-[8px] px-1 py-0.5 bg-white/10 rounded text-textMuted uppercase">{fetchedProduct.site}</span>
                                              <ExternalLink size={8} className="text-textMuted" />
                                           </div>
                                        </div>
                                        <button className="self-center p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded shadow-lg transition-colors" title="Apply this product">
                                           <Plus size={14} />
                                        </button>
                                     </>
                                  )}
                               </div>
                            )}
                         </div>
                      )}

                   </div>
                )}

             </div>
          )}
       </div>
    );
  };

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

              {/* SELECTION TAB (Two Strictly Defined Sections) */}
              {activeTab === 'selection' && (
                <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-200 relative">
                  
                  {/* Content List */}
                  <div className="flex-1 overflow-y-auto p-0 pb-24">
                     
                     {/* Section 1: Architectural Shell */}
                     <div>
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 pt-6 pb-2">Surfaces</h3>
                        {SURFACE_ELEMENTS.map(element => renderAccordionItem(element, false))}
                     </div>

                     {/* Section 2: Furnishing */}
                     <div className="mt-2 border-t border-border">
                         <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 pt-6 pb-2">Products</h3>
                         {PRODUCT_ELEMENTS.map(element => renderAccordionItem(element, true))}
                     </div>

                  </div>

                  {/* Floating Footer */}
                  <div className="absolute bottom-4 left-4 right-4 z-20">
                      <div className="absolute inset-0 bg-black/50 blur-xl rounded-xl -z-10" />
                      <Button 
                          variant="primary" 
                          onClick={onUpdateRender}
                          className="w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest border-none shadow-2xl backdrop-blur-md bg-amber-600 hover:bg-amber-500 text-white flex items-center justify-center gap-2 transition-all hover:translate-y-[-1px]"
                      >
                          <Sparkles size={14} className="text-white/90" /> Update Render
                      </Button>
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