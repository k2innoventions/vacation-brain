import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ScreenShell from '@/components/ScreenShell';
import { useTheme } from '@/hooks/useTheme';
import { canGenerateBriefing, generateBriefing, getTripStatus } from '@/lib/briefing/generate';
import type { BriefingSection } from '@/lib/types';
import { useTripContext } from '@/lib/trip-context';

const SECTIONS: { key: keyof BriefingSection; label: string }[] = [
  { key: 'goal', label: "Today's goal" },
  { key: 'weather', label: 'Weather' },
  { key: 'pacing', label: 'Pacing' },
  { key: 'priority', label: 'Priority' },
  { key: 'caution', label: 'Caution' },
  { key: 'magicMoment', label: 'Magic moment' },
  { key: 'nextAction', label: 'Next action' },
];

export default function BriefingScreen() {
  const theme = useTheme();
  const { trip, memories } = useTripContext();

  if (!trip) {
    return (
      <ScreenShell title="Morning briefing">
        <EmptyState
          message="Set up your trip first, then tell us what fits your group."
          actionLabel="Go to trip setup"
          onAction={() => router.push('/trip')}
        />
      </ScreenShell>
    );
  }

  const tripStatus = getTripStatus(trip);

  if (memories.length === 0) {
    return (
      <ScreenShell title="Morning briefing">
        <EmptyState
          message="Tap a few options about your trip so the briefing can reflect what you've shared."
          actionLabel="About your trip"
          onAction={() => router.push('/memory')}
        />
      </ScreenShell>
    );
  }

  if (!canGenerateBriefing(trip, memories)) {
    return (
      <ScreenShell title="Morning briefing">
        <EmptyState
          message={
            tripStatus.daysUntil > 0
              ? `Your trip starts in ${tripStatus.daysUntil} day${tripStatus.daysUntil === 1 ? '' : 's'}. The briefing will be ready then.`
              : 'This trip window has passed. Update your dates to preview a briefing.'
          }
          actionLabel="Edit trip"
          onAction={() => router.push('/trip')}
        />
      </ScreenShell>
    );
  }

  const briefing = generateBriefing(trip, memories);

  if (!briefing) {
    return (
      <ScreenShell title="Morning briefing">
        <EmptyState
          message="Unable to generate a briefing for today."
          actionLabel="Edit trip"
          onAction={() => router.push('/trip')}
        />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell title="Morning briefing">
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.dayLabel, { color: theme.textSecondary }]}>
          Day {briefing.dayNumber} of {briefing.totalDays} · {trip.destination}
        </Text>

        {SECTIONS.map(({ key, label }) => (
          <View key={key} style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>{label}</Text>
            <Text style={[styles.sectionBody, { color: theme.text }]}>
              {briefing.sections[key]}
            </Text>
          </View>
        ))}

        {briefing.citedMemories.length > 0 ? (
          <View style={[styles.citedCard, { borderColor: theme.textSecondary + '33' }]}>
            <Text style={[styles.citedTitle, { color: theme.text }]}>From what you told us</Text>
            {briefing.citedMemories.map((memory) => (
              <Text key={memory} style={[styles.citedItem, { color: theme.textSecondary }]}>
                · {memory}
              </Text>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </ScreenShell>
  );
}

function EmptyState({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel: string;
  onAction: () => void;
}) {
  const theme = useTheme();

  return (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyMessage, { color: theme.textSecondary }]}>{message}</Text>
      <Pressable
        onPress={onAction}
        style={({ pressed }) => [
          styles.emptyButton,
          { borderColor: theme.textSecondary + '44', opacity: pressed ? 0.75 : 1 },
        ]}
      >
        <Text style={[styles.emptyButtonText, { color: theme.text }]}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
    gap: 20,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  section: {
    gap: 6,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionBody: {
    fontSize: 16,
    lineHeight: 24,
  },
  citedCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 8,
    marginTop: 4,
  },
  citedTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  citedItem: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
    paddingBottom: 48,
  },
  emptyMessage: {
    fontSize: 16,
    lineHeight: 24,
  },
  emptyButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
