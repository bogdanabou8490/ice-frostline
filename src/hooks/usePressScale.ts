import { useCallback, useRef } from 'react';
import { Animated } from 'react-native';
import { theme } from '../constants/theme';

/**
 * Press feedback for this stack: the Pressable stays the OUTER element and the
 * Animated.View sits INSIDE it, so nothing can swallow the press on Android.
 * Only transform is animated, so useNativeDriver stays true.
 */
export function usePressScale(to = 0.96) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: to,
      tension: theme.animation.press.tension,
      friction: theme.animation.press.friction,
      useNativeDriver: true,
    }).start();
  }, [scale, to]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: theme.animation.press.tension,
      friction: theme.animation.press.friction,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  return { scale, onPressIn, onPressOut };
}
