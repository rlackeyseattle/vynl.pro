"use client";

import { useState, useCallback, useRef } from "react";
import { handleSwipe, SwipeDirection, SwipeResult } from "@/app/actions/swipe";

export type Card = Record<string, any>;

interface UseCardDeckOptions {
  onMatch: (matchId: string, draftContract: string) => void;
  onRefillNeeded: () => Promise<Card[]>;
}

export function useCardDeck(initialCards: Card[], options: UseCardDeckOptions) {
  const [stack, setStack] = useState<Card[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const pendingActions = useRef<Promise<SwipeResult>[]>([]);

  const currentCard = stack[currentIndex] ?? null;
  const nextCard = stack[currentIndex + 1] ?? null;

  const swipe = useCallback(
    async (direction: SwipeDirection, slotId: string, bandId: string) => {
      if (isSwiping || !currentCard) return;
      setIsSwiping(true);

      // Optimistically advance the deck
      setCurrentIndex((prev) => prev + 1);

      // Fire server action in background (non-blocking)
      const action = handleSwipe(slotId, bandId, direction).then((result) => {
        if (result.matched && result.matchId && result.draftContract) {
          options.onMatch(result.matchId, result.draftContract);
        }
        return result;
      });
      pendingActions.current.push(action);

      // Refill queue when running low
      if (stack.length - currentIndex <= 4) {
        const newCards = await options.onRefillNeeded();
        if (newCards.length > 0) {
          setStack((prev) => [...prev, ...newCards]);
        }
      }

      setIsSwiping(false);
    },
    [currentCard, currentIndex, isSwiping, options, stack.length]
  );

  const swipeLeft = useCallback(
    (slotId: string, bandId: string) => swipe("LEFT", slotId, bandId),
    [swipe]
  );

  const swipeRight = useCallback(
    (slotId: string, bandId: string) => swipe("RIGHT", slotId, bandId),
    [swipe]
  );

  const remaining = stack.length - currentIndex;

  return { currentCard, nextCard, swipeLeft, swipeRight, isSwiping, remaining };
}
