import React from 'react';
import { LayoutGrid } from 'lucide-react';

interface LoginScreenProps {
  onLogin?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-black/90 backdrop-blur-sm z-50 absolute inset-0">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 flex flex-col items-center text-center shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="p-4 bg-surfaceHighlight rounded-2xl mb-6 border border-white/5">
          <LayoutGrid size={32} className="text-white" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Welcome to DimensionxD</h1>
        <p className="text-textMuted mb-8 text-sm leading-relaxed max-w-xs">
          Sign in to access your professional workspace, save renders, and manage projects.
        </p>
        
        <button 
          onClick={onLogin}
          className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-3.5 rounded-xl hover:bg-gray-200 transition-all active:scale-[0.98]"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="G" />
          <span>Sign in with Google</span>
        </button>
      </div>
    </div>
  );
};
