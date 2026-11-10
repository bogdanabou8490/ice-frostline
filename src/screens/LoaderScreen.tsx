import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { assets } from '../assets';
import { AuroraBackground } from '../components/AuroraBackground';
import { LOADER_DURATION_MS } from '../constants/config';
import { theme } from '../constants/theme';

const BAR_W = 180;

/**
 * Brand card only: no PLAY button, no stat chips, no touch handlers.
 * It holds for exactly LOADER_DURATION_MS and then hands over to the menu.
 */
export function LoaderScreen({ onDone }: { onDone: () => void }) {
  const disc = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;
  const title = useRef(new Animated.Value(0)).current;
  const bar = useRef(new Animated.Value(0)).current;
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const timer = setTimeout(() => doneRef.current(), LOADER_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const entry = Animated.parallel([
      Animated.spring(disc, {
        toValue: 1,
        tension: 180,
        friction: 11,
        useNativeDriver: true,
      }),
      Animated.timing(title, {
        toValue: 1,
        duration: 520,
        delay: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
    // width is the one property the native driver may not touch
    const fill = Animated.timing(bar, {
      toValue: 1,
      duration: LOADER_DURATION_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    entry.start();
    fill.start();
    loop.start();
    return () => {
      entry.stop();
      fill.stop();
      loop.stop();
    };
  }, [bar, disc, float, title]);

  return (
    <AuroraBackground variant="loader">
      <View style={styles.root}>
        <Animated.View
          style={[
            styles.disc,
            {
              opacity: disc,
              transform: [
                { scale: disc.interpolate({ inputRange: [0, 1], outputRange: [0.78, 1] }) },
                { translateY: float.interpolate({ inputRange: [0, 1], outputRange: [3, -3] }) },
              ],
            },
          ]}>
          <Image source={assets.logo} style={styles.logo} resizeMode="contain" />
        </Animated.View>

        <Animated.View
          style={{
            opacity: title,
            transform: [{ translateY: title.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
          }}>
          <Text style={styles.title}>ICEFROSTLINE</Text>
          <Text style={styles.subtitle}>FROZEN LAKE CATCHBOOK</Text>
        </Animated.View>

        <View style={styles.barTrack}>
          <Animated.View
            style={[
              styles.barFillWrap,
              { width: bar.interpolate({ inputRange: [0, 1], outputRange: [0, BAR_W] }) },
            ]}>
            <LinearGradient
              colors={[theme.colors.ocean.wave, theme.colors.ocean.foam]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.barFill}
            />
          </Animated.View>
        </View>
        <Text style={styles.loading}>LOADING...</Text>
      </View>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  disc: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.ui.glassDark,
    borderWidth: 1,
    borderColor: theme.colors.ui.glassDarkBorder,
    marginBottom: 32,
  },
  logo: { width: 148, height: 148 },
  title: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: 5,
    lineHeight: 48,
    textAlign: 'center',
    color: '#EAF6FA',
    textShadowColor: 'rgba(0,166,203,0.55)',
    textShadowRadius: 18,
    textShadowOffset: { width: 0, height: 0 },
  },
  subtitle: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 3.2,
    lineHeight: 16,
    textAlign: 'center',
    color: 'rgba(234,246,250,0.62)',
  },
  barTrack: {
    marginTop: 40,
    width: BAR_W,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
  },
  barFillWrap: { height: 5, borderRadius: 3, overflow: 'hidden' },
  barFill: { flex: 1 },
  loading: {
    marginTop: 12,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2.4,
    lineHeight: 14,
    color: 'rgba(234,246,250,0.5)',
  },
});
