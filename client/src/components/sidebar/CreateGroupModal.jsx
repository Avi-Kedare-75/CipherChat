import React, { useState, useEffect } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useSocketStore } from '../../store/useSocketStore';
import { userService } from '../../services/userService';
import { Modal } from '../common/Modal';
import { SearchBar } from '../common/SearchBar';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { Users, X, Check, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export const CreateGroupModal = () => {
  const { isCreateGroupOpen, setIsCreateGroupOpen, createGroupChat } = useChatStore();
  const { socket } = useSocketStore();

  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

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
        setSearchResults(response.data?.users || []);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleUserSelection = (user) => {
    if (selectedUsers.some((u) => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }
    if (selectedUsers.length < 1) {
      toast.error('Please select at least 1 member for the group');
      return;
    }

    try {
      setIsCreating(true);
      const newGroup = await createGroupChat({
        name: groupName.trim(),
        description: description.trim(),
        users: selectedUsers.map((u) => u._id),
      });

      socket?.emit('group updated', newGroup);
      toast.success(`Group "${groupName}" created successfully! 🎉`);
      
      // Reset form
      setGroupName('');
      setDescription('');
      setSelectedUsers([]);
      setSearchQuery('');
      setIsCreateGroupOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create group');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal
      isOpen={isCreateGroupOpen}
      onClose={() => setIsCreateGroupOpen(false)}
      title="Create New Encrypted Group"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleCreateGroup} className="space-y-4">
        {/* Group Name & Description */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-dark-textMuted uppercase mb-1">
              Group Name *
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Project Cipher Core"
              maxLength={60}
              className="w-full bg-dark-input border border-white/5 focus:border-cipher-500 rounded-xl px-4 py-2.5 text-sm text-dark-textPrimary placeholder:text-dark-textMuted/50 focus:outline-none focus:ring-1 focus:ring-cipher-500/40"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-textMuted uppercase mb-1">
              Group Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this group about?"
              rows={2}
              maxLength={200}
              className="w-full bg-dark-input border border-white/5 focus:border-cipher-500 rounded-xl px-4 py-2 text-sm text-dark-textPrimary placeholder:text-dark-textMuted/50 focus:outline-none focus:ring-1 focus:ring-cipher-500/40 resize-none"
            />
          </div>
        </div>

        {/* Selected Members Chips */}
        {selectedUsers.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-dark-textMuted uppercase mb-1.5">
              Selected Members ({selectedUsers.length})
            </label>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1">
              {selectedUsers.map((user) => (
                <span
                  key={user._id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cipher-500/20 border border-cipher-500/30 text-cipher-300 text-xs font-medium animate-fade-in"
                >
                  <Avatar src={user.avatar} name={user.fullName} size="xs" />
                  <span>{user.fullName}</span>
                  <button
                    type="button"
                    onClick={() => toggleUserSelection(user)}
                    className="hover:text-rose-400 transition-colors ml-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Member Search */}
        <div>
          <label className="block text-xs font-semibold text-dark-textMuted uppercase mb-1.5">
            Add Members
          </label>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder="Search contacts to add..."
          />

          <div className="mt-2 min-h-[140px] max-h-[200px] overflow-y-auto space-y-1 pr-1 border border-white/5 rounded-xl p-2 bg-dark-panel/40">
            {isSearching ? (
              <div className="flex items-center justify-center py-6 text-dark-textMuted gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-cipher-400" />
                <span className="text-xs">Searching users...</span>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((user) => {
                const isSelected = selectedUsers.some((u) => u._id === user._id);
                return (
                  <button
                    key={user._id}
                    type="button"
                    onClick={() => toggleUserSelection(user)}
                    className={`w-full p-2 rounded-lg flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-cipher-500/20 border border-cipher-500/40 text-cipher-300'
                        : 'hover:bg-dark-panelHover text-dark-textPrimary'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar src={user.avatar} name={user.fullName} size="sm" />
                      <div className="text-left">
                        <div className="text-xs font-medium">{user.fullName}</div>
                        <div className="text-[11px] text-dark-textMuted">@{user.username}</div>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                        isSelected
                          ? 'bg-cipher-500 border-cipher-500 text-white'
                          : 'border-dark-border text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-6 text-xs text-dark-textMuted">
                {searchQuery ? 'No matching users found' : 'Type a name to find members to add'}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-dark-border/40">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsCreateGroupOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isCreating || !groupName.trim() || selectedUsers.length < 1}
            isLoading={isCreating}
            icon={Sparkles}
          >
            Create Encrypted Group
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateGroupModal;
