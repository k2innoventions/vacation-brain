import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/useTheme';

type ScreenShellProps = {
  title: string;
  children: React.ReactNode;
  showBack?: boolean;
  footer?: React.ReactNode;
  contentStyle?: ViewStyle;
};

export default function ScreenShell({
  title,
  children,
  showBack = true,
  footer,
  contentStyle,
}: ScreenShellProps) {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        {showBack ? (
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={[styles.backText, { color: theme.textSecondary }]}>← Back</Text>
          </Pressable>
        ) : (
          <View style={styles.backButton} />
        )}
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      </View>

      <View style={[styles.content, contentStyle]}>{children}</View>

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backButton: {
    minHeight: 32,
    justifyContent: 'center',
    marginBottom: 4,
  },
  backText: {
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  pressed: {
    opacity: 0.6,
  },
});
