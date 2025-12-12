import { Flashcard, Grade } from '../types';

/**
 * Calculates the new SRS parameters for a card based on the user's grade.
 * Simplified SM-2 / Box Logic as per PRD.
 */
export const calculateNextReview = (card: Flashcard, grade: Grade): Flashcard => {
  let newInterval = card.interval;
  let newEaseFactor = card.easeFactor;
  let newBox = card.box;

  // PRD Logic:
  // Again: Interval = 0 (Review same day)
  // Hard: Interval = Previous * 1.2
  // Good: Interval = Previous * 2.5
  // Easy: Interval = Previous * 4.0
  
  // Default logic for new cards (interval 0)
  const isNew = card.interval === 0;

  switch (grade) {
    case Grade.AGAIN:
      newInterval = 0;
      newBox = 0;
      // Slight punishment to ease factor
      newEaseFactor = Math.max(1.3, newEaseFactor - 0.2);
      break;
    
    case Grade.HARD:
      newInterval = isNew ? 1 : Math.max(1, Math.floor(card.interval * 1.2));
      newEaseFactor = Math.max(1.3, newEaseFactor - 0.15);
      break;

    case Grade.GOOD:
      newInterval = isNew ? 1 : Math.max(1, Math.floor(card.interval * 2.5));
      newBox += 1;
      break;

    case Grade.EASY:
      newInterval = isNew ? 3 : Math.max(1, Math.floor(card.interval * 4.0));
      newBox += 1;
      newEaseFactor += 0.15;
      break;
  }

  // Update Next Review Date
  // If interval is 0, set to 1 minute from now for immediate re-queue in a real app,
  // but for this batch logic, 'Again' usually means re-queue in current session or tomorrow.
  // Per PRD: Again -> 1 minute (effectively immediately/same day), others are days.
  
  let nextReviewDate: number;
  if (newInterval === 0) {
    // 1 minute from now
    nextReviewDate = Date.now() + 60 * 1000; 
  } else {
    // Days from now
    nextReviewDate = Date.now() + (newInterval * 24 * 60 * 60 * 1000);
  }

  return {
    ...card,
    interval: newInterval,
    easeFactor: newEaseFactor,
    nextReviewDate: nextReviewDate,
    box: newBox,
    history: [...(card.history || []), grade]
  };
};

export const createInitialFlashcard = (id: string, front: string, back: string): Flashcard => ({
  id,
  front,
  back,
  box: 0,
  nextReviewDate: Date.now(), // Due immediately
  interval: 0,
  easeFactor: 2.5,
  history: []
});
