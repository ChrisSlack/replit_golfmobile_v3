export interface CourseHole {
  hole: number;
  par: number;
  yardage: number;
  handicap: number;
}

export interface Course {
  id: string;
  name: string;
  par: number;
  holes: CourseHole[];
  description?: string;
  signatureHole?: string;
  website?: string;
}

export interface PlayerScore {
  player: string;
  hole: number;
  score: number;
}

export interface RoundScore {
  roundId: number;
  player: string;
  scores: { [hole: number]: number };
  total: number;
  toPar: number;
}

export interface StandardFine {
  type: string;
  name: string;
  amount: number;
  description: string;
}

export interface ActivityOption {
  id: string;
  name: string;
  description: string;
  category: string;
  image?: string;
}

export interface ScheduleItem {
  date: string;
  day: string;
  course?: string;
  departure?: string;
  travelTime?: string;
  teeTime?: string;
  pickupTime?: string;
  duration?: string;
  description: string;
  isSpecial?: boolean;
}
