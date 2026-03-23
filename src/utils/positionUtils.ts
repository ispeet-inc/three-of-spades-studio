/**
 * Utility functions for handling player positioning based on viewerIndex
 * Provides consistent positioning across GameBoard and CenterTable components
 * 
 * Mobile-responsive: provides separate class sets for mobile landscape/portrait
 */

export type PlayerPosition = "bottom" | "left" | "top" | "right";

export interface PositionInfo {
  position: PlayerPosition;
  className: string;
  container: string;
  cardClass: string;
  collectionTarget: string;
  centerTableCardClass: string;
  centerTableContainer: string;
  biddingDisplayClassName: string;
  playerAreaClassName: string;
}

export interface PlayerPositionData {
  playerIndex: number;
  position: PlayerPosition;
  playerAreaClassName: string;
}

/**
 * Get position info for a relative position (0=bottom, 1=left, 2=top, 3=right)
 */
export function getPositionInfo(relativeIndex: number): PositionInfo {
  const positions: PositionInfo[] = [
    {
      position: "bottom",
      className: "absolute bottom-4 left-1/2 transform -translate-x-1/2",
      container: "absolute bottom-4 left-1/2 transform -translate-x-1/2",
      centerTableCardClass:
        "absolute bottom-4 left-1/2 transform -translate-x-1/2",
      centerTableContainer:
        "absolute bottom-4 left-1/2 transform -translate-x-1/2",
      cardClass: "",
      collectionTarget: "translate-y-[280px] translate-x-0",
      biddingDisplayClassName:
        "absolute -bottom-4 left-1/2 transform -translate-x-1/2",
      playerAreaClassName:
        "absolute bottom-4 left-1/2 transform -translate-x-1/2",
    },
    {
      position: "left",
      className: "absolute left-4 top-1/2 transform -translate-y-1/2",
      container: "absolute left-4 top-1/2 transform -translate-y-1/2",
      centerTableCardClass:
        "absolute left-4 top-1/2 transform -translate-y-1/2",
      centerTableContainer:
        "absolute left-4 top-1/2 transform -translate-y-1/2",
      cardClass: "",
      collectionTarget: "translate-x-[-280px] translate-y-0",
      biddingDisplayClassName:
        "absolute -left-4 top-1/2 transform -translate-y-1/2",
      playerAreaClassName: "absolute left-4 top-1/2 transform -translate-y-1/2",
    },
    {
      position: "top",
      className: "absolute top-4 left-1/2 transform -translate-x-1/2",
      container: "absolute top-4 left-1/2 transform -translate-x-1/2",
      centerTableCardClass:
        "absolute top-4 left-1/2 transform -translate-x-1/2",
      centerTableContainer:
        "absolute top-4 left-1/2 transform -translate-x-1/2",
      cardClass: "",
      collectionTarget: "translate-y-[-280px] translate-x-0",
      biddingDisplayClassName:
        "absolute -top-4 left-1/2 transform -translate-x-1/2",
      playerAreaClassName: "absolute top-4 left-1/2 transform -translate-x-1/2",
    },
    {
      position: "right",
      className: "absolute right-4 top-1/2 transform -translate-y-1/2",
      container: "absolute right-4 top-1/2 transform -translate-y-1/2",
      centerTableCardClass:
        "absolute right-4 top-1/2 transform -translate-y-1/2",
      centerTableContainer:
        "absolute right-4 top-1/2 transform -translate-y-1/2",
      cardClass: "",
      collectionTarget: "translate-x-[280px] translate-y-0",
      biddingDisplayClassName:
        "absolute -right-4 top-1/2 transform -translate-y-1/2",
      playerAreaClassName:
        "absolute right-4 top-1/2 transform -translate-y-1/2",
    },
  ];

  if (relativeIndex < 0 || relativeIndex >= positions.length) {
    throw new Error(`Invalid relative index: ${relativeIndex}`);
  }

  return positions[relativeIndex];
}

