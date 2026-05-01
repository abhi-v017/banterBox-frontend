// src/components/common/Avatar.js
// UI fixes:
//  1. Online dot was overlapping avatar border on small sizes
//  2. Fallback letter not vertically centered on Android
//  3. Image not clipping to circle on some Android versions
//  4. Size prop not consistently applied to borderRadius

import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function Avatar({
  uri,
  name = '?',
  size = 48,
  showOnline = false,
  isOnline = false,
}) {
  const { colors } = useTheme();
  const radius = size / 2;
  const letter = (name?.[0] || '?').toUpperCase();

  // Dot size scales with avatar — min 10px, max 16px
  const dotSize   = Math.min(16, Math.max(10, size * 0.26));
  const dotOffset = -1; // slightly outside the avatar edge

  return (
    <View style={{ width: size, height: size }}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{
            width: size,
            height: size,
            borderRadius: radius,
            // Forces clip on Android
            overflow: 'hidden',
          }}
          // Prevent broken image showing as full-size rectangle
          onError={() => {}}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: size,
              height: size,
              borderRadius: radius,
              backgroundColor: stringToColor(name),
            },
          ]}
        >
          <Text
            style={[
              styles.letter,
              {
                fontSize:   size * 0.38,
                lineHeight: size * 0.44,
              },
            ]}
            numberOfLines={1}
          >
            {letter}
          </Text>
        </View>
      )}

      {/* Online/offline dot */}
      {showOnline && (
        <View
          style={[
            styles.dot,
            {
              width:        dotSize,
              height:       dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: isOnline ? colors.online : 'transparent',
              borderWidth:  isOnline ? 2 : 0,
              borderColor:  colors.background,
              bottom: dotOffset,
              right:  dotOffset,
            },
          ]}
        />
      )}
    </View>
  );
}

// Generate a consistent color from a string (so same user always gets same color)
function stringToColor(str = '') {
  const COLORS = [
    '#00A884', '#E91E8C', '#2196F3', '#FF5722',
    '#9C27B0', '#FF9800', '#4CAF50', '#F44336',
    '#00BCD4', '#8BC34A',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

const styles = StyleSheet.create({
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  letter: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false, // Android fix: removes extra top padding
  },
  dot: {
    position: 'absolute',
  },
});