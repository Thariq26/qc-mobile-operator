import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  LayoutGrid,
  Factory,
  PlusCircle,
  ClipboardCheck,
  ClipboardList,
  Building2,
  Sparkles,
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { InputProductionScreen } from '../screens/production/InputProductionScreen';
import { ProductionHistoryScreen } from '../screens/production/ProductionHistoryScreen';
import { InputDefectScreen } from '../screens/defect/InputDefectScreen';
import { MyHistoryScreen } from '../screens/history/MyHistoryScreen';
import { ComplaintsScreen } from '../screens/complaints/ComplaintsScreen';
import { AiChatScreen } from '../screens/chat/AiChatScreen';
import { typography } from '../theme/typography';
import { CustomTabBar } from './CustomTabBar';

const Tab = createBottomTabNavigator();

/**
 * BottomTabNavigator: Role-Based Access Control (RBAC) Navigation
 * - OPERATOR_PRODUKSI: Dashboard Produksi, Input Produksi, Riwayat Produksi, Tanya AI Mesin (4 tab)
 * - STAFF_QC: Dashboard Kualitas, Catat NG/Foto, Riwayat Cacat, Komplain Customer, Tanya AI Kualitas (5 tab)
 * - ADMIN: Full access to all production and QC modules (Dashboard, Input Prod, Catat NG, Riwayat, Komplain, Tanya AI - 6 tab)
 */
export const BottomTabNavigator = () => {
  const { colors, isDark } = useTheme();
  const { user, isOperatorProduksi, isStaffQc, isAdmin } = useAuth();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* 1. Dashboard (Semua Role) */}
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

      {/* --- MENU OPERATOR PRODUKSI & ADMIN --- */}
      {(isOperatorProduksi || isAdmin) && (
        <Tab.Screen
          name="InputProduction"
          component={InputProductionScreen}
          options={{
            tabBarLabel: 'Input Prod',
            tabBarIcon: ({ color, size, focused }) => (
              <Factory size={focused ? 20 : 18} color={color} />
            ),
          }}
        />
      )}

      {/* --- MENU STAFF QC & ADMIN: CATAT NG --- */}
      {(isStaffQc || isAdmin) && (
        <Tab.Screen
          name="InputDefect"
          component={InputDefectScreen}
          options={{
            tabBarLabel: 'Catat NG',
            tabBarIcon: ({ color, size, focused }) => (
              <PlusCircle size={focused ? 21 : 19} color={color} />
            ),
          }}
        />
      )}

      {/* --- MENU RIWAYAT CACAT (STAFF QC & ADMIN) --- */}
      {(isStaffQc || isAdmin) && (
        <Tab.Screen
          name="History"
          component={MyHistoryScreen}
          options={{
            tabBarLabel: 'Riwayat',
            tabBarIcon: ({ color, size, focused }) => (
              <ClipboardCheck size={focused ? 20 : 18} color={color} />
            ),
          }}
        />
      )}

      {/* --- MENU RIWAYAT PRODUKSI ---
          - Muncul di bar utama khusus OPERATOR_PRODUKSI (4 tab)
          - Untuk ADMIN disembunyikan dari bar (tetap bisa dinavigasi via tombol) agar bar tetap maksimal 5 tab rapi */}
      {isOperatorProduksi && (
        <Tab.Screen
          name="ProductionHistory"
          component={ProductionHistoryScreen}
          options={{
            tabBarLabel: 'Riwayat',
            tabBarIcon: ({ color, size, focused }) => (
              <ClipboardList size={focused ? 20 : 18} color={color} />
            ),
          }}
        />
      )}

      {isAdmin && (
        <Tab.Screen
          name="ProductionHistory"
          component={ProductionHistoryScreen}
          options={{
            tabBarItemStyle: { display: 'none' },
          }}
        />
      )}

      {/* --- MENU KOMPLAIN CUSTOMER (STAFF QC & ADMIN) --- */}
      {(isStaffQc || isAdmin) && (
        <Tab.Screen
          name="Complaints"
          component={ComplaintsScreen}
          options={{
            tabBarLabel: 'Komplain',
            tabBarIcon: ({ color, size, focused }) => (
              <Building2 size={focused ? 20 : 18} color={color} />
            ),
          }}
        />
      )}

      {/* --- MENU TANYA AI (Semua Role dengan Konteks Berbeda) --- */}
      <Tab.Screen
        name="AiChat"
        component={AiChatScreen}
        options={{
          tabBarLabel: isOperatorProduksi
            ? 'AI Mesin'
            : isStaffQc
            ? 'AI Kualitas'
            : 'Tanya AI',
          tabBarIcon: ({ color, size, focused }) => (
            <Sparkles
              size={focused ? 20 : 18}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
