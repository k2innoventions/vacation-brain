import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import MemoryChip from '@/components/MemoryChip';
import { useTheme } from '@/hooks/useTheme';
import type { MemoryPromptSection as MemoryPromptSectionType } from '@/lib/memory/prompts';
import { MEMORY_MAX_LENGTH } from '@/lib/types';

type MemoryPromptSectionProps = {
  section: MemoryPromptSectionType;
  selectedChipIds: Set<string>;
  isAtCap: boolean;
  onChipPress: (chipId: string, memoryText: string) => void;
  optionalText?: string;
  onOptionalTextChange?: (text: string) => void;
  onOptionalSubmit?: () => void;
};

export default function MemoryPromptSection({
  section,
  selectedChipIds,
  isAtCap,
  onChipPress,
  optionalText,
  onOptionalTextChange,
  onOptionalSubmit,
}: MemoryPromptSectionProps) {
  const theme = useTheme();

  const inputStyle = [
    styles.input,
    {
      color: theme.text,
      borderColor: theme.textSecondary + '44',
      backgroundColor: theme.background,
    },
  ];

  return (
    <View style={styles.section}>
      <Text style={[styles.question, { color: theme.text }]}>{section.question}</Text>
      <View style={styles.chips}>
        {section.chips.map((chip) => {
          const selected = selectedChipIds.has(chip.id);
          return (
            <MemoryChip
              key={chip.id}
              label={chip.label}
              selected={selected}
              disabled={isAtCap && !selected}
              onPress={() => onChipPress(chip.id, chip.memoryText)}
            />
          );
        })}
      </View>

      {section.optionalPrompt && onOptionalTextChange ? (
        <View style={styles.optionalBlock}>
          <Text style={[styles.optionalLabel, { color: theme.textSecondary }]}>
            {section.optionalPrompt}
          </Text>
          <TextInput
            value={optionalText ?? ''}
            onChangeText={(text) => onOptionalTextChange(text.slice(0, MEMORY_MAX_LENGTH))}
            placeholder="Optional — in your own words"
            placeholderTextColor={theme.textSecondary}
            style={inputStyle}
            multiline
            maxLength={MEMORY_MAX_LENGTH}
          />
          {optionalText && optionalText.trim().length > 0 && onOptionalSubmit ? (
            <Pressable
              onPress={onOptionalSubmit}
              style={({ pressed }) => [
                styles.optionalAdd,
                { backgroundColor: theme.text, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={[styles.optionalAddText, { color: theme.background }]}>Add</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
    marginBottom: 24,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionalBlock: {
    gap: 8,
    marginTop: 4,
  },
  optionalLabel: {
    fontSize: 14,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 44,
    textAlignVertical: 'top',
  },
  optionalAdd: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  optionalAddText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
