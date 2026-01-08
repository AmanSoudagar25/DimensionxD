import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  children, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-white/20 text-sm";
  
  const variants = {
    primary: "bg-white text-black hover:bg-gray-200 border border-transparent",
    secondary: "bg-surfaceHighlight text-textMain hover:bg-border border border-border",
    ghost: "bg-transparent text-textMuted hover:text-textMain hover:bg-surfaceHighlight"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};