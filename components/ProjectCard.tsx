import React from 'react';
import { Project, ProjectStatus } from '../types';
import { MoreHorizontal, Clock } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onClick?: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.Active:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case ProjectStatus.Pending:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case ProjectStatus.Draft:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case ProjectStatus.Archived:
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div 
      className="group bg-surface border border-border rounded-xl p-5 hover:border-white/20 transition-all duration-200 flex flex-col h-full relative cursor-pointer"
      onClick={() => onClick?.(project)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
          {project.status}
        </div>
        <button 
          className="text-textMuted hover:text-white p-1 rounded hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal size={18} />
        </button>
      </div>
      
      <div className="mt-auto">
        <h3 className="text-lg font-medium text-white mb-1 group-hover:text-indigo-400 transition-colors">
          {project.name}
        </h3>
        <p className="text-sm text-textMuted mb-4">{project.roomType}</p>
        
        <div className="flex items-center gap-2 text-xs text-textMuted pt-4 border-t border-border">
          <Clock size={14} />
          <span>Edited {project.lastEdited}</span>
        </div>
      </div>
    </div>
  );
};