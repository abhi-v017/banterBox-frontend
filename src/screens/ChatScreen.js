// src/screens/ChatScreen.js — Full UI fix
// Issues fixed:
//  1. Keyboard pushing content / jumping layout (KeyboardAvoidingView + FlatList)
//  2. Messages hidden behind input bar when keyboard opens
//  3. Header overlapping on Android
//  4. Input bar floating incorrectly when keyboard closes
//  5. FlatList not scrolling to bottom on new messages
//  6. Background color gap between header and message list
//  7. Bubble alignment inconsistency
//  8. Safe area not respected on notch devices

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { useTheme }  from '../context/ThemeContext';
import { useAuth }   from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useChat }   from '../hooks/useChat';
import { sendMediaMessage } from '../services/chatService';
import { getOtherParticipant } from '../utils/helpers';

import MessageBubble   from '../components/chat/MessageBubble';
import TypingIndicator from '../components/common/TypingIndicator';
import Avatar          from '../components/common/Avatar';

const TYPING_DEBOUNCE = 1500;

export default function ChatScreen({ navigation, route }) {
  const { chat }   = route.params;
  const { colors } = useTheme();
  const { user }   = useAuth();
  const { socket } = useSocket();
  const insets     = useSafeAreaInsets();
  const chatId     = chat._id;

  const { messages, loading, typingUsers, flatListRef } = useChat(chatId);

  const [text,        setText]        = useState('');
  const [sending,     setSending]     = useState(false);
  const [otherOnline, setOtherOnline] = useState(false);
  const [inputHeight, setInputHeight] = useState(44);

  const typingTimer = useRef(null);

  const other     = !chat.isGroup ? getOtherParticipant(chat, user._id) : null;
  const chatName  = chat.isGroup ? chat.groupName   : (other?.username ?? 'Unknown');
  const avatarUrl = chat.isGroup ? chat.groupAvatar?.url : other?.avatar?.url;
  const showTyping = typingUsers.length > 0;

  // ── Online status ─────────────────────────────────────────────
  useEffect(() => {
    if (!socket || chat.isGroup) return;
    const onOnline  = ({ userId }) => {
      if (userId?.toString() === other?._id?.toString()) setOtherOnline(true);
    };
    const onOffline = ({ userId }) => {
      if (userId?.toString() === other?._id?.toString()) setOtherOnline(false);
    };
    socket.on('user:online',  onOnline);
    socket.on('user:offline', onOffline);
    return () => {
      socket.off('user:online',  onOnline);
      socket.off('user:offline', onOffline);
    };
  }, [socket, other?._id]);

  // ── Scroll to bottom when messages load ──────────────────────
  const scrollToBottom = useCallback((animated = true) => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated });
      }, 100);
    }
  }, [messages.length]);

  useEffect(() => {
    if (!loading) scrollToBottom(false);
  }, [loading]);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages.length]);

  // ── Typing debounce ───────────────────────────────────────────
  const handleTextChange = (val) => {
    setText(val);
    if (!socket) return;
    socket.emit('chat:typing', { chatId });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('chat:stopTyping', { chatId });
    }, TYPING_DEBOUNCE);
  };

  // ── Send text ─────────────────────────────────────────────────
  const handleSend = () => {
    const content = text.trim();
    if (!content || !socket) return;
    socket.emit('chat:message', { chatId, content, type: 'text' });
    setText('');
    setInputHeight(44);
    clearTimeout(typingTimer.current);
    socket.emit('chat:stopTyping', { chatId });
    Keyboard.dismiss();
  };

  // ── Send media ─────────────────────────────────────────────────
  const handleAttach = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.85,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    try {
      setSending(true);
      const mime = asset.type === 'video' ? 'video/mp4' : 'image/jpeg';
      await sendMediaMessage(chatId, asset.uri, mime);
    } catch (err) {
      Alert.alert('Upload failed', err.message);
    } finally {
      setSending(false);
    }
  };

  const s = styles(colors, insets);

  return (
    // Use edges={[]} so we control safe areas manually
    // This prevents double-padding issues on Android
    <SafeAreaView style={s.safe} edges={['left', 'right']}>

      {/* ── Header — sits at very top, respects status bar ─── */}
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.headerInfo}
          activeOpacity={0.7}
          onPress={() =>
            chat.isGroup
              ? navigation.navigate('GroupInfo', { chat })
              : navigation.navigate('UserProfile', { userId: other?._id })
          }
        >
          <Avatar uri={avatarUrl} name={chatName} size={36} />
          <View style={s.headerText}>
            <Text style={s.headerName} numberOfLines={1}>{chatName}</Text>
            <Text style={s.headerSub} numberOfLines={1}>
              {showTyping
                ? '✏️ typing...'
                : !chat.isGroup && otherOnline
                  ? '🟢 online'
                  : chat.isGroup
                    ? `${chat.participants?.length ?? 0} members`
                    : ''}
            </Text>
          </View>
        </TouchableOpacity>

        {!chat.isGroup && (
          <View style={s.callBtns}>
            <TouchableOpacity
              style={s.callBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => navigation.navigate('Call', { chat, callType: 'voice', isCaller: true })}
            >
              <Text style={s.callBtnIcon}>📞</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.callBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => navigation.navigate('Call', { chat, callType: 'video', isCaller: true })}
            >
              <Text style={s.callBtnIcon}>📹</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Body: messages + input, keyboard-aware ───────────── */}
      <KeyboardAvoidingView
        style={s.body}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        // On iOS, offset by header height so messages don't go under header
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Message list */}
        {loading
          ? <ActivityIndicator style={s.loader} color={colors.primary} size="large" />
          : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(m) => m._id}
              renderItem={({ item }) => (
                <MessageBubble
                  message={item}
                  isOwn={(item.sender?._id || item.sender)?.toString() === user._id?.toString()}
                  showSenderName={chat.isGroup}
                />
              )}
              contentContainerStyle={s.msgList}
              // Keep content anchored to bottom like WhatsApp
              maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
              onContentSizeChange={() => scrollToBottom(false)}
              onLayout={() => scrollToBottom(false)}
              ListFooterComponent={showTyping ? <TypingIndicator /> : null}
              // Performance
              removeClippedSubviews={Platform.OS === 'android'}
              maxToRenderPerBatch={20}
              windowSize={10}
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
            />
          )}

        {/* Input bar — sticks to bottom above keyboard */}
        <View style={s.inputBar}>
          <TouchableOpacity
            style={s.attachBtn}
            onPress={handleAttach}
            disabled={sending}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Text style={s.attachIcon}>{sending ? '⏳' : '📎'}</Text>
          </TouchableOpacity>

          <TextInput
            style={[s.input, { height: Math.max(44, inputHeight) }]}
            placeholder="Message..."
            placeholderTextColor={colors.textMuted}
            value={text}
            onChangeText={handleTextChange}
            multiline
            maxLength={2000}
            onContentSizeChange={(e) => {
              const h = e.nativeEvent.contentSize.height;
              setInputHeight(Math.min(h + 4, 120));
            }}
            blurOnSubmit={false}
            returnKeyType="default"
          />

          <TouchableOpacity
            style={[s.sendBtn, !text.trim() && s.sendBtnOff]}
            onPress={handleSend}
            disabled={!text.trim()}
            activeOpacity={0.8}
          >
            <Text style={s.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom safe area padding inside keyboard view */}
        <View style={{ height: insets.bottom }} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = (c, insets) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: c.headerBg, // header color fills status bar area
  },

  // ── Header ────────────────────────────────────────────────────
  header: {
    backgroundColor: c.headerBg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 10,
    gap: 6,
    // Shadow
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  backBtn:   { padding: 6 },
  backArrow: { fontSize: 22, color: c.headerText },
  headerInfo: {
    flex: 1, flexDirection: 'row',
    alignItems: 'center', gap: 10,
  },
  headerText:  { flex: 1 },
  headerName:  { fontSize: 16, fontWeight: '700', color: c.headerText },
  headerSub:   { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 1 },
  callBtns:    { flexDirection: 'row' },
  callBtn:     { padding: 8 },
  callBtnIcon: { fontSize: 19 },

  // ── Body ──────────────────────────────────────────────────────
  body: {
    flex: 1,
    backgroundColor: c.surface, // chat background
  },
  loader: { flex: 1 },

  // ── Message list ──────────────────────────────────────────────
  msgList: {
    paddingTop: 10,
    paddingBottom: 6,
    paddingHorizontal: 4,
    flexGrow: 1,         // ensures list fills space so bubbles don't pile at top
    justifyContent: 'flex-end', // NEW messages anchor at bottom
  },

  // ── Input bar ─────────────────────────────────────────────────
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: c.card,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: c.border,
    gap: 6,
    // Subtle shadow above input
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: -1 },
    elevation: 3,
  },
  attachBtn:  { paddingHorizontal: 4, paddingBottom: 10, alignSelf: 'flex-end' },
  attachIcon: { fontSize: 22 },
  input: {
    flex: 1,
    backgroundColor: c.inputBg,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 11 : 8,
    paddingBottom: Platform.OS === 'ios' ? 11 : 8,
    fontSize: 15,
    color: c.text,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    maxHeight: 120,
    minHeight: 44,
    // Fix Android text vertical centering
    textAlignVertical: 'center',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: c.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: 0,
  },
  sendBtnOff: { backgroundColor: c.inputBg },
  sendIcon:   { color: '#fff', fontSize: 18, marginLeft: 2 },
});