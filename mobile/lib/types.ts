export type Reservation = {
  name: string;
  time: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'other';
};

export type Trip = {
  destination: string;
  startDate: string;
  endDate: string;
  goals?: string;
  reservation?: Reservation;
};

export type Memory = {
  id: string;
  content: string;
  createdAt: string;
};

export type BriefingSection = {
  goal: string;
  weather: string;
  pacing: string;
  priority: string;
  caution: string;
  magicMoment: string;
  nextAction: string;
};

export type Briefing = {
  dayNumber: number;
  totalDays: number;
  sections: BriefingSection;
  citedMemories: string[];
};

export type DayFixture = {
  weather: {
    condition: string;
    highF: number;
  };
  park: {
    name: string;
    hours: string;
    crowd: string;
    showtimes: string[];
  };
};

export const MEMORY_MAX_COUNT = 30;
export const MEMORY_MAX_LENGTH = 200;
