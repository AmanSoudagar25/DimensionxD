import React, { useState, useEffect } from 'react';
import { ArrowLeft, Share2, Save } from 'lucide-react';
import { Project, RenderNode, ProjectData, RoomSettings } from '../types';
import { Button } from './Button';
import { FloorPlanAnalysisOverlay } from './FloorPlanAnalysisOverlay';
import { CameraPositionModal } from './CameraPositionModal';
import { SidebarLeft } from './SidebarLeft';
import { SidebarRight } from './SidebarRight';
import { InfiniteCanvasArea } from './InfiniteCanvasArea';
import { LoginScreen } from './LoginScreen';

interface WorkspaceProps {
  project: Project;
  onBack: () => void;
  isNewProject?: boolean;
  isAuthenticated?: boolean; // Auth Guard Prop
}

// Initial Data States
const INITIAL_RENDERS: RenderNode[] = [
  { 
    id: '1', 
    imageUrl: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2700&auto=format&fit=crop', 
    position: { x: 0, y: 0 },
    settings: { lighting: 'Daylight', style: 'Japandi' },
    isSaved: true,
    title: 'Draft #3', 
    timestamp: '10:42 AM'
  },
  { 
    id: '2', 
    imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800', 
    position: { x: -380, y: 50 },
    settings: { lighting: 'Golden Hour', style: 'Modern' },
    isSaved: true,
    title: 'Draft #2', 
    timestamp: '10:30 AM'
  },
];

const INITIAL_SETTINGS: RoomSettings = {
  viewpoint: 'Hero (Entry)',
  lens: '1x',
  angle: 'Eye-Level',
  lightingScenario: 'Daylight',
  mood: 'Standard',
  style: 'Japandi',
  creativity: 30,
  excludePrompt: ''
};

export const Workspace: React.FC<WorkspaceProps> = ({ 
  project, 
  onBack, 
  isNewProject = false, 
  isAuthenticated = true 
}) => {
  // --- Auth Guard Check ---
  // In a real app, this might also trigger a redirect or a popup
  if (!isAuthenticated) {
    return (
      <div className="relative h-screen w-full bg-black overflow-hidden">
        {/* Render a blurred/dummy version of the workspace behind the login screen for effect */}
        <div className="absolute inset-0 blur-sm pointer-events-none opacity-30">
           <InfiniteCanvasArea 
             renders={INITIAL_RENDERS} 
             setRenders={() => {}} 
             selectedRenderId={null} 
             onSelect={() => {}} 
             canvasTransform={{ x: 0, y: 0, scale: 1 }} 
             setCanvasTransform={() => {}} 
           />
        </div>
        <LoginScreen onLogin={() => console.log("Trigger login flow")} />
      </div>
    );
  }

  // --- Sidebar States ---
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'room' | 'selection' | 'boq'>('room');
  
  // --- Central State Management ---
  const [projectData, setProjectData] = useState<ProjectData>({
    renders: INITIAL_RENDERS,
    boq: [],
    roomSettings: INITIAL_SETTINGS
  });

  const [selectedRenderId, setSelectedRenderId] = useState<string | null>('1');
  
  const selectedRender = projectData.renders.find(r => r.id === selectedRenderId) || null;

  // --- Shared Application States ---
  const [selectedObject, setSelectedObject] = useState<string>('wall');
  
  // --- Modals ---
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  // --- Generation States ---
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // --- Canvas State ---
  const [canvasTransform, setCanvasTransform] = useState({ x: 0, y: 0, scale: 1 });

  // --- Handlers ---

  const handleCenterOnRender = (render: RenderNode) => {
    setCanvasTransform({
       x: -render.position.x * canvasTransform.scale,
       y: -render.position.y * canvasTransform.scale,
       scale: canvasTransform.scale
    });
  };

  const handleUpdateRender = () => {
    if (!hasPendingChanges) return;
    setIsGenerating(true);
    setTimeout(() => {
       setIsGenerating(false);
       setHasPendingChanges(false);
    }, 2500);
  };

  const updateRoomSettings = (updates: Partial<RoomSettings>) => {
    setProjectData(prev => ({
      ...prev,
      roomSettings: { ...prev.roomSettings, ...updates }
    }));
  };

  // --- Effects ---
  useEffect(() => {
    if (isNewProject) {
      const timer = setTimeout(() => {
        setIsAnalysisOpen(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isNewProject]);

  useEffect(() => {
    setHasPendingChanges(true);
  }, [projectData.roomSettings]);

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
        <SidebarLeft 
          isCollapsed={isLeftCollapsed}
          onToggle={() => setIsLeftCollapsed(!isLeftCollapsed)}
          renders={projectData.renders}
          selectedRenderId={selectedRenderId}
          onSelect={setSelectedRenderId}
          onCenter={handleCenterOnRender}
          isLoading={isGenerating} // Using generation state to simulate loading for now
        />

        <InfiniteCanvasArea 
          renders={projectData.renders}
          setRenders={(newRenders) => {
             if (typeof newRenders === 'function') {
                setProjectData(prev => ({ ...prev, renders: newRenders(prev.renders) }));
             } else {
                setProjectData(prev => ({ ...prev, renders: newRenders }));
             }
          }}
          selectedRenderId={selectedRenderId}
          onSelect={setSelectedRenderId}
          canvasTransform={canvasTransform}
          setCanvasTransform={setCanvasTransform}
        />

        <SidebarRight 
          isCollapsed={isRightCollapsed}
          onToggle={() => setIsRightCollapsed(!isRightCollapsed)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          
          selectedRender={selectedRender}
          roomSettings={projectData.roomSettings}
          boqItems={projectData.boq}
          onUpdateSettings={updateRoomSettings}

          isGenerating={isGenerating}
          hasPendingChanges={hasPendingChanges}
          onUpdateRender={handleUpdateRender}
          onOpenMap={() => setIsCameraModalOpen(true)}
          
          selectedObject={selectedObject}
          setSelectedObject={setSelectedObject}
          isLoading={isGenerating} // Using generation state to simulate loading
        />
      </div>

      <FloorPlanAnalysisOverlay 
        isOpen={isAnalysisOpen}
        onClose={() => setIsAnalysisOpen(false)}
        onGenerate={() => setIsAnalysisOpen(false)}
      />

      <CameraPositionModal 
         isOpen={isCameraModalOpen} 
         onClose={() => setIsCameraModalOpen(false)}
         onApply={() => setIsCameraModalOpen(false)}
      />
    </div>
  );
};
