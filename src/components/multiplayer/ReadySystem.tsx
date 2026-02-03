/**
 * Ready System - Handles player ready status and game start
 */

import { CheckCircle2, Play, XCircle } from "lucide-react";
import { useMultiplayer } from "@/hooks/useMultiplayer";
import type { BotPlayer, Player } from "@/types/multiplayer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface ReadySystemProps {
  roomId: string;
  players: Player[];
  bots: BotPlayer[];
  allReady: boolean;
  isHost: boolean;
  onStartGame?: () => void;
}

export default function ReadySystem({
  roomId,
  players,
  bots,
  allReady,
  isHost,
  onStartGame,
}: ReadySystemProps) {
  const { setPlayerReady, socketId, startGame: startMultiplayerGame } = useMultiplayer();

  // Find current player
  const currentPlayer = players.find((p) => p.socketId === socketId);
  const isReady = currentPlayer?.isReady ?? false;

  const totalPlayers = players.length + bots.length;
  const readyPlayers = players.filter((p) => p.isReady).length;
  const readyBots = bots.filter((b) => b.isReady).length;
  const totalReady = readyPlayers + readyBots;

  const handleToggleReady = () => {
    if (!socketId) {
      toast.error("Not connected to server");
      return;
    }

    if (!roomId) {
      toast.error("Not in a room");
      return;
    }

    const newReadyState = !isReady;
    
    try {
      // Even if currentPlayer is not found in the list yet, we can still set ready
      // The server will handle it and update the player list
      setPlayerReady(roomId, newReadyState);
    } catch (error) {
      console.error("Error calling setPlayerReady:", error);
      toast.error("Failed to set ready status");
    }
  };

  const handleStartGame = () => {
    if (!allReady) {
      toast.error("Not all players are ready");
      return;
    }

    if (totalPlayers < 4) {
      toast.error("Need 4 players to start");
      return;
    }

    // Start game on server
    startMultiplayerGame(roomId);

    // Delay navigation slightly to allow game:started event to be received and processed
    // The event is sent immediately by the server, so we give it a moment to be received
    // by the useGameSync hook before navigating away
    setTimeout(() => {
      // Call callback if provided (for navigation, etc.)
      if (onStartGame) {
        onStartGame();
      }
    }, 100); // Small delay to allow event to be received
  };

  return (
    <Card className="bg-white/5 border-white/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-gold flex items-center gap-2">
          {allReady ? (
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          ) : (
            <XCircle className="w-5 h-5 text-yellow-400" />
          )}
          Ready Status
        </CardTitle>
        <CardDescription className="text-white/60">
          {allReady
            ? "All players ready! Host can start the game."
            : `${totalReady}/${totalPlayers} players ready`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ready Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/80">Ready Players</span>
            <span className="text-gold font-semibold">
              {totalReady}/{totalPlayers}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
              style={{ width: `${(totalReady / totalPlayers) * 100}%` }}
            />
          </div>
        </div>

        {/* Ready Button (for all players including host) */}
        {socketId && (
          <Button
            onClick={handleToggleReady}
            className={`w-full font-bold transition-all ${
              isReady
                ? "bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30"
                : "bg-gradient-to-r from-gold via-gold-light to-gold text-casino-black hover:shadow-glow"
            }`}
          >
            {isReady ? (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Ready
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 mr-2" />
                Mark as Ready
              </>
            )}
          </Button>
        )}

        {/* Start Game Button (host only) */}
        {isHost && (
          <Button
            onClick={handleStartGame}
            disabled={!allReady || totalPlayers < 4}
            className="w-full bg-gradient-to-r from-gold via-gold-light to-gold text-casino-black font-bold hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Game
          </Button>
        )}

        {/* Status Messages */}
        {!allReady && (
          <div className="text-sm text-white/60 space-y-1">
            {totalPlayers < 4 && (
              <p>Need {4 - totalPlayers} more player{4 - totalPlayers > 1 ? "s" : ""} to start</p>
            )}
            {totalPlayers === 4 && (
              <p>
                Waiting for{" "}
                {players.filter((p) => !p.isReady).map((p) => p.name).join(", ")}{" "}
                to be ready
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

