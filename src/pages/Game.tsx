import { useState } from "react";
import { GameBoard } from "@/components/game/GameBoard";
import { Card } from "@/components/game/PlayingCard";

// Mock game data for demonstration
const mockGameState = {
  players: [
    {
      id: "player1",
      name: "You",
      team: 1 as const,
      cards: [
        { id: 'A-hearts', suite: 2, number: 1, rank: 14, points: 10, positionValue: 214 },
        { id: 'K-spades', suite: 3, number: 13, rank: 13, points: 10, positionValue: 313 },
        { id: 'Q-clubs', suite: 0, number: 12, rank: 12, points: 10, positionValue: 12 },
        { id: 'J-diamonds', suite: 1, number: 11, rank: 11, points: 10, positionValue: 111 },
        { id: '10-hearts', suite: 2, number: 10, rank: 10, points: 10, positionValue: 210 },
        { id: '9-spades', suite: 3, number: 9, rank: 9, points: 0, positionValue: 309 }
      ],
      isCurrentPlayer: true
    },
    {
      id: "player2", 
      name: "Nats",
      team: 2 as const,
      cards: Array(6).fill(null).map((_, i) => ({ id: `card-${i}`, suite: 2, number: 1, rank: 14, points: 10, positionValue: 214 }))
    },
    {
      id: "player3",
      name: "Prateek", 
      team: 1 as const,
      cards: Array(6).fill(null).map((_, i) => ({ id: `card-p3-${i}`, suite: 2, number: 1, rank: 14, points: 10, positionValue: 214 })),
      isTeammate: true
    },
    {
      id: "player4",
      name: "Abhi",
      team: 2 as const, 
      cards: Array(6).fill(null).map((_, i) => ({ id: `card-p4-${i}`, suite: 2, number: 1, rank: 14, points: 10, positionValue: 214 }))
    }
  ],
  currentTrick: [
    { id: '5-hearts', suite: 2, number: 5, rank: 5, points: 5, positionValue: 205, player: 0 },
    { id: 'A-spades', suite: 3, number: 1, rank: 14, points: 10, positionValue: 314, player: 1 }
  ],
  trumpSuit: 'spades' as const,
  currentBid: 200,
  round: 4,
  teamScores: { team1: 0, team2: 70 },
  teammate: "Prateek"
};

const Game = () => {
  const [gameState, setGameState] = useState(mockGameState);

  const handleCardPlay = (card: Card) => {
    console.log("Card played:", card);
    // Here you would integrate with your game logic
  };

  const handleSettings = () => {
    console.log("Settings clicked");
  };

  return (
    <GameBoard 
      gameState={gameState}
      onCardPlay={handleCardPlay}
      onSettingsClick={handleSettings}
    />
  );
};

export default Game;