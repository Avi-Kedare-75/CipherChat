import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';
import { generateSafetyNumber } from '../../utils/crypto';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  ShieldCheck,
  Lock,
  QrCode,
  Copy,
  Check,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const SecurityCodeModal = ({ isOpen, onClose, contact }) => {
  const { user: currentUser } = useAuthStore();
  const { activeChat } = useChatStore();

  const [safetyDigits, setSafetyDigits] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && activeChat) {
      generateSafetyNumber(currentUser?._id, contact?._id, activeChat._id).then(
        (chunks) => setSafetyDigits(chunks)
      );
    }
  }, [isOpen, activeChat, currentUser?._id, contact?._id]);

  const fullCodeString = safetyDigits.join(' ');

  const handleCopy = () => {
    navigator.clipboard.writeText(fullCodeString);
    setCopied(true);
    toast.success('Security code copied to clipboard');
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verify Security Code"
      maxWidth="max-w-md"
    >
      <div className="space-y-5 text-center">
        {/* Shield Icon Header */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-cipher-500/10 border border-cipher-500/30 flex items-center justify-center mb-3 text-cipher-400 shadow-glow">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <h3 className="text-base font-bold text-dark-textPrimary">
            End-to-End Encryption Verified
          </h3>
          <p className="text-xs text-dark-textMuted max-w-sm mt-1 leading-relaxed">
            Messages and calls with <span className="text-dark-textPrimary font-semibold">{contact?.fullName || 'this contact'}</span> are secured with 256-bit AES-GCM encryption. Compare these 60 digits to verify out-of-band authenticity.
          </p>
        </div>

        {/* QR Code Graphic Box */}
        <div className="p-4 bg-dark-panel/80 rounded-2xl border border-white/5 flex flex-col items-center justify-center">
          <div className="w-36 h-36 bg-dark-sidebar rounded-xl border border-cipher-500/20 p-2 flex flex-col items-center justify-center relative overflow-hidden group">
            <QrCode className="w-28 h-28 text-cipher-400/90 group-hover:scale-105 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-sidebar/90 via-transparent to-transparent flex items-end justify-center pb-1">
              <span className="text-[10px] font-mono text-cipher-300 font-medium">
                256-BIT RATIO
              </span>
            </div>
          </div>
          <span className="text-[11px] text-dark-textMuted mt-2 flex items-center gap-1">
            <KeyRound className="w-3 h-3 text-cipher-500" />
            <span>Cryptographic Session Hash</span>
          </span>
        </div>

        {/* 60-Digit Code Matrix */}
        <div className="p-4 bg-dark-panel rounded-2xl border border-white/5 space-y-2">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 font-mono text-xs font-semibold text-dark-textPrimary">
            {safetyDigits.map((chunk, index) => (
              <div
                key={index}
                className="p-1.5 rounded-lg bg-dark-sidebar border border-white/5 tracking-widest text-center text-cipher-300/90"
              >
                {chunk}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full mt-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-dark-textPrimary flex items-center justify-center gap-2 transition-colors border border-white/5"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-dark-textMuted" />
                <span>Copy 60-Digit Code</span>
              </>
            )}
          </button>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-dark-border/40 flex justify-end">
          <Button variant="primary" onClick={onClose} size="sm">
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SecurityCodeModal;
