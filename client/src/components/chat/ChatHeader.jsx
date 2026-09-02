import React from 'react';
import { Avatar } from '../common/Avatar';
import { useUIStore } from '../../store/useUIStore';
import { formatLastSeen } from '../../utils/formatters';
import {
  ArrowLeft,
  Lock,
  Search,
  MoreVertical,
  ShieldCheck,
} from 'lucide-react';

export const ChatHeader = ({ contact, isGroup = false, groupInfo }) => {
  const { setShowMobileChat } = useUIStore();

  const title = isGroup ? groupInfo?.groupName : contact?.fullName || contact?.username;
  const avatar = isGroup ? groupInfo?.groupAvatar : contact?.avatar;
  const isOnline = !isGroup && contact?.isOnline;
  const statusText = isGroup
    ? `${groupInfo?.participants?.length || 0} members`
    : isOnline
    ? 'online'
    : contact?.lastSeen
    ? formatLastSeen(contact.lastSeen)
    : 'offline';

  return (
    <div className="h-16 px-4 bg-dark-panel border-b border-dark-border flex items-center justify-between flex-shrink-0 z-10">
      {/* Contact Info & Back Button */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setShowMobileChat(false)}
          className="md:hidden p-1.5 -ml-1 text-dark-textMuted hover:text-dark-textPrimary hover:bg-white/5 rounded-lg transition-colors"
          title="Back to chats"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <Avatar
          src={avatar}
          name={title}
          size="md"
          showStatus={!isGroup}
          isOnline={isOnline}
        />

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold text-dark-textPrimary truncate">
              {title}
            </h3>
            <ShieldCheck className="w-3.5 h-3.5 text-cipher-400 flex-shrink-0" title="E2EE Verified" />
          </div>
          <span className="text-[11px] text-dark-textMuted truncate">
            {statusText}
          </span>
        </div>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-1 text-dark-textMuted">
        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-cipher-500/10 border border-cipher-500/20 text-cipher-400 text-xs font-medium mr-2">
          <Lock className="w-3 h-3" />
          <span>E2EE Active</span>
        </div>

        <button
          className="p-2.5 rounded-xl hover:bg-white/5 hover:text-dark-textPrimary transition-colors"
          title="Search in chat"
        >
          <Search className="w-4 h-4" />
        </button>
        <button
          className="p-2.5 rounded-xl hover:bg-white/5 hover:text-dark-textPrimary transition-colors"
          title="More options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
