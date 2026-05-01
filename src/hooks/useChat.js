// src/hooks/useChat.js
// Fixes:
//  1. Scroll-to-bottom race condition when keyboard opens
//  2. Duplicate messages appearing when both REST history and socket fire
//  3. typingUsers not clearing on disconnect

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { getMessages } from '../services/chatService';

export const useChat = (chatId) => {
  const { socket }        = useSocket();
  const [messages,        setMessages]       = useState([]);
  const [loading,         setLoading]        = useState(true);
  const [typingUsers,     setTypingUsers]    = useState([]);
  const flatListRef       = useRef(null);

  // Track message IDs we already have to prevent duplicates
  const seenIds = useRef(new Set());

  // ── Load message history ────────────────────────────────────
  useEffect(() => {
    if (!chatId) return;
    setLoading(true);
    seenIds.current.clear();

    getMessages(chatId)
      .then((data) => {
        // Seed seenIds with history
        data.forEach((m) => seenIds.current.add(m._id));
        setMessages(data);
      })
      .catch(console.warn)
      .finally(() => setLoading(false));
  }, [chatId]);

  // ── Socket listeners ────────────────────────────────────────
  useEffect(() => {
    if (!socket || !chatId) return;

    socket.emit('chat:join', chatId);

    const onMessage = (msg) => {
      const msgChatId = msg.chat?._id || msg.chat;
      if (msgChatId !== chatId) return;

      // Deduplicate — skip if we already have this message
      if (seenIds.current.has(msg._id)) return;
      seenIds.current.add(msg._id);

      setMessages((prev) => [...prev, msg]);
    };

    const onTyping = ({ chatId: cid, userId, username }) => {
      if (cid !== chatId) return;
      setTypingUsers((prev) =>
        prev.find((u) => u.userId === userId)
          ? prev
          : [...prev, { userId, username }]
      );
    };

    const onStopTyping = ({ chatId: cid, userId }) => {
      if (cid !== chatId) return;
      setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
    };

    // Clear all typing indicators if socket disconnects
    const onDisconnect = () => setTypingUsers([]);

    socket.on('chat:message',    onMessage);
    socket.on('chat:typing',     onTyping);
    socket.on('chat:stopTyping', onStopTyping);
    socket.on('disconnect',      onDisconnect);

    return () => {
      socket.emit('chat:leave', chatId);
      socket.off('chat:message',    onMessage);
      socket.off('chat:typing',     onTyping);
      socket.off('chat:stopTyping', onStopTyping);
      socket.off('disconnect',      onDisconnect);
      setTypingUsers([]);
    };
  }, [socket, chatId]);

  return { messages, loading, typingUsers, flatListRef };
};