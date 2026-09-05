import React, { useState, useEffect } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useSocketStore } from '../../store/useSocketStore';
import { userService } from '../../services/userService';
import { Modal } from '../common/Modal';
import { SearchBar } from '../common/SearchBar';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import {
  Users,
  ShieldCheck,
  Crown,
  UserPlus,
  UserMinus,
  Edit2,
  Check,
  X,
  LogOut,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const GroupInfoModal = () => {
  const { user: currentUser } = useAuthStore();
  const {
    activeChat,
    isGroupInfoOpen,
    setIsGroupInfoOpen,
    renameGroup,
    addToGroup,
    removeFromGroup,
  } = useChatStore();
  const { socket } = useSocketStore();

  const [isEditingName, setIsEditingName] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (activeChat?.groupName) {
      setNewGroupName(activeChat.groupName);
    }
  }, [activeChat?.groupName]);

  // Search users to add
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const response = await userService.searchUsers(searchQuery);
        // Filter out already existing participants
        const existingIds = new Set(activeChat?.participants?.map((p) => p._id) || []);
        const filtered = (response.data?.users || []).filter((u) => !existingIds.has(u._id));
        setSearchResults(filtered);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, activeChat?.participants]);

  if (!activeChat || activeChat.chatType !== 'group') return null;

  const isAdmin =
    activeChat.groupAdmin?.some(
      (admin) => (admin._id || admin) === currentUser?._id
    ) || activeChat.createdBy === currentUser?._id;

  const handleRename = async () => {
    if (!newGroupName.trim() || newGroupName === activeChat.groupName) {
      setIsEditingName(false);
      return;
    }

    try {
      setIsActionLoading(true);
      const updated = await renameGroup(activeChat._id, newGroupName.trim());
      socket?.emit('group updated', updated);
      toast.success('Group name updated');
      setIsEditingName(false);
    } catch (error) {
      toast.error('Failed to rename group');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAddUser = async (userToAdd) => {
    try {
      setIsActionLoading(true);
      const updated = await addToGroup(activeChat._id, userToAdd._id);
      socket?.emit('group updated', updated);
      toast.success(`${userToAdd.fullName} added to group`);
      setSearchQuery('');
      setSearchResults([]);
      setIsAddingMember(false);
    } catch (error) {
      toast.error('Failed to add user to group');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRemoveUser = async (userId, userName) => {
    try {
      setIsActionLoading(true);
      const updated = await removeFromGroup(activeChat._id, userId);
      socket?.emit('group updated', updated);
      toast.success(
        userId === currentUser?._id
          ? 'You left the group'
          : `${userName || 'Member'} removed from group`
      );
      if (userId === currentUser?._id) {
        setIsGroupInfoOpen(false);
      }
    } catch (error) {
      toast.error('Failed to update group members');
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isGroupInfoOpen}
      onClose={() => setIsGroupInfoOpen(false)}
      title="Group Info & Settings"
      maxWidth="max-w-lg"
    >
      <div className="space-y-6">
        {/* Group Header Info */}
        <div className="flex flex-col items-center text-center p-4 bg-dark-panel/40 rounded-2xl border border-white/5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cipher-600 via-emerald-500 to-teal-400 p-0.5 shadow-glow mb-3">
            <div className="w-full h-full bg-dark-sidebar rounded-2xl flex items-center justify-center">
              <Users className="w-10 h-10 text-cipher-400" />
            </div>
          </div>

          {/* Group Name (Editable by Admin) */}
          <div className="flex items-center gap-2 w-full justify-center">
            {isEditingName ? (
              <div className="flex items-center gap-1.5 w-full max-w-xs">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full bg-dark-input border border-cipher-500 rounded-lg px-2.5 py-1 text-sm text-dark-textPrimary focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleRename}
                  disabled={isActionLoading}
                  className="p-1.5 bg-cipher-500 hover:bg-cipher-600 text-white rounded-lg transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingName(false);
                    setNewGroupName(activeChat.groupName);
                  }}
                  className="p-1.5 bg-white/10 hover:bg-white/20 text-dark-textMuted rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-dark-textPrimary">
                  {activeChat.groupName}
                </h3>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="p-1 text-dark-textMuted hover:text-cipher-400 rounded-md transition-colors"
                    title="Rename Group"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-dark-textMuted mt-1">
            Group · {activeChat.participants?.length || 0} participants
          </p>

          {activeChat.groupDescription && (
            <p className="text-xs text-dark-textPrimary/80 mt-2 px-4 py-1.5 bg-white/5 rounded-lg border border-white/5 max-w-md">
              {activeChat.groupDescription}
            </p>
          )}
        </div>

        {/* Participants List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-dark-textMuted uppercase tracking-wider">
              Participants ({activeChat.participants?.length || 0})
            </h4>
            {isAdmin && !isAddingMember && (
              <button
                type="button"
                onClick={() => setIsAddingMember(true)}
                className="text-xs text-cipher-400 hover:text-cipher-300 font-medium flex items-center gap-1 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>
            )}
          </div>

          {/* Add Member Search Input */}
          {isAddingMember && (
            <div className="mb-3 p-3 bg-dark-panel/60 rounded-xl border border-cipher-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-cipher-400">Add New Participant</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingMember(false);
                    setSearchQuery('');
                  }}
                  className="text-dark-textMuted hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={() => setSearchQuery('')}
                placeholder="Search user to add..."
              />
              <div className="max-h-36 overflow-y-auto space-y-1">
                {isSearching ? (
                  <div className="flex items-center justify-center py-4 text-xs text-dark-textMuted">
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5 text-cipher-400" />
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((u) => (
                    <div
                      key={u._id}
                      className="p-2 bg-dark-sidebar rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar src={u.avatar} name={u.fullName} size="xs" />
                        <span className="text-xs text-dark-textPrimary">{u.fullName}</span>
                      </div>
                      <Button
                        size="xs"
                        variant="primary"
                        onClick={() => handleAddUser(u)}
                        disabled={isActionLoading}
                      >
                        Add
                      </Button>
                    </div>
                  ))
                ) : searchQuery ? (
                  <p className="text-[11px] text-dark-textMuted text-center py-2">No users found</p>
                ) : null}
              </div>
            </div>
          )}

          {/* Members List */}
          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
            {activeChat.participants?.map((member) => {
              const isMemberAdmin = activeChat.groupAdmin?.some(
                (admin) => (admin._id || admin) === member._id
              );
              const isMe = member._id === currentUser?._id;

              return (
                <div
                  key={member._id}
                  className="p-2.5 rounded-xl bg-dark-panel/40 border border-white/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={member.avatar} name={member.fullName} size="sm" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-dark-textPrimary">
                          {member.fullName} {isMe && '(You)'}
                        </span>
                        {isMemberAdmin && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-cipher-500/10 text-cipher-400 border border-cipher-500/20">
                            <Crown className="w-2.5 h-2.5" />
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-dark-textMuted">@{member.username}</p>
                    </div>
                  </div>

                  {/* Actions for Admin on other members */}
                  {isAdmin && !isMe && (
                    <button
                      type="button"
                      onClick={() => handleRemoveUser(member._id, member.fullName)}
                      disabled={isActionLoading}
                      className="p-1.5 text-dark-textMuted hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Remove from group"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Leave Group Button */}
        <div className="pt-2 border-t border-dark-border/40 flex justify-between items-center">
          <button
            type="button"
            onClick={() => handleRemoveUser(currentUser?._id, 'You')}
            disabled={isActionLoading}
            className="inline-flex items-center gap-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-3 py-2 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit Group</span>
          </button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsGroupInfoOpen(false)}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default GroupInfoModal;
