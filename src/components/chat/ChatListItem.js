// src/components/chat/ChatListItem.js
// UI fixes:
//  1. Name and time on same row were overflowing into each other
//  2. Preview text same width as name — should span full width
//  3. Online dot misaligned on some sizes
//  4. Touch feedback missing on Android

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../common/Avatar';
import { getOtherParticipant, formatTime, truncate } from '../../utils/helpers';

export default function ChatListItem({ chat, myId, onPress }) {
  const { colors } = useTheme();

  const other     = chat.isGroup ? null : getOtherParticipant(chat, myId);
  const name      = chat.isGroup ? chat.groupName : (other?.username ?? 'Unknown');
  const avatarUrl = chat.isGroup ? chat.groupAvatar?.url : other?.avatar?.url;
  const isOnline  = !chat.isGroup && !!other?.isOnline;

  const lastMsg  = chat.lastMessage;
  let preview    = 'Tap to start chatting';
  if (lastMsg) {
    if (lastMsg.type === 'image')  preview = '📷  Photo';
    else if (lastMsg.type === 'video') preview = '🎥  Video';
    else preview = truncate(lastMsg.content, 50);
  }
  const timeStr = lastMsg ? formatTime(lastMsg.createdAt) : '';

  const s = styles(colors);
  return (
    <TouchableOpacity
      style={s.row}
      onPress={onPress}
      activeOpacity={0.65}
    >
      <View style={s.avatarCol}>
        <Avatar
          uri={avatarUrl}
          name={name}
          size={52}
          showOnline={!chat.isGroup}
          isOnline={isOnline}
        />
      </View>

      <View style={s.content}>
        {/* Top row: name (flex) + time (fixed) */}
        <View style={s.topRow}>
          <Text style={s.name} numberOfLines={1}>{name}</Text>
          <Text style={s.time} numberOfLines={1}>{timeStr}</Text>
        </View>
        {/* Preview on its own row — full width */}
        <Text style={s.preview} numberOfLines={1}>{preview}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = (c) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: c.background,
    // Ensures Android ripple fills the row
    overflow: 'hidden',
  },
  avatarCol: {
    marginRight: 12,
    // Fixed width prevents avatar from squishing
    width: 52,
    height: 52,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // Name shrinks, time stays fixed-width
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: c.text,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: c.textMuted,
    flexShrink: 0,
  },
  preview: {
    fontSize: 13,
    color: c.textSecondary,
    lineHeight: 18,
  },
});