/**
 * Get mobile-optimized position info for landscape orientation (P0: 844×390)
 * 
 * Redesign v2: The key constraint is 390px height.
 * Layout zones (top to bottom):
 *   - 0-30px: top player (cards + tiny info)
 *   - 30-55px: gap
 *   - 55-245px: center area (bidding circle / play area) — centered at ~150px
 *   - 245-310px: gap  
 *   - 310-390px: bottom player hand + info (cards peek from bottom)
 * 
 * Left/right players sit at vertical center with cards + small info
 */
export function getMobilePositionInfo(relativeIndex: number, isPortrait: boolean = false): PositionInfo {
  if (isPortrait) {
    return getMobilePortraitPositionInfo(relativeIndex);
  }
  
  // Landscape positions - redesigned for 844×390
  // Center of screen is at ~195px. We want the circle centered slightly above center
  // to leave room for the player's hand at the bottom.
  const positions: PositionInfo[] = [
    {
      // BOTTOM player: pinned to very bottom edge
      position: "bottom",
      className: "absolute bottom-0 left-1/2 transform -translate-x-1/2",
      container: "absolute bottom-0 left-1/2 transform -translate-x-1/2",
      centerTableCardClass:
        "absolute bottom-1 left-1/2 transform -translate-x-1/2",
      centerTableContainer:
        "absolute bottom-1 left-1/2 transform -translate-x-1/2",
      cardClass: "",
      collectionTarget: "translate-y-[100px] translate-x-0",
      biddingDisplayClassName:
        "absolute -bottom-1 left-1/2 transform -translate-x-1/2",
      playerAreaClassName:
        "absolute bottom-0 left-1/2 transform -translate-x-1/2",
    },
    {
      // LEFT player: tight to left edge, vertically centered
      position: "left",
      className: "absolute left-0 top-[45%] transform -translate-y-1/2",
      container: "absolute left-0 top-[45%] transform -translate-y-1/2",
      centerTableCardClass:
        "absolute left-1 top-1/2 transform -translate-y-1/2",
      centerTableContainer:
        "absolute left-1 top-1/2 transform -translate-y-1/2",
      cardClass: "",
      collectionTarget: "translate-x-[-100px] translate-y-0",
      biddingDisplayClassName:
        "absolute -left-1 top-1/2 transform -translate-y-1/2",
      playerAreaClassName: "absolute left-0 top-[45%] transform -translate-y-1/2",
    },
    {
      // TOP player: pinned to very top
      position: "top",
      className: "absolute top-0 left-1/2 transform -translate-x-1/2",
      container: "absolute top-0 left-1/2 transform -translate-x-1/2",
      centerTableCardClass:
        "absolute top-1 left-1/2 transform -translate-x-1/2",
      centerTableContainer:
        "absolute top-1 left-1/2 transform -translate-x-1/2",
      cardClass: "",
      collectionTarget: "translate-y-[-100px] translate-x-0",
      biddingDisplayClassName:
        "absolute -top-1 left-1/2 transform -translate-x-1/2",
      playerAreaClassName: "absolute top-0 left-1/2 transform -translate-x-1/2",
    },
    {
      // RIGHT player: tight to right edge, vertically centered
      position: "right",
      className: "absolute right-0 top-[45%] transform -translate-y-1/2",
      container: "absolute right-0 top-[45%] transform -translate-y-1/2",
      centerTableCardClass:
        "absolute right-1 top-1/2 transform -translate-y-1/2",
      centerTableContainer:
        "absolute right-1 top-1/2 transform -translate-y-1/2",
      cardClass: "",
      collectionTarget: "translate-x-[100px] translate-y-0",
      biddingDisplayClassName:
        "absolute -right-1 top-1/2 transform -translate-y-1/2",
      playerAreaClassName:
        "absolute right-0 top-[45%] transform -translate-y-1/2",
    },
  ];

  if (relativeIndex < 0 || relativeIndex >= positions.length) {
    throw new Error(`Invalid relative index: ${relativeIndex}`);
  }

  return positions[relativeIndex];
}

/**
 * Get mobile-optimized position info for portrait orientation (P1: 390×844)
 */
