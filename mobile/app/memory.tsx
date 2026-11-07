import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import KeepsInMindCard from '@/components/KeepsInMindCard';
import MemoryPromptSection from '@/components/MemoryPromptSection';
import ScreenShell from '@/components/ScreenShell';
import { useTheme } from '@/hooks/useTheme';
import { showAlert } from '@/lib/alert';
import { canGenerateBriefing } from '@/lib/briefing/generate';
import { MEMORY_CAP_WARNING_THRESHOLD, MEMORY_PROMPT_SECTIONS } from '@/lib/memory/prompts';
import type { Memory } from '@/lib/types';
import { MEMORY_MAX_COUNT, MEMORY_MAX_LENGTH } from '@/lib/types';
import { useTripContext } from '@/lib/trip-context';

export default function MemoryScreen() {
  const theme = useTheme();
  const {
    trip,
    memories,
    toggleChipMemory,
    addCustomMemory,
    updateMemory,
    deleteMemory,
    isAtMemoryCap,
  } = useTripContext();

  const [groupNote, setGroupNote] = useState('');
  const [tripNote, setTripNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');

  const briefingReady = canGenerateBriefing(trip, memories);

  const selectedChipIds = useMemo(
    () => new Set(memories.flatMap((m) => (m.chipId ? [m.chipId] : []))),
    [memories],
  );

  const inputStyle = [
    styles.input,
    {
      color: theme.text,
      borderColor: theme.textSecondary + '44',
      backgroundColor: theme.background,
    },
  ];

  const showCapWarning = memories.length >= MEMORY_CAP_WARNING_THRESHOLD;

  const handleChipPress = (chipId: string, memoryText: string) => {
    const isSelected = selectedChipIds.has(chipId);

    if (!isSelected && isAtMemoryCap) {
      showAlert(
        "That's plenty for now",
        'Remove a selection or note to add more.',
      );
      return;
    }

    toggleChipMemory(chipId, memoryText);
  };

  const handleAddGroupNote = () => {
    if (isAtMemoryCap) {
      showAlert("That's plenty for now", 'Remove a selection or note to add more.');
      return;
    }
    if (!addCustomMemory(groupNote)) {
      showAlert('Add a note', 'Write something about your group, or skip this.');
      return;
    }
    setGroupNote('');
  };

  const handleAddTripNote = () => {
    if (isAtMemoryCap) {
      showAlert("That's plenty for now", 'Remove a selection or note to add more.');
      return;
    }
    if (!addCustomMemory(tripNote)) {
      showAlert('Add a note', 'Write something about your trip, or skip this.');
      return;
    }
    setTripNote('');
  };

  const startEdit = (memory: Memory) => {
    setEditingId(memory.id);
    setEditDraft(memory.content);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const trimmed = editDraft.trim();
    if (!trimmed) {
      showAlert('Keep it short', "This can't be blank — edit or remove it.");
      return;
    }
    updateMemory(editingId, trimmed);
    setEditingId(null);
    setEditDraft('');
  };

  const confirmDelete = (memory: Memory) => {
    // react-native-web's Alert.alert is a no-op, so use the browser confirm on web.
    if (Platform.OS === 'web') {
      if (window.confirm(`Remove this?\n\n"${memory.content}"`)) {
        deleteMemory(memory.id);
      }
      return;
    }

    Alert.alert('Remove this?', `"${memory.content}"`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => deleteMemory(memory.id),
      },
    ]);
  };

  return (
    <ScreenShell title="About your trip">
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.lead, { color: theme.text }]}>
          Help us understand your trip.
        </Text>
        <Text style={[styles.trustLine, { color: theme.textSecondary }]}>
          Tap what fits. We&apos;ll only keep what you choose — nothing is guessed. Edit or
          remove anything anytime.
        </Text>

        {MEMORY_PROMPT_SECTIONS.map((section) => (
          <MemoryPromptSection
            key={section.id}
            section={section}
            selectedChipIds={selectedChipIds}
            isAtCap={isAtMemoryCap}
            onChipPress={handleChipPress}
            optionalText={section.id === 'who' ? groupNote : undefined}
            onOptionalTextChange={section.id === 'who' ? setGroupNote : undefined}
            onOptionalSubmit={section.id === 'who' ? handleAddGroupNote : undefined}
          />
        ))}

        <View style={styles.customBlock}>
          <Text style={[styles.customLabel, { color: theme.text }]}>
            Anything else for this trip?
          </Text>
          <TextInput
            value={tripNote}
            onChangeText={(text) => setTripNote(text.slice(0, MEMORY_MAX_LENGTH))}
            placeholder="Optional — in your own words"
            placeholderTextColor={theme.textSecondary}
            style={inputStyle}
            multiline
            maxLength={MEMORY_MAX_LENGTH}
          />
          {tripNote.trim().length > 0 ? (
            <Pressable
              onPress={handleAddTripNote}
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
          ) : null}
        </View>

        {memories.length > 0 ? (
          <View style={styles.summaryBlock}>
            <Text style={[styles.summaryTitle, { color: theme.text }]}>
              What we&apos;ll keep in mind
            </Text>
            <Text style={[styles.summaryHint, { color: theme.textSecondary }]}>
              This shapes your morning briefing.
            </Text>
            <View style={styles.summaryList}>
              {memories.map((memory) => (
                <KeepsInMindCard
                  key={memory.id}
                  memory={memory}
                  isEditing={editingId === memory.id}
                  editDraft={editDraft}
                  onStartEdit={() => startEdit(memory)}
                  onEditDraftChange={setEditDraft}
                  onSaveEdit={saveEdit}
                  onCancelEdit={() => {
                    setEditingId(null);
                    setEditDraft('');
                  }}
                  onRemove={() => confirmDelete(memory)}
                />
              ))}
            </View>
            {briefingReady ? (
              <Pressable
                onPress={() => router.push('/briefing')}
                style={({ pressed }) => [styles.briefingLink, pressed && styles.pressed]}
              >
                <Text style={[styles.briefingLinkText, { color: theme.text }]}>
                  See how this shapes today&apos;s plan →
                </Text>
              </Pressable>
            ) : null}
            {showCapWarning ? (
              <Text style={[styles.capHint, { color: theme.textSecondary }]}>
                {MEMORY_MAX_COUNT - memories.length} more available
              </Text>
            ) : null}
          </View>
        ) : (
          <Text style={[styles.emptyHint, { color: theme.textSecondary }]}>
            Tap options above to get started.
          </Text>
        )}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 32,
  },
  lead: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
    marginBottom: 8,
  },
  trustLine: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 24,
  },
  customBlock: {
    gap: 8,
    marginBottom: 28,
  },
  customLabel: {
    fontSize: 16,
    fontWeight: '600',
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
  addButton: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  summaryBlock: {
    gap: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  summaryHint: {
    fontSize: 14,
    marginBottom: 4,
  },
  summaryList: {
    gap: 10,
  },
  briefingLink: {
    marginTop: 4,
    paddingVertical: 8,
  },
  briefingLinkText: {
    fontSize: 15,
    fontWeight: '500',
  },
  capHint: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyHint: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  pressed: {
    opacity: 0.65,
  },
});
