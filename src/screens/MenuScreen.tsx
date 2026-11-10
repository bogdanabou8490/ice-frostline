import React, { memo, useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Settings as SettingsIcon,
  ShieldCheck,
  Trophy,
} from 'lucide-react-native';
import { AuroraBackground } from '../components/AuroraBackground';
import { BentoTile } from '../components/BentoTile';
import { ScreenHeader } from '../components/ScreenHeader';
import { StatCard } from '../components/stats';
import { theme } from '../constants/theme';
import { formatPoints, formatWeight } from '../game/format';
import { canPlayDaily, dateKey } from '../game/daily';
import { TOTAL_PAGES, unlockedCount } from '../game/journal';
import type { Profile } from '../game/storage';

export type MenuScreenProps = {
  profile: Profile;
  rank: number;
  onPlay: () => void;
  onOpenChallenge: () => void;
  onOpenDaily: () => void;
  onOpenCollection: () => void;
  onOpenProgress: () => void;
  onOpenSettings: () => void;
};

/** Entry stagger. box-none so the wrapper can never swallow the tile press. */
const StaggerItem = memo(function StaggerItem({
  index,
  children,
  reduced,
}: {
  index: number;
  children: React.ReactNode;
  reduced: boolean;
}) {
  const anim = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  useEffect(() => {
    if (reduced) {
      anim.setValue(1);
      return;
    }
    const a = Animated.timing(anim, {
      toValue: 1,
      duration: 300,
      delay: index * 60,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    a.start();
    return () => {
      a.stop();
    };
  }, [anim, index, reduced]);
  return (
    <Animated.View
      pointerEvents="box-none"
      style={{
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
      }}>
      {children}
    </Animated.View>
  );
});

export function MenuScreen({
  profile,
  rank,
  onPlay,
  onOpenChallenge,
  onOpenDaily,
  onOpenCollection,
  onOpenProgress,
  onOpenSettings,
}: MenuScreenProps) {
  const { width } = useWindowDimensions();
  const reduced = profile.settings.reducedMotion;

  const metrics = useMemo(() => {
    const gridW = Math.min(width - 32, 380);
    const gap = 10;
    const col = Math.floor((gridW - 2 * gap) / 3);
    return { gridW, gap, col, wide: col * 2 + gap, cta: 210, stat: 100 };
  }, [width]);

  const pages = unlockedCount(profile.journal);
  const todayKey = dateKey(new Date());
  const dailyOpen = canPlayDaily(profile.daily, todayKey);
  const firstRun = profile.trips === 0 && profile.xp === 0;

  return (
    <AuroraBackground variant="menu">
      <ScreenHeader
        title="ICEFROSTLINE"
        subtitle="FROZEN LAKE CATCHBOOK"
        divider={false}
        rightSlot={
          <LinearGradient
            colors={theme.gradients.primary as unknown as string[]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.rankPill}>
            <Trophy size={16} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.rankPillText}>RANK {rank}</Text>
          </LinearGradient>
        }
      />

      <View style={styles.body}>
        <Text style={styles.hint}>HOW TO PLAY · READ THE CLUES, PICK A BAIT, TIME THE HOOK</Text>

        <View style={[styles.grid, { width: metrics.gridW }]}>
          <View style={[styles.row, { gap: metrics.gap }]}>
            <StaggerItem index={0} reduced={reduced}>
              <BentoTile
                variant="cta"
                label="START TRIP"
                sub="PLAN · BAIT · HOOK"
                width={metrics.wide}
                height={metrics.cta}
                onPress={onPlay}
              />
            </StaggerItem>

            <StaggerItem index={1} reduced={reduced}>
              {firstRun ? (
                <View style={[styles.firstRun, { width: metrics.col, height: metrics.cta }]}>
                  <Text style={styles.firstRunTitle}>FIRST TRIP</Text>
                  <Text style={styles.firstRunBody}>
                    The Catchbook is empty. Land your first fish to print a page.
                  </Text>
                </View>
              ) : (
                <View style={{ width: metrics.col, gap: metrics.gap }}>
                  <StatCard
                    value={formatPoints(profile.xp)}
                    label="FROST PTS"
                    accent={theme.colors.ocean.wave}
                    size="sm"
                    style={{ height: metrics.stat }}
                  />
                  <StatCard
                    value={formatWeight(profile.heaviestKg, profile.settings.units)}
                    label="BEST CATCH"
                    accent={theme.colors.alert}
                    size="sm"
                    style={{ height: metrics.stat }}
                  />
                </View>
              )}
            </StaggerItem>
          </View>

          <View style={[styles.row, { gap: metrics.gap, marginTop: metrics.gap }]}>
            <StaggerItem index={2} reduced={reduced}>
              <BentoTile
                label="CHALLENGE"
                sub="3 RUNS"
                width={metrics.col}
                height={84}
                accent={theme.colors.ocean.deep}
                icon={p => <ShieldCheck size={p.size} color={p.color} strokeWidth={2} />}
                onPress={onOpenChallenge}
              />
            </StaggerItem>
            <StaggerItem index={3} reduced={reduced}>
              <BentoTile
                label="DAILY MODE"
                sub={dailyOpen ? "TODAY'S LAKE IS OPEN" : 'TODAY IS DONE ✓'}
                width={metrics.wide}
                height={84}
                accent={theme.colors.ocean.wave}
                icon={p => <CalendarDays size={p.size} color={p.color} strokeWidth={2} />}
                onPress={onOpenDaily}
              />
            </StaggerItem>
          </View>

          <View style={[styles.row, { gap: metrics.gap, marginTop: metrics.gap }]}>
            <StaggerItem index={4} reduced={reduced}>
              <BentoTile
                label="COLLECTION"
                sub={`${pages} / ${TOTAL_PAGES}`}
                width={metrics.col}
                height={74}
                accent={theme.colors.success}
                icon={p => <BookOpen size={p.size} color={p.color} strokeWidth={2} />}
                onPress={onOpenCollection}
              />
            </StaggerItem>
            <StaggerItem index={5} reduced={reduced}>
              <BentoTile
                label="PROGRESS"
                sub={`${profile.trips} TRIPS`}
                width={metrics.col}
                height={74}
                accent={theme.colors.alert}
                icon={p => <BarChart3 size={p.size} color={p.color} strokeWidth={2} />}
                onPress={onOpenProgress}
              />
            </StaggerItem>
            <StaggerItem index={6} reduced={reduced}>
              <BentoTile
                label="SETTINGS"
                sub={profile.settings.assist}
                width={metrics.col}
                height={74}
                accent={theme.colors.text.secondary}
                icon={p => <SettingsIcon size={p.size} color={p.color} strokeWidth={2} />}
                onPress={onOpenSettings}
              />
            </StaggerItem>
          </View>
        </View>

        <Text style={styles.footer}>OFFLINE · NO ADS · NO REAL MONEY</Text>
      </View>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', paddingTop: 4 },
  hint: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    lineHeight: 14,
    color: theme.colors.text.secondary,
    marginBottom: 14,
    textAlign: 'center',
  },
  grid: { alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  rankPill: {
    height: 34,
    borderRadius: 17,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rankPillText: { fontSize: 12, fontWeight: '700', lineHeight: 16, color: '#FFFFFF' },
  firstRun: {
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.ui.glass,
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  firstRunTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    lineHeight: 17,
    color: theme.colors.ocean.deep,
  },
  firstRunBody: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
    textAlign: 'center',
    color: theme.colors.text.secondary,
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 18,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.4,
    color: theme.colors.text.muted,
  },
});
