// src/components/common/TypingIndicator.js
// Fixed: was sometimes rendering on the right side (looked like own message)
// Fixed: dots not visible in dark mode

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const Dot = ({ delay, color }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.delay(Math.max(0, 560 - delay)),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });
  const opacity    = anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: color, transform: [{ translateY }], opacity },
      ]}
    />
  );
};

export default function TypingIndicator() {
  const { colors } = useTheme();
  return (
    // Force left alignment — same as received messages
    <View style={styles.row}>
      <View style={[styles.bubble, { backgroundColor: colors.bubble }]}>
        <Dot delay={0}   color={colors.textSecondary} />
        <Dot delay={160} color={colors.textSecondary} />
        <Dot delay={320} color={colors.textSecondary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Full-width row, left-aligned
  row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
    marginVertical: 4,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    gap: 5,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});