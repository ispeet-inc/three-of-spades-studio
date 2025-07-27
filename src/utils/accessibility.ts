// Accessibility utilities for the Three of Spades game

export const gameStateAnnouncements = {
  // Game stage announcements
  gameStart: "New game started. Dealing cards to all players.",
  biddingStart: "Bidding phase has begun. It's your turn to bid or pass.",
  trumpSelection: "Bidding complete. Time to select trump suit and teammate.",
  playingStart: "Trump selected. Playing phase has begun.",
  roundEnd: "Round complete. Calculating scores.",
  gameEnd: "Game finished. Final scores calculated.",

  // Player action announcements
  bidPlaced: (player: string, amount: number) => `${player} bids ${amount} points.`,
  bidPassed: (player: string) => `${player} passes on bidding.`,
  cardPlayed: (player: string, card: string) => `${player} plays ${card}.`,
  trumpSelected: (suit: string, teammate: string) => `Trump suit: ${suit}. Teammate: ${teammate}.`,

  // Game events
  roundWon: (winner: string, points: number) => `${winner} wins the round and scores ${points} points.`,
  teamScores: (team1: number, team2: number) => `Current scores: Team 1 has ${team1} points, Team 2 has ${team2} points.`,
  gameWon: (winner: string) => `Game over! ${winner} wins the game!`,

  // Turn indicators
  yourTurn: "It's your turn. Select a card to play.",
  botTurn: (botName: string) => `${botName} is thinking...`,
  waitingForAction: (player: string, action: string) => `Waiting for ${player} to ${action}.`
};

export const cardDescriptions = {
  getValue: (number: number) => {
    switch (number) {
      case 1: return "Ace";
      case 11: return "Jack";
      case 12: return "Queen"; 
      case 13: return "King";
      default: return number.toString();
    }
  },
  
  getSuit: (suite: number) => {
    switch (suite) {
      case 0: return "Spades";
      case 1: return "Hearts";
      case 2: return "Diamonds";
      case 3: return "Clubs";
      default: return "Unknown";
    }
  },

  getFullDescription: (number: number, suite: number) => {
    return `${cardDescriptions.getValue(number)} of ${cardDescriptions.getSuit(suite)}`;
  }
};

export const keyboardShortcuts = {
  // Global shortcuts
  ESC: "Escape - Close modals or cancel actions",
  ENTER: "Enter - Confirm selection or primary action",
  SPACE: "Space - Alternative confirm action",
  
  // Game-specific shortcuts
  "1-9": "Number keys - Quick bid amounts (150-230)",
  P: "P - Pass on bidding",
  H: "H - Show/hide help",
  
  // Card selection (when it's your turn)
  ARROW_LEFT: "Left Arrow - Previous card",
  ARROW_RIGHT: "Right Arrow - Next card",
  ARROW_UP: "Up Arrow - Select highlighted card"
};

// Screen reader utilities
export const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

export const announceUrgent = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'assertive');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Focus management
export const focusManagement = {
  // Store the last focused element before opening modal
  storeFocus: () => {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement !== document.body) {
      activeElement.setAttribute('data-last-focus', 'true');
    }
  },

  // Restore focus when closing modal
  restoreFocus: () => {
    const lastFocused = document.querySelector('[data-last-focus="true"]') as HTMLElement;
    if (lastFocused) {
      lastFocused.focus();
      lastFocused.removeAttribute('data-last-focus');
    }
  },

  // Focus the first interactive element in a container
  focusFirst: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  },

  // Trap focus within a modal
  trapFocus: (container: HTMLElement, event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    const focusableElements = container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
    }
  }
};

// Color contrast helpers
export const contrastHelpers = {
  // Verify text meets WCAG AA standards
  meetsContrastRequirements: (foreground: string, background: string) => {
    // This would typically use a contrast calculation library
    // For now, return true - implement actual contrast checking if needed
    return true;
  },

  // Get high contrast alternatives
  getHighContrastColors: () => ({
    background: '#000000',
    foreground: '#FFFFFF',
    accent: '#FFD700',
    error: '#FF4444',
    success: '#44FF44'
  })
};

// Reduced motion preferences
export const motionPreferences = {
  // Check if user prefers reduced motion
  prefersReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Apply reduced motion classes conditionally
  getMotionClass: (defaultClass: string, reducedClass: string = '') => {
    return motionPreferences.prefersReducedMotion() ? reducedClass : defaultClass;
  }
};