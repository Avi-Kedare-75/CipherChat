import React from 'react';
import { cn } from '../../utils/cn';
import { getInitials } from '../../utils/formatters';

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-24 h-24 text-2xl',
};

const badgeSizeClasses = {
  xs: 'w-2 h-2',
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-3.5 h-3.5',
  xl: 'w-4 h-4',
  '2xl': 'w-5 h-5',
};

// Generates consistent pleasant background gradients based on string
const getAvatarGradient = (str = '') => {
  const gradients = [
    'from-emerald-500 to-teal-700',
    'from-blue-500 to-indigo-700',
    'from-purple-500 to-pink-700',
    'from-amber-500 to-orange-700',
    'from-cyan-500 to-blue-700',
    'from-rose-500 to-red-700',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};

export const Avatar = ({
  src,
  alt = 'User',
  name = 'User',
  size = 'md',
  isOnline = false,
  showStatus = false,
  className,
}) => {
  const initials = getInitials(name || alt);
  const gradient = getAvatarGradient(name || alt);

  return (
    <div className={cn('relative inline-flex flex-shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={cn(
            'rounded-full object-cover ring-1 ring-white/10',
            sizeClasses[size]
          )}
          onError={(e) => {
            // fallback to initials on error
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <div
          className={cn(
            'rounded-full bg-gradient-to-tr flex items-center justify-center font-semibold text-white shadow-sm ring-1 ring-white/10',
            gradient,
            sizeClasses[size]
          )}
        >
          {initials}
        </div>
      )}

      {showStatus && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-dark-sidebar ring-1 ring-black/30',
            badgeSizeClasses[size],
            isOnline ? 'bg-emerald-500' : 'bg-gray-500'
          )}
        />
      )}
    </div>
  );
};

export default Avatar;
