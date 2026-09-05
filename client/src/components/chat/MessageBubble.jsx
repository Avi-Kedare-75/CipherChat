import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';
import { decryptText } from '../../utils/crypto';
import { MessageActionsMenu } from './MessageActionsMenu';
import { CustomAudioPlayer } from './CustomAudioPlayer';
import clsx from 'clsx';
import {
  Check,
  CheckCheck,
  FileText,
  Download,
  Ban,
  Lock,
  Sparkles,
} from 'lucide-react';

const API_ORIGIN =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
    : 'http://localhost:5000');

export const MessageBubble = ({ message, isNextMessageSameSender }) => {
  const { user } = useAuthStore();
  const { chatSearchQuery } = useChatStore();

  const [decryptedText, setDecryptedText] = useState(message.content || '');
  const [isEncrypted, setIsEncrypted] = useState(
    typeof message.content === 'string' && message.content.startsWith('enc:')
  );

  const chatId = typeof message.chatId === 'object' ? message.chatId._id : message.chatId;
  const isOwnMessage =
    (message.sender?._id || message.sender) === user?._id;

  useEffect(() => {
    if (message.content && typeof message.content === 'string' && message.content.startsWith('enc:')) {
      setIsEncrypted(true);
      decryptText(message.content, chatId).then((plain) => {
        setDecryptedText(plain);
      });
    } else {
      setDecryptedText(message.content || '');
    }
  }, [message.content, chatId]);

  const getStatusIcon = () => {
    if (!isOwnMessage) return null;

    if (message.status === 'sent') {
      return <Check className="w-3.5 h-3.5 text-emerald-200/70" />;
    }
    if (message.status === 'delivered') {
      return <CheckCheck className="w-3.5 h-3.5 text-emerald-200/70" />;
    }
    if (message.status === 'read') {
      return <CheckCheck className="w-3.5 h-3.5 text-cyan-300 drop-shadow-[0_0_6px_rgba(103,232,249,0.8)]" />;
    }
    return <Check className="w-3.5 h-3.5 text-emerald-200/70" />;
  };

  const getFileUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) return url;
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${API_ORIGIN}${cleanUrl}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Highlight search keywords
  const renderContent = (text) => {
    if (!text) return null;
    if (!chatSearchQuery || !chatSearchQuery.trim()) {
      return <span>{text}</span>;
    }

    const regex = new RegExp(`(${chatSearchQuery.trim()})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-amber-400/40 text-amber-200 rounded px-0.5">
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  // Group reactions by emoji
  const reactionCounts = (message.reactions || []).reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

  return (
    <div
      className={clsx(
        'flex w-full group items-center gap-2',
        isOwnMessage ? 'justify-end flex-row' : 'justify-start flex-row-reverse'
      )}
    >
      {/* Action Menu (Visible on hover) */}
      {!message.isDeleted && (
        <MessageActionsMenu message={message} isOwnMessage={isOwnMessage} />
      )}

      {/* Bubble Container */}
      <div
        className={clsx(
          'relative max-w-[85%] sm:max-w-[75%] md:max-w-[65%] rounded-2xl text-[14.5px] transition-all',
          isOwnMessage
            ? 'bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-[#f0fdf4] rounded-tr-none shadow-[0_4px_20px_-4px_rgba(5,150,105,0.3)] border border-emerald-500/30'
            : 'bg-[#131b26]/95 text-[#e2e8f0] rounded-tl-none border border-white/10 shadow-lg',
          isNextMessageSameSender ? 'mb-1' : 'mb-3.5'
        )}
      >
        {/* Sender Name for Group Chats */}
        {!isOwnMessage && message.sender?.fullName && (
          <div className="px-3.5 pt-2 text-xs font-semibold text-emerald-400 flex items-center gap-1">
            <span>{message.sender.fullName}</span>
          </div>
        )}

        {/* Replying To Quote Preview */}
        {message.replyTo && (
          <div className="mx-2.5 mt-2 p-2 bg-black/30 border-l-4 border-emerald-400 rounded-r-xl text-xs backdrop-blur-sm">
            <div className="font-semibold text-emerald-300">
              {message.replyTo.sender?.fullName || 'User'}
            </div>
            <p className="text-dark-textMuted line-clamp-1">
              {message.replyTo.content?.startsWith('enc:')
                ? '🔐 Encrypted Message'
                : message.replyTo.content || (message.replyTo.fileUrl ? '📎 Attachment' : 'Message')}
            </p>
          </div>
        )}

        {/* Deleted Message State */}
        {message.isDeleted ? (
          <div className="px-4 py-2.5 text-xs italic text-dark-textMuted flex items-center gap-1.5">
            <Ban className="w-3.5 h-3.5 text-dark-textMuted" />
            <span>This message was deleted</span>
          </div>
        ) : (
          <div className="px-3.5 py-2">
            {/* Media: Image */}
            {message.messageType === 'image' && message.fileUrl && (
              <div className="my-1 rounded-xl overflow-hidden border border-white/10 shadow-md">
                <a
                  href={getFileUrl(message.fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={getFileUrl(message.fileUrl)}
                    alt="Shared image"
                    className="max-h-72 w-full object-cover hover:scale-[1.01] transition-transform"
                    loading="lazy"
                  />
                </a>
              </div>
            )}

            {/* Media: Video */}
            {message.messageType === 'video' && message.fileUrl && (
              <div className="my-1 rounded-xl overflow-hidden border border-white/10 shadow-md">
                <video
                  src={getFileUrl(message.fileUrl)}
                  controls
                  className="max-h-72 w-full rounded-xl"
                />
              </div>
            )}

            {/* Media: Voice Note / Audio (Custom Cyber-Player) */}
            {(message.messageType === 'voice' || message.messageType === 'audio') &&
              message.fileUrl && (
                <div className="my-1 p-2 bg-black/30 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <CustomAudioPlayer
                    src={getFileUrl(message.fileUrl)}
                    duration={message.fileMetadata?.duration || 0}
                    isVoice={message.messageType === 'voice'}
                  />
                </div>
              )}

            {/* Media: Document File */}
            {message.messageType === 'file' && message.fileUrl && (
              <div className="my-1 p-3 bg-black/30 rounded-xl flex items-center justify-between gap-3 border border-white/10">
                <div className="flex items-center gap-2.5 truncate">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate text-left">
                    <div className="text-xs font-semibold text-dark-textPrimary truncate">
                      {message.fileMetadata?.originalName || 'Shared Document'}
                    </div>
                    <div className="text-[10px] text-dark-textMuted">
                      {formatFileSize(message.fileMetadata?.size)}
                    </div>
                  </div>
                </div>

                <a
                  href={getFileUrl(message.fileUrl)}
                  download={message.fileMetadata?.originalName || 'file'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-300 transition-colors flex-shrink-0"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* Text Content */}
            {decryptedText && (
              <div className="whitespace-pre-wrap break-words pr-2 leading-relaxed">
                {renderContent(decryptedText)}
              </div>
            )}

            {/* Timestamp & Status Icon & E2EE Padlock */}
            <div className="float-right -mb-0.5 mt-1 ml-3 flex items-center gap-1 opacity-80 select-none">
              {isEncrypted && (
                <Lock
                  className="w-2.5 h-2.5 text-emerald-300/80"
                  title="256-bit AES-GCM Encrypted"
                />
              )}
              <span className="text-[10px] text-dark-textMuted/90">
                {format(new Date(message.createdAt || new Date()), 'HH:mm')}
              </span>
              {getStatusIcon()}
            </div>
          </div>
        )}

        {/* Reaction Chips */}
        {Object.keys(reactionCounts).length > 0 && (
          <div className="absolute -bottom-2.5 right-2 flex gap-1 z-10">
            {Object.entries(reactionCounts).map(([emoji, count]) => (
              <span
                key={emoji}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1b2533] border border-white/15 text-[11px] shadow-lg select-none"
              >
                <span>{emoji}</span>
                {count > 1 && <span className="text-[9px] text-dark-textMuted">{count}</span>}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
