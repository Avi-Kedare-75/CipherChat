import React from 'react';
import { cn } from '../../utils/cn';
import { Avatar } from '../common/Avatar';
import { formatChatTimestamp } from '../../utils/formatters';
import { Check, CheckCheck, Lock } from 'lucide-react';

export const ChatListItem = ({
  chat,
  isActive = false,
  onClick,
  currentUserId,
}) => {
  const isGroup = chat.chatType === 'group';

  // For 1-on-1 chats, identify the other contact
  const otherParticipant =
    !isGroup && chat.participants
      ? chat.participants.find((p) => p._id !== currentUserId) || chat.participants[0]
      : null;

  const title = isGroup ? chat.groupName : otherParticipant?.fullName || 'Encrypted Contact';
  const avatar = isGroup ? chat.groupAvatar : otherParticipant?.avatar;
  const isOnline = !isGroup && otherParticipant?.isOnline;
  const lastMessage = chat.lastMessage;
  const unreadCount = chat.unreadCount || 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full px-3 py-3 flex items-center gap-3 transition-colors border-b border-dark-border/40 hover:bg-dark-panel/80 text-left group relative',
        isActive && 'bg-dark-panel/90 border-l-4 border-l-cipher-500'
      )}
    >
      <Avatar
        src={avatar}
        name={title}
        size="md"
        showStatus={!isGroup}
        isOnline={isOnline}
      />

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {/* Top Row: Name + Timestamp */}
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span
            className={cn(
              'text-sm font-semibold truncate text-dark-textPrimary group-hover:text-cipher-400 transition-colors',
              isActive && 'text-cipher-400 font-bold'
            )}
          >
            {title}
          </span>
          {lastMessage?.createdAt && (
            <span className="text-[11px] text-dark-textMuted flex-shrink-0">
              {formatChatTimestamp(lastMessage.createdAt)}
            </span>
          )}
        </div>

        {/* Bottom Row: Message preview + Unread badge */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 text-xs text-dark-textMuted truncate">
            {/* Status ticks for own messages */}
            {lastMessage?.sender === currentUserId && (
              <span className="flex-shrink-0">
                {lastMessage?.status === 'read' ? (
                  <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
                ) : lastMessage?.status === 'delivered' ? (
                  <CheckCheck className="w-3.5 h-3.5 text-dark-textMuted" />
                ) : (
                  <Check className="w-3.5 h-3.5 text-dark-textMuted" />
                )}
              </span>
            )}
            <span className="truncate">
              {lastMessage?.content || (
                <span className="italic flex items-center gap-1 text-[11px] text-dark-textMuted/70">
                  <Lock className="w-2.5 h-2.5 text-cipher-500" /> Encrypted conversation
                </span>
              )}
            </span>
          </div>

          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-cipher-500 text-white text-[10px] font-bold min-w-[18px] text-center shadow-glow">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default ChatListItem;
