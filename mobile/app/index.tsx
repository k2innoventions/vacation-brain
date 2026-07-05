import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import ScreenShell from '@/components/ScreenShell';
import { useTheme } from '@/hooks/useTheme';
import { canGenerateBriefing, getTripStatus } from '@/lib/briefing/generate';
import { useTripContext } from '@/lib/trip-context';

function NavCard({
  title,
  subtitle,
  onPress,
  disabled = false,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.background,
          borderColor: theme.textSecondary + '33',
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={[styles.cardTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const theme = useTheme();
  const { trip, memories } = useTripContext();

  const tripStatus = trip ? getTripStatus(trip) : null;
  const briefingReady = canGenerateBriefing(trip, memories);

  let statusLine = 'Set up your trip to get started.';
  if (trip && tripStatus) {
    if (tripStatus.daysUntil > 0) {
      statusLine = `${trip.destination} starts in ${tripStatus.daysUntil} day${tripStatus.daysUntil === 1 ? '' : 's'}.`;
    } else if (tripStatus.isPast) {
      statusLine = `${trip.destination} has ended. Update your dates to preview a briefing.`;
    } else {
      statusLine = `Day ${tripStatus.dayNumber} of ${tripStatus.totalDays} at ${trip.destination}.`;
    }
  }

  return (
    <ScreenShell
      title="Today"
      showBack={false}
      footer={
        <Text style={[styles.disclaimer, { color: theme.textSecondary }]}>
          Prototype mode: entries reset when the app reloads.
        </Text>
      }
    >
      <Text style={[styles.tagline, { color: theme.textSecondary }]}>
        Go make memories that become stories.
      </Text>

      <View style={[styles.statusCard, { borderColor: theme.textSecondary + '33' }]}>
        <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>Trip status</Text>
        <Text style={[styles.statusText, { color: theme.text }]}>{statusLine}</Text>
        {memories.length > 0 ? (
          <Text style={[styles.memoryCount, { color: theme.textSecondary }]}>
            {memories.length} thing{memories.length === 1 ? '' : 's'} we know about your family
          </Text>
        ) : null}
      </View>

      <View style={styles.navList}>
        <NavCard
          title="Trip setup"
          subtitle={trip ? `Edit ${trip.destination}` : 'Destination, dates, and optional reservation'}
          onPress={() => router.push('/trip')}
        />
        <NavCard
          title="What we know"
          subtitle={
            memories.length > 0
              ? `${memories.length} memor${memories.length === 1 ? 'y' : 'ies'} saved`
              : 'Tell us what matters to your family'
          }
          onPress={() => router.push('/memory')}
        />
        <NavCard
          title="Morning briefing"
          subtitle={
            briefingReady
              ? 'View today\'s plan'
              : !trip
                ? 'Set up a trip first'
                : memories.length === 0
                  ? 'Add at least one memory first'
                  : tripStatus && tripStatus.daysUntil > 0
                    ? 'Available once your trip starts'
                    : 'Unavailable for this trip window'
          }
          onPress={() => router.push('/briefing')}
          disabled={!briefingReady}
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  tagline: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  statusCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  statusText: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '500',
  },
  memoryCount: {
    fontSize: 14,
    marginTop: 8,
  },
  navList: {
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  disclaimer: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
