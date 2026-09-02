import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { Avatar } from '../common/Avatar';
import {
  MessageSquarePlus,
  MoreVertical,
  User,
  LogOut,
  Moon,
  Sun,
  Shield,
  CircleDot,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const SidebarHeader = () => {
  const { user, logout } = useAuthStore();
  const {
    toggleProfileDrawer,
    toggleNewChatModal,
    isDarkMode,
    toggleTheme,
  } = useUIStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await logout();
    toast.success('Logged out securely');
  };

  return (
    <div className="h-16 px-4 bg-dark-sidebar border-b border-dark-border flex items-center justify-between flex-shrink-0">
      {/* User profile trigger */}
      <button
        onClick={toggleProfileDrawer}
        className="flex items-center gap-3 p-1 rounded-xl hover:bg-white/5 transition-all text-left group"
        title="View Profile"
      >
        <Avatar
          src={user?.avatar}
          name={user?.fullName || user?.username}
          size="md"
          showStatus
          isOnline={true}
        />
        <div className="hidden sm:flex flex-col">
          <span className="text-sm font-semibold text-dark-textPrimary group-hover:text-cipher-400 transition-colors truncate max-w-[130px]">
            {user?.fullName || user?.username}
          </span>
          <span className="text-[11px] text-dark-textMuted flex items-center gap-1">
            <Shield className="w-3 h-3 text-cipher-400" />
            <span>@{user?.username}</span>
          </span>
        </div>
      </button>

      {/* Action buttons */}
      <div className="flex items-center gap-1 text-dark-textMuted">
        {/* New Chat Button */}
        <button
          onClick={toggleNewChatModal}
          className="p-2.5 rounded-xl hover:bg-white/5 hover:text-cipher-400 transition-all active:scale-95"
          title="New encrypted chat"
        >
          <MessageSquarePlus className="w-5 h-5" />
        </button>

        {/* Dropdown Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2.5 rounded-xl hover:bg-white/5 hover:text-dark-textPrimary transition-all active:scale-95"
            title="Menu"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-12 w-52 bg-dark-panel border border-white/10 rounded-2xl shadow-2xl py-1.5 z-50 animate-slide-up">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  toggleProfileDrawer();
                }}
                className="w-full px-4 py-2.5 text-xs text-dark-textPrimary hover:bg-white/5 flex items-center gap-3 transition-colors text-left"
              >
                <User className="w-4 h-4 text-dark-textMuted" />
                <span>Profile & Keys</span>
              </button>

              <button
                onClick={() => {
                  toggleTheme();
                }}
                className="w-full px-4 py-2.5 text-xs text-dark-textPrimary hover:bg-white/5 flex items-center gap-3 transition-colors text-left"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Light Theme</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-cipher-400" />
                    <span>Dark Theme</span>
                  </>
                )}
              </button>

              <div className="my-1 border-t border-white/5" />

              <button
                onClick={handleLogout}
                className="w-full px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-3 transition-colors text-left font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SidebarHeader;
