import React, { memo, useMemo } from 'react';
import { ImageBackground, StyleSheet, View, useWindowDimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { assets } from '../assets';
import { theme } from '../constants/theme';
import { makeRng } from '../game/rng';

export type AuroraVariant = 'loader' | 'menu' | 'game' | 'result' | 'hub';

const OVERLAYS: Record<AuroraVariant, readonly string[]> = {
  loader: theme.gradients.loader,
  menu: theme.gradients.menu,
  game: theme.gradients.game,
  result: theme.gradients.result,
  hub: theme.gradients.hub,
};

const BLOBS: Record<AuroraVariant, { color: string; opacity: number; size: number }[]> = {
  loader: [
    { color: theme.colors.ocean.wave, opacity: 0.18, size: 260 },
    { color: theme.colors.ocean.foam, opacity: 0.12, size: 320 },
  ],
  menu: [{ color: theme.colors.ocean.wave, opacity: 0.1, size: 300 }],
  game: [{ color: theme.colors.ocean.foam, opacity: 0.1, size: 280 }],
  result: [
    { color: theme.colors.ocean.foam, opacity: 0.14, size: 300 },
    { color: theme.colors.alert, opacity: 0.08, size: 240 },
  ],
  hub: [{ color: theme.colors.ocean.wave, opacity: 0.1, size: 280 }],
};

const SNOW_SEEDS: Record<AuroraVariant, number> = {
  loader: 10607,
  menu: 20011,
  game: 30133,
  result: 40423,
  hub: 50077,
};

const DOTS_PER_SCREEN = 22;

/**
 * The AURORA signature: bg_game, one screen-specific gradient field, soft
 * radial colour blobs and a fixed-seed snow field. Four layers before content.
 */
function AuroraBackgroundBase({
  variant,
  children,
}: {
  variant: AuroraVariant;
  children?: React.ReactNode;
}) {
  const { width, height } = useWindowDimensions();
  const dark = variant === 'loader' || variant === 'result';

  const dots = useMemo(() => {
    const rng = makeRng(SNOW_SEEDS[variant]);
    return Array.from({ length: DOTS_PER_SCREEN }, (_, i) => ({
      id: i,
      cx: rng.range(0.03, 0.97) * width,
      cy: rng.range(0.03, 0.97) * height,
      r: rng.range(1.5, 3),
      opacity: rng.range(0.1, 0.3),
    }));
  }, [variant, width, height]);

  const blobs = BLOBS[variant];

  return (
    <ImageBackground source={assets.bgGame} style={styles.fill} resizeMode="cover">
      <LinearGradient
        colors={OVERLAYS[variant] as string[]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={width} height={height}>
          <Defs>
            {blobs.map((b, i) => (
              <RadialGradient key={`g${i}`} id={`${variant}-blob${i}`} cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={b.color} stopOpacity={b.opacity} />
                <Stop offset="100%" stopColor={b.color} stopOpacity={0} />
              </RadialGradient>
            ))}
          </Defs>
          {blobs.map((b, i) => (
            <Circle
              key={`b${i}`}
              cx={i === 0 ? width * 0.18 : width * 0.86}
              cy={i === 0 ? height * 0.2 : height * 0.78}
              r={b.size / 2}
              fill={`url(#${variant}-blob${i})`}
            />
          ))}
          {dots.map(d => (
            <Circle
              key={d.id}
              cx={d.cx}
              cy={d.cy}
              r={d.r}
              fill={dark ? '#FFFFFF' : theme.colors.ocean.deep}
              opacity={dark ? d.opacity : d.opacity * 0.55}
            />
          ))}
        </Svg>
      </View>
      <View style={styles.fill}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});

export const AuroraBackground = memo(AuroraBackgroundBase);
