import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import type { Memory } from '@/lib/types';
import { MEMORY_MAX_LENGTH } from '@/lib/types';

type KeepsInMindCardProps = {
  memory: Memory;
  isEditing: boolean;
  editDraft: string;
  onStartEdit: () => void;
  onEditDraftChange: (text: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onRemove: () => void;
};

export default function KeepsInMindCard({
  memory,
  isEditing,
  editDraft,
  onStartEdit,
  onEditDraftChange,
  onSaveEdit,
  onCancelEdit,
  onRemove,
}: KeepsInMindCardProps) {
  const theme = useTheme();

  const sourceLabel = memory.chipId ? 'From your selections' : 'In your words';

  const inputStyle = [
    styles.input,
    {
      color: theme.text,
      borderColor: theme.textSecondary + '44',
      backgroundColor: theme.background,
    },
  ];

  if (isEditing) {
    return (
      <View style={[styles.card, { borderColor: theme.textSecondary + '33' }]}>
        <TextInput
          value={editDraft}
          onChangeText={(text) => onEditDraftChange(text.slice(0, MEMORY_MAX_LENGTH))}
          style={inputStyle}
          multiline
          maxLength={MEMORY_MAX_LENGTH}
          autoFocus
        />
        <View style={styles.actions}>
          <Pressable onPress={onCancelEdit} hitSlop={8}>
            <Text style={[styles.action, { color: theme.textSecondary }]}>Cancel</Text>
          </Pressable>
          <Pressable onPress={onSaveEdit} hitSlop={8}>
            <Text style={[styles.action, { color: theme.text }]}>Save</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, { borderColor: theme.textSecondary + '33' }]}>
      <Text style={[styles.content, { color: theme.text }]}>{memory.content}</Text>
      <Text style={[styles.source, { color: theme.textSecondary }]}>{sourceLabel}</Text>
      <View style={styles.actions}>
        <Pressable onPress={onStartEdit} hitSlop={8}>
          <Text style={[styles.action, { color: theme.textSecondary }]}>Edit</Text>
        </Pressable>
        <Pressable onPress={onRemove} hitSlop={8}>
          <Text style={[styles.action, { color: theme.textSecondary }]}>Remove</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
  },
  source: {
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 48,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 2,
  },
  action: {
    fontSize: 14,
    fontWeight: '500',
  },
});
