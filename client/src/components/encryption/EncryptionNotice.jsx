import React from 'react';
import { Lock } from 'lucide-react';
import { cn } from '../../utils/cn';

export const EncryptionNotice = ({ className, text }) => {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs shadow-sm max-w-md mx-auto text-center',
        className
      )}
    >
      <Lock className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
      <span className="leading-tight">
        {text || 'Messages and calls are end-to-end encrypted. No one outside of this chat, not even CipherChat, can read or listen to them.'}
      </span>
    </div>
  );
};

export default EncryptionNotice;
