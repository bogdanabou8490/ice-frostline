import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Cloud, Thermometer, Wind } from 'lucide-react-native';
import { assets, fishSprite } from '../assets';
import { AuroraBackground } from '../components/AuroraBackground';
import { HeaderIconButton, ScreenHeader } from '../components/ScreenHeader';
import { PrimaryButton, RoundIconButton } from '../components/buttons';
import { BaitTile, ClueChip, FreezeStrip, StrikeDots } from '../components/gameHud';
import {
  BOARD_FRAME,
  BiteMeter,
  CatchCard,
  IceHoleBoard,
  TensionColumn,
} from '../components/gameBoard';
import { ConfirmPopup } from '../components/states';
import { theme } from '../constants/theme';
import { BAITS, isBaitUnlocked, type BaitId } from '../game/bait';
import { clueText } from '../game/weather';
import { formatDepth, formatWeight } from '../game/format';
import { SPECIES } from '../game/species';
import type { TripSummary } from '../game/trip';
import type { Profile } from '../game/storage';
import { useSweep } from '../hooks/useSweep';
import { useTrip, type TripSetup } from '../hooks/useTrip';

const PHASE_LABEL: Record<string, string> = {
  bait: 'DROP LINE',
  descend: 'DROPPING',
  bite: 'HOOK',
  reel: 'REEL',
  landed: 'NEXT CAST',
};

const PHASE_HINT: Record<string, string> = {
  bait: 'READ THE CLUES · PICK A BAIT · THEN DROP LINE',
  descend: 'THE LURE IS GOING DOWN TO THE FISH',
  bite: 'TAP HOOK WHEN THE MARKER IS IN THE GREEN BAND',
  reel: 'TAP REEL TO HOLD THE TENSION IN THE GREEN ZONE',
  landed: 'FISH ON THE ICE · TAP NEXT CAST TO GO AGAIN',
};

export type GameScreenProps = {
  setup: TripSetup;
  profile: Profile;
  onGameOver: (summary: TripSummary) => void;
  onExit: () => void;
};

