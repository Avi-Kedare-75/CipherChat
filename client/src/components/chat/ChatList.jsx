import React from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { ChatListItem } from './ChatListItem';
import { MessageSquarePlus, ShieldCheck, Loader2, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';

export const ChatList = ({ activeFilter = 'all' }) => {
  const { user } = useAuthStore();
  const {
    chats,
    activeChat,
    setActiveChat,
    searchQuery,
    isLoadingChats,
  } = useChatStore();
  const { toggleNewChatModal, setShowMobileChat } = useUIStore();

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
    setShowMobileChat(true);
  };

  // Filter chats if user typed in search bar OR selected a tab
  const filteredChats = chats.filter((chat) => {
    // 1. Tab filter
    if (activeFilter === 'direct' && chat.chatType === 'group') return false;
    if (activeFilter === 'groups' && chat.chatType !== 'group') return false;

    // 2. Search query filter
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    if (chat.chatType === 'group') {
      return chat.groupName?.toLowerCase().includes(query);
    }
    const otherParticipant = chat.participants?.find((p) => p._id !== user?._id);
    return (
      otherParticipant?.fullName?.toLowerCase().includes(query) ||
      otherParticipant?.username?.toLowerCase().includes(query)
    );
  });

  if (isLoadingChats) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3">
        <div className="relative">
          <Loader2 className="w-7 h-7 animate-spin text-emerald-400" />
          <div className="absolute inset-0 blur-md bg-emerald-500/30 -z-10" />
        </div>
        <span className="text-xs font-mono tracking-wider text-emerald-400/80">DECRYPTING CHATS...</span>
      </div>
    );
  }

  if (filteredChats.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3.5 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
          <ShieldCheck className="w-7 h-7 text-emerald-400" />
        </div>
        <h4 className="text-sm font-semibold text-slate-200 mb-1">
          {searchQuery
            ? 'No matches found'
            : activeFilter === 'groups'
            ? 'No encrypted groups'
            : activeFilter === 'direct'
            ? 'No direct secure chats'
            : 'No conversations yet'}
        </h4>
        <p className="text-xs text-slate-400 max-w-xs mb-5 leading-relaxed">
          {searchQuery
            ? 'Try searching with a different username or key.'
            : 'Start a quantum-resistant end-to-end encrypted session with any registered peer.'}
        </p>
        <button
          type="button"
          onClick={toggleNewChatModal}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all active:scale-95"
        >
          <MessageSquarePlus className="w-4 h-4 text-emerald-400" />
          <span>Start Secure Chat</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-emerald-500/5 custom-scrollbar">
      {filteredChats.map((chat) => (
        <ChatListItem
          key={chat._id}
          chat={chat}
          currentUserId={user?._id}
          isActive={activeChat?._id === chat._id}
          onClick={() => handleSelectChat(chat)}
        />
      ))}
    </div>
  );
};

export default ChatList;
