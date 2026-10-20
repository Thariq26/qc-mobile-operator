import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Bot } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

/**
 * TypingIndicator: Staggered 3-dot animation
 * Simulates AI thinking while n8n webhook communicates with Google Gemini and Supabase.
 */
export const TypingIndicator = () => {
  const { colors, isDark } = useTheme();

  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const createDotAnim = (dotAnim, delay) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.loop(
          Animated.sequence([
            Animated.timing(dotAnim, {
              toValue: 1,
              duration: 350,
              useNativeDriver: true,
            }),
            Animated.timing(dotAnim, {
              toValue: 0.3,
              duration: 350,
              useNativeDriver: true,
            }),
            Animated.delay(200),
          ])
        ),
      ]);
    };

    const anim1 = createDotAnim(dot1, 0);
    const anim2 = createDotAnim(dot2, 180);
    const anim3 = createDotAnim(dot3, 360);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.container}>
      <View style={[styles.avatarAi, { backgroundColor: colors.aiAccent + '22', borderColor: colors.aiAccentLight || colors.primary }]}>
        <Bot size={18} color={colors.aiAccentLight || colors.primary} />
      </View>

      <View
        style={[
          styles.bubble,
          {
            backgroundColor: colors.card,
            borderColor: isDark ? '#2E3A59' : colors.border,
          },
        ]}
      >
        <Animated.View style={[styles.dot, { backgroundColor: colors.aiAccentLight || colors.primary, opacity: dot1 }]} />
        <Animated.View style={[styles.dot, { backgroundColor: colors.aiAccentLight || colors.primary, opacity: dot2 }]} />
        <Animated.View style={[styles.dot, { backgroundColor: colors.aiAccentLight || colors.primary, opacity: dot3 }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarAi: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});

export default TypingIndicator;
