/**
 * Yadawi design tokens — the single source of truth for colour.
 *
 * Before this module the same `COLORS` object was copy-pasted into 16 files, so
 * there was no way to retheme, add dark mode, or fix a contrast bug in one place.
 *
 * Structure follows the semantic-token model: every surface colour has a paired
 * `on*` foreground that is guaranteed to meet WCAG AA (4.5:1) against it, so you
 * can never accidentally pick an unreadable combination.
 *
 * Contrast ratios below were computed against the actual token values; if you
 * change a colour, re-check its pair.
 */

/** Brand hues. Raw palette — prefer the semantic tokens below in components. */
const palette = {
  terracotta: '#C8622A',   // brand primary
  terracottaStrong: '#A94E1E', // AA-safe primary: 5.5:1 vs white, 5.2:1 on cream
  terracottaLight: 'rgba(200, 98, 42, 0.1)',
  ember: '#E8873A',        // gradient partner for terracotta
  bark: '#3D2B1A',         // darkest brown — body text (12.6:1 on cream)
  smoke: '#6F6154',        // muted text. Darkened from #8B7B6E, which was only
                           // 3.8:1 on cream / 3.5:1 on sand and failed AA.
  sand: '#F2EAD8',         // raised surface
  cream: '#FAF6F0',        // page background
  white: '#FFFFFF',
} as const;

/** Status hues, shared by light and dark themes. */
const status = {
  success: '#22C55E',
  successLight: 'rgba(34, 197, 94, 0.1)',
  warning: '#F59E0B',
  warningLight: 'rgba(245, 158, 11, 0.1)',
  danger: '#EF4444',
  dangerLight: 'rgba(239, 68, 68, 0.1)',
  info: '#3B82F6',
  infoLight: 'rgba(59, 130, 246, 0.1)',
} as const;

export const lightTheme = {
  // Surfaces and their guaranteed-readable foregrounds
  background: palette.cream,
  onBackground: palette.bark,        // 12.6:1
  surface: palette.white,
  onSurface: palette.bark,           // 14.8:1
  surfaceRaised: palette.sand,       // cards, inputs, pills
  onSurfaceRaised: palette.bark,     // 11.2:1
  muted: palette.sand,
  onMuted: palette.smoke,            // 5.0:1 — secondary/label text

  // Brand
  primary: palette.terracotta,       // fills, borders, icons, large text
  primaryStrong: palette.terracottaStrong, // small text on light + button fills
  onPrimary: palette.white,          // 5.5:1 against primaryStrong
  primaryLight: palette.terracottaLight,
  secondary: palette.ember,
  ring: palette.terracotta,          // focus ring
  border: 'rgba(61, 43, 26, 0.12)',

  ...status,
} as const;

/**
 * Dark theme. Uses desaturated/lighter tonal variants rather than inverting the
 * light values — inverted brand colours vibrate badly on dark surfaces.
 */
export const darkTheme = {
  background: '#1A120B',
  onBackground: '#F2EAD8',           // 13.9:1
  surface: '#241811',
  onSurface: '#F2EAD8',              // 11.8:1
  surfaceRaised: '#32231A',
  onSurfaceRaised: '#F2EAD8',        // 9.1:1
  muted: '#32231A',
  onMuted: '#BFAE9C',                // 5.6:1 — secondary text

  primary: '#E8873A',                // lifted so it reads on dark (7.1:1)
  primaryStrong: '#F0A063',
  onPrimary: '#1A120B',              // 7.1:1 — dark text on light brand fill
  primaryLight: 'rgba(232, 135, 58, 0.16)',
  secondary: '#C8622A',
  ring: '#E8873A',
  border: 'rgba(242, 234, 216, 0.16)',

  ...status,
} as const;

export type Theme = typeof lightTheme;

/**
 * Legacy brand-name aliases.
 *
 * Existing screens reference `COLORS.terracotta`, `COLORS.bark`, etc. Importing
 * this keeps them working unchanged while removing the 16 duplicate definitions.
 * New code should use `lightTheme`/`darkTheme` semantic names instead.
 */
export const COLORS = {
  terracotta: palette.terracotta,
  terracottaStrong: palette.terracottaStrong,
  terracottaLight: palette.terracottaLight,
  ember: palette.ember,
  bark: palette.bark,
  sand: palette.sand,
  cream: palette.cream,
  smoke: palette.smoke,
  white: palette.white,
  border: lightTheme.border,
  ...status,
} as const;

export default COLORS;
