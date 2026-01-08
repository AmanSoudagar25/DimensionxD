import React from 'react';
import { 
  FolderOpen, Image as ImageIcon, History, Plus, Filter, 
  MoreHorizontal, ChevronsRight, ChevronsLeft, FileText 
} from 'lucide-react';
import { RenderNode } from '../types';

interface SidebarLeftProps {
  isCollapsed: boolean;
  onToggle: () => void;
  renders: RenderNode[];
  selectedRenderId: string | null;
  onSelect: (id: string) => void;
  onCenter: (render: RenderNode) => void;
}

export const SidebarLeft: React.FC<SidebarLeftProps> = ({
  isCollapsed,
  onToggle,
  renders,
  selectedRenderId,
  onSelect,
  onCenter
}) => {
  const sidebarWidth = isCollapsed ? 'w-[60px]' : 'w-72';

  const contextItems = [
    { title: 'Floor Plan Level 1', type: 'PLAN', color: 'bg-indigo-500/20 text-indigo-300', time: '2h ago', img: 'https://images.unsplash.com/photo-1580820267682-426da823b514?auto=format&fit=crop&q=80&w=100' },
    { title: 'Client Brief v2', type: 'BRIEF', color: 'bg-emerald-500/20 text-emerald-300', time: 'Yesterday', icon: FileText },
    { title: 'Moodboard Ref', type: 'REF', color: 'bg-amber-500/20 text-amber-300', time: '2 days ago', img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=100' },
  ];

  return (
    <aside className={`${sidebarWidth} bg-surface border-r border-border flex flex-col z-20 shrink-0 transition-all duration-300 ease-in-out`}>
      {/* Collapse Toggle */}
      <div className={`h-10 flex items-center border-b border-border ${isCollapsed ? 'justify-center' : 'justify-between px-3'}`}>
        {!isCollapsed && <span className="text-[10px] font-bold text-textMuted uppercase tracking-widest">Assets</span>}
        <button 
          onClick={onToggle}
          className="p-1 text-textMuted hover:text-white hover:bg-surfaceHighlight rounded transition-colors"
        >
          {isCollapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
        </button>
      </div>

      {/* Collapsed Rail */}
      {isCollapsed ? (
        <div className="flex-1 flex flex-col items-center gap-4 py-4">
          <button className="p-2 rounded-lg bg-surfaceHighlight/50 text-indigo-400 border border-indigo-500/20" title="Project Context" onClick={onToggle}>
            <FolderOpen size={18} />
          </button>
          <button className="p-2 rounded-lg text-textMuted hover:text-white hover:bg-surfaceHighlight" title="Renders" onClick={onToggle}>
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
                      item.icon && <item.icon size={14} className="text-textMuted" />
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
              {renders.filter(r => r.isSaved).map((render) => (
                <div 
                  key={render.id} 
                  className={`group cursor-pointer p-1 rounded-lg transition-all ${selectedRenderId === render.id ? 'bg-indigo-500/10 ring-1 ring-indigo-500/30' : 'hover:bg-white/5'}`}
                  onClick={() => {
                    onSelect(render.id);
                    onCenter(render);
                  }}
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
                      <h4 className={`text-xs font-medium transition-colors ${selectedRenderId === render.id ? 'text-indigo-400' : 'text-textMain group-hover:text-white'}`}>{render.title}</h4>
                      <p className="text-[10px] text-textMuted mt-0.5">{render.timestamp}</p>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      SAVED
                    </span>
                  </div>
                </div>
              ))}
              {renders.filter(r => r.isSaved).length === 0 && (
                <div className="text-center p-8 text-textMuted text-xs italic">
                  No saved renders yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};