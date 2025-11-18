/**
 * Multiplayer Page - Main entry point for multiplayer functionality
 */

import { RoomLobby } from "@/components/multiplayer";
import { useGameSync } from "@/hooks/useGameSync";
import { useMultiplayer } from "@/hooks/useMultiplayer";
import { useNavigate } from "react-router-dom";

export default function MultiplayerPage() {
  const navigate = useNavigate();
  const { roomState } = useMultiplayer();
  useGameSync(roomState.roomId);

  const handleBack = () => {
    navigate("/");
  };

  const handleStartGame = () => {
    // Navigate to game page with multiplayer mode
    // The game will be initialized when game:started event is received
    navigate("/multiplayer-game");
  };

  return <RoomLobby onBack={handleBack} onStartGame={handleStartGame} />;
}

