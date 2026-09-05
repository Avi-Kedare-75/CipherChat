import React from 'react';
import { cn } from '../../utils/cn';
import { Avatar } from '../common/Avatar';
import { formatChatTimestamp } from '../../utils/formatters';
import { Check, CheckCheck, Lock, Users, Sparkles } from 'lucide-react';

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
        'w-full px-3.5 py-3 mx-auto flex items-center gap-3.5 transition-all text-left group relative border-b border-white/[0.04]',
        isActive
          ? 'bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border-l-4 border-l-emerald-400'
          : 'hover:bg-white/[0.04]'
      )}
    >
      <div className="relative flex-shrink-0">
        <Avatar
          src={avatar}
          name={title}
          size="md"
          showStatus={!isGroup}
          isOnline={isOnline}
          className={cn(
            'transition-transform group-hover:scale-105',
            isActive ? 'ring-2 ring-emerald-400/50 shadow-neon' : ''
          )}
        />
        {isGroup && (
          <span className="absolute -bottom-1 -right-1 p-0.5 bg-[#121b28] rounded-full border border-white/10 text-emerald-400">
            <Users className="w-2.5 h-2.5" />
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {/* Top Row: Name + Timestamp */}
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span
            className={cn(
              'text-sm font-semibold truncate transition-colors',
              isActive ? 'text-emerald-400 font-bold' : 'text-slate-200 group-hover:text-emerald-300'
            )}
          >
            {title}
          </span>
          {lastMessage?.createdAt && (
            <span className="text-[11px] font-mono text-slate-400/80 flex-shrink-0">
              {formatChatTimestamp(lastMessage.createdAt)}
            </span>
          )}
        </div>

        {/* Bottom Row: Message preview + Unread badge */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate">
            {/* Status ticks for own messages */}
            {lastMessage?.sender === currentUserId && (
              <span className="flex-shrink-0">
                {lastMessage?.status === 'read' ? (
                  <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />
                ) : lastMessage?.status === 'delivered' ? (
                  <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <Check className="w-3.5 h-3.5 text-slate-400" />
                )}
              </span>
            )}
            <span className="truncate">
              {lastMessage?.content ? (
                lastMessage.content.startsWith('enc:') ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400/80 font-mono text-[11px]">
                    <Lock className="w-2.5 h-2.5" /> 256-bit Encrypted
                  </span>
                ) : (
                  lastMessage.content
                )
              ) : (
                <span className="italic flex items-center gap-1 text-[11px] text-slate-500">
                  <Lock className="w-2.5 h-2.5 text-emerald-500/70" /> End-to-end encrypted
                </span>
              )}
            </span>
          </div>

          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-dark-bg text-[10px] font-bold min-w-[18px] text-center shadow-neon">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default ChatListItem;
