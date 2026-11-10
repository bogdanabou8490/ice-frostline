import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { BookOpen, Home, RotateCcw } from 'lucide-react-native';
import { fishSprite } from '../assets';
import { AuroraBackground } from '../components/AuroraBackground';
import { PrimaryButton, SecondaryButton } from '../components/buttons';
import { RankBar } from '../components/panels';
import { StatRow } from '../components/stats';
import { EmptyState } from '../components/states';
import { theme } from '../constants/theme';
import { formatPoints, formatPercent, formatWeight } from '../game/format';
import { SPECIES } from '../game/species';
import type { Profile } from '../game/storage';
import { END_HEADLINE, END_SUB, accuracy, type TripSummary } from '../game/trip';

export type ResultScreenProps = {
  summary: TripSummary;
  profile: Profile;
  onPlayAgain: () => void;
  onMenu: () => void;
  onCollection: () => void;
};

export function ResultScreen({
  summary,
  profile,
  onPlayAgain,
  onMenu,
  onCollection,
}: ResultScreenProps) {
  const reduced = profile.settings.reducedMotion;
  const anim = useRef(new Animated.Value(reduced ? 1 : 0)).current;

  useEffect(() => {
    if (reduced) {
      anim.setValue(1);
      return;
    }
    const a = Animated.timing(anim, {
      toValue: 1,
      duration: 360,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    a.start();
    return () => {
      a.stop();
    };
  }, [anim, reduced]);

  const acc = accuracy(summary.hooks, summary.attempts);
  const chips = summary.catches.slice(0, 6);

  return (
    <AuroraBackground variant="result">
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.root,
          {
            opacity: anim,
            transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
          },
        ]}>
        <View style={styles.head}>
          <Text style={styles.headline}>{END_HEADLINE[summary.reason]}</Text>
          <Text style={styles.sub}>{END_SUB[summary.reason]}</Text>
          <Text style={styles.meta}>
            TRIP {summary.tripIndex} · {summary.spotName} · SEED {summary.seed}
          </Text>
        </View>

        {chips.length > 0 ? (
          <View style={styles.strip}>
            {chips.map((c, i) => (
              <View key={`${c.species}${i}`} style={styles.chip}>
                <Image
                  source={fishSprite(SPECIES[c.species].sprite)}
                  style={styles.chipSprite}
                  resizeMode="contain"
                />
              </View>
            ))}
          </View>
        ) : (
          <EmptyState
            tone="dark"
            title="NO FISH THIS TRIP"
            message="The clues change every hour - read them again and go back out."
          />
        )}

        <StatRow
          style={styles.stats}
          cards={[
            {
              value: formatPoints(summary.points),
              label: 'FROST PTS',
              accent: theme.colors.ocean.foam,
            },
            {
              value: summary.heaviestKg > 0 ? formatWeight(summary.heaviestKg, profile.settings.units) : 0,
              label: 'HEAVIEST',
              accent: theme.colors.alert,
            },
            { value: acc > 0 ? formatPercent(acc) : 0, label: 'ACCURACY', accent: theme.colors.success },
          ]}
        />

        <View style={styles.rank}>
          <RankBar xp={profile.xp} gained={summary.points} tone="dark" />
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            label="FISH AGAIN"
            onPress={onPlayAgain}
            height={60}
            icon={p => <RotateCcw size={p.size} color={p.color} strokeWidth={2.2} />}
          />
          {summary.newPages > 0 ? (
            <SecondaryButton
              label="COLLECTION"
              onPress={onCollection}
              tone="dark"
              height={48}
              icon={p => <BookOpen size={p.size} color={p.color} strokeWidth={2.2} />}
            />
          ) : null}
          <SecondaryButton
            label="MENU"
            onPress={onMenu}
            tone="dark"
            height={48}
            icon={p => <Home size={p.size} color={p.color} strokeWidth={2.2} />}
          />
        </View>
      </Animated.View>
    </AuroraBackground>
  );
}

export const GameOverScreen = ResultScreen;

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 64, paddingHorizontal: 20, paddingBottom: 24 },
  head: { alignItems: 'center' },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1.5,
    lineHeight: 34,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  sub: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.72)',
  },
  meta: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    lineHeight: 14,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
  },
  strip: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  chip: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.26)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSprite: { width: 44, height: 44 },
  stats: { marginTop: 20 },
  rank: {
    marginTop: 18,
    padding: 14,
    borderRadius: theme.radius.lg,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  actions: { marginTop: 'auto', gap: 10 },
});
