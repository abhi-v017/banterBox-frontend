// src/utils/helpers.js

/**
 * Return the other participant in a 1-to-1 chat.
 */
export const getOtherParticipant = (chat, myId) => {
  if (!chat?.participants) return null;
  return chat.participants.find(
    (p) => (p._id || p).toString() !== myId.toString()
  ) ?? null;
};

/**
 * Human-readable timestamp for chat list previews:
 *   Today    → "3:42 PM"
 *   This week → "Mon"
 *   Older    → "12/25"
 */
export const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d   = new Date(dateStr);
  const now = new Date();

  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth()    === now.getMonth() &&
    d.getDate()     === now.getDate();

  if (sameDay) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays < 7) {
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  }
  return d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
};

/**
 * Full time for message bubbles: "3:42 PM"
 */
export const formatMsgTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour:   'numeric',
    minute: '2-digit',
  });
};

/**
 * Format call duration seconds → "MM:SS"
 */
export const formatDuration = (secs) => {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

/**
 * Truncate string with ellipsis.
 */
export const truncate = (str = '', max = 50) =>
  str.length > max ? str.slice(0, max) + '…' : str;