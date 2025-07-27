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
        { suit: 'hearts' as const, value: 'A' as const },
        { suit: 'spades' as const, value: 'K' as const },
        { suit: 'clubs' as const, value: 'Q' as const },
        { suit: 'diamonds' as const, value: 'J' as const },
        { suit: 'hearts' as const, value: '10' as const },
        { suit: 'spades' as const, value: '9' as const }
      ],
      isCurrentPlayer: true
    },
    {
      id: "player2", 
      name: "Nats",
      team: 2 as const,
      cards: Array(6).fill(null).map(() => ({ suit: 'hearts' as const, value: 'A' as const }))
    },
    {
      id: "player3",
      name: "Prateek", 
      team: 1 as const,
      cards: Array(6).fill(null).map(() => ({ suit: 'hearts' as const, value: 'A' as const })),
      isTeammate: true
    },
    {
      id: "player4",
      name: "Abhi",
      team: 2 as const, 
      cards: Array(6).fill(null).map(() => ({ suit: 'hearts' as const, value: 'A' as const }))
    }
  ],
  currentTrick: [
    { suit: 'hearts' as const, value: '5' as const },
    { suit: 'spades' as const, value: 'A' as const }
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