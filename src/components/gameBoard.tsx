import React, { memo, useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../constants/theme';
import { DESCEND_MS, REEL_BAND_HIGH, REEL_BAND_LOW } from '../constants/config';
import type { Phase } from '../game/trip';
import { assets } from '../assets';
import { useTension } from '../hooks/useTension';

export const BOARD_PAD = 6;
export const BOARD_BORDER = 2;
export const BOARD_FRAME = BOARD_PAD + BOARD_BORDER;

export type IceHoleBoardProps = {
  width: number;
  height: number;
  phase: Phase;
  castKey: number;
  speciesSprite: ImageSourcePropType | null;
  reduced: boolean;
  tappable: boolean;
  onTap: () => void;
  children?: React.ReactNode;
};

/**
 * The water column. Owns the lure descent, the rising fish silhouette and the
 * cast ripples; everything the phase needs on top of it arrives as children.
 */
function IceHoleBoardBase({
  width,
  height,
  phase,
  castKey,
  speciesSprite,
  reduced,
  tappable,
  onTap,
  children,
}: IceHoleBoardProps) {
  const inner = width - 2 * BOARD_FRAME;
  const drop = useRef(new Animated.Value(0)).current;
  const fish = useRef(new Animated.Value(0)).current;
  const ripple = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (phase !== 'descend') {
      return;
    }
    drop.setValue(0);
    ripple.setValue(0);
    const anim = Animated.parallel([
      Animated.timing(drop, {
        toValue: 1,
        duration: reduced ? 200 : DESCEND_MS,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(ripple, {
        toValue: 1,
        duration: reduced ? 200 : 700,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]);
    anim.start();
    return () => {
      anim.stop();
    };
  }, [phase, castKey, drop, ripple, reduced]);

  useEffect(() => {
    if (phase !== 'bite' && phase !== 'reel') {
      fish.setValue(0);
      return;
    }
    const anim = Animated.timing(fish, {
      toValue: 1,
      duration: reduced ? 200 : 1400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    anim.start();
    return () => {
      anim.stop();
    };
  }, [phase, castKey, fish, reduced]);

  const lureTravel = height * 0.52;
  const fishTravel = height * 0.3;

  return (
    <View style={[styles.board, { width, height }]}>
      <LinearGradient
        colors={theme.gradients.water as unknown as string[]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {[0.25, 0.5, 0.75].map(p => (
        <View key={p} style={[styles.depthRule, { top: height * p }]} />
      ))}

      <Animated.View
        pointerEvents="none"
        style={[
          styles.ripple,
          {
            left: inner / 2 - 26 + BOARD_FRAME,
            opacity: ripple.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
            transform: [{ scale: ripple.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.8] }) }],
          },
        ]}
      />

      {phase === 'descend' ? (
        <Animated.Image
          source={assets.sprite5}
          resizeMode="contain"
          style={[
            styles.lure,
            {
              left: inner / 2 - 17 + BOARD_FRAME,
              transform: [
                { translateY: drop.interpolate({ inputRange: [0, 1], outputRange: [8, lureTravel] }) },
              ],
            },
          ]}
        />
      ) : null}

      {speciesSprite && (phase === 'bite' || phase === 'reel') ? (
        <Animated.Image
          source={speciesSprite}
          resizeMode="contain"
          style={[
            styles.fish,
            {
              left: inner / 2 - 48 + BOARD_FRAME,
              top: height * 0.42,
              opacity: fish.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.85] }),
              transform: [
                { translateY: fish.interpolate({ inputRange: [0, 1], outputRange: [fishTravel, 0] }) },
              ],
            },
          ]}
        />
      ) : null}

      <View style={styles.content}>{children}</View>

      {tappable ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tap the hole"
          onPress={onTap}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
    </View>
  );
}

export const IceHoleBoard = memo(IceHoleBoardBase);

export type BiteMeterProps = {
  width: number;
  bandStart: number;
  bandWidth: number;
  progress: Animated.Value;
};

const MARKER_W = 4;

/** Track, green bite band and the sweeping amber marker. */
function BiteMeterBase({ width, bandStart, bandWidth, progress }: BiteMeterProps) {
  return (
    <View style={[styles.meterWrap, { width }]}>
      <View style={[styles.meterTrack, { width }]}>
        <LinearGradient
          colors={theme.gradients.band as unknown as string[]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.meterBand,
            { left: width * bandStart, width: Math.max(10, width * bandWidth) },
          ]}
        />
      </View>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.marker,
          {
            transform: [
              {
                translateX: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, Math.max(0, width - MARKER_W)],
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
}

export const BiteMeter = memo(BiteMeterBase);

export type TensionColumnProps = {
  height: number;
  tension: number;
  ratio: number;
};

/** Vertical line-tension gauge with the safe band marked on the track. */
function TensionColumnBase({ height, tension, ratio }: TensionColumnProps) {
  const clamped = Math.max(0, Math.min(100, tension));
  const safe = tension >= REEL_BAND_LOW && tension <= REEL_BAND_HIGH;
  // transform-only fill, so the 50 ms loop reads smooth on the native driver
  const fill = useTension(clamped);
  return (
    <View style={styles.tensionWrap}>
      <View style={[styles.tensionTrack, { height }]}>
        <View
          style={[
            styles.tensionSafe,
            {
              bottom: (REEL_BAND_LOW / 100) * height,
              height: ((REEL_BAND_HIGH - REEL_BAND_LOW) / 100) * height,
            },
          ]}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.tensionFill,
            {
              height,
              backgroundColor: safe ? theme.colors.success : theme.colors.danger,
              transform: [
                {
                  translateY: fill.interpolate({
                    inputRange: [0, 1],
                    outputRange: [height / 2, 0],
                  }),
                },
                { scaleY: fill },
              ],
            },
          ]}
        />
      </View>
      <Text style={[styles.tensionLabel, { color: safe ? theme.colors.success : theme.colors.danger }]}>
        {safe ? 'HOLDING' : 'TENSION'}
      </Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round(ratio * 100)}%` }]} />
      </View>
      <Text style={styles.progressLabel}>FISH {Math.round(ratio * 100)} %</Text>
    </View>
  );
}

export const TensionColumn = memo(TensionColumnBase);

export type CatchCardProps = {
  sprite: ImageSourcePropType;
  species: string;
  tier: string;
  weight: string;
  points: number;
  isNewPage: boolean;
  reduced: boolean;
  scored: boolean;
};

/** Non-interactive result card over the board - taps still reach the board. */
function CatchCardBase({
  sprite,
  species,
  tier,
  weight,
  points,
  isNewPage,
  reduced,
  scored,
}: CatchCardProps) {
  const pop = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    pop.setValue(reduced ? 1 : 0);
    if (reduced) {
      return;
    }
    const anim = Animated.spring(pop, {
      toValue: 1,
      tension: theme.animation.pop.tension,
      friction: theme.animation.pop.friction,
      useNativeDriver: true,
    });
    anim.start();
    return () => {
      anim.stop();
    };
  }, [pop, reduced, species, weight]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.catchCard,
        {
          opacity: pop,
          transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
        },
      ]}>
      <Image source={sprite} style={styles.catchSprite} resizeMode="contain" />
      <Text style={styles.catchSpecies} numberOfLines={1}>
        {species} · {tier}
      </Text>
      <Text style={styles.catchWeight}>{weight}</Text>
      <Text style={styles.catchPoints}>
        {scored ? `+${points} FROST PTS` : 'DOES NOT COUNT TODAY'}
      </Text>
      {isNewPage ? (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>NEW PAGE</Text>
        </View>
      ) : null}
    </Animated.View>
  );
}

export const CatchCard = memo(CatchCardBase);

const styles = StyleSheet.create({
  board: {
    borderRadius: theme.radius.xl,
    borderWidth: BOARD_BORDER,
    borderColor: 'rgba(0,85,139,0.16)',
    backgroundColor: 'rgba(255,255,255,0.5)',
    overflow: 'hidden',
    alignSelf: 'center',
  },
  depthRule: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  content: { flex: 1, padding: BOARD_PAD },
  lure: { position: 'absolute', top: 0, width: 34, height: 34 },
  fish: { position: 'absolute', width: 96, height: 96 },
  ripple: {
    position: 'absolute',
    top: 12,
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.75)',
  },
  meterWrap: { alignSelf: 'center', justifyContent: 'center', height: 34 },
  meterTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    overflow: 'hidden',
  },
  meterBand: { position: 'absolute', top: 0, bottom: 0, borderRadius: 4 },
  marker: {
    position: 'absolute',
    top: 2,
    left: 0,
    width: MARKER_W,
    height: 30,
    borderRadius: 2,
    backgroundColor: theme.colors.alert,
  },
  tensionWrap: { alignItems: 'center', justifyContent: 'center' },
  tensionTrack: {
    width: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  tensionSafe: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(31,181,143,0.3)',
  },
  tensionFill: { position: 'absolute', left: 0, right: 0, top: 0, borderRadius: 6 },
  tensionLabel: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  progressTrack: {
    marginTop: 8,
    width: 120,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.35)',
    overflow: 'hidden',
  },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: theme.colors.ocean.wave },
  progressLabel: {
    marginTop: 4,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    color: theme.colors.text.onDark,
  },
  catchCard: {
    position: 'absolute',
    left: 18,
    right: 18,
    top: '16%',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: theme.radius.xl,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(0,85,139,0.18)',
  },
  catchSprite: { width: 120, height: 120 },
  catchSpecies: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.4,
    lineHeight: 20,
    color: theme.colors.text.primary,
  },
  catchWeight: {
    marginTop: 2,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 30,
    color: theme.colors.ocean.deep,
    fontVariant: ['tabular-nums'],
  },
  catchPoints: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: theme.colors.ocean.wave,
  },
  newBadge: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(242,163,60,0.18)',
    borderWidth: 1,
    borderColor: theme.colors.alert,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: theme.colors.alert,
  },
});
