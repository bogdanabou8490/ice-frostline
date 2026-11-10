import React, { memo, useEffect, useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Lock } from 'lucide-react-native';
import { fishSprite } from '../assets';
import { theme } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';
import { rankProgress } from '../game/progression';
import { PAGE_CLUES, type JournalEntry } from '../game/journal';
import { SPECIES, type SpeciesId, type Tier } from '../game/species';
import { formatWeight } from '../game/format';
import type { Units } from '../game/storage';
import type { Challenge } from '../game/challenges';
import { PrimaryButton } from './buttons';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

export type RankBarProps = {
  xp: number;
  gained?: number;
  tone?: 'light' | 'dark';
  animated?: boolean;
};

/** Rank progress. The fill animates its width, so useNativeDriver stays false. */
function RankBarBase({ xp, gained = 0, tone = 'light', animated = true }: RankBarProps) {
  const progress = rankProgress(xp);
  const width = useRef(new Animated.Value(animated ? 0 : progress.ratio)).current;

  useEffect(() => {
    if (!animated) {
      width.setValue(progress.ratio);
      return;
    }
    const anim = Animated.timing(width, {
      toValue: progress.ratio,
      duration: 600,
      useNativeDriver: false,
    });
    anim.start();
    return () => {
      anim.stop();
    };
  }, [animated, progress.ratio, width]);

  const fg = tone === 'dark' ? theme.colors.text.onDark : theme.colors.text.primary;
  const sub = tone === 'dark' ? theme.colors.text.onDarkMuted : theme.colors.text.secondary;
  const nextLabel = progress.isMax
    ? 'FROSTLINE MASTER'
    : `RANK ${progress.rank} · NEXT RANK ${progress.rank + 1}`;

  return (
    <View style={styles.rankWrap}>
      <View style={styles.rankHead}>
        <Text style={[styles.rankLabel, { color: fg }]}>{nextLabel}</Text>
        <Text style={[styles.rankXp, { color: sub }]}>
          {progress.isMax ? `${xp} XP` : `${progress.inRank} / ${progress.needed} XP`}
        </Text>
      </View>
      <View
        style={[
          styles.rankTrack,
          { backgroundColor: tone === 'dark' ? theme.colors.ui.trackDark : theme.colors.ui.track },
        ]}>
        <Animated.View
          style={[
            styles.rankFillWrap,
            { width: width.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
          ]}>
          <LinearGradient
            colors={theme.gradients.primary as unknown as string[]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.rankFill}
          />
        </Animated.View>
      </View>
      {gained > 0 ? <Text style={[styles.rankGain, { color: sub }]}>+{gained} XP</Text> : null}
      <Text style={[styles.rankReward, { color: sub }]} numberOfLines={1}>
        {progress.reward}
      </Text>
    </View>
  );
}

export const RankBar = memo(RankBarBase);

export type JournalTileProps = {
  pageKey: string;
  species: SpeciesId;
  tier: Tier;
  entry: JournalEntry | null;
  size: number;
  units: Units;
  onPress: (key: string) => void;
};

function JournalTileBase({ pageKey, species, tier, entry, size, units, onPress }: JournalTileProps) {
  const { scale, onPressIn, onPressOut } = usePressScale();
  const handlePress = React.useCallback(() => onPress(pageKey), [onPress, pageKey]);
  const unlocked = entry !== null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={unlocked ? `${SPECIES[species].name} ${tier}` : 'Locked page'}
      hitSlop={HIT}
      onPress={handlePress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={{ width: size, height: size + 26 }}>
      <Animated.View
        style={[
          styles.journalTile,
          { width: size, height: size + 26, transform: [{ scale }] },
          unlocked ? null : styles.journalLocked,
        ]}>
        <Image
          source={fishSprite(SPECIES[species].sprite)}
          resizeMode="contain"
          style={[
            { width: size - 22, height: size - 34 },
            unlocked ? null : styles.journalGhost,
          ]}
        />
        {unlocked ? (
          <>
            <View style={styles.tierRibbon}>
              <Text style={styles.tierRibbonText}>{tier}</Text>
            </View>
            <Text style={styles.journalCaption} numberOfLines={1}>
              {formatWeight(entry.bestKg, units)}
            </Text>
          </>
        ) : (
          <>
            <Lock size={16} color={theme.colors.text.muted} strokeWidth={2} />
            <Text style={styles.journalClue} numberOfLines={2}>
              {PAGE_CLUES[pageKey] ?? 'KEEP FISHING'}
            </Text>
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}

export const JournalTile = memo(JournalTileBase);

export type ChallengeCardProps = {
  challenge: Challenge;
  best: number;
  locked: boolean;
  onStart: (id: Challenge['id']) => void;
};

function ChallengeCardBase({ challenge, best, locked, onStart }: ChallengeCardProps) {
  const handleStart = React.useCallback(() => onStart(challenge.id), [challenge.id, onStart]);
  return (
    <View style={styles.challenge}>
      <View style={[styles.challengeStripe, locked ? styles.challengeStripeLocked : null]} />
      <View style={styles.challengeBody}>
        <Text style={styles.challengeName} numberOfLines={1}>
          {challenge.name}
        </Text>
        <Text style={styles.challengeObjective} numberOfLines={2}>
          {challenge.objective}
        </Text>
        <Text style={styles.challengeModifier} numberOfLines={1}>
          {challenge.modifier}
        </Text>
        <Text style={styles.challengeBest} numberOfLines={1}>
          {best > 0 ? `BEST ${best}` : 'NOT ATTEMPTED'}
        </Text>
      </View>
      <View style={styles.challengeAction}>
        {locked ? (
          <View style={styles.lockBox}>
            <Lock size={18} color={theme.colors.text.muted} strokeWidth={2} />
            <Text style={styles.lockText}>RANK {challenge.rankNeeded}</Text>
          </View>
        ) : (
          <PrimaryButton label="START" onPress={handleStart} height={48} textureless />
        )}
      </View>
    </View>
  );
}

export const ChallengeCard = memo(ChallengeCardBase);

export type SettingRowProps = {
  label: string;
  hint: string;
  kind: 'segmented' | 'switch' | 'destructive';
  options?: string[];
  value?: string;
  on?: boolean;
  onSelect?: (option: string) => void;
  onToggle?: (next: boolean) => void;
  onPress?: () => void;
};

function SettingRowBase({
  label,
  hint,
  kind,
  options = [],
  value,
  on = false,
  onSelect,
  onToggle,
  onPress,
}: SettingRowProps) {
  return (
    <View style={[styles.settingRow, kind === 'destructive' ? styles.settingDanger : null]}>
      <View style={styles.settingText}>
        <Text
          style={[
            styles.settingLabel,
            kind === 'destructive' ? { color: theme.colors.danger } : null,
          ]}
          numberOfLines={1}>
          {label}
        </Text>
        <Text style={styles.settingHint} numberOfLines={2}>
          {hint}
        </Text>
      </View>
      {kind === 'segmented' ? (
        <View style={styles.segmented}>
          {options.map(option => {
            const active = option === value;
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityLabel={`${label} ${option}`}
                accessibilityState={{ selected: active }}
                hitSlop={HIT}
                onPress={() => onSelect?.(option)}
                style={[styles.segment, active ? styles.segmentActive : null]}>
                <Text style={[styles.segmentText, active ? styles.segmentTextActive : null]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      {kind === 'switch' ? (
        <Switch
          value={on}
          onValueChange={next => onToggle?.(next)}
          accessibilityLabel={label}
          thumbColor={on ? theme.colors.ocean.wave : '#FFFFFF'}
          trackColor={{ false: 'rgba(0,85,139,0.2)', true: 'rgba(0,166,203,0.45)' }}
        />
      ) : null}
      {kind === 'destructive' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label}
          hitSlop={HIT}
          onPress={onPress}
          style={styles.destructiveButton}>
          <Text style={styles.destructiveText}>RESET</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export const SettingRow = memo(SettingRowBase);

const styles = StyleSheet.create({
  rankWrap: { width: '100%' },
  rankHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  rankLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 1.2, lineHeight: 16 },
  rankXp: { fontSize: 11, fontWeight: '700', lineHeight: 15, fontVariant: ['tabular-nums'] },
  rankTrack: { marginTop: 7, height: 8, borderRadius: 4, overflow: 'hidden' },
  rankFillWrap: { height: 8, borderRadius: 4, overflow: 'hidden' },
  rankFill: { flex: 1 },
  rankGain: { marginTop: 5, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  rankReward: { marginTop: 3, fontSize: 10, fontWeight: '600', letterSpacing: 0.8 },

  journalTile: {
    borderRadius: theme.radius.md,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    overflow: 'hidden',
  },
  journalLocked: { backgroundColor: 'rgba(0,85,139,0.08)' },
  journalGhost: { opacity: 0.08 },
  tierRibbon: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 7,
    backgroundColor: 'rgba(0,166,203,0.18)',
  },
  tierRibbonText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: theme.colors.ocean.deep,
  },
  journalCaption: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    lineHeight: 15,
    color: theme.colors.ocean.deep,
    fontVariant: ['tabular-nums'],
  },
  journalClue: {
    marginTop: 2,
    fontSize: 8,
    fontWeight: '600',
    lineHeight: 11,
    textAlign: 'center',
    paddingHorizontal: 4,
    color: theme.colors.text.muted,
  },

  challenge: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 112,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.ui.glass,
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
    overflow: 'hidden',
  },
  challengeStripe: { width: 4, height: '100%', backgroundColor: theme.colors.ocean.wave },
  challengeStripeLocked: { backgroundColor: theme.colors.text.muted },
  challengeBody: { flex: 1, paddingHorizontal: 12, paddingVertical: 10 },
  challengeName: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.2,
    lineHeight: 19,
    color: theme.colors.text.primary,
  },
  challengeObjective: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
    color: theme.colors.text.secondary,
  },
  challengeModifier: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    lineHeight: 14,
    color: theme.colors.ocean.wave,
  },
  challengeBest: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    lineHeight: 14,
    color: theme.colors.text.muted,
  },
  challengeAction: { width: 104, paddingRight: 12 },
  lockBox: { alignItems: 'center', justifyContent: 'center', gap: 4 },
  lockText: { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: theme.colors.text.muted },

  settingRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.ui.glass,
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
    gap: 12,
  },
  settingDanger: { borderColor: 'rgba(199,69,60,0.35)' },
  settingText: { flex: 1 },
  settingLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.1,
    lineHeight: 17,
    color: theme.colors.text.primary,
  },
  settingHint: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
    color: theme.colors.text.secondary,
  },
  segmented: {
    flexDirection: 'row',
    borderRadius: theme.radius.sm,
    backgroundColor: 'rgba(0,85,139,0.08)',
    padding: 3,
    gap: 3,
  },
  segment: {
    minWidth: 58,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  segmentActive: { backgroundColor: theme.colors.ocean.wave },
  segmentText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    lineHeight: 15,
    color: theme.colors.text.secondary,
  },
  segmentTextActive: { color: '#FFFFFF' },
  destructiveButton: {
    width: 92,
    height: 44,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(199,69,60,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(199,69,60,0.4)',
  },
  destructiveText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    lineHeight: 16,
    color: theme.colors.danger,
  },
});
