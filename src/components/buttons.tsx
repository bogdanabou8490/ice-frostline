import React, { memo } from 'react';
import {
  Animated,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { assets } from '../assets';
import { theme } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';

import {
  BUTTON_GAP,
  BUTTON_HEIGHT_PRIMARY,
  BUTTON_HEIGHT_SECONDARY,
  BUTTON_ICON,
  HEADER_HIT_SLOP,
  ROUND_BUTTON,
} from '../constants/config';

const HIT = {
  top: HEADER_HIT_SLOP,
  bottom: HEADER_HIT_SLOP,
  left: HEADER_HIT_SLOP,
  right: HEADER_HIT_SLOP,
};
/** Button icons are 24x24 and the label line height matches them exactly. */
export const BTN_ICON = BUTTON_ICON;
export const BTN_GAP = BUTTON_GAP;

export type IconRenderer = (props: { size: number; color: string }) => React.ReactNode;

function ButtonContent({
  label,
  color,
  icon,
  iconSource,
  fontSize,
}: {
  label: string;
  color: string;
  icon?: IconRenderer;
  iconSource?: ImageSourcePropType;
  fontSize: number;
}) {
  return (
    <View style={styles.row}>
      {icon ? <View style={styles.iconBox}>{icon({ size: BTN_ICON, color })}</View> : null}
      {!icon && iconSource ? (
        <Image source={iconSource} style={styles.iconImage} resizeMode="contain" />
      ) : null}
      <Text style={[styles.label, { color, fontSize }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  height?: number;
  icon?: IconRenderer;
  style?: StyleProp<ViewStyle>;
  textureless?: boolean;
};

function PrimaryButtonBase({
  label,
  onPress,
  disabled = false,
  height = BUTTON_HEIGHT_PRIMARY,
  icon,
  style,
  textureless = false,
}: PrimaryButtonProps) {
  const { scale, onPressIn, onPressOut } = usePressScale();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={HIT}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[styles.primaryPress, { height }, style]}>
      <Animated.View
        style={[
          styles.primaryBody,
          theme.shadows.cta,
          { height, opacity: disabled ? 0.45 : 1, transform: [{ scale }] },
        ]}>
        <LinearGradient
          colors={theme.gradients.primary as unknown as string[]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {textureless ? null : (
          <ImageBackground
            source={assets.buttonRect}
            resizeMode="stretch"
            style={StyleSheet.absoluteFill}
            imageStyle={styles.texture}
          />
        )}
        <ButtonContent label={label} color="#FFFFFF" icon={icon} fontSize={18} />
      </Animated.View>
    </Pressable>
  );
}

export type SecondaryButtonProps = {
  label: string;
  onPress: () => void;
  icon?: IconRenderer;
  tone?: 'light' | 'dark' | 'danger';
  height?: number;
  style?: StyleProp<ViewStyle>;
};

function SecondaryButtonBase({
  label,
  onPress,
  icon,
  tone = 'light',
  height = BUTTON_HEIGHT_SECONDARY,
  style,
}: SecondaryButtonProps) {
  const { scale, onPressIn, onPressOut } = usePressScale();
  const palette =
    tone === 'dark'
      ? { bg: 'rgba(255,255,255,0.14)', border: 'rgba(255,255,255,0.34)', fg: theme.colors.text.onDark }
      : tone === 'danger'
      ? { bg: 'rgba(199,69,60,0.12)', border: 'rgba(199,69,60,0.42)', fg: theme.colors.danger }
      : { bg: theme.colors.ui.glass, border: theme.colors.ui.borderStrong, fg: theme.colors.ocean.deep };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={HIT}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[styles.secondaryPress, { height }, style]}>
      <Animated.View
        style={[
          styles.secondaryBody,
          {
            height,
            backgroundColor: palette.bg,
            borderColor: palette.border,
            transform: [{ scale }],
          },
        ]}>
        <ButtonContent label={label} color={palette.fg} icon={icon} fontSize={14} />
      </Animated.View>
    </Pressable>
  );
}

export type RoundIconButtonProps = {
  label: string;
  onPress: () => void;
  iconSource?: ImageSourcePropType;
  icon?: IconRenderer;
  caption?: string;
  size?: number;
  disabled?: boolean;
};

function RoundIconButtonBase({
  label,
  onPress,
  iconSource,
  icon,
  caption,
  size = ROUND_BUTTON,
  disabled = false,
}: RoundIconButtonProps) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.92);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={HIT}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[styles.roundPress, { width: size, height: size + (caption ? 14 : 0) }]}>
      <Animated.View
        style={[
          styles.roundBody,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            opacity: disabled ? 0.45 : 1,
            transform: [{ scale }],
          },
        ]}>
        <ImageBackground
          source={assets.buttonRound}
          resizeMode="contain"
          style={StyleSheet.absoluteFill}
          imageStyle={styles.roundTexture}
        />
        {icon ? (
          <View style={styles.iconBox}>{icon({ size: BTN_ICON, color: theme.colors.ocean.deep })}</View>
        ) : null}
        {!icon && iconSource ? (
          <Image source={iconSource} style={styles.roundIcon} resizeMode="contain" />
        ) : null}
      </Animated.View>
      {caption ? <Text style={styles.roundCaption}>{caption}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: BTN_GAP,
  },
  iconBox: {
    width: BTN_ICON,
    height: BTN_ICON,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImage: { width: BTN_ICON, height: BTN_ICON },
  label: {
    fontWeight: '800',
    letterSpacing: 2,
    lineHeight: BTN_ICON,
    textAlign: 'center',
  },
  primaryPress: { width: '100%', borderRadius: theme.radius.lg },
  primaryBody: {
    width: '100%',
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  texture: { opacity: 0.85 },
  secondaryPress: { width: '100%', borderRadius: theme.radius.md },
  secondaryBody: {
    width: '100%',
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  roundPress: { alignItems: 'center', justifyContent: 'center' },
  roundBody: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.ui.glassStrong,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    overflow: 'hidden',
  },
  roundTexture: { opacity: 0.9 },
  roundIcon: { width: 26, height: 26 },
  roundCaption: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: theme.colors.ocean.deep,
  },
});

export const PrimaryButton = memo(PrimaryButtonBase);
export const SecondaryButton = memo(SecondaryButtonBase);
export const RoundIconButton = memo(RoundIconButtonBase);
