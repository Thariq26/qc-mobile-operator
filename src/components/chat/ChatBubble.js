import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Bot, User } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';

/**
 * ChatBubble: Industrial QC Chat Bubble
 * Displays operator messages on the right (Cobalt Blue)
 * and AI agent responses on the left (Card surface with indigo/purple tint).
 */
export const ChatBubble = ({ message, isUser, timestamp, modelTag }) => {
  const { colors, isDark } = useTheme();

  // Helper to render basic markdown formatting: bold (**text**), bullet points, and numbers
  const renderFormattedText = (text) => {
    if (!text) return null;

    const lines = text.split('\n');

    return lines.map((line, lineIndex) => {
      // Empty line spacer
      if (!line.trim()) {
        return <View key={lineIndex} style={{ height: 6 }} />;
      }

      // Check if line is bullet or numbered step
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
      const isNumbered = /^\d+\./.test(line.trim());

      // Parse bold segments
      const parts = line.split(/(\*\*.*?\*\*)/g);

      return (
        <View key={lineIndex} style={[styles.textLine, (isBullet || isNumbered) && styles.indentedLine]}>
          <Text style={[styles.messageText, { color: isUser ? '#FFFFFF' : colors.textPrimary }]}>
            {parts.map((part, partIndex) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <Text key={partIndex} style={styles.boldText}>
                    {part.slice(2, -2)}
                  </Text>
                );
              }
              return part;
            })}
          </Text>
        </View>
      );
    });
  };

  if (isUser) {
    return (
      <View style={styles.userContainer}>
        <View style={styles.userBubbleWrapper}>
          <View style={[styles.userBubble, { backgroundColor: colors.primary }]}>
            <Text style={[styles.messageText, { color: '#FFFFFF' }]}>
              {message}
            </Text>
          </View>
          {timestamp && (
            <Text style={[styles.timestampUser, { color: colors.textMuted }]}>
              {timestamp}
            </Text>
          )}
        </View>
        <View style={[styles.avatarUser, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
          <User size={16} color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.aiContainer}>
      <View style={[styles.avatarAi, { backgroundColor: colors.aiAccent + '22', borderColor: colors.aiAccentLight || colors.primary }]}>
        <Bot size={18} color={colors.aiAccentLight || colors.primary} />
      </View>

      <View style={styles.aiBubbleWrapper}>
        {/* Model Tag */}
        <View style={styles.modelHeader}>
          <Text style={[styles.modelName, { color: colors.aiAccentLight || colors.primary }]}>
            GMP QC COPILOT
          </Text>
          {modelTag && (
            <View style={[styles.modelBadge, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
              <Text style={[styles.modelBadgeText, { color: colors.textSecondary }]}>
                {modelTag}
              </Text>
            </View>
          )}
        </View>

        <View
          style={[
            styles.aiBubble,
            {
              backgroundColor: colors.card,
              borderColor: isDark ? '#2E3A59' : colors.border,
            },
          ]}
        >
          {renderFormattedText(message)}
        </View>

        {timestamp && (
          <Text style={[styles.timestampAi, { color: colors.textMuted }]}>
            {timestamp}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  userContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingLeft: 40,
  },
  userBubbleWrapper: {
    alignItems: 'flex-end',
    flex: 1,
  },
  userBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    maxWidth: '100%',
  },
  avatarUser: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginTop: 2,
  },
  timestampUser: {
    fontSize: typography.sizes.micro - 1,
    marginTop: 4,
    marginRight: 4,
  },
  aiContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingRight: 40,
  },
  avatarAi: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  aiBubbleWrapper: {
    alignItems: 'flex-start',
    flex: 1,
  },
  modelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  modelName: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modelBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
  },
  modelBadgeText: {
    fontSize: typography.sizes.micro - 2,
    fontWeight: '600',
  },
  aiBubble: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    width: '100%',
  },
  messageText: {
    fontSize: typography.sizes.body + 1,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: '800',
  },
  textLine: {
    marginBottom: 2,
  },
  indentedLine: {
    paddingLeft: 4,
  },
  timestampAi: {
    fontSize: typography.sizes.micro - 1,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default ChatBubble;
