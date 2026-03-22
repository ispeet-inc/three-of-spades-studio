import * as React from "react";

const MOBILE_BREAKPOINT = 768;
const SMALL_MOBILE_BREAKPOINT = 390;
const MOBILE_LANDSCAPE_HEIGHT = 500; // landscape phones typically < 500px tall

/**
 * Detects if the device is mobile based on the smaller dimension.
 * This ensures landscape phones (e.g., 844×390) are still detected as mobile,
 * since their height (390px) is below the breakpoint.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    const check = () => {
      const minDim = Math.min(window.innerWidth, window.innerHeight);
      setIsMobile(minDim < MOBILE_BREAKPOINT);
    };
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);

  return !!isMobile;
}

export function useIsSmallMobile() {
  const [isSmall, setIsSmall] = React.useState(false);

  React.useEffect(() => {
    const check = () => {
      const minDim = Math.min(window.innerWidth, window.innerHeight);
      setIsSmall(minDim < SMALL_MOBILE_BREAKPOINT);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isSmall;
}

export function useIsMobileLandscape() {
  const [isLandscape, setIsLandscape] = React.useState(false);

  React.useEffect(() => {
    const check = () => {
      setIsLandscape(
        window.innerWidth > window.innerHeight &&
          window.innerHeight < MOBILE_LANDSCAPE_HEIGHT
      );
    };
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);

  return isLandscape;
}

/** Combined hook returning all mobile layout states */
export function useMobileLayout() {
  const isMobile = useIsMobile();
  const isSmallMobile = useIsSmallMobile();
  const isMobileLandscape = useIsMobileLandscape();

  return {
    isMobile,
    isSmallMobile,
    isMobileLandscape,
    /** P0 target: iPhone 14 landscape (844×390) */
    isPhoneLandscape: isMobileLandscape,
    /** P1 target: iPhone 14 portrait (390×844) */
    isPhonePortrait: isMobile && !isMobileLandscape,
  };
}
