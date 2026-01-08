import React from 'react';
import { Button } from './Button';
import { Plus } from 'lucide-react';

interface NewProjectCardProps {
  onCreateClick: () => void;
}

export const NewProjectCard: React.FC<NewProjectCardProps> = ({ onCreateClick }) => {
  return (
    <div className="w-full bg-surface border border-border rounded-2xl p-8 mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:border-white/20 transition-colors">
      <div className="max-w-xl">
        <h2 className="text-2xl font-semibold text-white mb-2">Create a new project</h2>
        <p className="text-textMuted leading-relaxed">
          Start a fresh workspace for your architectural designs. You can import existing blueprints or start from scratch using the DimensionxD editor.
        </p>
      </div>
      <div className="shrink-0">
        <Button variant="primary" className="flex items-center gap-2 px-6 py-3" onClick={onCreateClick}>
          <Plus size={18} />
          Create Project
        </Button>
      </div>
    </div>
  );
};