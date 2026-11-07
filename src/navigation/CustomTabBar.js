import React, { useRef, useEffect, useState } from 'react';
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
import {
  isRouteScrolled,
  subscribeTabScroll,
} from './tabBarScrollState';

const CAPSULE_WIDTH = 44;
const CAPSULE_HEIGHT = 24;

/**
 * TabItem: Compact, Practical & Dynamic Animated Tab Button
 * - Slim 24px icon area + crisp 10px label
 * - Smooth spring micro-interaction on focus & press
 */
const TabItem = ({
  route,
  isFocused,
  options,
  onPress,
  onLongPress,
  colors,
  tabCount = 5,
}) => {
  const focusAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(focusAnim, {
      toValue: isFocused ? 1 : 0,
      damping: 17,
      stiffness: 200,
      mass: 0.65,
      useNativeDriver: true,
    }).start();
  }, [isFocused, focusAnim]);

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.9,
      damping: 15,
      stiffness: 260,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      damping: 14,
      stiffness: 220,
      useNativeDriver: true,
    }).start();
  };

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
        size: 18,
      })
    : null;

  const labelFontSize = tabCount >= 5 ? 10 : 10.5;

  const iconTranslateY = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, -0.5],
  });

  const iconScale = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.04],
  });

  const labelOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.75, 1],
  });

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
          {
            transform: [{ scale: pressAnim }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.iconBox,
            {
              transform: [{ translateY: iconTranslateY }, { scale: iconScale }],
            },
          ]}
        >
          {icon}

          {options.tabBarBadge !== undefined ? (
            <View
              style={[
                styles.badgeContainer,
                { backgroundColor: colors.critical || '#EF4444' },
              ]}
            >
              <Text style={styles.badgeText}>{String(options.tabBarBadge)}</Text>
            </View>
          ) : null}
        </Animated.View>

        <Animated.Text
          style={[
            styles.tabLabel,
            {
              fontSize: labelFontSize,
              color: isFocused ? activeColor : inactiveColor,
              fontWeight: isFocused ? '800' : '600',
              opacity: labelOpacity,
            },
          ]}
          numberOfLines={1}
        >
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

/**
 * CustomTabBar: Adaptive Docked-at-Top / Floating-on-Scroll Navigation Bar
 * - At top of screen (scrollY <= 8): Merged flush at the bottom edge (Docked)
 * - When scrolled down (scrollY > 16): Smoothly lifts & narrows into a Floating Capsule Dock
 * - Compact 44x24 sliding icon capsule glides across tabs with spring physics
 */
