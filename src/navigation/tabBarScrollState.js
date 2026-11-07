/**
 * tabBarScrollState: Lightweight zero-rerender scroll state bridge
 * Tracks whether each tab route is scrolled down (floating mode) or at top (docked mode).
 */

const routeScrolledMap = {};
const listeners = new Set();

export const isRouteScrolled = (routeName) => {
  if (!routeName) return false;
  return Boolean(routeScrolledMap[routeName]);
};

export const setRouteScrolled = (routeName, scrolled) => {
  if (!routeName) return;
  const nextVal = Boolean(scrolled);
  if (routeScrolledMap[routeName] === nextVal) return;
  routeScrolledMap[routeName] = nextVal;
  listeners.forEach((fn) => fn(routeName, nextVal));
};

export const handleTabScrollOffset = (routeName, offsetY) => {
  if (!routeName) return;
  const current = Boolean(routeScrolledMap[routeName]);
  // Hysteresis to prevent flicker around threshold
  if (!current && offsetY > 16) {
    setRouteScrolled(routeName, true);
  } else if (current && offsetY <= 8) {
    setRouteScrolled(routeName, false);
  }
};

export const subscribeTabScroll = (listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
