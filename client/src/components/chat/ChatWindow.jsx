import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useSocketStore } from '../../store/useSocketStore';
import { useUIStore } from '../../store/useUIStore';
import { ChatHeader } from './ChatHeader';
import { EncryptionNotice } from '../encryption/EncryptionNotice';
import { MessageBubble } from './MessageBubble';
import { GroupInfoModal } from './GroupInfoModal';
import { FilePreviewModal } from './FilePreviewModal';
import { VoiceRecorder } from './VoiceRecorder';
import {
  ShieldCheck,
  Lock,
  Smile,
  Paperclip,
  Mic,
  Send,
  Sparkles,
  X,
  Reply,
  MessageSquarePlus,
  Users,
  KeyRound,
  Zap,
} from 'lucide-react';
import { encryptText } from '../../utils/crypto';
import toast from 'react-hot-toast';

const COMMON_EMOJIS = ['😀', '🔥', '⚡', '🔐', '👍', '🚀', '😎', '🎉', '💯', '✨'];

export const ChatWindow = () => {
  const { user } = useAuthStore();
  const {
    activeChat,
    selectedContact,
    messages,
    fetchMessages,
    sendMessage,
    replyingTo,
    clearReplyingTo,
  } = useChatStore();
  const { toggleNewChatModal, toggleCreateGroupModal } = useUIStore();
  const { socket } = useSocketStore();

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const activeMessages = activeChat ? messages[activeChat._id] || [] : [];

  // Determine current active conversation partner
  const isGroup = activeChat?.chatType === 'group';
  const otherContact =
    selectedContact ||
    (!isGroup && activeChat?.participants
      ? activeChat.participants.find((p) => p._id !== user?._id) || activeChat.participants[0]
      : null);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat._id);
      socket?.emit('join chat', activeChat._id);
    }
  }, [activeChat?._id]);

  useEffect(() => {
    setIsOtherTyping(false);
    if (!socket) return;

    const handleTyping = (room) => {
      if (activeChat && activeChat._id === room) setIsOtherTyping(true);
    };

    const handleStopTyping = (room) => {
      if (activeChat && activeChat._id === room) setIsOtherTyping(false);
    };

    socket.on('typing', handleTyping);
    socket.on('stop typing', handleStopTyping);

    return () => {
      socket.off('typing', handleTyping);
      socket.off('stop typing', handleStopTyping);
    };
  }, [socket, activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages, isOtherTyping]);

  const handleTypingChange = (e) => {
    setInputText(e.target.value);

    if (!socket || !activeChat) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', activeChat._id);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop typing', activeChat._id);
      setIsTyping(false);
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat) return;

    socket?.emit('stop typing', activeChat._id);
    setIsTyping(false);
    const textToSend = inputText;
    setInputText('');

    try {
      const encryptedContent = await encryptText(textToSend, activeChat._id);
      const newMsg = await sendMessage(activeChat._id, {
        content: encryptedContent,
        replyTo: replyingTo?._id,
      });
      socket?.emit('new message', newMsg);
    } catch (error) {
      toast.error('Failed to send message');
      setInputText(textToSend); // Revert on fail
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size exceeds the 50MB limit');
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
    e.target.value = '';
  };

  const addEmoji = (emoji) => {
    setInputText((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Distinct Cyber-Obsidian Empty State
  if (!activeChat && !selectedContact) {
    return (
      <div className="flex-1 h-full bg-[#05080c] cyber-grid-bg flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-lg flex flex-col items-center animate-fade-in relative z-10">
          {/* Central Holographic Emblem */}
          <div className="relative mb-7 group">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 p-0.5 shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-transform duration-500 group-hover:scale-105">
              <div className="w-full h-full bg-[#090e15] rounded-3xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent" />
                <ShieldCheck className="w-12 h-12 text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 p-2 bg-[#090e15] rounded-full border border-emerald-500/40 shadow-lg">
              <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>CIPHER PROTOCOL ACTIVE</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
            Encrypted Workspace
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-8 max-w-md">
            Select an existing encrypted channel from the sidebar or start a new peer-to-peer session with zero metadata leakage.
          </p>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8 w-full">
            <button
              type="button"
              onClick={toggleNewChatModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-semibold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-95"
            >
              <MessageSquarePlus className="w-4 h-4 text-slate-950" />
              <span>New Encrypted Chat</span>
            </button>
            <button
              type="button"
              onClick={toggleCreateGroupModal}
              className="px-4 py-2.5 rounded-xl bg-[#0d141f] hover:bg-[#121c2b] text-slate-200 border border-emerald-500/20 hover:border-emerald-500/40 font-medium text-xs flex items-center gap-2 transition-all active:scale-95"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Create Group</span>
            </button>
          </div>

          {/* Feature Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
            <div className="p-3.5 rounded-2xl bg-[#090f17]/80 border border-emerald-500/10 backdrop-blur-md flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 flex-shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200">AES-256-GCM</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Client-side authenticated encryption on all messages & audio
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#090f17]/80 border border-emerald-500/10 backdrop-blur-md flex items-start gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200">50MB Direct Uploads</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Stream high-fidelity voice notes and encrypted binary attachments
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col bg-[#05080c] cyber-grid-bg relative">
      {/* Active Chat Header */}
      <ChatHeader
        contact={otherContact}
        isGroup={isGroup}
        groupInfo={activeChat}
      />

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 flex flex-col custom-scrollbar">
        <div className="flex justify-center pt-1 pb-4">
          <EncryptionNotice />
        </div>

        {activeMessages.map((msg, index) => {
          const nextMsg = activeMessages[index + 1];
          const isNextSameSender =
            nextMsg &&
            (nextMsg.sender?._id || nextMsg.sender) === (msg.sender?._id || msg.sender);
          return (
            <MessageBubble
              key={msg._id}
              message={msg}
              isNextMessageSameSender={isNextSameSender}
            />
          );
        })}

        {isOtherTyping && (
          <div className="flex justify-start mb-3 animate-fade-in">
            <div className="bg-[#0c131d] border border-emerald-500/20 px-4 py-2.5 rounded-2xl rounded-tl-none shadow-lg">
              <div className="flex gap-1.5 items-center h-4">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Replying Banner */}
      {replyingTo && (
        <div className="px-4 py-2 bg-[#090f17] border-t border-emerald-500/20 flex items-center justify-between animate-slide-up">
          <div className="flex items-center gap-2.5 truncate">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Reply className="w-3.5 h-3.5" />
            </div>
            <div className="truncate text-xs text-left">
              <span className="font-semibold text-emerald-400">
                Replying to {replyingTo.sender?.fullName || 'User'}:
              </span>
              <p className="text-slate-400 truncate text-[11px]">
                {replyingTo.content || (replyingTo.fileUrl ? '📎 Attachment' : 'Message')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={clearReplyingTo}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Message Input Bar */}
      <div className="p-3 bg-[#080c12]/95 border-t border-emerald-500/10 backdrop-blur-md flex items-center gap-2 relative z-10">
        {isRecordingVoice ? (
          <VoiceRecorder onCancel={() => setIsRecordingVoice(false)} />
        ) : (
          <>
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Emoji Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all"
                title="Emojis"
              >
                <Smile className="w-5 h-5" />
              </button>

              {showEmojiPicker && (
                <div className="absolute bottom-full mb-2 left-0 bg-[#0c131d] border border-emerald-500/20 rounded-2xl p-2 shadow-2xl flex gap-1 z-50 animate-fade-in backdrop-blur-lg">
                  {COMMON_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => addEmoji(emoji)}
                      className="p-2 hover:bg-emerald-500/20 rounded-xl text-lg hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* File Attachment Trigger */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-all"
              title="Attach file (50MB max)"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  value={inputText}
                  onChange={handleTypingChange}
                  placeholder="Type an encrypted message..."
                  className="w-full bg-[#0e1622] border border-emerald-500/15 hover:border-emerald-500/30 focus:border-emerald-500/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
                />
              </div>

              {inputText.trim() ? (
                <button
                  type="submit"
                  className="p-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all active:scale-95 flex items-center justify-center flex-shrink-0"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsRecordingVoice(true)}
                  className="p-2.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all flex-shrink-0"
                  title="Record voice message"
                >
                  <Mic className="w-5 h-5" />
                </button>
              )}
            </form>
          </>
        )}
      </div>

      {/* Modals */}
      <GroupInfoModal />
      <FilePreviewModal
        file={selectedFile}
        isOpen={!!selectedFile}
        onClose={() => setSelectedFile(null)}
      />
    </div>
  );
};

export default ChatWindow;
