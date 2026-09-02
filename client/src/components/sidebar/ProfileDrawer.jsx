import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { Avatar } from '../common/Avatar';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import {
  ArrowLeft,
  User,
  Info,
  Shield,
  Key,
  Check,
  Edit2,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ProfileDrawer = () => {
  const { user, updateProfile, isLoading } = useAuthStore();
  const { isProfileDrawerOpen, setProfileDrawerOpen } = useUIStore();

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [about, setAbout] = useState(user?.about || '');

  if (!isProfileDrawerOpen) return null;

  const handleSaveName = async () => {
    if (!fullName.trim()) return;
    const result = await updateProfile({ fullName: fullName.trim() });
    if (result.success) {
      setIsEditingName(false);
      toast.success('Name updated successfully');
    }
  };

  const handleSaveAbout = async () => {
    const result = await updateProfile({ about: about.trim() });
    if (result.success) {
      setIsEditingAbout(false);
      toast.success('About updated');
    }
  };

  return (
    <div className="absolute inset-0 z-40 bg-dark-sidebar flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="h-24 bg-dark-panel px-5 flex items-end pb-4 gap-6 border-b border-dark-border">
        <button
          onClick={() => setProfileDrawerOpen(false)}
          className="p-1 rounded-lg text-dark-textMuted hover:text-dark-textPrimary hover:bg-white/5 transition-colors"
          title="Back to chats"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-dark-textPrimary">Profile & Security</h2>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center justify-center py-4">
          <Avatar
            src={user?.avatar}
            name={user?.fullName || user?.username}
            size="2xl"
            className="shadow-glow ring-2 ring-cipher-500/30"
          />
          <span className="text-xs text-dark-textMuted mt-3">
            @{user?.username}
          </span>
        </div>

        {/* Full Name Edit */}
        <div className="p-4 rounded-xl bg-dark-panel/60 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-cipher-400 font-medium">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Your Name
            </span>
            {!isEditingName && (
              <button
                onClick={() => setIsEditingName(true)}
                className="text-dark-textMuted hover:text-dark-textPrimary p-1 rounded hover:bg-white/5"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {isEditingName ? (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-dark-input border border-cipher-500 rounded-lg px-3 py-1.5 text-sm text-dark-textPrimary focus:outline-none"
                autoFocus
              />
              <Button
                size="sm"
                variant="primary"
                onClick={handleSaveName}
                isLoading={isLoading}
              >
                <Check className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <p className="text-sm font-medium text-dark-textPrimary">{user?.fullName}</p>
          )}
          <p className="text-[11px] text-dark-textMuted">
            This is how your name will appear to your encrypted contacts.
          </p>
        </div>

        {/* About / Status Edit */}
        <div className="p-4 rounded-xl bg-dark-panel/60 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-cipher-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              About
            </span>
            {!isEditingAbout && (
              <button
                onClick={() => setIsEditingAbout(true)}
                className="text-dark-textMuted hover:text-dark-textPrimary p-1 rounded hover:bg-white/5"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {isEditingAbout ? (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                maxLength={150}
                className="w-full bg-dark-input border border-cipher-500 rounded-lg px-3 py-1.5 text-sm text-dark-textPrimary focus:outline-none"
                autoFocus
              />
              <Button
                size="sm"
                variant="primary"
                onClick={handleSaveAbout}
                isLoading={isLoading}
              >
                <Check className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <p className="text-sm text-dark-textPrimary">{user?.about || 'Hey there! I am using CipherChat'}</p>
          )}
        </div>

        {/* Security & Cryptography Card */}
        <div className="p-4 rounded-xl bg-dark-panel/40 border border-cipher-500/20 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-cipher-400">
            <Shield className="w-4 h-4" />
            <span>Cryptographic Identity</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-dark-textMuted py-1 border-b border-white/5">
              <span>Account ID</span>
              <span className="font-mono text-dark-textPrimary text-[11px]">
                {user?._id?.substring(0, 10)}...
              </span>
            </div>
            <div className="flex justify-between items-center text-dark-textMuted py-1 border-b border-white/5">
              <span>Encryption Status</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <Lock className="w-3 h-3" /> Active (Signal X3DH)
              </span>
            </div>
            <div className="flex justify-between items-center text-dark-textMuted py-1">
              <span>Registered Email</span>
              <span className="text-dark-textPrimary text-[11px] truncate max-w-[150px]">
                {user?.email}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDrawer;
