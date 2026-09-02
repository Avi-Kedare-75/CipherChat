import React from 'react';
import { cn } from '../../utils/cn';
import { ShieldCheck, Lock } from 'lucide-react';

export const Loader = ({
  fullScreen = false,
  message = 'Securing connection...',
  size = 'md',
  className,
}) => {
  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 text-center select-none',
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        {/* Animated pulsating circles */}
        <div className="w-14 h-14 rounded-2xl bg-cipher-500/20 border border-cipher-500/30 flex items-center justify-center animate-pulse">
          <ShieldCheck className="w-7 h-7 text-cipher-400 animate-bounce" />
        </div>
        <div className="absolute -inset-2 rounded-2xl border border-cipher-500/20 animate-ping opacity-25" />
      </div>

      <div className="flex flex-col items-center gap-1">
        <h4 className="text-sm font-medium text-dark-textPrimary">{message}</h4>
        <div className="flex items-center gap-1 text-xs text-dark-textMuted">
          <Lock className="w-3 h-3 text-cipher-500" />
          <span>256-bit End-to-End Encrypted</span>
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-dark-bg flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;
