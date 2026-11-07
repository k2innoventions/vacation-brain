import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

type MemoryChipProps = {
  label: string;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
};

export default function MemoryChip({ label, selected, disabled, onPress }: MemoryChipProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled && !selected}
      style={({ pressed }) => [
        styles.chip,
        {
          borderColor: selected ? theme.text : theme.textSecondary + '44',
          backgroundColor: selected ? theme.text + '14' : theme.background,
          opacity: disabled && !selected ? 0.4 : pressed ? 0.75 : 1,
        },
      ]}
    >
      <Text style={[styles.label, { color: selected ? theme.text : theme.text }]}>
        {selected ? `✓ ${label}` : label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
  },
});
