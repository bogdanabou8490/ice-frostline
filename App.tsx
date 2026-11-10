/**
 * IceFrostline - frozen lake catchbook.
 * App.tsx owns the screen state machine and the profile; every screen is
 * self-contained and receives only callbacks. No navigation library.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Easing, StatusBar, StyleSheet, View } from 'react-native';
import { LoaderScreen } from './src/screens/LoaderScreen';
import { MenuScreen } from './src/screens/MenuScreen';
import { GameScreen } from './src/screens/GameScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { ChallengeScreen } from './src/screens/ChallengeScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { CollectionScreen } from './src/screens/CollectionScreen';
import { DailyScreen } from './src/screens/DailyScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { useProfile } from './src/hooks/useProfile';
import type { TripSetup } from './src/hooks/useTrip';
import type { TripSummary } from './src/game/trip';
import type { ChallengeId } from './src/game/challenges';
import { dailyModifier, dailySeed, dayIndex } from './src/game/daily';
import { tripSeed } from './src/game/rng';
import { theme } from './src/constants/theme';
import { REDUCED_MOTION_MS } from './src/constants/config';

type Screen =
  | 'loader'
  | 'menu'
  | 'game'
  | 'gameover'
  | 'challenge'
  | 'progress'
  | 'collection'
  | 'daily'
  | 'settings';

function App(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>('loader');
  const [setup, setSetup] = useState<TripSetup | null>(null);
  const [summary, setSummary] = useState<TripSummary | null>(null);
  const [gameKey, setGameKey] = useState(0);

  const {
    profile,
    error,
    rank,
    reload,
    updateSettings,
    commitTrip,
    resetProgress,
  } = useProfile();

  const reduced = profile.settings.reducedMotion;
  const fade = useRef(new Animated.Value(1)).current;

  // Screen transitions are animated, never an instant swap.
  useEffect(() => {
    fade.setValue(0);
    const anim = Animated.timing(fade, {
      toValue: 1,
      duration: reduced ? REDUCED_MOTION_MS : 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    anim.start();
    return () => {
      anim.stop();
    };
  }, [screen, fade, reduced]);

  const goMenu = useCallback(() => setScreen('menu'), []);

  // Android Back: any screen returns to Menu, Menu closes the app.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'loader') {
        return true;
      }
      if (screen === 'menu') {
        return false;
      }
      setScreen('menu');
      return true;
    });
    return () => sub.remove();
  }, [screen]);

  const startTrip = useCallback(
    (mode: TripSetup['mode'], challengeId: ChallengeId | null) => {
      const now = new Date();
      const tripIndex = profile.trips + 1;
      const seed =
        mode === 'DAILY' ? dailySeed(now) : tripSeed(dayIndex(now), tripIndex);
      setSetup({
        mode,
        challengeId,
        seed,
        tripIndex,
        journal: profile.journal,
        settings: profile.settings,
        daily: mode === 'DAILY' ? dailyModifier(now) : null,
      });
      setGameKey(k => k + 1);
      setScreen('game');
    },
    [profile.journal, profile.settings, profile.trips],
  );

  const onPlay = useCallback(() => startTrip('FREE', null), [startTrip]);
  const onStartDaily = useCallback(() => startTrip('DAILY', null), [startTrip]);
  const onStartChallenge = useCallback(
    (id: ChallengeId) => startTrip('CHALLENGE', id),
    [startTrip],
  );

  const onGameOver = useCallback(
    (result: TripSummary) => {
      commitTrip(result);
      setSummary(result);
      setScreen('gameover');
    },
    [commitTrip],
  );

  const onPlayAgain = useCallback(() => {
    const mode = setup ? setup.mode : 'FREE';
    const challengeId = setup ? setup.challengeId : null;
    startTrip(mode === 'DAILY' ? 'FREE' : mode, challengeId);
  }, [setup, startTrip]);

  const renderScreen = () => {
    switch (screen) {
      case 'loader':
        return <LoaderScreen onDone={goMenu} />;
      case 'game':
        return setup ? (
          <GameScreen
            key={gameKey}
            setup={setup}
            profile={profile}
            onGameOver={onGameOver}
            onExit={goMenu}
          />
        ) : (
          <MenuScreen
            profile={profile}
            rank={rank}
            onPlay={onPlay}
            onOpenChallenge={() => setScreen('challenge')}
            onOpenDaily={() => setScreen('daily')}
            onOpenCollection={() => setScreen('collection')}
            onOpenProgress={() => setScreen('progress')}
            onOpenSettings={() => setScreen('settings')}
          />
        );
      case 'gameover':
        return summary ? (
          <ResultScreen
            summary={summary}
            profile={profile}
            onPlayAgain={onPlayAgain}
            onMenu={goMenu}
            onCollection={() => setScreen('collection')}
          />
        ) : null;
      case 'challenge':
        return (
          <ChallengeScreen
            profile={profile}
            rank={rank}
            loadError={error}
            onRetry={reload}
            onBack={goMenu}
            onStart={onStartChallenge}
          />
        );
      case 'progress':
        return <ProgressScreen profile={profile} onBack={goMenu} onPlay={onPlay} />;
      case 'collection':
        return <CollectionScreen profile={profile} onBack={goMenu} />;
      case 'daily':
        return (
          <DailyScreen
            profile={profile}
            onBack={goMenu}
            onStartDaily={onStartDaily}
            onCollection={() => setScreen('collection')}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            settings={profile.settings}
            onBack={goMenu}
            onChange={updateSettings}
            onReset={resetProgress}
          />
        );
      case 'menu':
      default:
        return (
          <MenuScreen
            profile={profile}
            rank={rank}
            onPlay={onPlay}
            onOpenChallenge={() => setScreen('challenge')}
            onOpenDaily={() => setScreen('daily')}
            onOpenCollection={() => setScreen('collection')}
            onOpenProgress={() => setScreen('progress')}
            onOpenSettings={() => setScreen('settings')}
          />
        );
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle={screen === 'loader' || screen === 'gameover' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.root,
          {
            opacity: fade,
            transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
          },
        ]}>
        {renderScreen()}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.ocean.night },
});

export default App;
