export interface Flashcard {
  id: string;
  front: string;
  back: string;
  // SRS properties
  box: number; // 0 to 5 (Conceptually, though we use easeFactor/interval primarily)
  nextReviewDate: number; // Timestamp
  interval: number; // Days until next review
  easeFactor: number; // Multiplier for SM-2 algo
  history: Grade[]; // Track performance
}

export interface Deck {
  id: string;
  name: string;
  cards: Flashcard[];
  createdAt: number;
}

export enum Grade {
  AGAIN = 'Again', // Score 1
  HARD = 'Hard',   // Score 2
  GOOD = 'Good',   // Score 3
  EASY = 'Easy'    // Score 4
}

export type StudySessionState = 'intro' | 'studying' | 'summary';
