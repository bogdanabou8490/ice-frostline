import React, { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { fishSprite } from '../assets';
import { AuroraBackground } from '../components/AuroraBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { JournalTile } from '../components/panels';
import { SecondaryButton } from '../components/buttons';
import { theme } from '../constants/theme';
import { ALL_PAGES, TOTAL_PAGES, unlockedCount } from '../game/journal';
import { SPECIES } from '../game/species';
import { formatWeight } from '../game/format';
import { baitById } from '../game/bait';
import type { Profile } from '../game/storage';

export type CollectionScreenProps = {
  profile: Profile;
  onBack: () => void;
};

export function CollectionScreen({ profile, onBack }: CollectionScreenProps) {
  const { width } = useWindowDimensions();
  const gridW = Math.min(width - 32, 380);
  const gap = 10;
  const tile = Math.floor((gridW - 2 * gap) / 3);
  const [openKey, setOpenKey] = useState<string | null>(null);

  const pages = unlockedCount(profile.journal);
  const handleOpen = useCallback((key: string) => setOpenKey(prev => (prev === key ? null : key)), []);
  const closeSheet = useCallback(() => setOpenKey(null), []);

  const detail = useMemo(() => {
    if (!openKey) {
      return null;
    }
    return profile.journal[openKey] ?? null;
  }, [openKey, profile.journal]);

  return (
    <AuroraBackground variant="hub">
      <ScreenHeader
        title="COLLECTION"
        subtitle="THE ILLUSTRATED CATCHBOOK"
        onBack={onBack}
        rightSlot={
          <View style={styles.pill}>
            <Text style={styles.pillText}>
              {pages} / {TOTAL_PAGES}
            </Text>
          </View>
        }
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {pages === 0 ? (
          <Text style={styles.emptyLine}>
            THE CATCHBOOK IS EMPTY - every new fish prints a page.
          </Text>
        ) : (
          <Text style={styles.lead}>Tap an unlocked page to read its record.</Text>
        )}

        <View style={[styles.grid, { width: gridW, gap }]}>
          {ALL_PAGES.map(page => (
            <JournalTile
              key={page.key}
              pageKey={page.key}
              species={page.species}
              tier={page.tier}
              entry={profile.journal[page.key] ?? null}
              size={tile}
              units={profile.settings.units}
              onPress={handleOpen}
            />
          ))}
        </View>

        {detail ? (
          <View style={[styles.sheet, { width: gridW }]}>
            <Image
              source={fishSprite(SPECIES[detail.species].sprite)}
              style={styles.sheetSprite}
              resizeMode="contain"
            />
            <Text style={styles.sheetTitle}>
              {SPECIES[detail.species].name} · {detail.tier}
            </Text>
            <Text style={styles.sheetValue}>
              {formatWeight(detail.bestKg, profile.settings.units)}
            </Text>
            <Text style={styles.sheetMeta}>
              CAUGHT {detail.date} ON {baitById(detail.bait).name}
            </Text>
            <View style={styles.sheetAction}>
              <SecondaryButton label="CLOSE" onPress={closeSheet} height={46} />
            </View>
          </View>
        ) : null}

        {openKey && !detail ? (
          <Pressable onPress={closeSheet} style={[styles.sheet, { width: gridW }]}>
            <Text style={styles.sheetTitle}>PAGE STILL LOCKED</Text>
            <Text style={styles.sheetMeta}>
              Land this species at this size and the page prints itself.
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, alignItems: 'center', paddingBottom: 30 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  lead: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
    color: theme.colors.text.secondary,
  },
  emptyLine: {
    marginBottom: 12,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    lineHeight: 16,
    textAlign: 'center',
    color: theme.colors.text.secondary,
  },
  sheet: {
    marginTop: 16,
    padding: 16,
    borderRadius: theme.radius.lg,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: theme.colors.ui.borderStrong,
    alignItems: 'center',
  },
  sheetSprite: { width: 120, height: 120 },
  sheetTitle: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.2,
    lineHeight: 20,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  sheetValue: {
    marginTop: 2,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28,
    color: theme.colors.ocean.deep,
    fontVariant: ['tabular-nums'],
  },
  sheetMeta: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    lineHeight: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  sheetAction: { marginTop: 12, width: 160 },
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
    fontVariant: ['tabular-nums'],
  },
});
