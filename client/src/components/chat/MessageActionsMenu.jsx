import React, { useState } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useSocketStore } from '../../store/useSocketStore';
import { Smile, Reply, Trash2, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

export const MessageActionsMenu = ({ message, isOwnMessage }) => {
  const { setReplyingTo, reactToMessage, deleteMessage } = useChatStore();
  const { socket } = useSocketStore();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);

  const handleReact = async (emoji) => {
    setShowEmojiPicker(false);
    try {
      const updated = await reactToMessage(message._id, emoji);
      socket?.emit('message reaction', updated);
    } catch (error) {
      toast.error('Failed to react');
    }
  };

  const handleReply = () => {
    setReplyingTo(message);
  };

  const handleDelete = async (forEveryone = true) => {
    setShowDeleteMenu(false);
    try {
      const updated = await deleteMessage(message._id, forEveryone);
      socket?.emit('message deleted', updated);
      toast.success(forEveryone ? 'Message deleted for everyone' : 'Message deleted for you');
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  if (message.isDeleted) return null;

  return (
    <div className="relative inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-dark-panel/90 backdrop-blur-sm border border-white/10 rounded-full px-1.5 py-0.5 shadow-lg">
      {/* Quick Reaction Bar Trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-1 text-dark-textMuted hover:text-amber-400 hover:bg-white/10 rounded-full transition-colors"
          title="React with Emoji"
        >
          <Smile className="w-3.5 h-3.5" />
        </button>

        {/* Floating Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-full mb-1 left-0 z-50 bg-dark-panel border border-white/10 rounded-2xl p-1.5 flex items-center gap-1 shadow-2xl animate-fade-in">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleReact(emoji)}
                className="hover:scale-125 transform transition-transform text-lg p-1 rounded-lg hover:bg-white/10"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reply Trigger */}
      <button
        type="button"
        onClick={handleReply}
        className="p-1 text-dark-textMuted hover:text-cipher-400 hover:bg-white/10 rounded-full transition-colors"
        title="Reply"
      >
        <Reply className="w-3.5 h-3.5" />
      </button>

      {/* Delete Trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowDeleteMenu(!showDeleteMenu)}
          className="p-1 text-dark-textMuted hover:text-rose-400 hover:bg-white/10 rounded-full transition-colors"
          title="Delete Message"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Delete Options Menu */}
        {showDeleteMenu && (
          <div className="absolute bottom-full mb-1 right-0 z-50 bg-dark-sidebar border border-white/10 rounded-xl py-1 shadow-2xl w-40 animate-fade-in text-xs">
            {isOwnMessage && (
              <button
                type="button"
                onClick={() => handleDelete(true)}
                className="w-full text-left px-3 py-1.5 hover:bg-rose-500/20 text-rose-400 transition-colors"
              >
                Delete for everyone
              </button>
            )}
            <button
              type="button"
              onClick={() => handleDelete(false)}
              className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-dark-textPrimary transition-colors"
            >
              Delete for me
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageActionsMenu;
