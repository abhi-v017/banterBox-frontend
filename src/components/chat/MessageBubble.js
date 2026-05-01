// src/components/chat/MessageBubble.js
// UI fixes:
//  1. Own bubbles were not right-aligned on some Android devices
//  2. Media images overflowing bubble bounds
//  3. Timestamp and tick overlapping on short messages
//  4. Sender name clipping in group chats
//  5. Inconsistent border radius between own and other bubbles
//  6. Shadow showing on both sides (should only show on others' bubbles)

import React from 'react';
import {
  View, Text, Image, TouchableOpacity,
  StyleSheet, Linking,
} from 'react-native';
import { useTheme }     from '../../context/ThemeContext';
import { formatMsgTime } from '../../utils/helpers';

export default function MessageBubble({ message, isOwn, showSenderName = false }) {
  const { colors } = useTheme();
  const s = styles(colors, isOwn);

  const renderContent = () => {
    if (message.type === 'image' && message.media?.url) {
      return (
        <View style={s.mediaWrap}>
          <Image
            source={{ uri: message.media.url }}
            style={s.mediaImage}
            resizeMode="cover"
          />
        </View>
      );
    }
    if (message.type === 'video' && message.media?.url) {
      return (
        <TouchableOpacity
          style={s.videoThumb}
          onPress={() => Linking.openURL(message.media.url)}
          activeOpacity={0.8}
        >
          <View style={s.videoPlayCircle}>
            <Text style={s.videoPlayIcon}>▶</Text>
          </View>
          <Text style={s.videoLabel}>Tap to open video</Text>
        </TouchableOpacity>
      );
    }
    // Text message
    return (
      <Text style={s.text} selectable>
        {message.content}
      </Text>
    );
  };

  const isRead   = Array.isArray(message.readBy) && message.readBy.length > 0;
  const hasMedia = message.type === 'image' || message.type === 'video';

  return (
    // Outer wrapper — controls LEFT vs RIGHT alignment
    <View style={s.row}>
      <View style={s.bubbleWrap}>
        {/* Group chat: sender name above bubble */}
        {!isOwn && showSenderName && message.sender?.username && (
          <Text style={s.senderName} numberOfLines={1}>
            {message.sender.username}
          </Text>
        )}

        <View style={[s.bubble, hasMedia && s.bubbleMedia]}>
          {renderContent()}

          {/* Timestamp + read tick row */}
          <View style={[s.meta, hasMedia && s.metaOnMedia]}>
            <Text style={[s.time, hasMedia && s.timeOnMedia]}>
              {formatMsgTime(message.createdAt)}
            </Text>
            {isOwn && (
              <Text style={[s.tick, isRead && s.tickBlue, hasMedia && s.timeOnMedia]}>
                {isRead ? '✓✓' : '✓'}
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const BUBBLE_RADIUS = 18;
const TAIL_RADIUS   = 4;

const styles = (c, isOwn) => StyleSheet.create({
  // Full-width row, aligns bubble left or right
  row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: isOwn ? 'flex-end' : 'flex-start',
    marginVertical: 2,
    paddingHorizontal: 8,
  },

  // Constrains bubble to max 75% of screen width
  bubbleWrap: {
    maxWidth: '75%',
    alignItems: isOwn ? 'flex-end' : 'flex-start',
  },

  senderName: {
    fontSize: 11,
    fontWeight: '700',
    color: c.primary,
    marginLeft: 12,
    marginBottom: 3,
    maxWidth: '100%',
  },

  bubble: {
    backgroundColor: isOwn ? c.bubbleOwn : c.bubble,
    // All corners rounded, except the "tail" corner
    borderTopLeftRadius:     BUBBLE_RADIUS,
    borderTopRightRadius:    BUBBLE_RADIUS,
    borderBottomLeftRadius:  isOwn ? BUBBLE_RADIUS : TAIL_RADIUS,
    borderBottomRightRadius: isOwn ? TAIL_RADIUS   : BUBBLE_RADIUS,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    // Shadow only on received bubbles
    ...(isOwn ? {} : {
      elevation: 1,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
    }),
  },

  // Media bubbles have tighter padding
  bubbleMedia: {
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 2,
    overflow: 'hidden',
  },

  text: {
    fontSize: 15,
    color: c.text,
    lineHeight: 21,
    flexShrink: 1,
  },

  mediaWrap: {
    borderRadius: BUBBLE_RADIUS - 2,
    overflow: 'hidden',
  },
  mediaImage: {
    width: 220,
    height: 180,
    borderRadius: BUBBLE_RADIUS - 2,
  },

  videoThumb: {
    width: 220,
    height: 140,
    backgroundColor: '#000',
    borderRadius: BUBBLE_RADIUS - 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  videoPlayIcon: { fontSize: 22, color: '#fff' },
  videoLabel:    { color: 'rgba(255,255,255,0.65)', fontSize: 11 },

  // Timestamp row — right-aligned inside bubble
  meta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
    // Ensures timestamp never overlaps text on short messages
    alignSelf: 'flex-end',
  },
  // For media bubbles — overlay timestamp on the image
  metaOnMedia: {
    position: 'absolute',
    bottom: 8,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 0,
  },

  time:        { fontSize: 10, color: c.textMuted },
  timeOnMedia: { color: '#fff' },

  tick:     { fontSize: 10, color: c.textMuted },
  tickBlue: { color: c.primary },
});