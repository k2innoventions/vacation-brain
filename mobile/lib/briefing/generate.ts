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

function cite(content: string): string {
  return `"${content}"`;
}

function pickRelevantMemories(memories: Memory[]): Memory[] {
  if (memories.length === 0) return [];
  return memories.slice(0, 3);
}

function buildGoal(trip: Trip, memories: Memory[], dayNumber: number, totalDays: number): string {
  const combined = memories.map((m) => m.content).join(' ');

  if (matchesAny(combined, ['first-timers', 'first-timer'])) {
    const memory = memories.find((m) => matchesAny(m.content, ['first-timers', 'first-timer']));
    if (memory) {
      return `Day ${dayNumber} of ${totalDays} at ${trip.destination}. Keeping in mind ${cite(memory.content)}, we'll keep the plan welcoming and unhurried.`;
    }
  }

  if (matchesAny(combined, ['avoid overdoing'])) {
    const memory = memories.find((m) => matchesAny(m.content, ['avoid overdoing']));
    if (memory) {
      return `Day ${dayNumber} of ${totalDays} at ${trip.destination}. ${cite(memory.content)} — today sets the tone for the days ahead.`;
    }
  }

  if (trip.goals?.trim()) {
    return `Day ${dayNumber} of ${totalDays} at ${trip.destination}. Your goal for this trip: ${trip.goals.trim()}.`;
  }

  return `Day ${dayNumber} of ${totalDays} at ${trip.destination}. One good day, paced for this group — not optimized for maximum throughput.`;
}

function buildWeather(memories: Memory[]): string {
  const { weather, park } = dayFixture;
  let text = `${weather.condition}, high around ${weather.highF}°F. ${park.name} is open ${park.hours} with ${park.crowd} crowds today.`;

  if (matchesAny(memories.map((m) => m.content).join(' '), ['heat sensitivity'])) {
    text += ' With heat sensitivity in mind, plan shade and hydration early.';
  }

  return text;
}

