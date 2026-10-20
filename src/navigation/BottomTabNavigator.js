import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  LayoutGrid,
  Factory,
  PlusCircle,
  ClipboardCheck,
  Building2,
  Sparkles,
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { InputProductionScreen } from '../screens/production/InputProductionScreen';
import { InputDefectScreen } from '../screens/defect/InputDefectScreen';
import { MyHistoryScreen } from '../screens/history/MyHistoryScreen';
import { ComplaintsScreen } from '../screens/complaints/ComplaintsScreen';
import { AiChatScreen } from '../screens/chat/AiChatScreen';
import { typography } from '../theme/typography';

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.navBackground,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          elevation: 12,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: typography.sizes.tabLabel - 0.5,
          fontWeight: '700',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingHorizontal: 2,
        },
      }}
    >
      {/* 1. Dashboard */}
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size, focused }) => (
            <LayoutGrid size={focused ? 21 : 19} color={color} />
          ),
        }}
      />

      {/* 2. Input Produksi (BARU!) */}
      <Tab.Screen
        name="InputProduction"
        component={InputProductionScreen}
        options={{
          tabBarLabel: 'Input Prod',
          tabBarIcon: ({ color, size, focused }) => (
            <Factory size={focused ? 21 : 19} color={focused ? colors.primary : color} />
          ),
        }}
      />

      {/* 3. Catat NG */}
      <Tab.Screen
        name="InputDefect"
        component={InputDefectScreen}
        options={{
          tabBarLabel: 'Catat NG',
          tabBarIcon: ({ color, size, focused }) => (
            <PlusCircle size={focused ? 22 : 20} color={focused ? colors.critical : color} />
          ),
        }}
      />

      {/* 4. Riwayat */}
      <Tab.Screen
        name="History"
        component={MyHistoryScreen}
        options={{
          tabBarLabel: 'Riwayat',
          tabBarIcon: ({ color, size, focused }) => (
            <ClipboardCheck size={focused ? 21 : 19} color={color} />
          ),
        }}
      />

      {/* 5. Komplain PT */}
      <Tab.Screen
        name="Complaints"
        component={ComplaintsScreen}
        options={{
          tabBarLabel: 'Komplain',
          tabBarIcon: ({ color, size, focused }) => (
            <Building2 size={focused ? 21 : 19} color={focused ? colors.purple : color} />
          ),
        }}
      />

      {/* 6. Tanya AI */}
      <Tab.Screen
        name="AiChat"
        component={AiChatScreen}
        options={{
          tabBarLabel: 'Tanya AI',
          tabBarIcon: ({ color, size, focused }) => (
            <Sparkles size={focused ? 21 : 19} color={focused ? colors.aiAccentLight || colors.primary : color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
