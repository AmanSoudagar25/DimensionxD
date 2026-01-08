import React from 'react';
import { User } from '../types';
import { LayoutGrid, Bell } from 'lucide-react';

interface NavbarProps {
  user: User;
}

export const Navbar: React.FC<NavbarProps> = ({ user }) => {
  return (
    <nav className="w-full h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-surfaceHighlight rounded-lg border border-border">
            <LayoutGrid size={20} className="text-white" />
        </div>
        <span className="font-semibold text-lg tracking-tight text-white">DimensionxD</span>
      </div>

      <div className="flex items-center gap-6">
        <button className="text-textMuted hover:text-white transition-colors">
          <Bell size={20} />
        </button>
        <div className="flex items-center gap-3 pl-6 border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{user.name}</p>
            <p className="text-xs text-textMuted">Admin</p>
          </div>
          <img 
            src={user.avatarUrl} 
            alt={user.name} 
            className="w-9 h-9 rounded-full border border-border object-cover"
          />
        </div>
      </div>
    </nav>
  );
};