function buildPacing(memories: Memory[], reservation?: Trip['reservation']): { text: string; cited: string[] } {
  const cited: string[] = [];

  const napMemory = memories.find((m) => matchesAny(m.content, ['nap window']));
  if (napMemory) {
    cited.push(napMemory.content);
    let text = `Keeping in mind ${cite(napMemory.content)}, we'll front-load the morning and protect a quiet window midday.`;
    if (reservation?.name) {
      text += ` That leaves a comfortable window before your ${reservation.time} reservation at ${reservation.name}.`;
    }
    return { text, cited };
  }

  const middayMemory = memories.find((m) => matchesAny(m.content, ['midday break']));
  if (middayMemory) {
    cited.push(middayMemory.content);
    let text = `${cite(middayMemory.content)} — we'll build the day around a real pause in the middle, not as an afterthought.`;
    if (reservation?.name) {
      text += ` Dinner at ${reservation.name} (${reservation.time}) still fits comfortably.`;
    }
    return { text, cited };
  }

  const slowMemory = memories.find((m) =>
    matchesAny(m.content, ['slow mornings', 'prefers slow']),
  );
  const ropeDropMemory = memories.find((m) => matchesAny(m.content, ['rope drop']));

  if (slowMemory && !ropeDropMemory) {
    cited.push(slowMemory.content);
    const flexMemory = memories.find((m) => matchesAny(m.content, ['flexible plans']));
    if (flexMemory) cited.push(flexMemory.content);

    let text = `Keeping in mind ${cite(slowMemory.content)}, we're not pushing an early arrival. A late-morning start works with the day's rhythm.`;
    if (flexMemory) {
      text += ` ${cite(flexMemory.content)} stays the guide.`;
    }
    return { text, cited };
  }

  if (ropeDropMemory && !slowMemory) {
    cited.push(ropeDropMemory.content);
    return {
      text: `${cite(ropeDropMemory.content)} — we'll prioritize the morning window while energy is high.`,
      cited,
    };
  }

  const mobilityMemory = memories.find((m) => matchesAny(m.content, ['mobility needs']));
  if (mobilityMemory) {
    cited.push(mobilityMemory.content);
    return {
      text: `Keeping in mind ${cite(mobilityMemory.content)}, we'll build in frequent pauses and shorter walking stretches.`,
      cited,
    };
  }

  const poolMemory = memories.find((m) =>
    matchesAny(m.content, ['pool time matters', 'pool time is part']),
  );
  if (poolMemory) {
    cited.push(poolMemory.content);
    return {
      text: `Keeping in mind ${cite(poolMemory.content)}, we'll leave room for resort time — not just park time.`,
      cited,
    };
  }

  const avoidMemory = memories.find((m) => matchesAny(m.content, ['avoid overdoing']));
  if (avoidMemory) {
    cited.push(avoidMemory.content);
    return {
      text: `${cite(avoidMemory.content)} — we'll keep today's plan lighter than it could be.`,
      cited,
    };
  }

  const first = memories[0];
  if (first) {
    cited.push(first.content);
    return {
      text: `Keeping in mind ${cite(first.content)}, we'll shape today's rhythm around what you've shared — not a generic park schedule.`,
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

  const characterMemory = memories.find((m) => matchesAny(m.content, ['character moments']));
  if (characterMemory) {
    cited.push(characterMemory.content);
    return {
      text: `Make time for character moments — ${cite(characterMemory.content)}.`,
      cited,
    };
  }

  const thrillMemory = memories.find((m) => matchesAny(m.content, ['thrill rides matter']));
  if (thrillMemory) {
    cited.push(thrillMemory.content);
    return {
      text: `Front-load the thrill rides that matter — ${cite(thrillMemory.content)}.`,
      cited,
    };
  }

  const paradeMemory = memories.find((m) => matchesAny(m.content, ['parades matter']));
  if (paradeMemory) {
    cited.push(paradeMemory.content);
    return {
      text: `Protect time for parades — ${cite(paradeMemory.content)}.`,
      cited,
    };
  }

  const snackMemory = memories.find((m) => matchesAny(m.content, ['snacks are part']));
  if (snackMemory) {
    cited.push(snackMemory.content);
    return {
      text: `Build in snack stops — ${cite(snackMemory.content)}.`,
      cited,
    };
  }

  if (memories.length > 0) {
    cited.push(memories[0].content);
    return {
      text: `One clear priority this morning, shaped by ${cite(memories[0].content)}. Everything else is optional.`,
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

  const allergyMemory = memories.find((m) => matchesAny(m.content, ['food allerg']));
  if (allergyMemory) {
    cited.push(allergyMemory.content);
    return {
      text: `${cite(allergyMemory.content)} — mention this when checking in at any dining reservation and ask to speak with a chef or manager. We won't claim any specific item is safe; always verify in person.`,
      cited,
    };
  }

  const sensoryMemory = memories.find((m) => matchesAny(m.content, ['sensory sensitivity']));
  const loudMemory = memories.find((m) => matchesAny(m.content, ['loud shows are hard']));
  if (sensoryMemory || loudMemory) {
    const memory = sensoryMemory ?? loudMemory!;
    cited.push(memory.content);
    return {
      text: `${cite(memory.content)} — plan quieter pockets through the day and have an exit strategy if things get overwhelming.`,
      cited,
    };
  }

  const heatMemory = memories.find((m) => matchesAny(m.content, ['heat sensitivity']));
  if (heatMemory) {
    cited.push(heatMemory.content);
    return {
      text: `${cite(heatMemory.content)} — seek shade during peak afternoon hours and hydrate before anyone feels depleted.`,
      cited,
    };
  }

  return {
    text: 'Heat and walking add up faster than expected. Hydrate early, and treat a mid-afternoon slowdown as signal, not failure.',
    cited,
  };
}

function buildMagicMoment(trip: Trip, memories: Memory[]): string {
  const combined = memories.map((m) => m.content).join(' ');

  const fireworksMemory = memories.find((m) => matchesAny(m.content, ['fireworks matter']));
  if (fireworksMemory) {
    return `${cite(fireworksMemory.content)} — ${dayFixture.park.showtimes[0] ?? 'Evening fireworks'} could be a natural finale if energy allows, not an obligation.`;
  }

  const photoMemory = memories.find((m) => matchesAny(m.content, ['photos matter']));
  if (photoMemory) {
    return `Leave unhurried moments for photos — ${cite(photoMemory.content)}. The best shots often happen between plans.`;
  }

  if (matchesAny(combined, ['first-timers'])) {
    return `At ${trip.destination}, the first walk down Main Street is a moment — not a transit segment. Take it in.`;
  }

  if (dayFixture.park.showtimes.length > 0) {
    return `${dayFixture.park.showtimes[0]} is tonight if energy allows — a natural finale, not an obligation.`;
  }

  return 'Leave one unscheduled hour for whatever catches this group\'s attention. That\'s often where the story comes from.';
}

function buildNextAction(trip: Trip, reservation?: Trip['reservation']): string {
  if (reservation?.name?.trim()) {
    return `Confirm your ${reservation.time} reservation at ${reservation.name} when you arrive. Then agree on one morning priority together.`;
  }

  return `Before you leave for ${trip.destination}, agree on one thing that would make today feel like a win.`;
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
  const weather = buildWeather(memories);
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

// A future trip can show a preview of its Day 1 briefing.
export function canPreviewBriefing(trip: Trip | null, memories: Memory[], today = new Date()): boolean {
  if (!trip || memories.length === 0) return false;
  return getTripStatus(trip, today).daysUntil > 0;
}

export function generatePreviewBriefing(trip: Trip, memories: Memory[]): Briefing | null {
  return generateBriefing(trip, memories, new Date(trip.startDate + 'T00:00:00'));
}

export { pickRelevantMemories };
