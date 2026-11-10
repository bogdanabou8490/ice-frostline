import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

/**
 * Smooths the integer tension of the reel loop into an animated 0..1 value for
 * a transform:scaleY fill. Transform only, so the native driver stays legal.
 */
export function useTension(tension: number, max = 100) {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const target = Math.max(0, Math.min(1, tension / max));
    const anim = Animated.timing(value, {
      toValue: target,
      duration: 90,
      useNativeDriver: true,
    });
    anim.start();
    return () => {
      anim.stop();
    };
  }, [tension, max, value]);

  return value;
}
