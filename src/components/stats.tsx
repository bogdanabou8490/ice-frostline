import React, { memo } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Snowflake } from 'lucide-react-native';
import { theme } from '../constants/theme';

/**
 * One pill shape for every statistic in the app. The icon is deliberately the
 * SAME glyph everywhere: pills in a row are told apart by colour, value and
 * label, never by three differently-proportioned sprites.
 */
export type StatCardProps = {
  value: string | number;
  label: string;
  accent: string;
  size?: 'md' | 'sm';
  style?: StyleProp<ViewStyle>;
};

function hasValue(value: string | number): boolean {
  if (typeof value === 'number') {
    return value > 0;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed !== '0' && trimmed !== '0.0';
}

function StatCardBase({ value, label, accent, size = 'md', style }: StatCardProps) {
  // An empty pill reads as a broken skeleton - render nothing instead.
  if (!hasValue(value)) {
    return null;
  }
  const small = size === 'sm';
  const wrap = small ? 30 : 44;
  const glyph = small ? 16 : 24;
  return (
    <View style={[styles.card, small ? styles.cardSm : null, style]}>
      <View
        style={[
          styles.iconWrap,
          { width: wrap, height: wrap, borderRadius: wrap / 2, backgroundColor: accent + '22' },
        ]}>
        <Snowflake size={glyph} color={accent} strokeWidth={2} />
      </View>
      <Text
        style={[styles.value, small ? styles.valueSm : null, { color: accent }]}
        numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export const StatCard = memo(StatCardBase);

export type StatRowProps = {
  cards: StatCardProps[];
  size?: 'md' | 'sm';
  style?: StyleProp<ViewStyle>;
};

/** A row with fewer than two live values is not worth the space - skip it. */
function StatRowBase({ cards, size = 'md', style }: StatRowProps) {
  const live = cards.filter(c => hasValue(c.value));
  if (live.length < 2) {
    return null;
  }
  return (
    <View style={[styles.row, style]}>
      {live.map(card => (
        <View key={card.label} style={styles.slot}>
          <StatCard {...card} size={size} />
        </View>
      ))}
    </View>
  );
}

export const StatRow = memo(StatRowBase);

const styles = StyleSheet.create({
  // width:'100%' (never flex:1 inside a flex:1 slot) so the text can never collapse
  card: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.ui.glass,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
  },
  cardSm: { paddingVertical: 10 },
  iconWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  value: {
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 30,
    fontVariant: ['tabular-nums'],
  },
  valueSm: { fontSize: 20, lineHeight: 24 },
  label: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: theme.colors.text.secondary,
  },
  row: { flexDirection: 'row', gap: 10 },
  slot: { flex: 1 },
});
