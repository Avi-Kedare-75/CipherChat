import React, { useState } from 'react';
import { Avatar } from '../common/Avatar';
import { useUIStore } from '../../store/useUIStore';
import { useChatStore } from '../../store/useChatStore';
import { SecurityCodeModal } from '../encryption/SecurityCodeModal';
import { formatLastSeen } from '../../utils/formatters';
import {
  ArrowLeft,
  Lock,
  Search,
  MoreVertical,
  ShieldCheck,
  Users,
  X,
  Info,
  KeyRound,
} from 'lucide-react';

export const ChatHeader = ({ contact, isGroup = false, groupInfo }) => {
  const { setShowMobileChat } = useUIStore();
  const {
    isChatSearching,
    setIsChatSearching,
    chatSearchQuery,
    setChatSearchQuery,
    setIsGroupInfoOpen,
  } = useChatStore();

  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  const title = isGroup ? groupInfo?.groupName : contact?.fullName || contact?.username;
  const avatar = isGroup ? groupInfo?.groupAvatar : contact?.avatar;
  const isOnline = !isGroup && contact?.isOnline;
  const statusText = isGroup
    ? `${groupInfo?.participants?.length || 0} members · Click for group info`
    : isOnline
    ? 'online'
    : contact?.lastSeen
    ? formatLastSeen(contact.lastSeen)
    : 'offline';

  const handleHeaderClick = () => {
    if (isGroup) {
      setIsGroupInfoOpen(true);
    }
  };

  return (
    <>
      <div className="h-16 px-4 bg-dark-panel border-b border-dark-border flex items-center justify-between flex-shrink-0 z-10 relative">
        {/* Contact Info & Back Button */}
        <div
          onClick={handleHeaderClick}
          className={`flex items-center gap-3 min-w-0 ${
            isGroup ? 'cursor-pointer hover:opacity-90' : ''
          }`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMobileChat(false);
            }}
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
              <ShieldCheck
                className="w-3.5 h-3.5 text-cipher-400 flex-shrink-0"
                title="E2EE Verified"
              />
            </div>
            <span className="text-[11px] text-dark-textMuted truncate">
              {statusText}
            </span>
          </div>
        </div>

        {/* In-Chat Search Input if Active */}
        {isChatSearching && (
          <div className="flex-1 max-w-xs mx-4 flex items-center gap-1 bg-dark-input border border-cipher-500/50 rounded-xl px-3 py-1 animate-fade-in">
            <Search className="w-3.5 h-3.5 text-cipher-400" />
            <input
              type="text"
              value={chatSearchQuery}
              onChange={(e) => setChatSearchQuery(e.target.value)}
              placeholder="Find in chat..."
              className="w-full bg-transparent text-xs text-dark-textPrimary focus:outline-none placeholder:text-dark-textMuted/50"
              autoFocus
            />
            <button
              type="button"
              onClick={() => {
                setIsChatSearching(false);
                setChatSearchQuery('');
              }}
              className="text-dark-textMuted hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Action Icons */}
        <div className="flex items-center gap-1 text-dark-textMuted">
          {/* Clickable E2EE Pill */}
          <button
            type="button"
            onClick={() => setShowSecurityModal(true)}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-cipher-500/10 hover:bg-cipher-500/20 border border-cipher-500/20 text-cipher-400 text-xs font-medium mr-2 transition-colors cursor-pointer"
            title="Verify 60-digit E2EE Security Code"
          >
            <Lock className="w-3 h-3" />
            <span>E2EE Active</span>
          </button>

          <button
            type="button"
            onClick={() => setIsChatSearching(!isChatSearching)}
            className={`p-2.5 rounded-xl transition-colors ${
              isChatSearching
                ? 'bg-cipher-500/20 text-cipher-300'
                : 'hover:bg-white/5 hover:text-dark-textPrimary'
            }`}
            title="Search in chat"
          >
            <Search className="w-4 h-4" />
          </button>

          {isGroup && (
            <button
              type="button"
              onClick={() => setIsGroupInfoOpen(true)}
              className="p-2.5 rounded-xl hover:bg-white/5 hover:text-dark-textPrimary transition-colors"
              title="Group Info"
            >
              <Info className="w-4 h-4" />
            </button>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="p-2.5 rounded-xl hover:bg-white/5 hover:text-dark-textPrimary transition-colors"
              title="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showOptionsMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-dark-sidebar border border-white/10 rounded-xl py-1 shadow-2xl z-50 animate-fade-in text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setShowSecurityModal(true);
                    setShowOptionsMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-white/5 text-dark-textPrimary flex items-center gap-2"
                >
                  <KeyRound className="w-3.5 h-3.5 text-cipher-400" />
                  <span>Verify Security Code</span>
                </button>

                {isGroup && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsGroupInfoOpen(true);
                      setShowOptionsMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-white/5 text-dark-textPrimary flex items-center gap-2"
                  >
                    <Users className="w-3.5 h-3.5 text-cipher-400" />
                    <span>Group Info</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsChatSearching(true);
                    setShowOptionsMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-white/5 text-dark-textPrimary flex items-center gap-2"
                >
                  <Search className="w-3.5 h-3.5 text-cipher-400" />
                  <span>Search Messages</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Security Verification Modal */}
      <SecurityCodeModal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
        contact={contact}
      />
    </>
  );
};

export default ChatHeader;
