/**
 * Utility functions for handling player positioning based on viewerIndex
 * Provides consistent positioning across GameBoard and CenterTable components
 */

export type PlayerPosition = "bottom" | "left" | "top" | "right";

export interface PositionInfo {
  position: PlayerPosition;
  className: string;
  container: string;
  cardClass: string;
  collectionTarget: string;
}

export interface PlayerPositionData {
  playerIndex: number;
  position: PlayerPosition;
  className: string;
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
      cardClass: "",
      collectionTarget: "translate-y-[280px] translate-x-0", // Bottom
    },
    {
      position: "left",
      className: "absolute left-4 top-1/2 transform -translate-y-1/2",
      container: "absolute left-4 top-1/2 transform -translate-y-1/2",
      cardClass: "",
      collectionTarget: "translate-x-[-280px] translate-y-0", // Left
    },
    {
      position: "top",
      className: "absolute top-4 left-1/2 transform -translate-x-1/2",
      container: "absolute top-4 left-1/2 transform -translate-x-1/2",
      cardClass: "",
      collectionTarget: "translate-y-[-280px] translate-x-0", // Top
    },
    {
      position: "right",
      className: "absolute right-4 top-1/2 transform -translate-y-1/2",
      container: "absolute right-4 top-1/2 transform -translate-y-1/2",
      cardClass: "",
      collectionTarget: "translate-x-[280px] translate-y-0", // Right
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
export function getPlayerPositions(viewerIndex: number): PlayerPositionData[] {
  return Array.from({ length: 4 }, (_, i) => {
    const playerIndex = (viewerIndex + i) % 4;
    const positionInfo = getPositionInfo(i);

    return {
      playerIndex,
      position: positionInfo.position,
      className: positionInfo.className,
    };
  });
}

/**
 * Get position info for a specific player (used by CenterTable)
 * Converts playerIndex to relative position based on viewerIndex
 */
export function getPlayerPosition(
  playerIndex: number,
  viewerIndex: number
): PositionInfo {
  const relativeIndex = (playerIndex - viewerIndex + 4) % 4;
  return getPositionInfo(relativeIndex);
}
