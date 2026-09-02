import React, { useState } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import { ChatHeader } from './ChatHeader';
import { EncryptionNotice } from '../encryption/EncryptionNotice';
import {
  ShieldCheck,
  Lock,
  Smile,
  Paperclip,
  Mic,
  Send,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ChatWindow = () => {
  const { user } = useAuthStore();
  const { activeChat, selectedContact } = useChatStore();
  const [inputText, setInputText] = useState('');

  // Determine current active conversation partner
  const isGroup = activeChat?.chatType === 'group';
  const otherContact =
    selectedContact ||
    (!isGroup && activeChat?.participants
      ? activeChat.participants.find((p) => p._id !== user?._id) || activeChat.participants[0]
      : null);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    toast('Real-time Socket.IO messaging is being connected in Phase 2!', {
      icon: '🚀',
      style: {
        background: '#202c33',
        color: '#e9edef',
        border: '1px solid #10b981',
      },
    });
    setInputText('');
  };

  // Empty state: WhatsApp Web style welcome screen
  if (!activeChat && !selectedContact) {
    return (
      <div className="flex-1 h-full bg-dark-bg chat-pattern-bg flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden border-b-8 border-b-cipher-500">
        <div className="max-w-md flex flex-col items-center animate-fade-in">
          {/* Central Logo */}
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-cipher-600 via-emerald-500 to-teal-400 p-0.5 shadow-glow-lg animate-pulse-subtle">
              <div className="w-full h-full bg-dark-sidebar rounded-3xl flex items-center justify-center">
                <ShieldCheck className="w-12 h-12 text-cipher-400" />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 p-2 bg-dark-panel rounded-full ring-4 ring-dark-bg border border-cipher-500/30">
              <Lock className="w-4 h-4 text-cipher-400" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-dark-textPrimary mb-2">
            CipherChat for Web
          </h2>
          <p className="text-xs sm:text-sm text-dark-textMuted leading-relaxed mb-8">
            Send and receive end-to-end encrypted messages and share up to 50MB files without phone synchronization.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
            <div className="p-3.5 rounded-xl bg-dark-panel/60 border border-white/5 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-cipher-500/10 text-cipher-400 flex-shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-dark-textPrimary">Signal Protocol</h4>
                <p className="text-[11px] text-dark-textMuted mt-0.5">
                  Forward secrecy with Double Ratchet key agreement
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-dark-panel/60 border border-white/5 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-dark-textPrimary">50MB Files</h4>
                <p className="text-[11px] text-dark-textMuted mt-0.5">
                  Client-side encrypted uploads & media streaming
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex items-center gap-1.5 text-xs text-dark-textMuted/60">
            <Lock className="w-3 h-3 text-cipher-500" />
            <span>End-to-end encrypted · Zero knowledge architecture</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col bg-dark-bg chat-pattern-bg relative">
      {/* Active Chat Header */}
      <ChatHeader
        contact={otherContact}
        isGroup={isGroup}
        groupInfo={activeChat}
      />

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col justify-between">
        {/* Top Encryption Banner */}
        <div className="flex justify-center pt-2">
          <EncryptionNotice />
        </div>

        {/* Phase 1 Preview Placeholder */}
        <div className="my-auto py-8 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-dark-panel/80 flex items-center justify-center mb-3 text-cipher-400">
            <MessageSquare className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-dark-textPrimary">
            Encrypted Channel Established with {otherContact?.fullName || otherContact?.username}
          </p>
          <p className="text-xs text-dark-textMuted mt-1 max-w-sm">
            Phase 1 UI shell is fully active. Live Socket.IO message streaming will be enabled in Phase 2.
          </p>
        </div>
      </div>

      {/* Message Input Bar */}
      <div className="p-3 bg-dark-panel border-t border-dark-border flex items-center gap-2">
        <button
          type="button"
          className="p-2 text-dark-textMuted hover:text-dark-textPrimary hover:bg-white/5 rounded-xl transition-colors"
          title="Emojis"
        >
          <Smile className="w-5 h-5" />
        </button>

        <button
          type="button"
          className="p-2 text-dark-textMuted hover:text-dark-textPrimary hover:bg-white/5 rounded-xl transition-colors"
          title="Attach file (50MB max)"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type an encrypted message..."
            className="w-full bg-dark-input border border-transparent hover:border-white/5 focus:border-cipher-500 rounded-xl px-4 py-2.5 text-sm text-dark-textPrimary placeholder:text-dark-textMuted/60 focus:outline-none focus:ring-1 focus:ring-cipher-500/40"
          />

          {inputText.trim() ? (
            <button
              type="submit"
              className="p-2.5 bg-cipher-500 hover:bg-cipher-600 text-white rounded-xl shadow-glow transition-all active:scale-95 flex items-center justify-center"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              className="p-2.5 text-dark-textMuted hover:text-dark-textPrimary hover:bg-white/5 rounded-xl transition-colors"
              title="Record voice message"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
