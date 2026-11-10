import React, { memo } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Lock } from 'lucide-react-native';
import { assets } from '../assets';
import { theme } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';
import type { IconRenderer } from './buttons';
import type { BaitId, MatchBucket } from '../game/bait';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

/** Hole-freeze meter. Colour flips at 30 % and again at 12 %. */
function FreezeStripBase({ percent }: { percent: number }) {
  const pct = Math.max(0, Math.min(100, percent));
  const colors =
    pct < 12
      ? [theme.colors.danger, theme.colors.danger]
      : pct < 30
      ? [theme.colors.alert, theme.colors.alert]
      : (theme.gradients.freeze as unknown as string[]);
  return (
    <View style={styles.freezeWrap}>
      <View style={styles.freezeTrack}>
        <LinearGradient
          colors={colors as string[]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.freezeFill, { width: `${pct}%` }]}
        />
      </View>
      <Text style={styles.freezeLabel}>HOLE FREEZING {Math.round(pct)} %</Text>
    </View>
  );
}

export const FreezeStrip = memo(FreezeStripBase);

function StrikeDotsBase({ used, max }: { used: number; max: number }) {
  return (
    <View style={styles.dotsWrap}>
      <View style={styles.dotsRow}>
        {Array.from({ length: max }, (_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < used
                ? { backgroundColor: theme.colors.danger, borderColor: theme.colors.danger }
                : null,
            ]}
          />
        ))}
      </View>
      <Text style={styles.dotsCaption}>SPOOKS</Text>
    </View>
  );
}

export const StrikeDots = memo(StrikeDotsBase);

/** One weather clue. Flashes amber for the drift that just changed it. */
function ClueChipBase({
  icon,
  text,
  changed = false,
  hidden = false,
}: {
  icon: IconRenderer;
  text: string;
  changed?: boolean;
  hidden?: boolean;
}) {
  const accent = changed ? theme.colors.alert : theme.colors.ocean.deep;
  return (
    <View
      style={[
        styles.chip,
        changed ? { borderColor: theme.colors.alert, backgroundColor: 'rgba(242,163,60,0.16)' } : null,
      ]}>
      {icon({ size: 16, color: hidden ? theme.colors.text.muted : accent })}
      <Text
        style={[styles.chipText, { color: hidden ? theme.colors.text.muted : accent }]}
        numberOfLines={1}>
        {hidden ? 'HIDDEN' : text}
      </Text>
    </View>
  );
}

export const ClueChip = memo(ClueChipBase);

export type BaitTileProps = {
  id: BaitId;
  name: string;
  note: string;
  width: number;
  locked: boolean;
  unlockHint: string;
  selected: boolean;
  bucket: MatchBucket;
  showConfidence: boolean;
  onSelect: (id: BaitId) => void;
};

const CONFIDENCE: Record<MatchBucket, number> = { perfect: 3, good: 2, poor: 1 };

function BaitTileBase({
  id,
  name,
  note,
  width,
  locked,
  unlockHint,
  selected,
  bucket,
  showConfidence,
  onSelect,
}: BaitTileProps) {
  const { scale, onPressIn, onPressOut } = usePressScale();
  const handlePress = React.useCallback(() => onSelect(id), [id, onSelect]);
  const dots = CONFIDENCE[bucket];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={locked ? `${name} locked` : name}
      accessibilityState={{ selected, disabled: locked }}
      disabled={locked}
      hitSlop={HIT}
      onPress={handlePress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={{ width, height: 88 }}>
      <Animated.View
        style={[
          styles.bait,
          { width, transform: [{ scale }] },
          selected ? styles.baitSelected : null,
          locked ? styles.baitLocked : null,
        ]}>
        {locked ? (
          <Lock size={20} color={theme.colors.text.muted} strokeWidth={2} />
        ) : (
          <Image source={assets.sprite5} style={styles.baitSprite} resizeMode="contain" />
        )}
        <Text
          style={[styles.baitName, locked ? { color: theme.colors.text.muted } : null]}
          numberOfLines={1}>
          {name}
        </Text>
        {locked ? (
          <Text style={styles.baitHint} numberOfLines={1}>
            {unlockHint}
          </Text>
        ) : showConfidence ? (
          <View style={styles.confidenceRow}>
            {[0, 1, 2].map(i => (
              <View
                key={i}
                style={[
                  styles.confidenceDot,
                  i < dots ? { backgroundColor: theme.colors.success } : null,
                ]}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.baitHint} numberOfLines={1}>
            {note}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

export const BaitTile = memo(BaitTileBase);

const styles = StyleSheet.create({
  freezeWrap: { paddingHorizontal: 16, paddingTop: 8 },
  freezeTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.ui.track,
    overflow: 'hidden',
  },
  freezeFill: { height: 6, borderRadius: 3 },
  freezeLabel: {
    marginTop: 4,
    textAlign: 'right',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: theme.colors.text.secondary,
  },
  dotsWrap: { alignItems: 'center', justifyContent: 'center', width: 60 },
  dotsRow: { flexDirection: 'row', gap: 6 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: theme.colors.ui.borderStrong,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotsCaption: {
    marginTop: 4,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    color: theme.colors.text.secondary,
  },
  chip: {
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
  },
  chipText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, lineHeight: 16 },
  bait: {
    height: 88,
    borderRadius: theme.radius.lg,
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  baitSelected: {
    borderColor: theme.colors.ocean.wave,
    borderWidth: 2,
    backgroundColor: 'rgba(0,166,203,0.14)',
  },
  baitLocked: { backgroundColor: 'rgba(255,255,255,0.35)' },
  baitSprite: { width: 36, height: 36 },
  baitName: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    lineHeight: 17,
    color: theme.colors.text.primary,
  },
  baitHint: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.6,
    lineHeight: 12,
    color: theme.colors.text.muted,
  },
  confidenceRow: { flexDirection: 'row', gap: 4, marginTop: 5 },
  confidenceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,85,139,0.18)',
  },
});
