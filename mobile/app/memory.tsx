import { useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import ScreenShell from '@/components/ScreenShell';
import { useTheme } from '@/hooks/useTheme';
import type { Memory } from '@/lib/types';
import { MEMORY_MAX_COUNT, MEMORY_MAX_LENGTH } from '@/lib/types';
import { useTripContext } from '@/lib/trip-context';

const PLACEHOLDER_HINTS = [
  'Kids are 4 and 7.',
  'Ben (4) is afraid of dark rides.',
  'Nap at 1pm is non-negotiable for our 2-year-old.',
];

export default function MemoryScreen() {
  const theme = useTheme();
  const { memories, addMemory, updateMemory, deleteMemory, memoryCount, isAtMemoryCap } =
    useTripContext();

  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');

  const inputStyle = [
    styles.input,
    {
      color: theme.text,
      borderColor: theme.textSecondary + '44',
      backgroundColor: theme.background,
    },
  ];

  const handleAdd = () => {
    if (isAtMemoryCap) {
      Alert.alert(
        'Memory limit reached',
        `You can save up to ${MEMORY_MAX_COUNT} memories. Edit or remove one to add another.`,
      );
      return;
    }

    const didAdd = addMemory(draft);
    if (!didAdd) {
      Alert.alert('Empty memory', 'Write something your family would want us to remember.');
      return;
    }

    setDraft('');
  };

  const startEdit = (memory: Memory) => {
    setEditingId(memory.id);
    setEditDraft(memory.content);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const trimmed = editDraft.trim();
    if (!trimmed) {
      Alert.alert('Empty memory', 'A memory cannot be blank.');
      return;
    }
    updateMemory(editingId, trimmed);
    setEditingId(null);
    setEditDraft('');
  };

  const confirmDelete = (memory: Memory) => {
    Alert.alert('Delete memory?', `"${memory.content}"`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMemory(memory.id),
      },
    ]);
  };

  return (
    <ScreenShell title="What we know">
      <Text style={[styles.intro, { color: theme.textSecondary }]}>
        Short statements about your family that should shape every briefing. You control what's
        here — nothing is inferred.
      </Text>

      {memories.length === 0 ? (
        <View style={[styles.hintsCard, { borderColor: theme.textSecondary + '33' }]}>
          <Text style={[styles.hintsTitle, { color: theme.text }]}>Examples to get started</Text>
          {PLACEHOLDER_HINTS.map((hint) => (
            <Text key={hint} style={[styles.hint, { color: theme.textSecondary }]}>
              · {hint}
            </Text>
          ))}
        </View>
      ) : null}

      <View style={styles.addSection}>
        <TextInput
          value={draft}
          onChangeText={(text) => setDraft(text.slice(0, MEMORY_MAX_LENGTH))}
          placeholder="Example: We are not rope drop people."
          placeholderTextColor={theme.textSecondary}
          style={inputStyle}
          multiline
          maxLength={MEMORY_MAX_LENGTH}
        />
        <View style={styles.addMeta}>
          <Text style={[styles.charCount, { color: theme.textSecondary }]}>
            {draft.length}/{MEMORY_MAX_LENGTH}
          </Text>
          <Pressable
            onPress={handleAdd}
            disabled={isAtMemoryCap}
            style={({ pressed }) => [
              styles.addButton,
              {
                backgroundColor: theme.text,
                opacity: isAtMemoryCap ? 0.4 : pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={[styles.addButtonText, { color: theme.background }]}>Add</Text>
          </Pressable>
        </View>
        <Text style={[styles.countLabel, { color: theme.textSecondary }]}>
          {memoryCount}/{MEMORY_MAX_COUNT} memories
        </Text>
      </View>

      <FlatList
        data={memories}
        keyExtractor={(item) => item.id}
        style={styles.listContainer}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.textSecondary }]}>
            No memories yet. Add what matters to your family.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={[styles.memoryCard, { borderColor: theme.textSecondary + '33' }]}>
            {editingId === item.id ? (
              <>
                <TextInput
                  value={editDraft}
                  onChangeText={(text) => setEditDraft(text.slice(0, MEMORY_MAX_LENGTH))}
                  style={inputStyle}
                  multiline
                  maxLength={MEMORY_MAX_LENGTH}
                  autoFocus
                />
                <View style={styles.rowActions}>
                  <Pressable onPress={() => setEditingId(null)}>
                    <Text style={[styles.actionText, { color: theme.textSecondary }]}>Cancel</Text>
                  </Pressable>
                  <Pressable onPress={saveEdit}>
                    <Text style={[styles.actionText, { color: theme.text }]}>Save</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.memoryText, { color: theme.text }]}>{item.content}</Text>
                <View style={styles.rowActions}>
                  <Pressable onPress={() => startEdit(item)}>
                    <Text style={[styles.actionText, { color: theme.textSecondary }]}>Edit</Text>
                  </Pressable>
                  <Pressable onPress={() => confirmDelete(item)}>
                    <Text style={[styles.actionText, { color: theme.textSecondary }]}>Delete</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        )}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  intro: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  hintsCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 6,
  },
  hintsTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
  },
  addSection: {
    marginBottom: 16,
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 48,
    textAlignVertical: 'top',
  },
  addMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  charCount: {
    fontSize: 12,
  },
  addButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  countLabel: {
    fontSize: 13,
  },
  listContainer: {
    flex: 1,
  },
  list: {
    paddingBottom: 24,
    gap: 10,
  },
  empty: {
    fontSize: 15,
    lineHeight: 22,
    paddingVertical: 12,
  },
  memoryCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  memoryText: {
    fontSize: 16,
    lineHeight: 24,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
