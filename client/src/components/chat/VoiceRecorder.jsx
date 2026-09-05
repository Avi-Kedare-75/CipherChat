import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useSocketStore } from '../../store/useSocketStore';
import { messageService } from '../../services/messageService';
import { Mic, Trash2, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const VoiceRecorder = ({ onCancel }) => {
  const { activeChat, sendMessage } = useChatStore();
  const { socket } = useSocketStore();

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    startRecording();

    return () => {
      stopMediaStream();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const stopMediaStream = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream?.getTracks().forEach((track) => track.stop());
    }
  };

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);

      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Microphone access denied:', error);
      toast.error('Microphone access required to record voice notes');
      onCancel();
    }
  };

  const handleCancel = () => {
    stopMediaStream();
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    onCancel();
  };

  const handleSendVoiceNote = async () => {
    if (!mediaRecorderRef.current || !activeChat) return;

    try {
      setIsUploading(true);

      mediaRecorderRef.current.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const file = new File([audioBlob], `voice-note-${Date.now()}.webm`, {
            type: 'audio/webm',
          });

          const formData = new FormData();
          formData.append('file', file);

          const uploadRes = await messageService.uploadFile(formData);

          const newMsg = await sendMessage(activeChat._id, {
            content: '',
            messageType: 'voice',
            fileUrl: uploadRes.fileUrl,
            fileMetadata: {
              ...uploadRes.fileMetadata,
              duration: recordingDuration,
            },
          });

          socket?.emit('new message', newMsg);
          onCancel();
        } catch (err) {
          console.error('Voice send error:', err);
          toast.error('Failed to send voice note');
          setIsUploading(false);
        }
      };

      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream?.getTracks().forEach((track) => track.stop());
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    } catch (error) {
      console.error('Voice upload failed:', error);
      toast.error('Failed to upload voice note');
      setIsUploading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex-1 flex items-center justify-between gap-3 bg-dark-panel px-4 py-2 rounded-xl border border-cipher-500/40 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-rose-500/20 text-rose-400 rounded-full animate-pulse">
          <Mic className="w-4 h-4" />
        </div>
        <span className="text-xs font-mono font-semibold text-dark-textPrimary">
          {formatTime(recordingDuration)}
        </span>
        <div className="flex items-center gap-1">
          <div className="w-1 h-3 bg-cipher-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-1 h-5 bg-cipher-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-1 h-2 bg-cipher-400 rounded-full animate-bounce" />
          <div className="w-1 h-4 bg-cipher-400 rounded-full animate-bounce [animation-delay:-0.2s]" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isUploading}
          className="p-2 text-dark-textMuted hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
          title="Cancel recording"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleSendVoiceNote}
          disabled={isUploading}
          className="p-2.5 bg-cipher-500 hover:bg-cipher-600 text-white rounded-xl shadow-glow transition-all active:scale-95 flex items-center justify-center"
          title="Send voice note"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

export default VoiceRecorder;
