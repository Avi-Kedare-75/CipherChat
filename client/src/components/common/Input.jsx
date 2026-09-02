import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export const Input = forwardRef(
  (
    {
      label,
      error,
      icon: Icon,
      endIcon: EndIcon,
      onEndIconClick,
      className,
      containerClassName,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('w-full flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label className="text-xs font-medium text-dark-textMuted tracking-wide">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {Icon && (
            <div className="absolute left-3.5 text-dark-textMuted pointer-events-none flex items-center">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-dark-panel border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-dark-textPrimary placeholder:text-dark-textMuted/60 transition-all focus:outline-none focus:border-cipher-500 focus:ring-1 focus:ring-cipher-500/50 disabled:opacity-50 disabled:cursor-not-allowed',
              Icon && 'pl-10',
              EndIcon && 'pr-10',
              error && 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30',
              className
            )}
            {...props}
          />
          {EndIcon && (
            <button
              type="button"
              onClick={onEndIconClick}
              className="absolute right-3.5 text-dark-textMuted hover:text-dark-textPrimary transition-colors flex items-center"
            >
              <EndIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        {error && (
          <span className="text-xs text-rose-400 font-medium pl-1 animate-fade-in">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
