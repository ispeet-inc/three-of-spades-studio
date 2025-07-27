// Audio/Haptic feedback system for Three of Spades
// This provides visual feedback that mimics audio/haptic sensations

export type FeedbackType = 
  | 'cardPlay' 
  | 'cardDeal' 
  | 'buttonClick' 
  | 'bid' 
  | 'trump' 
  | 'roundWin' 
  | 'gameWin' 
  | 'error' 
  | 'success';

export interface FeedbackOptions {
  intensity?: 'light' | 'medium' | 'strong';
  duration?: number;
  element?: HTMLElement;
}

class FeedbackSystem {
  private static instance: FeedbackSystem;
  private isEnabled: boolean = true;

  static getInstance(): FeedbackSystem {
    if (!FeedbackSystem.instance) {
      FeedbackSystem.instance = new FeedbackSystem();
    }
    return FeedbackSystem.instance;
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  // Main feedback trigger
  trigger(type: FeedbackType, options: FeedbackOptions = {}) {
    if (!this.isEnabled) return;

    const { intensity = 'medium', duration = 300, element } = options;

    // Visual feedback based on type
    switch (type) {
      case 'cardPlay':
        this.cardPlayFeedback(element, intensity);
        break;
      case 'cardDeal':
        this.cardDealFeedback(element, intensity);
        break;
      case 'buttonClick':
        this.buttonClickFeedback(element, intensity);
        break;
      case 'bid':
        this.bidFeedback(element, intensity);
        break;
      case 'trump':
        this.trumpFeedback(element, intensity);
        break;
      case 'roundWin':
        this.roundWinFeedback(element, intensity);
        break;
      case 'gameWin':
        this.gameWinFeedback(element, intensity);
        break;
      case 'error':
        this.errorFeedback(element, intensity);
        break;
      case 'success':
        this.successFeedback(element, intensity);
        break;
    }

    // Screen flash for important events
    if (['roundWin', 'gameWin', 'trump'].includes(type)) {
      this.screenFlash(type);
    }
  }

  private cardPlayFeedback(element?: HTMLElement, intensity?: string) {
    if (!element) return;
    
    // Quick scale pulse
    element.style.transform = 'scale(1.1)';
    element.style.transition = 'transform 0.1s ease-out';
    
    setTimeout(() => {
      element.style.transform = 'scale(1)';
      element.style.transition = 'transform 0.2s ease-out';
    }, 100);

    // Add ripple effect
    this.createRipple(element, '#FFD700');
  }

  private cardDealFeedback(element?: HTMLElement, intensity?: string) {
    if (!element) return;
    
    // Subtle shake
    element.style.animation = 'deal-impact 0.3s ease-out';
    setTimeout(() => {
      element.style.animation = '';
    }, 300);
  }

  private buttonClickFeedback(element?: HTMLElement, intensity?: string) {
    if (!element) return;
    
    // Quick press effect
    element.style.transform = 'scale(0.95)';
    element.style.transition = 'transform 0.05s ease-out';
    
    setTimeout(() => {
      element.style.transform = 'scale(1)';
      element.style.transition = 'transform 0.15s ease-out';
    }, 50);

    // Add subtle glow
    this.createGlow(element, intensity);
  }

  private bidFeedback(element?: HTMLElement, intensity?: string) {
    if (!element) return;
    
    // Pulse effect
    element.style.animation = 'bid-pulse 0.4s ease-out';
    setTimeout(() => {
      element.style.animation = '';
    }, 400);

    this.createRipple(element, '#FFD700');
  }

  private trumpFeedback(element?: HTMLElement, intensity?: string) {
    if (!element) return;
    
    // Strong pulse with golden glow
    element.style.animation = 'trump-selected 0.6s ease-out';
    setTimeout(() => {
      element.style.animation = '';
    }, 600);
  }

  private roundWinFeedback(element?: HTMLElement, intensity?: string) {
    if (!element) return;
    
    // Victory pulse
    element.style.animation = 'victory-pulse 0.8s ease-out';
    setTimeout(() => {
      element.style.animation = '';
    }, 800);
  }

  private gameWinFeedback(element?: HTMLElement, intensity?: string) {
    if (!element) return;
    
    // Extended celebration
    element.style.animation = 'game-win-celebration 1.2s ease-out';
    setTimeout(() => {
      element.style.animation = '';
    }, 1200);
  }

  private errorFeedback(element?: HTMLElement, intensity?: string) {
    if (!element) return;
    
    // Shake effect
    element.style.animation = 'error-shake 0.4s ease-out';
    setTimeout(() => {
      element.style.animation = '';
    }, 400);

    this.createRipple(element, '#FF4444');
  }

  private successFeedback(element?: HTMLElement, intensity?: string) {
    if (!element) return;
    
    // Success bounce
    element.style.animation = 'success-bounce 0.5s ease-out';
    setTimeout(() => {
      element.style.animation = '';
    }, 500);

    this.createRipple(element, '#44FF44');
  }

  private createRipple(element: HTMLElement, color: string) {
    const ripple = document.createElement('div');
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = color;
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple-effect 0.6s linear';
    ripple.style.left = '50%';
    ripple.style.top = '50%';
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.marginLeft = '-10px';
    ripple.style.marginTop = '-10px';
    ripple.style.pointerEvents = 'none';
    ripple.style.opacity = '0.6';

    element.style.position = 'relative';
    element.appendChild(ripple);

    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  }

  private createGlow(element: HTMLElement, intensity?: string) {
    const glowDuration = intensity === 'strong' ? 400 : intensity === 'light' ? 200 : 300;
    
    element.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.6)';
    element.style.transition = `box-shadow ${glowDuration}ms ease-out`;
    
    setTimeout(() => {
      element.style.boxShadow = '';
    }, glowDuration);
  }

  private screenFlash(type: FeedbackType) {
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100vw';
    flash.style.height = '100vh';
    flash.style.pointerEvents = 'none';
    flash.style.zIndex = '9999';
    flash.style.opacity = '0';

    // Different colors for different events
    switch (type) {
      case 'roundWin':
        flash.style.background = 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)';
        break;
      case 'gameWin':
        flash.style.background = 'radial-gradient(circle, rgba(255,215,0,0.5) 0%, transparent 70%)';
        break;
      case 'trump':
        flash.style.background = 'linear-gradient(45deg, rgba(255,215,0,0.2) 0%, transparent 50%)';
        break;
    }

    flash.style.animation = 'screen-flash 0.4s ease-out';
    document.body.appendChild(flash);

    setTimeout(() => {
      if (flash.parentNode) {
        flash.parentNode.removeChild(flash);
      }
    }, 400);
  }
}

// Create and export singleton instance
export const feedback = FeedbackSystem.getInstance();

// Hook for React components
export const useFeedback = () => {
  return {
    trigger: (type: FeedbackType, options?: FeedbackOptions) => feedback.trigger(type, options),
    setEnabled: (enabled: boolean) => feedback.setEnabled(enabled)
  };
};

// Utility function for adding feedback to any element
export const addFeedback = (element: HTMLElement | null, type: FeedbackType, options?: FeedbackOptions) => {
  if (element) {
    feedback.trigger(type, { ...options, element });
  }
};