function getMobilePortraitPositionInfo(relativeIndex: number): PositionInfo {
  const positions: PositionInfo[] = [
    {
      position: "bottom",
      className: "absolute bottom-1 left-1/2 transform -translate-x-1/2",
      container: "absolute bottom-1 left-1/2 transform -translate-x-1/2",
      centerTableCardClass:
        "absolute bottom-2 left-1/2 transform -translate-x-1/2",
      centerTableContainer:
        "absolute bottom-2 left-1/2 transform -translate-x-1/2",
      cardClass: "",
      collectionTarget: "translate-y-[160px] translate-x-0",
      biddingDisplayClassName:
        "absolute -bottom-2 left-1/2 transform -translate-x-1/2",
      playerAreaClassName:
        "absolute bottom-1 left-1/2 transform -translate-x-1/2",
    },
    {
      position: "left",
      className: "absolute left-0 top-1/2 transform -translate-y-1/2",
      container: "absolute left-0 top-1/2 transform -translate-y-1/2",
      centerTableCardClass:
        "absolute left-1 top-1/2 transform -translate-y-1/2",
      centerTableContainer:
        "absolute left-1 top-1/2 transform -translate-y-1/2",
      cardClass: "",
      collectionTarget: "translate-x-[-100px] translate-y-0",
      biddingDisplayClassName:
        "absolute -left-1 top-1/2 transform -translate-y-1/2",
      playerAreaClassName: "absolute left-0 top-1/2 transform -translate-y-1/2",
    },
    {
      position: "top",
      className: "absolute top-1 left-1/2 transform -translate-x-1/2",
      container: "absolute top-1 left-1/2 transform -translate-x-1/2",
      centerTableCardClass:
        "absolute top-2 left-1/2 transform -translate-x-1/2",
      centerTableContainer:
        "absolute top-2 left-1/2 transform -translate-x-1/2",
      cardClass: "",
      collectionTarget: "translate-y-[-160px] translate-x-0",
      biddingDisplayClassName:
        "absolute -top-2 left-1/2 transform -translate-x-1/2",
      playerAreaClassName: "absolute top-1 left-1/2 transform -translate-x-1/2",
    },
    {
      position: "right",
      className: "absolute right-0 top-1/2 transform -translate-y-1/2",
      container: "absolute right-0 top-1/2 transform -translate-y-1/2",
      centerTableCardClass:
        "absolute right-1 top-1/2 transform -translate-y-1/2",
      centerTableContainer:
        "absolute right-1 top-1/2 transform -translate-y-1/2",
      cardClass: "",
      collectionTarget: "translate-x-[100px] translate-y-0",
      biddingDisplayClassName:
        "absolute -right-1 top-1/2 transform -translate-y-1/2",
      playerAreaClassName:
        "absolute right-0 top-1/2 transform -translate-y-1/2",
    },
  ];

  if (relativeIndex < 0 || relativeIndex >= positions.length) {
    throw new Error(`Invalid relative index: ${relativeIndex}`);
  }

  return positions[relativeIndex];
}

/**
 * Get all player positions for GameBoard component
 * Maps players to positions based on viewerIndex
 */
export function getPlayerPositions(viewerIndex: number, isMobile: boolean = false, isPortrait: boolean = false): PlayerPositionData[] {
  return Array.from({ length: 4 }, (_, i) => {
    const playerIndex = (viewerIndex + i) % 4;
    const positionInfo = isMobile 
      ? getMobilePositionInfo(i, isPortrait) 
      : getPositionInfo(i);

    return {
      playerIndex,
      position: positionInfo.position,
      playerAreaClassName: positionInfo.playerAreaClassName,
    };
  });
}

/**
 * Get position info for a specific player (used by CenterTable)
 * Converts playerIndex to relative position based on viewerIndex
 */
export function getPlayerPosition(
  playerIndex: number,
  viewerIndex: number,
  isMobile: boolean = false,
  isPortrait: boolean = false
): PositionInfo {
  const relativeIndex = (playerIndex - viewerIndex + 4) % 4;
  return isMobile 
    ? getMobilePositionInfo(relativeIndex, isPortrait) 
    : getPositionInfo(relativeIndex);
}
