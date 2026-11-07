import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  LayoutGrid,
  Factory,
  PlusCircle,
  ClipboardCheck,
  ClipboardList,
  Building2,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { InputProductionScreen } from '../screens/production/InputProductionScreen';
import { ProductionHistoryScreen } from '../screens/production/ProductionHistoryScreen';
import { InputDefectScreen } from '../screens/defect/InputDefectScreen';
import { MyHistoryScreen } from '../screens/history/MyHistoryScreen';
import { ComplaintsScreen } from '../screens/complaints/ComplaintsScreen';
import { CustomTabBar } from './CustomTabBar';

const Tab = createBottomTabNavigator();

/**
 * BottomTabNavigator: Role-Based Access Control (RBAC) Navigation
 * - OPERATOR_PRODUKSI: Dashboard Produksi, Input Produksi, Riwayat Produksi (3 tab)
 * - STAFF_QC: Dashboard Kualitas, Catat NG/Foto, Riwayat Cacat, Komplain Customer (4 tab)
 * - ADMIN: Full access to all production and QC modules (Dashboard, Input Prod, Catat NG, Riwayat, Komplain - 5 tab)
 */
export const BottomTabNavigator = () => {
  const { isOperatorProduksi, isStaffQc, isAdmin } = useAuth();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: 'shift',
      }}
    >
      {/* 1. Dashboard (Semua Role) */}
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <LayoutGrid size={18} strokeWidth={focused ? 2.4 : 1.9} color={color} />
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
            tabBarIcon: ({ color, focused }) => (
              <Factory size={18} strokeWidth={focused ? 2.4 : 1.9} color={color} />
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
            tabBarIcon: ({ color, focused }) => (
              <PlusCircle size={18} strokeWidth={focused ? 2.4 : 1.9} color={color} />
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
            tabBarIcon: ({ color, focused }) => (
              <ClipboardCheck size={18} strokeWidth={focused ? 2.4 : 1.9} color={color} />
            ),
          }}
        />
      )}

      {/* --- MENU RIWAYAT PRODUKSI ---
          - Muncul di bar utama khusus OPERATOR_PRODUKSI (3 tab)
          - Untuk ADMIN disembunyikan dari bar (diakses via switcher di MyHistoryScreen) agar bar tetap maksimal 5 tab rapi */}
      {isOperatorProduksi && (
        <Tab.Screen
          name="ProductionHistory"
          component={ProductionHistoryScreen}
          options={{
            tabBarLabel: 'Riwayat',
            tabBarIcon: ({ color, focused }) => (
              <ClipboardList size={18} strokeWidth={focused ? 2.4 : 1.9} color={color} />
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
            tabBarIcon: ({ color, focused }) => (
              <Building2 size={18} strokeWidth={focused ? 2.4 : 1.9} color={color} />
            ),
          }}
        />
      )}
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
