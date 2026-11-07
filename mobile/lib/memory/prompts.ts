export type MemoryChip = {
  id: string;
  label: string;
  memoryText: string;
};

export type MemoryPromptSection = {
  id: string;
  question: string;
  chips: MemoryChip[];
  optionalPrompt?: string;
};

export const MEMORY_PROMPT_SECTIONS: MemoryPromptSection[] = [
  {
    id: 'who',
    question: "Who's coming?",
    chips: [
      { id: 'adults', label: 'Adults', memoryText: 'This group includes adults.' },
      { id: 'kids', label: 'Kids', memoryText: 'This group includes kids.' },
      { id: 'teens', label: 'Teens', memoryText: 'This group includes teens.' },
      { id: 'grandparents', label: 'Grandparents', memoryText: 'This group includes grandparents.' },
      { id: 'first-timers', label: 'First-timers', memoryText: 'This group includes first-timers.' },
    ],
    optionalPrompt: 'Anything else about your group?',
  },
  {
    id: 'pace',
    question: 'What kind of park days work best?',
    chips: [
      { id: 'slow-mornings', label: 'Slow mornings', memoryText: 'This group prefers slow mornings.' },
      { id: 'rope-drop', label: 'Rope drop', memoryText: 'This group likes rope drop mornings.' },
      { id: 'midday-break', label: 'Midday break', memoryText: 'Midday breaks are important for this trip.' },
      { id: 'pool-time-matters', label: 'Pool time matters', memoryText: 'Pool time matters to this group.' },
      { id: 'flexible-plans', label: 'Flexible plans', memoryText: 'This group prefers flexible plans.' },
      {
        id: 'avoid-overdoing',
        label: 'Avoid overdoing it',
        memoryText: 'This group wants to avoid overdoing it.',
      },
    ],
  },
  {
    id: 'careful',
    question: 'What should we be careful about?',
    chips: [
      { id: 'food-allergy', label: 'Food allergy', memoryText: 'Food allergies need to be considered.' },
      {
        id: 'sensory',
        label: 'Sensory sensitivity',
        memoryText: 'Sensory sensitivity should be considered.',
      },
      { id: 'mobility', label: 'Mobility needs', memoryText: 'Mobility needs should be considered.' },
      { id: 'nap-window', label: 'Nap window', memoryText: 'A nap window is important for this trip.' },
      { id: 'heat', label: 'Heat sensitivity', memoryText: 'Heat sensitivity should be considered.' },
      { id: 'loud-shows', label: 'Loud shows are hard', memoryText: 'Loud shows are hard for this group.' },
    ],
  },
  {
    id: 'magical',
    question: 'What makes the trip feel magical?',
    chips: [
      { id: 'characters', label: 'Characters', memoryText: 'Character moments matter to this group.' },
      { id: 'snacks', label: 'Snacks', memoryText: 'Snacks are part of what makes this trip special.' },
      { id: 'thrill-rides', label: 'Thrill rides', memoryText: 'Thrill rides matter to this group.' },
      { id: 'fireworks', label: 'Fireworks', memoryText: 'Fireworks matter to this group.' },
      { id: 'parades', label: 'Parades', memoryText: 'Parades matter to this group.' },
      { id: 'photos', label: 'Photos', memoryText: 'Photos matter to this group.' },
      { id: 'shopping', label: 'Shopping', memoryText: 'Shopping matters to this group.' },
      {
        id: 'pool-time-magic',
        label: 'Pool time',
        memoryText: 'Pool time is part of what makes this trip special.',
      },
    ],
  },
];

export const MEMORY_CAP_WARNING_THRESHOLD = 25;

const chipById = new Map(
  MEMORY_PROMPT_SECTIONS.flatMap((section) => section.chips).map((chip) => [chip.id, chip]),
);

export function getChipById(chipId: string): MemoryChip | undefined {
  return chipById.get(chipId);
}
