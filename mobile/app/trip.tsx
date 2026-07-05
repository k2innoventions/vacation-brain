import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import ScreenShell from '@/components/ScreenShell';
import { useTheme } from '@/hooks/useTheme';
import type { Reservation, Trip } from '@/lib/types';
import { useTripContext } from '@/lib/trip-context';

function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function defaultTrip(): Trip {
  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() + 6);

  return {
    destination: 'Magic Kingdom',
    startDate: formatDateInput(today),
    endDate: formatDateInput(end),
    goals: '',
  };
}

function parseReservation(
  name: string,
  time: string,
  type: Reservation['type'],
): Reservation | undefined {
  const trimmedName = name.trim();
  const trimmedTime = time.trim();
  if (!trimmedName && !trimmedTime) return undefined;
  if (!trimmedName || !trimmedTime) return undefined;

  return {
    name: trimmedName,
    time: trimmedTime,
    type,
  };
}

export default function TripScreen() {
  const theme = useTheme();
  const { trip, setTrip } = useTripContext();

  const [destination, setDestination] = useState(trip?.destination ?? defaultTrip().destination);
  const [startDate, setStartDate] = useState(trip?.startDate ?? defaultTrip().startDate);
  const [endDate, setEndDate] = useState(trip?.endDate ?? defaultTrip().endDate);
  const [goals, setGoals] = useState(trip?.goals ?? '');
  const [reservationName, setReservationName] = useState(trip?.reservation?.name ?? '');
  const [reservationTime, setReservationTime] = useState(trip?.reservation?.time ?? '');

  useEffect(() => {
    if (trip) {
      setDestination(trip.destination);
      setStartDate(trip.startDate);
      setEndDate(trip.endDate);
      setGoals(trip.goals ?? '');
      setReservationName(trip.reservation?.name ?? '');
      setReservationTime(trip.reservation?.time ?? '');
    }
  }, [trip]);

  const inputStyle = [
    styles.input,
    {
      color: theme.text,
      borderColor: theme.textSecondary + '44',
      backgroundColor: theme.background,
    },
  ];

  const handleSave = () => {
    const trimmedDestination = destination.trim();
    if (!trimmedDestination) {
      Alert.alert('Destination required', 'Where are you headed?');
      return;
    }

    if (endDate < startDate) {
      Alert.alert('Check your dates', 'End date must be on or after the start date.');
      return;
    }

    const hasPartialReservation = Boolean(
      (reservationName.trim() && !reservationTime.trim()) ||
        (!reservationName.trim() && reservationTime.trim()),
    );
    if (hasPartialReservation) {
      Alert.alert('Reservation incomplete', 'Enter both a name and time, or leave both blank.');
      return;
    }

    setTrip({
      destination: trimmedDestination,
      startDate,
      endDate,
      goals: goals.trim() || undefined,
      reservation: parseReservation(reservationName, reservationTime, 'dinner'),
    });
    Alert.alert('Saved', 'Your trip details are ready.');
  };

  return (
    <ScreenShell title="Trip setup">
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Field label="Destination">
          <TextInput
            value={destination}
            onChangeText={setDestination}
            placeholder="Magic Kingdom"
            placeholderTextColor={theme.textSecondary}
            style={inputStyle}
          />
        </Field>

        <Field label="Start date">
          <TextInput
            value={startDate}
            onChangeText={setStartDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.textSecondary}
            style={inputStyle}
            autoCapitalize="none"
          />
        </Field>

        <Field label="End date">
          <TextInput
            value={endDate}
            onChangeText={setEndDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.textSecondary}
            style={inputStyle}
            autoCapitalize="none"
          />
        </Field>

        <Field label="Trip goals (optional)">
          <TextInput
            value={goals}
            onChangeText={setGoals}
            placeholder="Example: Kids' first Disney trip"
            placeholderTextColor={theme.textSecondary}
            style={[inputStyle, styles.multiline]}
            multiline
          />
        </Field>

        <Text style={[styles.sectionLabel, { color: theme.text }]}>Reservation (optional)</Text>
        <Text style={[styles.sectionHint, { color: theme.textSecondary }]}>
          Example: Crystal Palace at 5:30 PM
        </Text>

        <Field label="Restaurant or event">
          <TextInput
            value={reservationName}
            onChangeText={setReservationName}
            placeholder="Example: Crystal Palace"
            placeholderTextColor={theme.textSecondary}
            style={inputStyle}
          />
        </Field>

        <Field label="Time">
          <TextInput
            value={reservationTime}
            onChangeText={setReservationTime}
            placeholder="Example: 5:30 PM"
            placeholderTextColor={theme.textSecondary}
            style={inputStyle}
          />
        </Field>

        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [
            styles.saveButton,
            { backgroundColor: theme.text, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={[styles.saveButtonText, { color: theme.background }]}>Save trip</Text>
        </Pressable>
      </ScrollView>
    </ScreenShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const theme = useTheme();

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    paddingBottom: 32,
    gap: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  sectionHint: {
    fontSize: 14,
    marginTop: -8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
