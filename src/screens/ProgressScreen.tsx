import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { AuroraBackground } from '../components/AuroraBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { RankBar } from '../components/panels';
import { StatCard } from '../components/stats';
import { EmptyState } from '../components/states';
import { theme } from '../constants/theme';
import { formatPercent, formatPoints, formatWeight } from '../game/format';
import { TOTAL_PAGES, unlockedCount } from '../game/journal';
import { rankProgress } from '../game/progression';
import { accuracy } from '../game/trip';
import type { Profile } from '../game/storage';

export type ProgressScreenProps = {
  profile: Profile;
  onBack: () => void;
  onPlay: () => void;
};

const CHART_H = 120;

export function ProgressScreen({ profile, onBack, onPlay }: ProgressScreenProps) {
  const { width } = useWindowDimensions();
  const gridW = Math.min(width - 32, 380);
  const progress = rankProgress(profile.xp);
  const pages = unlockedCount(profile.journal);
  const acc = accuracy(profile.hooks, profile.attempts);
  const tile = Math.floor((gridW - 20) / 3);

  const chart = useMemo(() => {
    const trips = profile.recentTrips.slice(-5);
    const max = trips.reduce((m, t) => Math.max(m, t.points), 0) || 1;
    const slot = gridW / 5;
    return trips.map((t, i) => ({
      key: t.index,
      x: i * slot + slot * 0.22,
      w: slot * 0.56,
      h: Math.max(6, (t.points / max) * (CHART_H - 26)),
      points: t.points,
    }));
  }, [gridW, profile.recentTrips]);

  const cards = [
    { value: profile.trips, label: 'TRIPS', accent: theme.colors.ocean.wave },
    { value: profile.fishLanded, label: 'FISH LANDED', accent: theme.colors.success },
    { value: acc > 0 ? formatPercent(acc) : 0, label: 'HOOK ACCURACY', accent: theme.colors.alert },
    {
      value: profile.heaviestKg > 0 ? formatWeight(profile.heaviestKg, profile.settings.units) : 0,
      label: 'HEAVIEST',
      accent: theme.colors.alert,
    },
    {
      value: profile.bestTrip > 0 ? formatPoints(profile.bestTrip) : 0,
      label: 'BEST TRIP',
      accent: theme.colors.ocean.deep,
    },
    { value: pages > 0 ? `${pages} / ${TOTAL_PAGES}` : 0, label: 'JOURNAL', accent: theme.colors.success },
  ].filter(c => (typeof c.value === 'number' ? c.value > 0 : true));

  const empty = profile.trips === 0;

  return (
    <AuroraBackground variant="hub">
      <ScreenHeader
        title="PROGRESS"
        subtitle="RANK, RECORDS AND THE LAST FIVE TRIPS"
        onBack={onBack}
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {empty ? (
          <EmptyState
            title="NO TRIPS YET"
            message="Walk out on the ice once and this page fills with your records."
            actionLabel="START TRIP"
            onAction={onPlay}
          />
        ) : (
          <>
            <View style={styles.rankBlock}>
              <Text style={styles.rankBig}>RANK {progress.rank}</Text>
              <RankBar xp={profile.xp} animated={!profile.settings.reducedMotion} />
            </View>

            <View style={[styles.grid, { width: gridW }]}>
              {cards.map(card => (
                <View key={card.label} style={{ width: tile }}>
                  <StatCard
                    value={card.value}
                    label={card.label}
                    accent={card.accent}
                    size="sm"
                  />
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>LAST FIVE TRIPS</Text>
            {chart.length > 0 ? (
              <Svg width={gridW} height={CHART_H}>
                {chart.map(bar => (
                  <React.Fragment key={bar.key}>
                    <Rect
                      x={bar.x}
                      y={CHART_H - 20 - bar.h}
                      width={bar.w}
                      height={bar.h}
                      rx={6}
                      fill={theme.colors.ocean.wave}
                      opacity={0.85}
                    />
                    <SvgText
                      x={bar.x + bar.w / 2}
                      y={CHART_H - 6}
                      fontSize="10"
                      fontWeight="700"
                      fill={theme.colors.text.secondary}
                      textAnchor="middle">
                      {`T${bar.key}`}
                    </SvgText>
                  </React.Fragment>
                ))}
              </Svg>
            ) : (
              <Text style={styles.note}>The chart fills once a trip is finished.</Text>
            )}

            <Text style={styles.note}>{progress.reward}</Text>
          </>
        )}
      </ScrollView>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, alignItems: 'center', paddingBottom: 30 },
  rankBlock: {
    width: '100%',
    padding: 16,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.ui.glass,
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
  },
  rankBig: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 1.5,
    lineHeight: 42,
    color: theme.colors.ocean.deep,
    fontVariant: ['tabular-nums'],
    marginBottom: 10,
  },
  grid: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-start',
  },
  sectionTitle: {
    alignSelf: 'flex-start',
    marginTop: 18,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: theme.colors.text.primary,
  },
  note: {
    marginTop: 10,
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: 0.8,
    color: theme.colors.text.muted,
    textAlign: 'center',
  },
});
