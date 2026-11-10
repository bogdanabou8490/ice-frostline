/**
 * IceFrostline — OCEAN_FRESH preset, copied from design-system/presets.ts.
 * Two accent overrides only: bite/alert amber and success teal.
 * Style: AURORA / GRADIENT_MESH — soft gradient fields, glow, radius 20-28.
 */

export const theme = {
  name: 'OCEAN_FRESH',

  colors: {
    bg: {
      primary: '#E8F4F8',
      secondary: '#D1E7EE',
      tertiary: '#B8DBE5',
      accent: '#9DCEDB',
    },
    ocean: {
      deep: '#00558B',
      wave: '#00A6CB',
      foam: '#49C7D8',
      seafoam: '#A8E6D9',
      ice: '#06303D',
      night: '#052430',
    },
    // override 1 — the single warm accent (bite marker, best catch, freeze warning)
    alert: '#F2A33C',
    // override 2 — success (bite band, accuracy)
    success: '#1FB58F',
    danger: '#C7453C',
    text: {
      primary: '#06303D',
      secondary: '#3F6A7A',
      muted: '#7FA3B0',
      onDark: '#EAF6FA',
      onDarkMuted: 'rgba(234,246,250,0.62)',
    },
    ui: {
      border: 'rgba(0,85,139,0.14)',
      borderStrong: 'rgba(0,85,139,0.22)',
      glass: 'rgba(255,255,255,0.55)',
      glassStrong: 'rgba(255,255,255,0.72)',
      glassDark: 'rgba(255,255,255,0.08)',
      glassDarkBorder: 'rgba(255,255,255,0.16)',
      track: 'rgba(0,85,139,0.12)',
      trackDark: 'rgba(255,255,255,0.14)',
    },
  },

  gradients: {
    primary: ['#00A6CB', '#00558B'] as const,
    band: ['#1FB58F', '#49C7D8'] as const,
    water: ['#D1E7EE', '#9DCEDB', '#00558B'] as const,
    freeze: ['#49C7D8', '#00A6CB'] as const,
    // screen overlays over bg_game — one per screen family
    loader: ['rgba(5,36,48,0.94)', 'rgba(0,85,139,0.88)', 'rgba(3,26,36,0.96)'] as const,
    menu: ['rgba(232,244,248,0.86)', 'rgba(184,219,229,0.78)', 'rgba(209,231,238,0.90)'] as const,
    game: ['rgba(232,244,248,0.92)', 'rgba(157,206,219,0.80)', 'rgba(0,85,139,0.42)'] as const,
    result: ['rgba(0,46,74,0.82)', 'rgba(0,85,139,0.72)', 'rgba(5,36,48,0.90)'] as const,
    hub: ['rgba(214,236,243,0.90)', 'rgba(168,206,219,0.84)', 'rgba(0,85,139,0.30)'] as const,
  },

  typography: {
    hero: { fontSize: 40, fontWeight: '800' as const, letterSpacing: 5 },
    title: { fontSize: 26, fontWeight: '800' as const, letterSpacing: 1.5 },
    section: { fontSize: 17, fontWeight: '700' as const, letterSpacing: 1.2 },
    body: { fontSize: 15, fontWeight: '500' as const, lineHeight: 21 },
    caption: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 1.4 },
    number: {
      fontSize: 26,
      fontWeight: '800' as const,
      lineHeight: 30,
      fontVariant: ['tabular-nums'] as const,
    },
    button: { fontSize: 18, fontWeight: '800' as const, letterSpacing: 2, lineHeight: 24 },
  },

  radius: { sm: 10, md: 18, lg: 22, xl: 26, xxl: 28, full: 999 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },

  shadows: {
    card: {
      shadowColor: '#00558B',
      shadowOpacity: 0.16,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
    cta: {
      shadowColor: '#00558B',
      shadowOpacity: 0.28,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
  },

  animation: {
    spring: { tension: 180, friction: 12 },
    press: { tension: 300, friction: 18 },
    pop: { tension: 170, friction: 10 },
    fade: 280,
    element: 180,
  },
} as const;

export type Theme = typeof theme;
export const HEADER_TOP = 44;
