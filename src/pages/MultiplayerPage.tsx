/**
 * Multiplayer Page - Main entry point for multiplayer functionality
 */

import { RoomLobby } from "@/components/multiplayer";
import { useGameSync } from "@/hooks/useGameSync";
import { useMultiplayer } from "@/hooks/useMultiplayer";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";

export default function MultiplayerPage() {
  const navigate = useNavigate();
  const { roomId: urlRoomId } = useParams<{ roomId?: string }>();
  const { roomState } = useMultiplayer();
  // Use roomId from URL if available, otherwise use roomState
  const roomId = urlRoomId || roomState.roomId;
  useGameSync(roomId);
  
  // Navigate to URL with roomId when room is created
  useEffect(() => {
    if (roomState.roomId && !urlRoomId) {
      navigate(`/multiplayer/${roomState.roomId}`, { replace: true });
    }
  }, [roomState.roomId, urlRoomId, navigate]);

  const handleBack = () => {
    navigate("/");
  };

  const handleStartGame = () => {
    // Navigate to game page with multiplayer mode
    // Include roomId in URL for better state persistence
    // Also pass roomId through navigation state as fallback
    if (roomId) {
      navigate(`/multiplayer-game?roomId=${roomId}`, { state: { roomId: roomId } });
    } else {
      navigate("/multiplayer-game", { state: { roomId: roomId } });
    }
  };

  return <RoomLobby onBack={handleBack} onStartGame={handleStartGame} />;
}

