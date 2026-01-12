
import React from 'react';
import { 
  FolderOpen, Image as ImageIcon, History, Plus,
  ChevronsRight, ChevronsLeft, FileText,
  Map as MapIcon, Download, Eye, LayoutGrid, List
} from 'lucide-react';
import { RenderNode } from '../types';
import { SkeletonCard } from './SkeletonCard';

interface SidebarLeftProps {
  isCollapsed: boolean;
  onToggle: () => void;
  renders: RenderNode[];
  selectedRenderId: string | null;
  onSelect: (id: string) => void;
  onCenter: (render: RenderNode) => void;
  isLoading?: boolean;
}

export const SidebarLeft: React.FC<SidebarLeftProps> = ({
  isCollapsed,
  onToggle,
  renders,
  selectedRenderId,
  onSelect,
  onCenter,
  isLoading = false
}) => {
  const sidebarWidth = isCollapsed ? 'w-[60px]' : 'w-72';
  const contextItems = [
    { title: 'Floor Plan Level 1.pdf', icon: MapIcon, iconColor: 'text-blue-400' },
    { title: 'Client Brief v2.docx', icon: FileText, iconColor: 'text-emerald-400' },
    { title: 'Moodboard Ref.jpg', icon: ImageIcon, iconColor: 'text-amber-400' },
  ];

  return (
    <aside className={`${sidebarWidth} bg-surface border-r border-border flex flex-col z-20 shrink-0 transition-all duration-300 ease-in-out`}>
      <div className={`h-12 flex items-center border-b border-border bg-surface shrink-0 ${isCollapsed ? 'justify-center' : 'justify-between px-4'}`}>
        {!isCollapsed && <span className="text-sm font-semibold text-white tracking-tight">Assets</span>}
        <button onClick={onToggle} className="p-1.5 text-textMuted hover:text-white hover:bg-white/5 rounded-md transition-colors">
          {isCollapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
          {/* Context Section */}
          <div className="flex flex-col min-h-[160px] border-b border-border">
            <div className="px-4 py-3 flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Project Context</h3>
              <button className="text-gray-500 hover:text-white transition-colors p-1 hover:bg-white/5 rounded"><Plus size={14}/></button>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
              {contextItems.map((item, idx) => (
                <div key={idx} className="group flex items-center justify-between h-10 px-2 rounded-md hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 min-w-0">
                    <item.icon size={15} className={item.iconColor} />
                    <span className="text-sm text-gray-300 truncate font-medium">{item.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Renders Section */}
          <div className="flex-1 flex flex-col bg-surface">
            <div className="px-4 py-3 flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Saved Renders</h3>
              <div className="flex items-center gap-1 bg-surfaceHighlight/50 rounded p-0.5 border border-white/5">
                <button className="p-1 text-white bg-white/10 rounded shadow-sm"><LayoutGrid size={12} /></button>
                <button className="p-1 text-gray-500 hover:text-white transition-colors"><List size={12} /></button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="grid grid-cols-2 gap-3">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {renders.filter(r => r.isSaved).map((render) => (
                    <div 
                      key={render.id} 
                      className={`group relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer transition-all ${selectedRenderId === render.id ? 'ring-2 ring-white ring-offset-2 ring-offset-[#171717] z-10' : 'ring-1 ring-white/10 hover:ring-white/30 hover:shadow-lg'}`}
                      onClick={() => { onSelect(render.id); onCenter(render); }}
                    >
                      <img src={render.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Render" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2.5">
                        <span className="text-[10px] font-bold text-white truncate leading-tight">{render.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