export function GameScreen({ setup, profile, onGameOver, onExit }: GameScreenProps) {
  const { width } = useWindowDimensions();
  const reduced = profile.settings.reducedMotion;
  const units = profile.settings.units;

  const trip = useTrip(setup, onGameOver);
  const view = trip.view;
  const phase = view.phase;

  const sweep = useSweep(phase === 'bite', view.castKey);
  const [boardH, setBoardH] = useState(0);
  const [paused, setPausedState] = useState(false);
  const [status, setStatus] = useState<{ text: string; color: string } | null>(null);
  const statusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const boardW = Math.min(width - 32, 380);
  const innerW = boardW - 2 * BOARD_FRAME;
  const baitTile = Math.floor((innerW - 10) / 2);

  useEffect(() => {
    const kind = view.event.kind;
    if (kind === 'none') {
      return;
    }
    const map: Record<string, { text: string; color: string }> = {
      hook: { text: 'HOOK SET', color: theme.colors.success },
      spook: { text: 'SPOOKED - THE FISH BOLTED', color: theme.colors.danger },
      snap: { text: 'LINE SNAPPED', color: theme.colors.danger },
      landed: { text: 'FISH LANDED', color: theme.colors.ocean.wave },
      drift: { text: 'CLUES CHANGED', color: theme.colors.alert },
      move: { text: 'NEW HOLE DRILLED', color: theme.colors.ocean.wave },
      left: { text: 'THE FISH LOST INTEREST', color: theme.colors.text.secondary },
    };
    const next = map[kind];
    if (!next) {
      return;
    }
    setStatus(next);
    if (statusTimer.current) {
      clearTimeout(statusTimer.current);
    }
    statusTimer.current = setTimeout(() => setStatus(null), 1500);
  }, [view.event]);

  useEffect(
    () => () => {
      if (statusTimer.current) {
        clearTimeout(statusTimer.current);
      }
    },
    [],
  );

  const onBoardLayout = useCallback(
    (e: { nativeEvent: { layout: { height: number } } }) => {
      const h = Math.round(e.nativeEvent.layout.height);
      if (h > 0 && h !== boardH) {
        setBoardH(h);
      }
    },
    [boardH],
  );

  const handlePrimary = useCallback(() => {
    if (phase === 'bait') {
      trip.dropLine();
    } else if (phase === 'bite') {
      trip.hookNow(sweep.positionNow());
    } else if (phase === 'reel') {
      trip.pullReel();
    } else if (phase === 'landed') {
      trip.skipCatchCard();
    }
  }, [phase, sweep, trip]);

  const handleSelectBait = useCallback((id: BaitId) => trip.selectBait(id), [trip]);

  const openPause = useCallback(() => {
    setPausedState(true);
    trip.setPaused(true);
  }, [trip]);

  const resume = useCallback(() => {
    setPausedState(false);
    trip.setPaused(false);
  }, [trip]);

  const leaveToMenu = useCallback(() => {
    setPausedState(false);
    trip.setPaused(false);
    onExit();
  }, [onExit, trip]);

  const clues = useMemo(() => clueText(view.weather), [view.weather]);
  const sprite = view.species ? fishSprite(SPECIES[view.species].sprite) : null;
  const last = view.lastCatch;

  return (
    <AuroraBackground variant="game">
      <ScreenHeader
        title={`HOLE · ${formatDepth(view.spot.depth)}`}
        subtitle={`${view.spot.name} · ${clues.wind} · ${clues.temp}`}
        onBack={onExit}
        backLabel="MENU"
        rightSlot={
          <HeaderIconButton label="PAUSE" onPress={openPause} source={assets.iconPause} />
        }
      />

      <FreezeStrip percent={view.freeze} />

      <View style={styles.statusRow}>
        <Text style={styles.bagText}>
          BAG {view.catches.length} / {trip.bagLimit} · {view.points} FROST PTS
        </Text>
        {status ? (
          <Text style={[styles.statusText, { color: status.color }]} numberOfLines={1}>
            {status.text}
          </Text>
        ) : null}
      </View>

      <View style={styles.boardArea}>
        <View style={styles.boardSlot} onLayout={onBoardLayout}>
          {boardH > 0 ? (
          <IceHoleBoard
            width={boardW}
            height={boardH}
            phase={phase}
            castKey={view.castKey}
            speciesSprite={sprite}
            reduced={reduced}
            tappable={phase === 'bite' || phase === 'reel'}
            onTap={handlePrimary}>
            {phase === 'bait' ? (
              <View style={styles.baitLayer}>
                <View style={styles.clueRow}>
                  <ClueChip
                    icon={p => <Wind size={p.size} color={p.color} strokeWidth={2} />}
                    text={clues.wind}
                    hidden={!view.cluesVisible}
                    changed={view.clueChanged === 'wind'}
                  />
                  <ClueChip
                    icon={p => <Cloud size={p.size} color={p.color} strokeWidth={2} />}
                    text={clues.cloud}
                    hidden={!view.cluesVisible}
                    changed={view.clueChanged === 'cloud'}
                  />
                </View>
                <View style={styles.clueRow}>
                  <ClueChip
                    icon={p => <Thermometer size={p.size} color={p.color} strokeWidth={2} />}
                    text={clues.temp}
                    hidden={!view.cluesVisible}
                    changed={view.clueChanged === 'temp'}
                  />
                </View>

                <View style={styles.baitGrid}>
                  {BAITS.map(bait => (
                    <BaitTile
                      key={bait.id}
                      id={bait.id}
                      name={bait.name}
                      note={bait.note}
                      width={baitTile}
                      locked={!isBaitUnlocked(bait.id, view.pages)}
                      unlockHint={`JOURNAL ${bait.unlockPages} PAGES`}
                      selected={view.selectedBait === bait.id}
                      bucket={view.bucket}
                      showConfidence={view.pages >= 10 && view.selectedBait === bait.id}
                      onSelect={handleSelectBait}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            {phase === 'bite' ? (
              <View style={styles.meterLayer}>
                <BiteMeter
                  width={innerW - 24}
                  bandStart={view.bandStart}
                  bandWidth={view.bandWidth}
                  progress={sweep.progress}
                />
              </View>
            ) : null}

            {phase === 'reel' ? (
              <View style={styles.reelLayer}>
                <TensionColumn
                  height={Math.max(90, boardH * 0.42)}
                  tension={view.tension}
                  ratio={view.reelRatio}
                />
              </View>
            ) : null}

            {phase === 'landed' && last ? (
              <CatchCard
                sprite={fishSprite(SPECIES[last.species].sprite)}
                species={SPECIES[last.species].name}
                tier={last.tier}
                weight={formatWeight(last.weightKg, units)}
                points={last.points}
                isNewPage={last.isNewPage}
                reduced={reduced}
                scored={last.points > 0}
              />
            ) : null}
          </IceHoleBoard>
          ) : null}
        </View>
      </View>

      <View style={styles.controls}>
        <Text style={styles.hint} numberOfLines={2}>
          {PHASE_HINT[phase]}
        </Text>
        <View style={styles.controlsRow}>
          <RoundIconButton
            label="MOVE"
            caption="MOVE"
            iconSource={assets.sprite5}
            onPress={trip.moveHole}
            disabled={phase !== 'bait'}
          />
          <View style={styles.primarySlot}>
            <PrimaryButton
              label={PHASE_LABEL[phase]}
              onPress={handlePrimary}
              disabled={phase === 'descend'}
              height={60}
            />
          </View>
          <StrikeDots used={view.strikes} max={view.maxStrikes} />
        </View>
      </View>

      <ConfirmPopup
        visible={paused}
        title="PAUSED"
        message="The hole keeps its ice while you are away."
        confirmLabel="RESUME"
        cancelLabel="MENU"
        onConfirm={resume}
        onCancel={leaveToMenu}
      />
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 20,
    gap: 8,
  },
  bagText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    lineHeight: 15,
    color: theme.colors.ocean.deep,
    fontVariant: ['tabular-nums'],
  },
  statusText: { flex: 1, textAlign: 'right', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  boardArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    // reserves room for the floating control bar - the board never sits under it
    paddingBottom: 150,
  },
  // measured separately from the padded area, so the board height is the real
  // space left for it and can never overflow into the controls
  boardSlot: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' },
  baitLayer: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 4 },
  clueRow: { flexDirection: 'row', gap: 8, marginBottom: 8, justifyContent: 'center' },
  baitGrid: {
    marginTop: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  meterLayer: { flex: 1, justifyContent: 'flex-end', paddingBottom: 10 },
  reelLayer: { flex: 1, alignItems: 'flex-end', justifyContent: 'center', paddingRight: 8 },
  controls: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    borderRadius: theme.radius.xxl,
    backgroundColor: theme.colors.ui.glassStrong,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
    shadowColor: '#00558B',
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  hint: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    lineHeight: 14,
    textAlign: 'center',
    color: theme.colors.text.secondary,
    marginBottom: 10,
  },
  controlsRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  primarySlot: { flex: 1 },
});
