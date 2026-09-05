import React, { useState } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useSocketStore } from '../../store/useSocketStore';
import { messageService } from '../../services/messageService';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  File,
  Send,
  Loader2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const FilePreviewModal = ({ file, isOpen, onClose }) => {
  const { activeChat, sendMessage, replyingTo } = useChatStore();
  const { socket } = useSocketStore();

  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  if (!file) return null;

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const isAudio = file.type.startsWith('audio/');

  const getMessageType = () => {
    if (isImage) return 'image';
    if (isVideo) return 'video';
    if (isAudio) return 'audio';
    return 'file';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!activeChat) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size exceeds the 50MB limit');
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await messageService.uploadFile(formData);

      const newMsg = await sendMessage(activeChat._id, {
        content: caption.trim(),
        messageType: getMessageType(),
        fileUrl: uploadRes.fileUrl,
        fileMetadata: uploadRes.fileMetadata,
        replyTo: replyingTo?._id,
      });

      socket?.emit('new message', newMsg);
      toast.success('File sent successfully!');
      setCaption('');
      onClose();
    } catch (error) {
      console.error('File upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to send file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send Attachment (50MB Max)"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSend} className="space-y-4">
        {/* Preview Container */}
        <div className="flex flex-col items-center justify-center p-6 bg-dark-panel/60 rounded-2xl border border-white/5 min-h-[220px]">
          {isImage ? (
            <img
              src={URL.createObjectURL(file)}
              alt="Attachment preview"
              className="max-h-60 max-w-full rounded-xl object-contain shadow-lg"
            />
          ) : isVideo ? (
            <video
              src={URL.createObjectURL(file)}
              controls
              className="max-h-60 max-w-full rounded-xl"
            />
          ) : isAudio ? (
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 rounded-2xl bg-cipher-500/10 text-cipher-400">
                <Music className="w-10 h-10" />
              </div>
              <audio src={URL.createObjectURL(file)} controls className="mt-2" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="p-4 rounded-2xl bg-cipher-500/10 text-cipher-400">
                <FileText className="w-12 h-12" />
              </div>
              <p className="text-sm font-semibold text-dark-textPrimary truncate max-w-xs">
                {file.name}
              </p>
              <span className="text-xs text-dark-textMuted">
                {formatFileSize(file.size)}
              </span>
            </div>
          )}
        </div>

        {/* File Details Bar */}
        <div className="flex items-center justify-between text-xs text-dark-textMuted px-1">
          <span className="truncate max-w-[280px]">{file.name}</span>
          <span>{formatFileSize(file.size)}</span>
        </div>

        {/* Caption Input */}
        <div>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption..."
            className="w-full bg-dark-input border border-white/5 focus:border-cipher-500 rounded-xl px-4 py-2.5 text-sm text-dark-textPrimary placeholder:text-dark-textMuted/50 focus:outline-none focus:ring-1 focus:ring-cipher-500/40"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-dark-border/40">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isUploading}
            isLoading={isUploading}
            icon={Send}
          >
            Send ({formatFileSize(file.size)})
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default FilePreviewModal;
