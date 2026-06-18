import { useEffect, useState } from "react";

interface HintState {
  enabled: boolean;
  hintsShown: Record<string, number>; // hintId -> count
  maxShows: Record<string, number>; // hintId -> max times to show
}

const HINT_CONFIG = {
  "bidding-intro": {
    maxShows: 3,
    content: "Bidding determines your team and target score",
  },
  "trump-selection": {
    maxShows: 2,
    content: "Choose a trump suite you have many cards in",
  },
  "card-playing": { maxShows: 3, content: "Follow the lead suite if you can" },
  "trick-completion": {
    maxShows: 2,
    content: "Your team scored points this trick",
  },
} as const;

type HintId = keyof typeof HINT_CONFIG;

export const useHintSystem = () => {
  // Initialize state with localStorage value (moved inside hook to ensure localStorage is available)
  const [hintState, setHintState] = useState<HintState>(() => {
    if (typeof window === "undefined") {
      // Server-side rendering fallback
      return {
        enabled: false,
        hintsShown: {},
        maxShows: Object.fromEntries(
          Object.entries(HINT_CONFIG).map(([id, config]) => [
            id,
            config.maxShows,
          ])
        ),
      };
    }

    const savedHelperMode = localStorage.getItem("game-helper-mode");
    const enabled =
      savedHelperMode !== null ? JSON.parse(savedHelperMode) : false;

    return {
      enabled,
      hintsShown: {},
      maxShows: Object.fromEntries(
        Object.entries(HINT_CONFIG).map(([id, config]) => [id, config.maxShows])
      ),
    };
  });

  // Load helper mode setting from localStorage on mount (fallback)
  useEffect(() => {
    const savedHelperMode = localStorage.getItem("game-helper-mode");
    if (savedHelperMode !== null) {
      const enabled = JSON.parse(savedHelperMode);
      setHintState(prev => ({
        ...prev,
        enabled,
      }));
    }
  }, []);

  // Listen for localStorage changes (when settings are updated)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "game-helper-mode" && e.newValue) {
        const newValue = e.newValue;
        try {
          setHintState(prev => ({
            ...prev,
            enabled: JSON.parse(newValue),
          }));
        } catch (error) {
          console.error("Failed to parse helper mode setting:", error);
        }
      }
    };

    // Listen for custom event from same tab
    const handleCustomStorageChange = () => {
      const savedHelperMode = localStorage.getItem("game-helper-mode");
      if (savedHelperMode !== null) {
        const enabled = JSON.parse(savedHelperMode);
        setHintState(prev => ({
          ...prev,
          enabled,
        }));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("helperModeChanged", handleCustomStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "helperModeChanged",
        handleCustomStorageChange
      );
    };
  }, []);

  const shouldShowHint = (hintId: HintId): boolean => {
    if (!hintState.enabled) {
      return false;
    }

    const currentCount = hintState.hintsShown[hintId] || 0;
    const maxCount = hintState.maxShows[hintId] || 0;

    return currentCount < maxCount;
  };

  const markHintShown = (hintId: HintId) => {
    setHintState(prev => ({
      ...prev,
      hintsShown: {
        ...prev.hintsShown,
        [hintId]: (prev.hintsShown[hintId] || 0) + 1,
      },
    }));
  };

  const getHintContent = (hintId: HintId): string => {
    return HINT_CONFIG[hintId]?.content || "";
  };

  const resetHints = () => {
    setHintState(prev => ({
      ...prev,
      hintsShown: {},
    }));
  };

  return {
    shouldShowHint,
    markHintShown,
    getHintContent,
    resetHints,
    hintState,
  };
};
