import { dayFixture } from '@/lib/fixtures/day';
import type { Briefing, Memory, Trip } from '@/lib/types';

function daysBetween(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1);
}

function tripDayNumber(trip: Trip, today = new Date()): number {
  const start = new Date(trip.startDate + 'T00:00:00');
  const end = new Date(trip.endDate + 'T00:00:00');
  const totalDays = daysBetween(start, end);

  if (today < start) return 0;

  const dayNumber = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return Math.min(Math.max(dayNumber, 1), totalDays);
}

function totalTripDays(trip: Trip): number {
  const start = new Date(trip.startDate + 'T00:00:00');
  const end = new Date(trip.endDate + 'T00:00:00');
  return daysBetween(start, end);
}

function daysUntilTrip(trip: Trip, today = new Date()): number {
  const start = new Date(trip.startDate + 'T00:00:00');
  if (today >= start) return 0;
  return Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function matchesAny(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((keyword) => lower.includes(keyword));
}

function cite(memory: Memory): string {
  return `"${memory.content}"`;
}

function pickRelevantMemories(memories: Memory[]): Memory[] {
  if (memories.length === 0) return [];
  return memories.slice(0, 3);
}

function buildGoal(trip: Trip, memories: Memory[], dayNumber: number, totalDays: number): string {
  const combined = memories.map((m) => m.content).join(' ');

  if (matchesAny(combined, ['first trip', 'first time', 'talking about it'])) {
    const memory = memories.find((m) => matchesAny(m.content, ['first trip', 'first time', 'overdo']));
    if (memory) {
      return `Day ${dayNumber} of ${totalDays} at ${trip.destination}. You have ${totalDays - dayNumber + 1} days left — today sets the tone for the week. Keeping in mind ${cite(memory)}, we'll keep the plan light and leave room for wonder.`;
    }
  }

  if (trip.goals?.trim()) {
    return `Day ${dayNumber} of ${totalDays} at ${trip.destination}. Your goal for this trip: ${trip.goals.trim()}.`;
  }

  return `Day ${dayNumber} of ${totalDays} at ${trip.destination}. One good day, paced for your family — not optimized for maximum throughput.`;
}

function buildWeather(): string {
  const { weather, park } = dayFixture;
  return `${weather.condition}, high around ${weather.highF}°F. ${park.name} is open ${park.hours} with ${park.crowd} crowds today.`;
}

function buildPacing(memories: Memory[], reservation?: Trip['reservation']): { text: string; cited: string[] } {
  const cited: string[] = [];
  const combined = memories.map((m) => m.content).join(' ');

  const napMemory = memories.find((m) =>
    matchesAny(m.content, ['nap', '1pm', 'non-negotiable', 'quiet break']),
  );
  if (napMemory) {
    cited.push(napMemory.content);
    let text = `Since you told us ${cite(napMemory)}, we'll front-load the morning and plan a real break around 1:00–3:00 — not as a concession, but as the plan.`;
    if (reservation?.name) {
      text += ` That leaves a comfortable window before your ${reservation.time} reservation at ${reservation.name}.`;
    }
    return { text, cited };
  }

  const slowMemory = memories.find((m) =>
    matchesAny(m.content, ['not rope drop', 'slow morning', 'mornings are slow']),
  );
  if (slowMemory) {
    cited.push(slowMemory.content);
    const stressMemory = memories.find((m) =>
      matchesAny(m.content, ['fewer things', 'without stress', 'rush']),
    );
    if (stressMemory) cited.push(stressMemory.content);

    let text = `You said ${cite(slowMemory)} — so we're not pushing an early arrival. Plan on a late-morning start and use the evening window when crowds often ease.`;
    if (stressMemory) {
      text += ` ${cite(stressMemory)} stays the guide: fewer things, less stress.`;
    }
    return { text, cited };
  }

  const grandmaMemory = memories.find((m) =>
    matchesAny(m.content, ['grandma', 'cane', 'break every']),
  );
  if (grandmaMemory) {
    cited.push(grandmaMemory.content);
    const showMemory = memories.find((m) => matchesAny(m.content, ['live show', 'loves show']));
    if (showMemory) cited.push(showMemory.content);

    let text = `Keeping in mind ${cite(grandmaMemory)}, we'll build in seated anchors every couple of hours — rest that doesn't feel like sitting out.`;
    if (showMemory) {
      text += ` ${cite(showMemory)} — shows from today's schedule make natural pauses.`;
    }
    return { text, cited };
  }

  const first = memories[0];
  if (first) {
    cited.push(first.content);
    return {
      text: `Keeping in mind what you've shared — ${cite(first)} — we'll shape today's rhythm around your family's pace, not a generic park schedule.`,
      cited,
    };
  }

  return {
    text: "A steady pace with deliberate breaks beats a packed schedule. We'll leave unscheduled time on purpose.",
    cited,
  };
}

function buildPriority(memories: Memory[]): { text: string; cited: string[] } {
  const cited: string[] = [];
  const buzzMemory = memories.find((m) =>
    matchesAny(m.content, ['buzz lightyear', 'obsessed with buzz']),
  );
  if (buzzMemory) {
    cited.push(buzzMemory.content);
    return {
      text: `Morning priority: Buzz Lightyear's Space Ranger Spin — ${cite(buzzMemory)} makes this a must-do before midday.`,
      cited,
    };
  }

  const birthdayMemory = memories.find((m) =>
    matchesAny(m.content, ['birthday', 'celebrating']),
  );
  if (birthdayMemory) {
    cited.push(birthdayMemory.content);
    return {
      text: `Today's anchor: ${cite(birthdayMemory)}. We'll protect time for the celebration, not squeeze it between rides.`,
      cited,
    };
  }

  if (memories.length > 0) {
    cited.push(memories[0].content);
    return {
      text: `One clear priority this morning, shaped by ${cite(memories[0])}. Everything else is optional.`,
      cited,
    };
  }

  return {
    text: 'Pick one thing that would make today feel like a success — and protect time for it.',
    cited,
  };
}

function buildCaution(memories: Memory[]): { text: string; cited: string[] } {
  const cited: string[] = [];
  const allergyMemory = memories.find((m) =>
    matchesAny(m.content, ['allergy', 'peanut', 'epinephrine', 'nut']),
  );
  if (allergyMemory) {
    cited.push(allergyMemory.content);
    return {
      text: `${cite(allergyMemory)} — mention this when checking in at any dining reservation and ask to speak with a chef or manager. We won't claim any specific item is safe; always verify in person.`,
      cited,
    };
  }

  const darkRideMemory = memories.find((m) =>
    matchesAny(m.content, ['dark ride', 'afraid of dark', 'afraid of']),
  );
  if (darkRideMemory) {
    cited.push(darkRideMemory.content);
    return {
      text: `Watch for intense or dark attractions today. You noted ${cite(darkRideMemory)} — we'll steer clear unless you're ready.`,
      cited,
    };
  }

  return {
    text: 'Heat and walking add up faster than expected. Hydrate early, and treat a mid-afternoon slowdown as signal, not failure.',
    cited,
  };
}

function buildMagicMoment(trip: Trip, memories: Memory[]): string {
  const firstTripMemory = memories.find((m) =>
    matchesAny(m.content, ['first trip', 'first time', 'talking about it']),
  );
  if (firstTripMemory) {
    return `The walk down Main Street at ${trip.destination} is the moment — not a transit segment. Let the kids stare at the castle. That's the plan.`;
  }

  if (dayFixture.park.showtimes.length > 0) {
    return `${dayFixture.park.showtimes[0]} is tonight if energy allows — a natural finale, not an obligation.`;
  }

  return "Leave one unscheduled hour for whatever catches your family's attention. That's often where the story comes from.";
}

function buildNextAction(trip: Trip, reservation?: Trip['reservation']): string {
  if (reservation?.name?.trim()) {
    return `Confirm your ${reservation.time} reservation at ${reservation.name} when you arrive. Then take ten minutes to agree on one morning priority together.`;
  }

  return `Before you leave for ${trip.destination}, agree on one thing that would make today feel like a win — and write it down.`;
}

export function getTripStatus(trip: Trip, today = new Date()) {
  const dayNumber = tripDayNumber(trip, today);
  const totalDays = totalTripDays(trip);
  const daysUntil = daysUntilTrip(trip, today);
  const isActive = dayNumber > 0;
  const isPast = today > new Date(trip.endDate + 'T23:59:59');

  return { dayNumber, totalDays, daysUntil, isActive, isPast };
}

export function generateBriefing(trip: Trip, memories: Memory[], today = new Date()): Briefing | null {
  const { dayNumber, totalDays, isActive } = getTripStatus(trip, today);

  if (!isActive || dayNumber === 0) {
    return null;
  }

  const citedSet = new Set<string>();

  const goal = buildGoal(trip, memories, dayNumber, totalDays);
  const weather = buildWeather();
  const pacingResult = buildPacing(memories, trip.reservation);
  const priorityResult = buildPriority(memories);
  const cautionResult = buildCaution(memories);
  const magicMoment = buildMagicMoment(trip, memories);
  const nextAction = buildNextAction(trip, trip.reservation);

  for (const content of [
    ...pacingResult.cited,
    ...priorityResult.cited,
    ...cautionResult.cited,
  ]) {
    citedSet.add(content);
  }

  if (citedSet.size === 0 && memories.length > 0) {
    citedSet.add(memories[0].content);
  }

  return {
    dayNumber,
    totalDays,
    sections: {
      goal,
      weather,
      pacing: pacingResult.text,
      priority: priorityResult.text,
      caution: cautionResult.text,
      magicMoment,
      nextAction,
    },
    citedMemories: Array.from(citedSet),
  };
}

export function canGenerateBriefing(trip: Trip | null, memories: Memory[], today = new Date()): boolean {
  if (!trip || memories.length === 0) return false;
  const { isActive } = getTripStatus(trip, today);
  return isActive;
}

export { pickRelevantMemories };
