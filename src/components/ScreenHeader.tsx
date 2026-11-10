import React, { memo } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { assets } from '../assets';
import { HEADER_TOP, theme } from '../constants/theme';
import { HEADER_BUTTON, HEADER_HIT_SLOP } from '../constants/config';
import { usePressScale } from '../hooks/usePressScale';

const HIT = {
  top: HEADER_HIT_SLOP,
  bottom: HEADER_HIT_SLOP,
  left: HEADER_HIT_SLOP,
  right: HEADER_HIT_SLOP,
};

/**
 * The one header of the app. Every screen passes the same three slots, so the
 * badges, paddings and type never drift between Menu, Game and the hubs.
 */
export type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  rightSlot?: React.ReactNode;
  tone?: 'light' | 'dark';
  divider?: boolean;
};

/** The 44x44 round header button. Exported so the game's pause button is the
 *  exact same control as the back button, never a second look-alike. */
export function HeaderIconButton({
  label,
  onPress,
  source,
  tone = 'light',
}: {
  label: string;
  onPress: () => void;
  source: number;
  tone?: 'light' | 'dark';
}) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.9);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={HIT}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={styles.iconPress}>
      <Animated.View
        style={[
          styles.iconBody,
          {
            backgroundColor: tone === 'dark' ? 'rgba(255,255,255,0.14)' : theme.colors.ui.glassStrong,
            borderColor: tone === 'dark' ? 'rgba(255,255,255,0.3)' : theme.colors.ui.borderStrong,
            transform: [{ scale }],
          },
        ]}>
        <Image source={source} style={styles.iconImage} resizeMode="contain" />
      </Animated.View>
    </Pressable>
  );
}

function ScreenHeaderBase({
  title,
  subtitle,
  onBack,
  backLabel = 'MENU',
  rightSlot,
  tone = 'light',
  divider = true,
}: ScreenHeaderProps) {
  const fg = tone === 'dark' ? theme.colors.text.onDark : theme.colors.text.primary;
  const sub = tone === 'dark' ? theme.colors.text.onDarkMuted : theme.colors.text.secondary;
  return (
    <View
      style={[
        styles.header,
        divider
          ? {
              borderBottomWidth: 1,
              borderBottomColor:
                tone === 'dark' ? 'rgba(255,255,255,0.16)' : theme.colors.ui.border,
            }
          : null,
      ]}>
      <View style={styles.side}>
        {onBack ? (
          <HeaderIconButton
            label={backLabel}
            onPress={onBack}
            source={assets.iconHome}
            tone={tone}
          />
        ) : null}
      </View>
      <View style={styles.center}>
        <Text style={[styles.title, { color: fg }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: sub }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.sideRight}>{rightSlot}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: HEADER_TOP,
    height: HEADER_TOP + 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  side: { width: 64, alignItems: 'flex-start', justifyContent: 'center' },
  sideRight: { minWidth: 64, alignItems: 'flex-end', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, fontWeight: '800', letterSpacing: 1.8, lineHeight: 22 },
  subtitle: { fontSize: 10, fontWeight: '600', letterSpacing: 1.4, lineHeight: 14, marginTop: 2 },
  iconPress: {
    width: HEADER_BUTTON,
    height: HEADER_BUTTON,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBody: {
    width: HEADER_BUTTON,
    height: HEADER_BUTTON,
    borderRadius: HEADER_BUTTON / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImage: { width: 22, height: 22 },
});

export const ScreenHeader = memo(ScreenHeaderBase);
