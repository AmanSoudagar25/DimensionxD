import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Button } from './Button';
import { X, ChevronRight, ChevronDown, CheckCircle2, Box, Maximize, Palette, Layout, Sofa, Sun, Sparkles, Upload, Image as ImageIcon, PenLine } from 'lucide-react';

interface FloorPlanAnalysisOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: () => void;
}

interface AnalysisOption {
  label: string;
  color?: string;
  brand?: string;
}

interface AnalysisItem {
  id: string;
  label: string;
  value: string;
  detected: boolean;
  options: AnalysisOption[];
}

interface Section {
  title: string;
  icon: React.ElementType;
  items: AnalysisItem[];
}

interface ItemState {
  mode: 'catalog' | 'custom';
  selectedCatalogOption?: string;
  customText?: string;
  customImage?: string;
}

export const FloorPlanAnalysisOverlay: React.FC<FloorPlanAnalysisOverlayProps> = ({ isOpen, onClose, onGenerate }) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [itemStates, setItemStates] = useState<Record<string, ItemState>>({});
  
  // Refs for file inputs
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  if (!isOpen) return null;

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const getItemState = (id: string): ItemState => {
    return itemStates[id] || { mode: 'catalog' };
  };

  const updateItemState = (id: string, updates: Partial<ItemState>) => {
    setItemStates(prev => ({
      ...prev,
      [id]: { ...(prev[id] || { mode: 'catalog' }), ...updates }
    }));
  };

  const handleSelectCatalogOption = (itemId: string, optionLabel: string) => {
    updateItemState(itemId, { 
      selectedCatalogOption: optionLabel, 
      mode: 'catalog' 
    });
  };

  const handleCustomTextChange = (itemId: string, text: string) => {
    updateItemState(itemId, { 
      customText: text, 
      mode: 'custom' // Switch to custom mode on type
    });
  };

  const handleFileUpload = (itemId: string, file: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateItemState(itemId, { 
          customImage: e.target?.result as string,
          mode: 'custom'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, itemId: string) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      handleFileUpload(itemId, e.dataTransfer.files[0]);
    }
  };

  const sections: Section[] = [
    {
      title: 'Structure',
      icon: Box,
      items: [
        { 
          id: 'ceiling', 
          label: 'Ceiling Height', 
          value: '2.8 meters', 
          detected: true, 
          options: [{label: '2.4m'}, {label: '2.8m'}, {label: '3.0m'}, {label: '3.2m (Vaulted)'}] 
        },
        { 
          id: 'wall_type', 
          label: 'Wall Type', 
          value: 'Brick & Plaster', 
          detected: true, 
          options: [{label: 'Drywall'}, {label: 'Brick', color: '#8d4024'}, {label: 'Concrete', color: '#9ca3af'}, {label: 'Timber', color: '#78350f'}] 
        },
      ]
    },
    {
      title: 'Openings',
      icon: Layout,
      items: [
        { 
          id: 'windows', 
          label: 'Windows', 
          value: '2x Large Casement', 
          detected: true, 
          options: [{label: 'Casement'}, {label: 'Sliding'}, {label: 'Awning'}, {label: 'Fixed'}] 
        },
        { 
          id: 'doors', 
          label: 'Doors', 
          value: '1x Single Flush', 
          detected: true, 
          options: [{label: 'Flush'}, {label: 'Panel', color: '#d4d4d4'}, {label: 'Glass', color: '#e0f2fe'}, {label: 'Barn', color: '#573018'}] 
        },
      ]
    },
    {
      title: 'Finishes',
      icon: Palette,
      items: [
        { 
          id: 'flooring', 
          label: 'Flooring', 
          value: 'Hardwood - Oak', 
          detected: true, 
          options: [
            {label: 'Oak', color: '#C19A6B', brand: 'Tarkett'}, 
            {label: 'Walnut', color: '#5D4037'}, 
            {label: 'Concrete', color: '#9E9E9E'},
            {label: 'Tile', color: '#E0E0E0'}
          ] 
        },
        { 
          id: 'walls', 
          label: 'Wall Color', 
          value: 'Off-White / Eggshell', 
          detected: true, 
          options: [
            {label: 'White', color: '#F5F5F5', brand: 'Dulux'}, 
            {label: 'Beige', color: '#E0D0C0', brand: 'Asian Paints'}, 
            {label: 'Grey', color: '#B0B0B0'},
            {label: 'Sage', color: '#8DA399'}
          ] 
        },
      ]
    },
    {
      title: 'Furniture Anchors',
      icon: Sofa,
      items: [
        { 
          id: 'sofa', 
          label: 'Sofa', 
          value: 'L-Shape Fabric', 
          detected: true, 
          options: [{label: 'L-Shape', color: '#4b5563'}, {label: '3-Seater', color: '#374151'}, {label: 'Chesterfield', color: '#7f1d1d'}, {label: 'Modular', color: '#6b7280'}] 
        },
        { 
          id: 'rug', 
          label: 'Rug', 
          value: 'Jute Rectangle', 
          detected: true, 
          options: [{label: 'Jute', brand: 'IKEA', color: '#d4a373'}, {label: 'Wool', color: '#f3f4f6'}, {label: 'Persian', color: '#9f1239'}, {label: 'Shag', color: '#e5e7eb'}] 
        },
      ]
    },
    {
      title: 'Atmosphere',
      icon: Sun,
      items: [
        { 
          id: 'style', 
          label: 'Style', 
          value: 'Modern Minimalist', 
          detected: true, 
          options: [{label: 'Modern'}, {label: 'Industrial'}, {label: 'Boho'}, {label: 'Scandi'}] 
        },
        { 
          id: 'lighting', 
          label: 'Lighting', 
          value: 'Golden Hour (Warm)', 
          detected: true, 
          options: [{label: 'Warm', color: '#fbbf24'}, {label: 'Cool', color: '#60a5fa'}, {label: 'Daylight', color: '#f3f4f6'}, {label: 'Evening', color: '#4338ca'}] 
        },
      ]
    }
  ];

  const totalItems = sections.reduce((acc, section) => acc + section.items.length, 0);
  
  // Calculate customization stats
  const customizedItems = (Object.values(itemStates) as ItemState[]).filter(
    s => s.mode === 'custom' || (s.mode === 'catalog' && s.selectedCatalogOption)
  );
  const customizationCount = customizedItems.length;
  const autoCount = totalItems - customizationCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

      <div className="relative w-full max-w-6xl h-[85vh] bg-surface border border-border rounded-2xl shadow-2xl flex overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Left Pane - Preview & Context */}
        <div className="w-1/3 border-r border-border bg-[#0a0a0a] flex flex-col relative">
          {/* Floor Plan Visualization */}
          <div className="flex-1 relative overflow-hidden bg-[#050505]">
            <div 
              className="absolute inset-0 opacity-40 bg-cover bg-center mix-blend-luminosity"
              style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1599694537180-a88f760f3316?q=80&w=1000&auto=format&fit=crop")' }} // Placeholder architectural drawing
            />
            {/* Neon Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3/4 aspect-[3/4] border-2 border-indigo-500/70 shadow-[0_0_20px_rgba(99,102,241,0.3)] bg-indigo-500/5 relative rounded-sm backdrop-blur-[1px]">
                  {/* Active Room Outline Effect */}
                  <div className="absolute -top-6 -left-1 flex items-center gap-2 bg-black/80 backdrop-blur px-3 py-1.5 rounded-full border border-indigo-500/30 shadow-lg">
                      <Maximize size={14} className="text-indigo-400" />
                      <span className="text-xs font-medium text-white">4.5m x 6.2m</span>
                  </div>
              </div>
            </div>
            
            <div className="absolute top-6 left-6 right-6">
                <h3 className="text-xl font-semibold text-white">Room Analysis</h3>
                <p className="text-sm text-textMuted mt-1">AI Detection Results</p>
            </div>
          </div>

          {/* Client Context Input */}
          <div className="p-6 border-t border-border bg-surface">
            <label className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-2 block">Client Context / Notes</label>
            <textarea 
              className="w-full h-32 bg-background border border-border rounded-lg p-3 text-sm text-white placeholder-textMuted/50 focus:outline-none focus:border-indigo-500 resize-none transition-colors"
              placeholder="e.g. The client wants a bright, airy feel with natural materials. Keep the existing brick wall exposed."
            />
          </div>
        </div>

        {/* Right Pane - Compact Accordion List */}
        <div className="w-2/3 flex flex-col bg-surface">
           <div className="p-5 border-b border-border flex items-center justify-between bg-surface sticky top-0 z-10">
              <div>
                <h2 className="text-lg font-semibold text-white">Detected Elements</h2>
                <p className="text-sm text-textMuted">Review and customize settings.</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-surfaceHighlight rounded-full text-textMuted hover:text-white transition-colors">
                <X size={20} />
              </button>
           </div>

           <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
              {sections.map((section, idx) => (
                <div key={idx} className="mb-6">
                  <div className="flex items-center gap-2 px-4 py-2 mb-1 sticky top-0 bg-surface/95 backdrop-blur z-10">
                    <section.icon size={16} className="text-indigo-400" />
                    <h4 className="text-xs font-bold text-textMuted uppercase tracking-widest">{section.title}</h4>
                  </div>
                  
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const isExpanded = expandedRow === item.id;
                      const state = getItemState(item.id);
                      
                      const isCustomMode = state.mode === 'custom' && (state.customText || state.customImage);
                      const isCatalogModified = state.mode === 'catalog' && state.selectedCatalogOption;
                      const currentValue = isCustomMode 
                        ? (state.customText ? 'Custom Specification' : 'Custom Image') 
                        : (state.selectedCatalogOption || item.value);

                      return (
                        <div key={item.id} className="mx-2">
                          {/* Row Header */}
                          <div 
                            onClick={() => toggleRow(item.id)}
                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border border-transparent ${isExpanded ? 'bg-surfaceHighlight border-white/5' : 'hover:bg-surfaceHighlight/50 hover:border-white/5'}`}
                          >
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-textMain font-medium">{item.label}</span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <span className={`text-sm ${isCustomMode || isCatalogModified ? 'text-indigo-400 font-medium' : 'text-textMuted'}`}>
                                {isCustomMode ? 'Custom' : currentValue}
                              </span>
                              
                              {/* Badges */}
                              {isCustomMode ? (
                                <span className="text-[10px] px-1.5 py-0.5 rounded border flex items-center gap-1 bg-purple-500/10 text-purple-400 border-purple-500/20 font-medium">
                                  <PenLine size={10} /> Custom
                                </span>
                              ) : (
                                !isCatalogModified && item.detected && (
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded border flex items-center gap-1 transition-opacity ${isExpanded ? 'opacity-50 text-textMuted border-border' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                    <CheckCircle2 size={10} /> Auto
                                  </span>
                                )
                              )}

                              {/* Thumbnail Preview */}
                              {state.customImage && (
                                <div className="w-6 h-6 rounded border border-white/20 overflow-hidden bg-background">
                                    <img src={state.customImage} alt="ref" className="w-full h-full object-cover" />
                                </div>
                              )}
                              
                              {isExpanded ? <ChevronDown size={14} className="text-indigo-400" /> : <ChevronRight size={14} className="text-textMuted" />}
                            </div>
                          </div>

                          {/* Expanded Content */}
                          {isExpanded && (
                            <div className="p-4 bg-surfaceHighlight/30 rounded-b-lg -mt-1 mx-1 border-x border-b border-white/5 mb-2 animate-in slide-in-from-top-2 duration-200">
                               {/* Segmented Control */}
                               <div className="flex p-1 bg-background rounded-lg mb-4 w-fit border border-border">
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); updateItemState(item.id, { mode: 'catalog' }); }}
                                   className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${state.mode === 'catalog' ? 'bg-surfaceHighlight text-white shadow-sm' : 'text-textMuted hover:text-white'}`}
                                 >
                                   Catalog
                                 </button>
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); updateItemState(item.id, { mode: 'custom' }); }}
                                   className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${state.mode === 'custom' ? 'bg-surfaceHighlight text-white shadow-sm' : 'text-textMuted hover:text-white'}`}
                                 >
                                   Custom
                                 </button>
                               </div>

                               {/* Catalog Mode */}
                               {state.mode === 'catalog' && (
                                 <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                                   {item.options.map((option, optIdx) => (
                                     <button 
                                       key={optIdx}
                                       onClick={() => handleSelectCatalogOption(item.id, option.label)}
                                       className={`flex-shrink-0 group relative flex flex-col items-center gap-2 p-2 rounded-lg border transition-all min-w-[80px] ${state.selectedCatalogOption === option.label ? 'bg-indigo-500/20 border-indigo-500 ring-1 ring-indigo-500' : 'bg-background border-border hover:border-white/20'}`}
                                     >
                                       {/* Color Circle instead of Letter */}
                                       <div 
                                          className="w-10 h-10 rounded-full border border-white/10 shadow-sm relative overflow-hidden flex items-center justify-center"
                                          style={{ backgroundColor: option.color || '#262626' }}
                                       >
                                            {/* Fallback if no color provided, maintain subtle look */}
                                            {!option.color && <div className="w-full h-full bg-surfaceHighlight" />}
                                            
                                            {option.brand && (
                                              <div className="absolute bottom-0 right-0 left-0 bg-black/40 text-[6px] text-white text-center py-0.5 backdrop-blur-sm">
                                                {option.brand}
                                              </div>
                                            )}
                                       </div>
                                       
                                       <span className="text-[10px] font-medium text-textMuted group-hover:text-white text-center truncate w-full">{option.label}</span>
                                       {state.selectedCatalogOption === option.label && (
                                         <div className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                                       )}
                                     </button>
                                   ))}
                                 </div>
                               )}

                               {/* Custom Mode */}
                               {state.mode === 'custom' && (
                                 <div className="space-y-3">
                                   <input 
                                      type="text" 
                                      placeholder="Describe specific finish, texture or style..."
                                      value={state.customText || ''}
                                      onChange={(e) => handleCustomTextChange(item.id, e.target.value)}
                                      className="w-full bg-[#121212] border border-border rounded-lg px-3 py-2 text-sm text-white placeholder-textMuted/40 focus:outline-none focus:border-indigo-500 transition-colors"
                                   />
                                   
                                   <div 
                                     className="border border-dashed border-border rounded-lg p-4 bg-[#121212] hover:bg-surfaceHighlight/50 hover:border-white/20 transition-all cursor-pointer flex items-center justify-center gap-3 relative group"
                                     onDragOver={(e) => e.preventDefault()}
                                     onDrop={(e) => handleDrop(e, item.id)}
                                     onClick={() => fileInputRefs.current[item.id]?.click()}
                                   >
                                      <input 
                                        type="file" 
                                        className="hidden" 
                                        ref={(el) => { fileInputRefs.current[item.id] = el; }}
                                        accept="image/*"
                                        onChange={(e) => {
                                          if (e.target.files?.[0]) handleFileUpload(item.id, e.target.files[0]);
                                        }}
                                      />
                                      
                                      {state.customImage ? (
                                        <div className="flex items-center gap-3 w-full">
                                            <div className="h-10 w-10 rounded bg-background border border-border overflow-hidden shrink-0">
                                                <img src={state.customImage} className="w-full h-full object-cover" alt="Preview" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-xs text-white font-medium truncate">Reference Image Uploaded</span>
                                                <span className="text-[10px] text-textMuted">Click or drop to replace</span>
                                            </div>
                                            <Button variant="ghost" className="ml-auto p-1.5 h-auto text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={(e) => {
                                                e.stopPropagation();
                                                updateItemState(item.id, { customImage: undefined });
                                            }}>
                                                <X size={14} />
                                            </Button>
                                        </div>
                                      ) : (
                                        <>
                                            <div className="p-2 bg-surfaceHighlight rounded-full text-textMuted group-hover:text-white transition-colors">
                                                <Upload size={16} />
                                            </div>
                                            <span className="text-xs text-textMuted group-hover:text-white transition-colors">Drop reference texture or image</span>
                                        </>
                                      )}
                                   </div>
                                 </div>
                               )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
           </div>

           <div className="p-5 border-t border-border bg-surfaceHighlight/30 flex items-center justify-between">
              <div className="flex flex-col">
                 <span className="text-sm font-medium text-white">{autoCount} automatic defaults</span>
                 <span className="text-xs text-textMuted">{customizationCount} customised settings</span>
              </div>
              <div className="flex items-center gap-3">
                 <Button variant="ghost" onClick={onClose}>Back to workspace</Button>
                 <Button variant="primary" onClick={onGenerate} className="bg-indigo-500 hover:bg-indigo-600 text-white border-none shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <Sparkles size={16} />
                    Generate first render
                 </Button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};