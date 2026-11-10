import React, { memo } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { Snowflake, X } from 'lucide-react-native';
import { theme } from '../constants/theme';
import { PrimaryButton, SecondaryButton } from './buttons';

export type EmptyStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: 'light' | 'dark';
};

/** A page that can be empty always says so in the game's own words. */
function EmptyStateBase({ title, message, actionLabel, onAction, tone = 'light' }: EmptyStateProps) {
  const fg = tone === 'dark' ? theme.colors.text.onDark : theme.colors.text.primary;
  const sub = tone === 'dark' ? theme.colors.text.onDarkMuted : theme.colors.text.secondary;
  return (
    <View style={styles.center}>
      <View style={styles.badge}>
        <Snowflake size={28} color={theme.colors.ocean.wave} strokeWidth={2} />
      </View>
      <Text style={[styles.title, { color: fg }]}>{title}</Text>
      <Text style={[styles.message, { color: sub }]}>{message}</Text>
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <PrimaryButton label={actionLabel} onPress={onAction} height={52} />
        </View>
      ) : null}
    </View>
  );
}

export const EmptyState = memo(EmptyStateBase);

export type ErrorStateProps = {
  message: string;
  onRetry: () => void;
  tone?: 'light' | 'dark';
};

function ErrorStateBase({ message, onRetry, tone = 'light' }: ErrorStateProps) {
  const fg = tone === 'dark' ? theme.colors.text.onDark : theme.colors.text.primary;
  return (
    <View style={styles.center}>
      <View style={[styles.badge, styles.badgeDanger]}>
        <X size={28} color={theme.colors.danger} strokeWidth={2.5} />
      </View>
      <Text style={[styles.title, { color: fg }]}>SOMETHING WENT WRONG</Text>
      <Text style={[styles.message, { color: theme.colors.text.secondary }]}>{message}</Text>
      <View style={styles.action}>
        <PrimaryButton label="RETRY" onPress={onRetry} height={52} />
      </View>
    </View>
  );
}

export const ErrorState = memo(ErrorStateBase);

export type ConfirmPopupProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Every popup button carries its own caption, by meaning. */
function ConfirmPopupBase({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'CANCEL',
  onConfirm,
  onCancel,
}: ConfirmPopupProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.popup}>
          <Text style={styles.popupTitle}>{title}</Text>
          <Text style={styles.popupMessage}>{message}</Text>
          <View style={styles.popupActions}>
            <PrimaryButton label={confirmLabel} onPress={onConfirm} height={52} />
            <SecondaryButton label={cancelLabel} onPress={onCancel} height={46} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export const ConfirmPopup = memo(ConfirmPopupBase);

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 24 },
  badge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,166,203,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(0,166,203,0.3)',
  },
  badgeDanger: {
    backgroundColor: 'rgba(199,69,60,0.14)',
    borderColor: 'rgba(199,69,60,0.35)',
  },
  title: {
    marginTop: 14,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.4,
    lineHeight: 20,
    textAlign: 'center',
  },
  message: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
    textAlign: 'center',
  },
  action: { marginTop: 18, width: 220 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5,36,48,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  popup: {
    width: '100%',
    borderRadius: theme.radius.xl,
    backgroundColor: '#F2FAFC',
    borderWidth: 1,
    borderColor: 'rgba(0,85,139,0.18)',
    padding: 22,
  },
  popupTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 1.4,
    lineHeight: 22,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  popupMessage: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  popupActions: { marginTop: 18, gap: 10 },
});
