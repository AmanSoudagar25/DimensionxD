import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { X, Upload, FileText, Check, ChevronDown } from 'lucide-react';
import { Button } from './Button';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (projectData: any) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onProjectCreated }) => {
  const [projectName, setProjectName] = useState('');
  const [roomType, setRoomType] = useState('Living room');
  const [floorPlan, setFloorPlan] = useState<File | null>(null);
  const [requirements, setRequirements] = useState<File | null>(null);
  
  const [isDraggingFloor, setIsDraggingFloor] = useState(false);
  const [isDraggingReq, setIsDraggingReq] = useState(false);

  const floorInputRef = useRef<HTMLInputElement>(null);
  const reqInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: DragEvent<HTMLDivElement>, setDragging: (v: boolean) => void) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragging(true);
    } else if (e.type === 'dragleave') {
      setDragging(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, setFile: (f: File | null) => void, setDragging: (v: boolean) => void) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, setFile: (f: File | null) => void) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    // In a real app, we would process files here
    const newProject = {
      name: projectName,
      roomType: roomType,
      floorPlanName: floorPlan?.name,
      lastEdited: 'Just now',
      status: 'Active'
    };
    onProjectCreated(newProject);
    // Reset form
    setProjectName('');
    setFloorPlan(null);
    setRequirements(null);
  };

  const isFormValid = projectName.trim() !== '' && floorPlan !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-8 border-b border-border sticky top-0 bg-surface z-10">
          <div>
            <h2 className="text-2xl font-semibold text-white tracking-tight">Create New Project</h2>
            <p className="text-sm text-textMuted mt-1">Setup your workspace details to get started.</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-textMuted hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-3">
            <label className="text-xs font-semibold text-textMuted uppercase tracking-wider">Project Name <span className="text-red-400">*</span></label>
            <input 
              type="text" 
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && isFormValid) {
                  handleSubmit();
                }
              }}
              placeholder="e.g. Modern Loft Renovation"
              autoFocus
              className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-white placeholder-textMuted/40 focus:outline-none focus:border-white/30 focus:ring-4 focus:ring-white/5 transition-all duration-200"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-textMuted uppercase tracking-wider">Room Type</label>
            <div className="relative">
              <select 
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-white appearance-none focus:outline-none focus:border-white/30 focus:ring-4 focus:ring-white/5 transition-all duration-200 cursor-pointer"
              >
                <option>Living room</option>
                <option>Bedroom</option>
                <option>Kitchen</option>
                <option>Dining</option>
                <option>Other</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none" size={18} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-semibold text-textMuted uppercase tracking-wider">Floor Plan <span className="text-red-400">*</span></label>
              <div 
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer h-48 flex flex-col items-center justify-center ${isDraggingFloor ? 'border-emerald-500 bg-emerald-500/5' : 'border-border hover:border-white/20 hover:bg-surfaceHighlight/50 bg-background/50'}`}
                onDragEnter={(e) => handleDrag(e, setIsDraggingFloor)}
                onDragOver={(e) => handleDrag(e, setIsDraggingFloor)}
                onDragLeave={(e) => handleDrag(e, setIsDraggingFloor)}
                onDrop={(e) => handleDrop(e, setFloorPlan, setIsDraggingFloor)}
                onClick={() => floorInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={floorInputRef} 
                  className="hidden" 
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, setFloorPlan)}
                />
                {floorPlan ? (
                  <div className="flex flex-col items-center gap-3 text-emerald-400 animate-in fade-in zoom-in">
                    <div className="p-3 bg-emerald-500/10 rounded-full">
                      <Check size={24} />
                    </div>
                    <span className="text-sm font-medium truncate max-w-[200px]">{floorPlan.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-textMuted">
                    <div className="p-3 bg-surfaceHighlight rounded-full border border-border">
                        <Upload size={20} />
                    </div>
                    <div>
                        <span className="text-sm font-medium block text-white">Upload floor plan</span>
                        <span className="text-xs text-textMuted/70">JPG, PNG, PDF</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-textMuted uppercase tracking-wider">Client Requirements <span className="text-[10px] font-normal lowercase opacity-70">(Optional)</span></label>
               <div 
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer h-48 flex flex-col items-center justify-center ${isDraggingReq ? 'border-emerald-500 bg-emerald-500/5' : 'border-border hover:border-white/20 hover:bg-surfaceHighlight/50 bg-background/50'}`}
                onDragEnter={(e) => handleDrag(e, setIsDraggingReq)}
                onDragOver={(e) => handleDrag(e, setIsDraggingReq)}
                onDragLeave={(e) => handleDrag(e, setIsDraggingReq)}
                onDrop={(e) => handleDrop(e, setRequirements, setIsDraggingReq)}
                onClick={() => reqInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={reqInputRef} 
                  className="hidden" 
                  onChange={(e) => handleFileChange(e, setRequirements)}
                />
                {requirements ? (
                  <div className="flex flex-col items-center gap-3 text-emerald-400 animate-in fade-in zoom-in">
                    <div className="p-3 bg-emerald-500/10 rounded-full">
                      <Check size={24} />
                    </div>
                    <span className="text-sm font-medium truncate max-w-[200px]">{requirements.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-textMuted">
                    <div className="p-3 bg-surfaceHighlight rounded-full border border-border">
                        <FileText size={20} />
                    </div>
                    <div>
                        <span className="text-sm font-medium block text-white">Upload docs</span>
                        <span className="text-xs text-textMuted/70">PDF, DOCX, TXT</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-border flex justify-end gap-4 bg-surface rounded-b-2xl">
          <Button variant="ghost" onClick={onClose} className="px-6 py-3 text-base">Cancel</Button>
          <Button 
            variant="primary" 
            disabled={!isFormValid} 
            onClick={handleSubmit}
            className={`transition-all px-8 py-3 text-base shadow-lg shadow-white/5 ${!isFormValid ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-white/10'}`}
          >
            Create & open workspace
          </Button>
        </div>
      </div>
    </div>
  );
};