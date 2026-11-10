import React, { memo } from 'react';
import { Animated, Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { assets } from '../assets';
import { theme } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';
import type { IconRenderer } from './buttons';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

export type BentoTileProps = {
  label: string;
  sub?: string;
  onPress: () => void;
  width: number;
  height: number;
  variant?: 'cell' | 'wide' | 'cta';
  icon?: IconRenderer;
  accent?: string;
};

function BentoTileBase({
  label,
  sub,
  onPress,
  width,
  height,
  variant = 'cell',
  icon,
  accent = theme.colors.ocean.deep,
}: BentoTileProps) {
  const { scale, onPressIn, onPressOut } = usePressScale();
  const cta = variant === 'cta';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={HIT}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={{ width, height }}>
      <Animated.View
        style={[
          styles.body,
          cta ? styles.ctaBody : styles.cellBody,
          cta ? theme.shadows.cta : theme.shadows.card,
          { width, height, transform: [{ scale }] },
        ]}>
        {cta ? (
          <>
            <LinearGradient
              colors={theme.gradients.primary as unknown as string[]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <ImageBackground
              source={assets.buttonRect}
              resizeMode="stretch"
              style={StyleSheet.absoluteFill}
              imageStyle={styles.texture}
            />
            <Image source={assets.sprite5} style={styles.ctaSprite} resizeMode="contain" />
            <Text style={styles.ctaLabel} numberOfLines={1}>
              {label}
            </Text>
            {sub ? (
              <Text style={styles.ctaSub} numberOfLines={1}>
                {sub}
              </Text>
            ) : null}
          </>
        ) : (
          <>
            {icon ? (
              <View style={[styles.iconWrap, { backgroundColor: accent + '1A' }]}>
                {icon({ size: 20, color: accent })}
              </View>
            ) : null}
            <Text style={styles.cellLabel} numberOfLines={1}>
              {label}
            </Text>
            {sub ? (
              <Text style={styles.cellSub} numberOfLines={1}>
                {sub}
              </Text>
            ) : null}
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cellBody: {
    backgroundColor: theme.colors.ui.glass,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
    paddingHorizontal: 6,
  },
  ctaBody: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  texture: { opacity: 0.9 },
  ctaSprite: { width: 72, height: 72, marginBottom: 10 },
  ctaLabel: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 2,
    lineHeight: 28,
    color: '#FFFFFF',
  },
  ctaSub: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.72)',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cellLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
    lineHeight: 16,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  cellSub: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    lineHeight: 13,
    color: theme.colors.text.muted,
    textAlign: 'center',
  },
});

export const BentoTile = memo(BentoTileBase);
