import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AuroraBackground } from '../components/AuroraBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { ChallengeCard } from '../components/panels';
import { ErrorState } from '../components/states';
import { theme } from '../constants/theme';
import { CHALLENGES, isChallengeUnlocked, type ChallengeId } from '../game/challenges';
import type { Profile } from '../game/storage';

export type ChallengeScreenProps = {
  profile: Profile;
  rank: number;
  loadError: boolean;
  onRetry: () => void;
  onBack: () => void;
  onStart: (id: ChallengeId) => void;
};

export function ChallengeScreen({
  profile,
  rank,
  loadError,
  onRetry,
  onBack,
  onStart,
}: ChallengeScreenProps) {
  return (
    <AuroraBackground variant="hub">
      <ScreenHeader
        title="CHALLENGE"
        subtitle="THREE HARDER WAYS TO FISH"
        onBack={onBack}
        rightSlot={
          <View style={styles.pill}>
            <Text style={styles.pillText}>RANK {rank}</Text>
          </View>
        }
      />
      {loadError ? (
        <ErrorState message="COULD NOT READ YOUR PROGRESS" onRetry={onRetry} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.lead}>
            Each challenge changes one real rule of the trip and pays a bigger reward.
          </Text>
          {CHALLENGES.map(challenge => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              best={profile.challengeBest[challenge.id] ?? 0}
              locked={!isChallengeUnlocked(challenge, rank)}
              onStart={onStart}
            />
          ))}
          <Text style={styles.footer}>
            A challenge trip ends the same way a free trip does and still writes journal pages.
          </Text>
        </ScrollView>
      )}
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, gap: 12, paddingBottom: 30 },
  lead: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
  footer: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
    color: theme.colors.text.muted,
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
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    lineHeight: 15,
    color: theme.colors.ocean.deep,
  },
});
