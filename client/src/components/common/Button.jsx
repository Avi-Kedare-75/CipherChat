import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:
    'bg-cipher-500 hover:bg-cipher-600 text-white font-medium shadow-glow transition-all active:scale-[0.98]',
  secondary:
    'bg-dark-panel hover:bg-dark-panelHover text-dark-textPrimary border border-white/5 active:scale-[0.98]',
  outline:
    'border border-cipher-500/50 hover:bg-cipher-500/10 text-cipher-400 font-medium active:scale-[0.98]',
  ghost:
    'hover:bg-white/5 text-dark-textMuted hover:text-dark-textPrimary active:scale-[0.98]',
  danger:
    'bg-rose-600/90 hover:bg-rose-600 text-white font-medium active:scale-[0.98]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
  icon: 'p-2.5 rounded-full aspect-square',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  className,
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-cipher-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4 flex-shrink-0" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
