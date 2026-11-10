import { useCallback, useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { SWEEP_MS } from '../constants/config';
import { markerPos } from '../game/hook';

/**
 * The amber marker. The native-driven translateX and the JS hit test are both
 * linear triangle waves over the same SWEEP_MS, so what the player sees and
 * what the hook test reads can never drift apart.
 */
export function useSweep(active: boolean, castKey: number) {
  const progress = useRef(new Animated.Value(0)).current;
  const startedAt = useRef(0);

  useEffect(() => {
    if (!active) {
      progress.stopAnimation();
      progress.setValue(0);
      return;
    }
    startedAt.current = Date.now();
    progress.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: SWEEP_MS,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: SWEEP_MS,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [active, castKey, progress]);

  /** Live marker position 0..1 — read from the clock, never from stale state. */
  const positionNow = useCallback(
    () => markerPos(Date.now() - startedAt.current, SWEEP_MS),
    [],
  );

  return { progress, positionNow, startedAt };
}
