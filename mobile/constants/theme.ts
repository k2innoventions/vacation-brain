export const colors = {
  light: {
    background: '#FAFAF8',
    text: '#1A1A18',
    textSecondary: '#5C5C58',
  },
  dark: {
    background: '#121210',
    text: '#F5F5F2',
    textSecondary: '#A8A8A4',
  },
} as const;

export type ThemeColors = (typeof colors)['light'];
