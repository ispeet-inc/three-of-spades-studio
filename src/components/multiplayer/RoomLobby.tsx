/**
 * Room Lobby - Main multiplayer screen for creating/joining rooms
 */

import { Copy, Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { usePlayerProfile } from "@/hooks/usePlayerProfile";
import { useMultiplayer } from "@/hooks/useMultiplayer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import RoomConfigurationPanel from "./RoomConfigurationPanel";
import PlayerList from "./PlayerList";
import ReadySystem from "./ReadySystem";

interface RoomLobbyProps {
  onBack?: () => void;
  onStartGame?: () => void;
}

export default function RoomLobby({ onBack, onStartGame }: RoomLobbyProps) {
  const { profile, createProfile, updateProfile } = usePlayerProfile();
  const {
    isConnected,
    roomState,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    isHost,
    canReconnect,
    reconnectToRoom,
  } = useMultiplayer();

  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  // Ensure profile exists and sync name from StartScreen
  useEffect(() => {
    if (!profile) {
      // Try to get name from StartScreen localStorage
      const startScreenName = localStorage.getItem("threeOfSpades_playerName");
      const nameToUse = startScreenName?.trim() || "Player";
      createProfile(nameToUse);
    } else {
      // Update profile name if StartScreen name is different
      const startScreenName = localStorage.getItem("threeOfSpades_playerName");
      if (startScreenName?.trim() && startScreenName.trim() !== profile.name) {
        updateProfile({ name: startScreenName.trim() });
      }
    }
  }, [profile, createProfile, updateProfile]);

  // Handle room creation
  const handleCreateRoom = () => {
    if (!profile || !isConnected) {
      toast.error("Not connected to server");
      return;
    }

    // Ensure profile name is up to date
    const startScreenName = localStorage.getItem("threeOfSpades_playerName");
    const nameToUse = startScreenName?.trim() || profile.name;
    
    // Update profile if name changed
    if (nameToUse !== profile.name) {
      updateProfile({ name: nameToUse });
    }

    createRoom(profile.id, nameToUse);
    setShowCreateRoom(true);
  };

  // Handle room joining
  const handleJoinRoom = () => {
    if (!profile || !isConnected) {
      toast.error("Not connected to server");
      return;
    }

    const code = roomCodeInput.trim().toUpperCase();
    if (code.length !== 6) {
      toast.error("Room code must be 6 characters");
      return;
    }

    // Ensure profile name is up to date
    const startScreenName = localStorage.getItem("threeOfSpades_playerName");
    const nameToUse = startScreenName?.trim() || profile.name;
    
    // Update profile if name changed
    if (nameToUse !== profile.name) {
      updateProfile({ name: nameToUse });
    }

    joinRoom(code, profile.id, nameToUse);
    setRoomCodeInput("");
  };

  // Handle leaving room
  const handleLeaveRoom = () => {
    if (roomState.roomId) {
      leaveRoom(roomState.roomId);
      setShowCreateRoom(false);
    }
  };

  // Copy room code to clipboard
  const handleCopyRoomCode = () => {
    if (roomState.roomId) {
      navigator.clipboard.writeText(roomState.roomId);
      toast.success("Room code copied to clipboard!");
    }
  };

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // If in a room, show room view
  if (roomState.roomId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-felt-green-dark via-felt-green to-felt-green-light relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-gold mb-2">Room Lobby</h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 border border-gold/30">
                  <span className="text-white/80 text-sm">Room Code:</span>
                  <span className="text-gold font-bold text-lg font-mono">
                    {roomState.roomId}
                  </span>
                  <button
                    onClick={handleCopyRoomCode}
                    className="ml-2 text-gold hover:text-gold-light transition-colors"
                    title="Copy room code"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                {isHost && (
                  <span className="bg-gold/20 text-gold px-3 py-1 rounded-full text-sm font-semibold border border-gold/30">
                    Host
                  </span>
                )}
              </div>
            </div>
            <Button
              onClick={handleLeaveRoom}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Leave Room
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Players */}
            <div className="lg:col-span-2 space-y-6">
              <PlayerList
                roomId={roomState.roomId}
                players={roomState.players}
                bots={roomState.bots}
                isHost={isHost}
              />

              <ReadySystem
                roomId={roomState.roomId}
                players={roomState.players}
                bots={roomState.bots}
                allReady={roomState.allReady}
                isHost={isHost}
                onStartGame={onStartGame}
              />
            </div>

            {/* Right Column - Configuration */}
            <div>
              {isHost && roomState.config && (
                <RoomConfigurationPanel
                  roomId={roomState.roomId}
                  config={roomState.config}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show create/join screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-felt-green-dark via-felt-green to-felt-green-light relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div className="text-center max-w-2xl mx-auto w-full">
          {/* Title */}
          <div className="mb-12">
            <h1 className="text-6xl md:text-7xl font-black text-gold mb-4 tracking-tight leading-none">
              Multiplayer
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto rounded-full shadow-glow"></div>
          </div>

          {/* Connection Status */}
          <div className="mb-8 space-y-3">
            {isConnected ? (
              <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full border border-green-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Connected</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-full border border-red-500/30">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-sm font-medium">Disconnected</span>
              </div>
            )}

            {/* Reconnection Option */}
            {canReconnect && (
              <Card className="bg-yellow-500/10 border-yellow-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-400 font-semibold mb-1">
                        Reconnection Available
                      </p>
                      <p className="text-white/60 text-sm">
                        You were disconnected. Click to rejoin your room.
                      </p>
                    </div>
                    <Button
                      onClick={reconnectToRoom}
                      className="bg-gradient-to-r from-gold via-gold-light to-gold text-casino-black font-bold hover:shadow-glow"
                    >
                      Reconnect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Create Room */}
            <Card className="bg-white/5 border-white/20 backdrop-blur-sm hover:bg-white/10 transition-all">
              <CardHeader>
                <CardTitle className="text-gold flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create Room
                </CardTitle>
                <CardDescription className="text-white/60">
                  Start a new game room and invite friends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleCreateRoom}
                  disabled={!isConnected}
                  className="w-full bg-gradient-to-r from-gold via-gold-light to-gold text-casino-black font-bold hover:shadow-glow"
                >
                  Create Room
                </Button>
              </CardContent>
            </Card>

            {/* Join Room */}
            <Card className="bg-white/5 border-white/20 backdrop-blur-sm hover:bg-white/10 transition-all">
              <CardHeader>
                <CardTitle className="text-gold flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Join Room
                </CardTitle>
                <CardDescription className="text-white/60">
                  Enter a 6-character room code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  type="text"
                  placeholder="ABC123"
                  value={roomCodeInput}
                  onChange={(e) =>
                    setRoomCodeInput(e.target.value.toUpperCase().slice(0, 6))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleJoinRoom();
                    }
                  }}
                  className="text-center text-lg font-mono uppercase bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  maxLength={6}
                />
                <Button
                  onClick={handleJoinRoom}
                  disabled={!isConnected || roomCodeInput.length !== 6}
                  className="w-full bg-gradient-to-r from-gold via-gold-light to-gold text-casino-black font-bold hover:shadow-glow"
                >
                  Join Room
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Back Button */}
          {onBack && (
            <Button
              onClick={onBack}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Back to Menu
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

