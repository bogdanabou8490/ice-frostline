import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { AuroraBackground } from '../components/AuroraBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { SettingRow } from '../components/panels';
import { ConfirmPopup } from '../components/states';
import { theme } from '../constants/theme';
import type { Assist, Settings, Units } from '../game/storage';

export type SettingsScreenProps = {
  settings: Settings;
  onBack: () => void;
  onChange: (patch: Partial<Settings>) => void;
  onReset: () => void;
};

export function SettingsScreen({ settings, onBack, onChange, onReset }: SettingsScreenProps) {
  const [step, setStep] = useState<0 | 1 | 2>(0);

  const handleAssist = useCallback(
    (option: string) => onChange({ assist: option as Assist }),
    [onChange],
  );
  const handleUnits = useCallback(
    (option: string) => onChange({ units: option as Units }),
    [onChange],
  );
  const handleMotion = useCallback(
    (next: boolean) => onChange({ reducedMotion: next }),
    [onChange],
  );

  const askReset = useCallback(() => setStep(1), []);
  const cancelReset = useCallback(() => setStep(0), []);
  const confirmFirst = useCallback(() => setStep(2), []);
  const confirmSecond = useCallback(() => {
    setStep(0);
    onReset();
  }, [onReset]);

  return (
    <AuroraBackground variant="hub">
      <ScreenHeader title="SETTINGS" subtitle="FOUR OPTIONS, ALL OF THEM REAL" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <SettingRow
          kind="segmented"
          label="HOOK ASSIST"
          hint="WIDE multiplies the green bite band by 1.35 from the next cast."
          options={['STANDARD', 'WIDE']}
          value={settings.assist}
          onSelect={handleAssist}
        />
        <SettingRow
          kind="switch"
          label="REDUCED MOTION"
          hint="Turns off the decorative loops and springs. Gameplay timings stay the same."
          on={settings.reducedMotion}
          onToggle={handleMotion}
        />
        <SettingRow
          kind="segmented"
          label="WEIGHT UNITS"
          hint="Re-formats every weight in Game, Result, Progress and Collection."
          options={['KG', 'LB']}
          value={settings.units}
          onSelect={handleUnits}
        />
        <SettingRow
          kind="destructive"
          label="RESET CATCHBOOK"
          hint="Clears the journal, rank, records and the daily history. Two confirmations."
          onPress={askReset}
        />

        <Text style={styles.footer}>OFFLINE · NO ADS · NO REAL MONEY</Text>
      </ScrollView>

      <ConfirmPopup
        visible={step === 1}
        title="RESET THE CATCHBOOK?"
        message="Every journal page, your rank and the daily history will be cleared."
        confirmLabel="CONTINUE"
        cancelLabel="KEEP MY BOOK"
        onConfirm={confirmFirst}
        onCancel={cancelReset}
      />
      <ConfirmPopup
        visible={step === 2}
        title="THIS CANNOT BE UNDONE"
        message="Confirm once more and the lake forgets every fish you landed."
        confirmLabel="RESET NOW"
        cancelLabel="CANCEL"
        onConfirm={confirmSecond}
        onCancel={cancelReset}
      />
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, gap: 12, paddingBottom: 30 },
  footer: {
    marginTop: 14,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.4,
    textAlign: 'center',
    color: theme.colors.text.muted,
  },
});
