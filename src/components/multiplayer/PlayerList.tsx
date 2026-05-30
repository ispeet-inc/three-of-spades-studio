/**
 * Player List - Displays all players and bots in the room
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMultiplayer } from "@/hooks/useMultiplayer";
import type { BotPlayer, Player } from "@/types/multiplayer";
import { PLAYER_NAME_POOL } from "@/utils/constants";
import { Bot, Crown, Plus, Trash2, User } from "lucide-react";
import { toast } from "sonner";

interface PlayerListProps {
  roomId: string;
  players: Player[];
  bots: BotPlayer[];
  isHost: boolean;
}

export default function PlayerList({
  roomId,
  players,
  bots,
  isHost,
}: PlayerListProps) {
  const { socketId, addBot, removeBot } = useMultiplayer();
  const totalPlayers = players.length + bots.length;
  const maxPlayers = 4;

  const handleAddBot = () => {
    if (totalPlayers >= maxPlayers) {
      toast.error("Room is full");
      return;
    }
    
    if (!roomId) {
      toast.error("Not in a room");
      return;
    }
    
    if (!isHost) {
      toast.error("Only the host can add bots");
      return;
    }
    
    try {
      // Generate a bot name from the pool that doesn't conflict with existing players/bots
      const usedNames = new Set([
        ...players.map(p => p.name),
        ...bots.map(b => b.name)
      ]);
      
      const availableNames = PLAYER_NAME_POOL.filter(name => !usedNames.has(name));
      
      let botName: string;
      if (availableNames.length > 0) {
        // Pick a random name from available names
        const randomIndex = Math.floor(Math.random() * availableNames.length);
        botName = availableNames[randomIndex];
      } else {
        // Fallback to generic name if pool is exhausted
        botName = `Bot ${bots.length + 1}`;
      }
      
      addBot(roomId, botName);
    } catch (error) {
      console.error("Error calling addBot:", error);
      toast.error("Failed to add bot");
    }
  };

  const handleRemoveBot = (botId: string) => {
    removeBot(roomId, botId);
  };

  // Combine players and bots, sort by position
  const allParticipants = [
    ...players.map((p) => ({ ...p, type: "player" as const })),
    ...bots.map((b) => ({ ...b, type: "bot" as const })),
  ].sort((a, b) => a.position - b.position);

  return (
    <Card className="bg-white/5 border-white/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-gold flex items-center gap-2">
          <User className="w-5 h-5" />
          Players ({totalPlayers}/{maxPlayers})
        </CardTitle>
        <CardDescription className="text-white/60">
          {totalPlayers < maxPlayers
            ? `${maxPlayers - totalPlayers} slot${maxPlayers - totalPlayers > 1 ? "s" : ""} available`
            : "Room is full"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {allParticipants.map((participant) => {
            const isCurrentPlayer =
              participant.type === "player" &&
              participant.socketId === socketId;
            const isHost = participant.type === "player" && participant.isHost;

            return (
              <div
                key={
                  participant.type === "player"
                    ? participant.socketId
                    : participant.id
                }
                className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                  isCurrentPlayer
                    ? "bg-gold/20 border-gold/50"
                    : "bg-white/5 border-white/20"
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  {/* Icon */}
                  <div
                    className={`p-2 rounded-full ${
                      participant.type === "bot"
                        ? "bg-purple-500/20 text-purple-300"
                        : "bg-blue-500/20 text-blue-300"
                    }`}
                  >
                    {participant.type === "bot" ? (
                      <Bot className="w-5 h-5" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>

                  {/* Name */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-semibold ${
                          isCurrentPlayer ? "text-gold" : "text-white"
                        }`}
                      >
                        {participant.name}
                      </span>
                      {isHost && (
                        <Crown className="w-4 h-4 text-gold" />
                      )}
                      {participant.type === "bot" && (
                        <Badge
                          variant="outline"
                          className="bg-purple-500/20 text-purple-300 border-purple-500/30"
                        >
                          Bot
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-white/50 mt-1">
                      Position {participant.position + 1}
                    </div>
                  </div>
                </div>

                {/* Ready Status */}
                {participant.type === "player" && (
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      participant.isReady
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    }`}
                  >
                    {participant.isReady ? "Ready" : "Not Ready"}
                  </div>
                )}
                {participant.type === "bot" && (
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                      Ready
                    </div>
                    {isHost && (
                      <Button
                        onClick={() => handleRemoveBot(participant.id)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        title="Remove bot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Add Bot Button (Host only) */}
          {isHost && totalPlayers < maxPlayers && (
            <Button
              onClick={handleAddBot}
              variant="outline"
              className="w-full border-dashed border-white/30 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/50 mt-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Bot
            </Button>
          )}

          {/* Empty Slots */}
          {totalPlayers < maxPlayers && (
            <div className="space-y-2 pt-2">
              {Array.from({ length: maxPlayers - totalPlayers }).map(
                (_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="flex items-center justify-center p-4 rounded-lg border border-dashed border-white/20 bg-white/5"
                  >
                    <span className="text-white/30 text-sm">
                      Waiting for player...
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

