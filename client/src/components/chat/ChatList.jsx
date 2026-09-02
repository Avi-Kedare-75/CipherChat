import React from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { ChatListItem } from './ChatListItem';
import { MessageSquarePlus, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '../common/Button';

export const ChatList = () => {
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

  // Filter chats if user typed in the search bar
  const filteredChats = chats.filter((chat) => {
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
      <div className="flex-1 flex flex-col items-center justify-center text-dark-textMuted gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-cipher-500" />
        <span className="text-xs">Loading secure chats...</span>
      </div>
    );
  }

  if (filteredChats.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-dark-panel flex items-center justify-center mb-3">
          <ShieldCheck className="w-6 h-6 text-cipher-400" />
        </div>
        <h4 className="text-sm font-semibold text-dark-textPrimary mb-1">
          {searchQuery ? 'No chats match your search' : 'No conversations yet'}
        </h4>
        <p className="text-xs text-dark-textMuted max-w-xs mb-4">
          {searchQuery
            ? 'Try searching with a different name or start a new chat.'
            : 'Start a direct end-to-end encrypted conversation with any user in the directory.'}
        </p>
        <Button
          size="sm"
          variant="outline"
          icon={MessageSquarePlus}
          onClick={toggleNewChatModal}
        >
          <span>Start New Chat</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-dark-border/20">
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
