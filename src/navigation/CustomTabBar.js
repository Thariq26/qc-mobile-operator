import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';

/**
 * TabItem: Individual Animated Tab Button
 * - Tactile spring press feedback (glove-friendly)
 * - Dynamic active capsule around icon
 * - Role-specific accent coloring:
 *   * InputDefect (Catat NG): Critical Red
 *   * Complaints (Komplain): Purple
 *   * InputProduction / History / Dashboard: Primary Industrial Blue
 * - Micro-indicator bar underneath active label
 */
const TabItem = ({
  route,
  isFocused,
  options,
  onPress,
  onLongPress,
  colors,
  isDark,
  tabCount = 5,
}) => {
  const scaleAnim = useRef(new Animated.Value(isFocused ? 1 : 0.95)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isFocused ? 1 : 0.95,
      friction: 6,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [isFocused, scaleAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: isFocused ? 1 : 0.95,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  // Unified signature primary accent for bottom navigation (Linear / Vercel style)
  const activeColor = colors.primary;
  const inactiveColor = colors.textMuted || '#94A3B8';

  const label =
    options.tabBarLabel !== undefined
      ? options.tabBarLabel
      : options.title !== undefined
      ? options.title
      : route.name;

  const icon = options.tabBarIcon
    ? options.tabBarIcon({
        focused: isFocused,
        color: isFocused ? activeColor : inactiveColor,
        size: tabCount >= 6 ? (isFocused ? 19 : 17) : (isFocused ? 20 : 18),
      })
    : null;

  const capsuleWidth = tabCount >= 6 ? 38 : tabCount <= 4 ? 48 : 42;
  const labelFontSize = tabCount >= 6 ? 10 : tabCount <= 4 ? 11 : 10.5;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={typeof label === 'string' ? label : route.name}
      style={styles.tabButton}
    >
      <Animated.View
        style={[
          styles.tabContent,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* Dynamic Active Capsule around Icon */}
        <View
          style={[
            styles.iconCapsule,
            {
              width: capsuleWidth,
              backgroundColor: isFocused
                ? isDark
                  ? activeColor + '2E'
                  : activeColor + '18'
                : 'transparent',
              borderColor: isFocused
                ? isDark
                  ? activeColor + '55'
                  : activeColor + '30'
                : 'transparent',
            },
          ]}
        >
          {icon}

          {/* Optional badge indicator */}
          {options.tabBarBadge !== undefined && (
            <View
              style={[
                styles.badgeContainer,
                { backgroundColor: colors.critical || '#EF4444' },
              ]}
            >
              <Text style={styles.badgeText}>{options.tabBarBadge}</Text>
            </View>
          )}
        </View>

        {/* Tab Label */}
        <Text
          style={[
            styles.tabLabel,
            {
              fontSize: labelFontSize,
              color: isFocused ? activeColor : inactiveColor,
              fontWeight: isFocused ? '800' : '600',
            },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>

        {/* Micro-Indicator Bar */}
        <View
          style={[
            styles.indicatorBar,
            {
              width: tabCount >= 6 ? 12 : 14,
              backgroundColor: isFocused ? activeColor : 'transparent',
              opacity: isFocused ? 1 : 0,
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
};

/**
 * CustomTabBar: Modern, Practical & Dynamic Bottom Navigation Dock
 * - Responsive flex distribution for 4 tabs (Operator) and 5 tabs (Admin / QC)
 * - Safe Area aware for gesture bar and notch navigation
 * - Capsule highlight for active items with role-specific accent coloring
 * - Seamless dual-theme support
 */
export const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 8);

  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    return options.tabBarItemStyle?.display !== 'none';
  });
  const tabCount = visibleRoutes.length;

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          backgroundColor: colors.navBackground,
          borderTopColor: colors.border,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          height: 58 + bottomPadding,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];

        // Skip hidden routes (e.g. ProductionHistory when hidden from tab bar)
        if (options.tabBarItemStyle?.display === 'none') {
          return null;
        }

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TabItem
            key={route.key}
            route={route}
            isFocused={isFocused}
            options={options}
            onPress={onPress}
            onLongPress={onLongPress}
            colors={colors}
            isDark={isDark}
            tabCount={tabCount}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    elevation: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    paddingHorizontal: 2,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    minHeight: 48,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconCapsule: {
    width: 44,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    position: 'relative',
  },
  tabLabel: {
    fontSize: typography.sizes.tabLabel ? typography.sizes.tabLabel - 0.5 : 10.5,
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  indicatorBar: {
    width: 14,
    height: 2.5,
    borderRadius: 1.5,
    marginTop: 2,
  },
  badgeContainer: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});

export default CustomTabBar;
