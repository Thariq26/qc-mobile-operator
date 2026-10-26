import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Send, Bot, Sparkles, RefreshCw } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/common/AppHeader';
import { ChatBubble } from '../../components/chat/ChatBubble';
import { TypingIndicator } from '../../components/chat/TypingIndicator';
import { aiService } from '../../api/services/aiService';
import { typography } from '../../theme/typography';

const MACHINE_PROMPTS = [
  'SOP Setting Tonase Amada Press',
  'Troubleshooting Bending Macet',
  'Pelumasan Dies Komatsu',
  'Kalibrasi Sudut Bending',
  'Pembersihan Scrap Stamping',
  'Reset E-Stop Robot Welding',
];

const QC_PROMPTS = [
  'Cek SOP Bending',
  'Solusi Burry Blanking',
  'Penyebab Las Keropos',
  'Toleransi Lubang Baut PT-1001',
  'Analisa SPC Out-of-Control',
  'SOP Penanganan Sompal',
];

export const AiChatScreen = ({ route }) => {
  const { colors, isDark } = useTheme();
  const { user, isOperatorProduksi } = useAuth();

  const quickPrompts = isOperatorProduksi ? MACHINE_PROMPTS : QC_PROMPTS;

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  const welcomeText = isOperatorProduksi
    ? `Halo ${user?.fullName || 'Rekan Operator'}! Saya **AI Copilot Mesin & Maintenance PT Galaxy Mandiri Perkasa**.\n\nSaya siap membantu Anda menangani:\n1. Panduan setting mesin press, welding, dan bending.\n2. Troubleshooting cepat gangguan mekanis & tooling mesin.\n3. SOP pembersihan scrap, pelumasan dies, dan setup cetakan.\n\nKetik pertanyaan Anda atau pilih saran cepat di bawah!`
    : `Halo ${user?.fullName || 'Rekan QC'}! Saya **QC AI Quality Agent PT Galaxy Mandiri Perkasa**.\n\nSaya siap membantu Anda menangani:\n1. Solusi teknis cacat stamping & welding.\n2. Analisis batas kendali SPC p-Chart & mitigasi deviasi 3-Sigma.\n3. Analisis akar masalah komplain customer.\n\nKetik pertanyaan Anda atau pilih saran cepat di bawah!`;

  const [messages, setMessages] = useState([
    {
      id: 'msg_welcome',
      isUser: false,
      text: welcomeText,
      timestamp: '14:00',
      modelTag: 'Gemini 1.5 Pro via n8n RAG',
    },
  ]);

  // Handle route param from RfModal shortcut
  useEffect(() => {
    if (route?.params?.initialPrompt) {
      sendMessage(route.params.initialPrompt);
    }
  }, [route?.params?.initialPrompt]);

  const sendMessage = async (customText) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || loading) return;

    const userMessageId = `msg_user_${Date.now()}`;
    const userMsg = {
      id: userMessageId,
      isUser: true,
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await aiService.sendN8nChatMessage({
        sessionId: `qc_${user?.username || 'operator'}_session`,
        operatorName: user?.fullName || user?.username || 'Operator',
        message: textToSend.trim(),
      });

      const aiMsg = {
        id: `msg_ai_${Date.now()}`,
        isUser: false,
        text: response.reply,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        modelTag: response.model || 'n8n RAG Copilot',
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        id: `msg_err_${Date.now()}`,
        isUser: false,
        text: 'Maaf, terjadi gangguan koneksi ke webhook AI. Namun Anda tetap dapat menggunakan fitur rekomendasi Random Forest di Dashboard.',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        modelTag: 'System Fallback',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt) => {
    sendMessage(prompt);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'msg_welcome',
        isUser: false,
        text: `Sesi percakapan baru dimulai untuk ${user?.fullName || 'Operator'}. Silakan ajukan pertanyaan teknis seputar lantai produksi.`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        modelTag: 'Gemini 1.5 Pro via n8n RAG',
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <AppHeader />

      {/* Chat Title Sub-header */}
      <View style={[styles.subHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.subHeaderLeft}>
          <View style={[styles.botIconBadge, { backgroundColor: colors.aiAccent + '20', borderColor: colors.aiAccentLight || colors.primary }]}>
            <Bot size={18} color={colors.aiAccentLight || colors.primary} />
          </View>
          <View>
            <Text style={[styles.subHeaderTitle, { color: colors.textPrimary }]}>
              KONSULTASI TEKNIS QC AI
            </Text>
            <Text style={[styles.subHeaderDesc, { color: colors.textSecondary }]}>
              Connected to n8n Webhook • Supabase Vector RAG
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleClearChat}
          hitSlop={8}
          style={({ pressed }) => [
            styles.clearBtn,
            { backgroundColor: colors.cardSubtle, borderColor: colors.border },
            pressed && { opacity: 0.6 },
          ]}
        >
          <RefreshCw size={14} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Chat Message List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatBubble
            message={item.text}
            isUser={item.isUser}
            timestamp={item.timestamp}
            modelTag={item.modelTag}
          />
        )}
        contentContainerStyle={styles.messageListContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={loading ? <TypingIndicator /> : null}
      />

      {/* Horizontally Scrollable Quick Prompt Chips */}
      <View style={[styles.chipsContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {quickPrompts.map((prompt, idx) => (
            <Pressable
              key={idx}
              onPress={() => handleQuickPrompt(prompt)}
              style={({ pressed }) => [
                styles.chipItem,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && { borderColor: colors.primary, transform: [{ scale: 0.96 }] },
              ]}
            >
              <Sparkles size={12} color={colors.primary} style={{ marginRight: 5 }} />
              <Text style={[styles.chipText, { color: colors.textPrimary }]}>
                {prompt}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Input Bar */}
      <View style={[styles.inputBarContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TextInput
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="Tanyakan SOP, solusi mesin, atau penyebab cacat..."
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={500}
          style={[styles.inputField, { backgroundColor: colors.cardSubtle, borderColor: colors.border, color: colors.textPrimary }]}
        />
        <Pressable
          onPress={() => sendMessage()}
          disabled={loading || !inputMessage.trim()}
          style={({ pressed }) => [
            styles.sendButton,
            {
              backgroundColor: !inputMessage.trim() || loading ? colors.cardSubtle : colors.primary,
              borderColor: colors.border,
            },
            pressed && { transform: [{ scale: 0.92 }] },
          ]}
        >
          <Send
            size={18}
            color={!inputMessage.trim() || loading ? colors.textMuted : '#FFFFFF'}
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  subHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  subHeaderTitle: {
    fontSize: typography.sizes.body + 1,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  subHeaderDesc: {
    fontSize: typography.sizes.caption - 1,
    marginTop: 1,
  },
  clearBtn: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  messageListContent: {
    padding: 16,
    paddingBottom: 8,
  },
  chipsContainer: {
    borderTopWidth: 1,
    paddingVertical: 8,
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipText: {
    fontSize: typography.sizes.caption,
    fontWeight: '700',
  },
  inputBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  inputField: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: typography.sizes.body + 1,
    maxHeight: 100,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default AiChatScreen;
