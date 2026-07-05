import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { Memory, Trip } from '@/lib/types';
import { MEMORY_MAX_COUNT, MEMORY_MAX_LENGTH } from '@/lib/types';

type TripContextValue = {
  trip: Trip | null;
  memories: Memory[];
  setTrip: (trip: Trip) => void;
  addMemory: (content: string) => boolean;
  updateMemory: (id: string, content: string) => void;
  deleteMemory: (id: string) => void;
  memoryCount: number;
  isAtMemoryCap: boolean;
};

const TripContext = createContext<TripContextValue | null>(null);

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function TripProvider({ children }: { children: ReactNode }) {
  const [trip, setTripState] = useState<Trip | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);

  const setTrip = useCallback((nextTrip: Trip) => {
    setTripState(nextTrip);
  }, []);

  const addMemory = useCallback((content: string): boolean => {
    const trimmed = content.trim().slice(0, MEMORY_MAX_LENGTH);
    if (!trimmed) return false;

    let didAdd = false;
    setMemories((current) => {
      if (current.length >= MEMORY_MAX_COUNT) {
        return current;
      }
      didAdd = true;
      return [
        {
          id: createId(),
          content: trimmed,
          createdAt: new Date().toISOString(),
        },
        ...current,
      ];
    });

    return didAdd;
  }, []);

  const updateMemory = useCallback((id: string, content: string) => {
    const trimmed = content.trim().slice(0, MEMORY_MAX_LENGTH);
    if (!trimmed) return;

    setMemories((current) =>
      current.map((memory) =>
        memory.id === id ? { ...memory, content: trimmed } : memory,
      ),
    );
  }, []);

  const deleteMemory = useCallback((id: string) => {
    setMemories((current) => current.filter((memory) => memory.id !== id));
  }, []);

  const value = useMemo(
    (): TripContextValue => ({
      trip,
      memories,
      setTrip,
      addMemory,
      updateMemory,
      deleteMemory,
      memoryCount: memories.length,
      isAtMemoryCap: memories.length >= MEMORY_MAX_COUNT,
    }),
    [trip, memories, setTrip, addMemory, updateMemory, deleteMemory],
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTripContext(): TripContextValue {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTripContext must be used within TripProvider');
  }
  return context;
}
