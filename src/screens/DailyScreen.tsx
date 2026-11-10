import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Cloud, Play, Thermometer, Wind } from 'lucide-react-native';
import { AuroraBackground } from '../components/AuroraBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { PrimaryButton, SecondaryButton } from '../components/buttons';
import { ClueChip } from '../components/gameHud';
import { ErrorState } from '../components/states';
import { theme } from '../constants/theme';
import {
  canPlayDaily,
  dailyModifier,
  dailySeed,
  dateKey,
  formatDateKey,
  weekStrip,
  WEEK_LETTERS,
} from '../game/daily';
import { makeRng } from '../game/rng';
import { pickSpot } from '../game/species';
import { clueText, rollWeather } from '../game/weather';
import { formatDepth, formatPoints } from '../game/format';
import type { Profile } from '../game/storage';

export type DailyScreenProps = {
  profile: Profile;
  onBack: () => void;
  onStartDaily: () => void;
  onCollection: () => void;
};

export function DailyScreen({ profile, onBack, onStartDaily, onCollection }: DailyScreenProps) {
  const today = useMemo(() => new Date(), []);
  const valid = !Number.isNaN(today.getTime());

  const lake = useMemo(() => {
    if (!valid) {
      return null;
    }
    const rng = makeRng(dailySeed(today));
    const modifier = dailyModifier(today);
    const spot = pickSpot(rng, modifier.minDepth);
    const weather = rollWeather(rng);
    return { rng, modifier, spot, weather, clues: clueText(weather) };
  }, [today, valid]);

  if (!valid || !lake) {
    return (
      <AuroraBackground variant="hub">
        <ScreenHeader title="DAILY MODE" onBack={onBack} />
        <ErrorState message="DAILY LAKE UNAVAILABLE" onRetry={onBack} />
      </AuroraBackground>
    );
  }

  const key = dateKey(today);
  const open = canPlayDaily(profile.daily, key);
  const record = profile.daily[key] ?? null;
  const week = weekStrip(profile.daily, today);

  return (
    <AuroraBackground variant="hub">
      <ScreenHeader
        title="DAILY MODE"
        subtitle="ONE SEEDED LAKE A DAY"
        onBack={onBack}
        rightSlot={
          <View style={styles.pill}>
            <Text style={styles.pillText}>SEED {key}</Text>
          </View>
        }
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.date}>{formatDateKey(key)}</Text>
          <Text style={styles.spot}>
            {lake.spot.name} · {formatDepth(lake.spot.depth)}
          </Text>

          <View style={styles.clues}>
            <ClueChip
              icon={p => <Wind size={p.size} color={p.color} strokeWidth={2} />}
              text={lake.clues.wind}
            />
            <ClueChip
              icon={p => <Cloud size={p.size} color={p.color} strokeWidth={2} />}
              text={lake.clues.cloud}
            />
          </View>
          <View style={styles.clues}>
            <ClueChip
              icon={p => <Thermometer size={p.size} color={p.color} strokeWidth={2} />}
              text={lake.clues.temp}
            />
          </View>

          <Text style={styles.modifierLabel}>MODIFIER OF THE DAY</Text>
          <Text style={styles.modifier}>{lake.modifier.text}</Text>
        </View>

        <View style={styles.weekRow}>
          {week.map((day, i) => (
            <View key={day.key} style={styles.weekCell}>
              <View style={[styles.weekDot, day.played ? styles.weekDotOn : null]} />
              <Text style={styles.weekLetter}>{WEEK_LETTERS[i]}</Text>
            </View>
          ))}
        </View>

        {open ? (
          <View style={styles.action}>
            <Text style={styles.actionHint}>ONE RUN PER CALENDAR DAY</Text>
            <PrimaryButton
              label="START DAILY"
              onPress={onStartDaily}
              height={60}
              icon={p => <Play size={p.size} color={p.color} strokeWidth={2.2} />}
            />
          </View>
        ) : (
          <View style={styles.action}>
            <View style={styles.doneCard}>
              <Text style={styles.doneTitle}>TODAY IS FISHED ✓</Text>
              <Text style={styles.doneValue}>
                {formatPoints(record ? record.points : 0)} FROST PTS ·{' '}
                {record ? record.fish : 0} FISH
              </Text>
              <Text style={styles.doneHint}>Come back tomorrow for a new seeded lake.</Text>
            </View>
            <SecondaryButton label="COLLECTION" onPress={onCollection} height={48} />
          </View>
        )}
      </ScrollView>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, paddingBottom: 30 },
  card: {
    padding: 16,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.ui.glass,
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
  },
  date: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1.2,
    lineHeight: 28,
    color: theme.colors.ocean.deep,
    fontVariant: ['tabular-nums'],
  },
  spot: {
    marginTop: 2,
    marginBottom: 12,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
    lineHeight: 16,
    color: theme.colors.text.secondary,
  },
  clues: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  modifierLabel: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: theme.colors.text.muted,
  },
  modifier: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    color: theme.colors.ocean.wave,
  },
  weekRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  weekCell: { alignItems: 'center', gap: 5 },
  weekDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: theme.colors.ui.borderStrong,
  },
  weekDotOn: { backgroundColor: theme.colors.ocean.wave, borderColor: theme.colors.ocean.wave },
  weekLetter: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: theme.colors.text.secondary,
  },
  action: { marginTop: 22, gap: 10 },
  actionHint: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    lineHeight: 14,
    textAlign: 'center',
    color: theme.colors.text.secondary,
    marginBottom: 6,
  },
  doneCard: {
    padding: 16,
    borderRadius: theme.radius.lg,
    backgroundColor: 'rgba(0,166,203,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,166,203,0.34)',
    alignItems: 'center',
  },
  doneTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.4,
    lineHeight: 18,
    color: theme.colors.ocean.deep,
  },
  doneValue: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
    color: theme.colors.ocean.wave,
    fontVariant: ['tabular-nums'],
  },
  doneHint: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
    color: theme.colors.text.secondary,
  },
  pill: {
    height: 32,
    borderRadius: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.ui.glass,
    borderWidth: 1,
    borderColor: theme.colors.ui.borderStrong,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    lineHeight: 14,
    color: theme.colors.ocean.deep,
    fontVariant: ['tabular-nums'],
  },
});