export const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 14 : 6);
  const [rowWidth, setRowWidth] = useState(0);

  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    return options.tabBarItemStyle?.display !== 'none';
  });

  const tabCount = visibleRoutes.length;
  const activeRoute = state.routes[state.index];
  const activeRouteName = activeRoute?.name || 'Dashboard';

  // Resolve visible active index (map hidden ProductionHistory -> History tab)
  let activeVisibleIndex = visibleRoutes.findIndex((r) => r.key === activeRoute?.key);
  if (activeVisibleIndex === -1 && activeRouteName === 'ProductionHistory') {
    activeVisibleIndex = visibleRoutes.findIndex((r) => r.name === 'History');
  }
  if (activeVisibleIndex === -1) {
    activeVisibleIndex = 0;
  }

  // Track whether current active screen is scrolled down (Floating mode)
  const [isFloating, setIsFloating] = useState(() => isRouteScrolled(activeRouteName));

  useEffect(() => {
    setIsFloating(isRouteScrolled(activeRouteName));
  }, [activeRouteName]);

  useEffect(() => {
    return subscribeTabScroll((routeName, scrolled) => {
      if (routeName === activeRouteName) {
        setIsFloating(scrolled);
      }
    });
  }, [activeRouteName]);

  // 1. Horizontal sliding icon capsule animation
  const slideAnim = useRef(new Animated.Value(activeVisibleIndex)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeVisibleIndex,
      damping: 18,
      stiffness: 200,
      mass: 0.7,
      useNativeDriver: true,
    }).start();
  }, [activeVisibleIndex, slideAnim]);

  // 2. Docked (0) <-> Floating (1) morph animation
  const floatAnim = useRef(new Animated.Value(isFloating ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(floatAnim, {
      toValue: isFloating ? 1 : 0,
      damping: 19,
      stiffness: 180,
      mass: 0.75,
      useNativeDriver: false,
    }).start();
  }, [isFloating, floatAnim]);

  const slotWidth = tabCount > 0 ? rowWidth / tabCount : 0;

  const capsuleTranslateX =
    slotWidth > 0 && visibleRoutes.length > 1
      ? slideAnim.interpolate({
          inputRange: visibleRoutes.map((_, idx) => idx),
          outputRange: visibleRoutes.map(
            (_, idx) => (idx + 0.5) * slotWidth - CAPSULE_WIDTH / 2
          ),
        })
      : new Animated.Value(
          slotWidth > 0 ? 0.5 * slotWidth - CAPSULE_WIDTH / 2 : 0
        );

  const floatingBottomOffset = Math.max(insets.bottom, 10);

  const animatedMarginHorizontal = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 14],
  });

  const animatedBottom = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, floatingBottomOffset],
  });

  const animatedBorderRadius = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 22],
  });

  const animatedPaddingBottom = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [bottomPadding, 5],
  });

  const animatedShadowOpacity = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.06, isDark ? 0.38 : 0.16],
  });

  return (
    <View pointerEvents="box-none" style={styles.outerAnchor}>
      <Animated.View
        style={[
          styles.tabBarSurface,
          {
            backgroundColor: isDark
              ? isFloating
                ? 'rgba(15, 23, 42, 0.96)'
                : colors.navBackground
              : isFloating
              ? 'rgba(255, 255, 255, 0.97)'
              : colors.navBackground,
            borderColor: isFloating
              ? isDark
                ? colors.primary + '38'
                : colors.border
              : colors.border,
            borderTopWidth: 1,
            borderLeftWidth: isFloating ? 1 : 0,
            borderRightWidth: isFloating ? 1 : 0,
            borderBottomWidth: isFloating ? 1 : 0,
            marginHorizontal: animatedMarginHorizontal,
            bottom: animatedBottom,
            borderRadius: animatedBorderRadius,
            paddingBottom: animatedPaddingBottom,
            paddingTop: 5,
            shadowOpacity: animatedShadowOpacity,
            elevation: isFloating ? 18 : 10,
          },
        ]}
      >
        <View
          onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)}
          style={styles.tabsRow}
        >
          {/* Compact Sliding Icon Capsule */}
          {slotWidth > 0 ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.slidingIconCapsule,
                {
                  width: CAPSULE_WIDTH,
                  height: CAPSULE_HEIGHT,
                  backgroundColor: isDark
                    ? colors.primary + '28'
                    : colors.primary + '16',
                  borderColor: isDark
                    ? colors.primary + '4D'
                    : colors.primary + '30',
                  transform: [{ translateX: capsuleTranslateX }],
                },
              ]}
            />
          ) : null}

          {visibleRoutes.map((route, visibleIdx) => {
            const { options } = descriptors[route.key];
            const isFocused = visibleIdx === activeVisibleIndex;
            const isExactRouteFocused = activeRoute?.key === route.key;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isExactRouteFocused && !event.defaultPrevented) {
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
                tabCount={tabCount}
              />
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerAnchor: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
  tabBarSurface: {
    paddingHorizontal: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 42,
    position: 'relative',
  },
  slidingIconCapsule: {
    position: 'absolute',
    top: 1,
    left: 0,
    borderRadius: 12,
    borderWidth: 1,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    zIndex: 2,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  iconBox: {
    width: CAPSULE_WIDTH,
    height: CAPSULE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabLabel: {
    marginTop: 1.5,
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: -2,
    right: 2,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
  },
});

export default CustomTabBar;
