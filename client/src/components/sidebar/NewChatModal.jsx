import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useChatStore } from '../../store/useChatStore';
import { userService } from '../../services/userService';
import { Modal } from '../common/Modal';
import { SearchBar } from '../common/SearchBar';
import { Avatar } from '../common/Avatar';
import { Loader2, UserPlus, Lock, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const NewChatModal = () => {
  const { isNewChatModalOpen, setNewChatModalOpen, setShowMobileChat } = useUIStore();
  const { setSelectedContact } = useChatStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search
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
        toast.error('Search failed');
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectUser = (user) => {
    setSelectedContact(user);
    setNewChatModalOpen(false);
    setShowMobileChat(true);
    setSearchQuery('');
    setSearchResults([]);
    toast.success(`Encrypted channel opened with ${user.fullName}`, {
      icon: '🔐',
      style: {
        background: '#202c33',
        color: '#e9edef',
        border: '1px solid #10b981',
      },
    });
  };

  return (
    <Modal
      isOpen={isNewChatModalOpen}
      onClose={() => {
        setNewChatModalOpen(false);
        setSearchQuery('');
      }}
      title="Start New Encrypted Chat"
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* Search Input */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Search by username, full name, or email..."
        />

        {/* Results Container */}
        <div className="min-h-[220px] max-h-[340px] overflow-y-auto space-y-1 pr-1">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-12 text-dark-textMuted gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-cipher-400" />
              <span className="text-xs">Searching user registry...</span>
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map((user) => (
              <button
                key={user._id}
                onClick={() => handleSelectUser(user)}
                className="w-full p-3 rounded-xl hover:bg-dark-panelHover flex items-center justify-between transition-all group text-left border border-transparent hover:border-white/5"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    src={user.avatar}
                    name={user.fullName || user.username}
                    size="md"
                    showStatus
                    isOnline={user.isOnline}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-dark-textPrimary group-hover:text-cipher-400 transition-colors">
                        {user.fullName}
                      </span>
                      <span className="text-xs text-dark-textMuted">
                        @{user.username}
                      </span>
                    </div>
                    <p className="text-xs text-dark-textMuted truncate max-w-[240px]">
                      {user.about || 'Available'}
                    </p>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-cipher-500/10 text-cipher-400 group-hover:bg-cipher-500 group-hover:text-white transition-all">
                  <UserPlus className="w-4 h-4" />
                </div>
              </button>
            ))
          ) : searchQuery.trim() ? (
            <div className="flex flex-col items-center justify-center py-12 text-dark-textMuted text-center">
              <p className="text-sm text-dark-textPrimary font-medium">No users found</p>
              <p className="text-xs mt-1">Try searching by username or email</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-dark-textMuted text-center px-4">
              <div className="w-12 h-12 rounded-2xl bg-dark-panel flex items-center justify-center mb-3">
                <ShieldCheck className="w-6 h-6 text-cipher-400" />
              </div>
              <p className="text-sm font-medium text-dark-textPrimary">
                Search the Cipher Directory
              </p>
              <p className="text-xs mt-1 max-w-xs">
                Enter a person's username or email above to initiate a 256-bit encrypted messaging channel.
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default NewChatModal;
