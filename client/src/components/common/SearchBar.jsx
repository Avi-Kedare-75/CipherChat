import React from 'react';
import { cn } from '../../utils/cn';
import { Search, X } from 'lucide-react';

export const SearchBar = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search or start new chat',
  className,
}) => {
  return (
    <div className={cn('relative flex items-center w-full', className)}>
      <div className="absolute left-3 text-dark-textMuted pointer-events-none flex items-center">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-dark-panel border border-transparent hover:border-white/5 focus:border-cipher-500/50 rounded-xl pl-9 pr-8 py-2 text-xs md:text-sm text-dark-textPrimary placeholder:text-dark-textMuted/70 transition-all focus:outline-none focus:ring-1 focus:ring-cipher-500/40"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2.5 text-dark-textMuted hover:text-dark-textPrimary p-0.5 rounded-full hover:bg-white/5 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
