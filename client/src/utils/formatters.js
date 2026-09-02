import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';

/**
 * Format message or chat timestamp for WhatsApp-style display
 */
export const formatChatTimestamp = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  if (isToday(date)) {
    return format(date, 'HH:mm');
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  return format(date, 'dd/MM/yyyy');
};

/**
 * Format relative last seen timestamp
 */
export const formatLastSeen = (dateInput) => {
  if (!dateInput) return 'offline';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'offline';

  return `last seen ${formatDistanceToNow(date, { addSuffix: true })}`;
};

/**
 * Format file size in bytes to human readable string
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Get initials from a name
 */
export const getInitials = (name) => {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
