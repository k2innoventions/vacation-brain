import { colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';

export function useTheme() {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? colors.dark : colors.light;
}
