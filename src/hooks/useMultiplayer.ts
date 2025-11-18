/**
 * React hook for managing multiplayer connection
 */

import { useEffect, useRef, useState } from "react";
import {
  createMultiplayerClient,
  MultiplayerClient,
} from "@/utils/multiplayer";
import type {
  BotPlayer,
  Player,
  RoomConfig,
} from "@/types/multiplayer";

export interface RoomState {
  roomId: string | null;
  hostSocketId: string | null;
  players: Player[];
  bots: BotPlayer[];
  config: RoomConfig | null;
  status: "waiting" | "ready" | "playing" | "finished";
  allReady: boolean;
}

export function useMultiplayer(serverUrl?: string) {
  const clientRef = useRef<MultiplayerClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomState, setRoomState] = useState<RoomState>({
    roomId: null,
    hostSocketId: null,
    players: [],
    bots: [],
    config: null,
    status: "waiting",
    allReady: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [reconnectionToken, setReconnectionToken] = useState<string | null>(null);
  const [disconnectedRoomId, setDisconnectedRoomId] = useState<string | null>(null);

  // Initialize client
  useEffect(() => {
    const client = createMultiplayerClient(serverUrl);
    clientRef.current = client;

    // Set up event listeners
    const unsubscribeFunctions: (() => void)[] = [];

    // Connection events
    const unsubConnect = client.on("connect", () => {
      setIsConnected(true);
      setError(null);
    });

    const unsubDisconnect = client.on("disconnect", () => {
      setIsConnected(false);
    });

    const unsubConnectError = client.on("connect_error", () => {
      setIsConnected(false);
      setError("Failed to connect to server");
    });

    unsubscribeFunctions.push(unsubConnect, unsubDisconnect, unsubConnectError);

    // Room events
    const unsubCreated = client.on("room:created", (data: unknown) => {
      const event = data as { roomId: string; hostSocketId: string; config: RoomConfig };
      setRoomState((prev) => ({
        ...prev,
        roomId: event.roomId,
        hostSocketId: event.hostSocketId,
        config: event.config,
      }));
    });

    const unsubJoined = client.on("room:joined", (data: unknown) => {
      const event = data as {
        roomId: string;
        player: Player;
        players: Player[];
        bots: BotPlayer[];
        config: RoomConfig;
        status: RoomState["status"];
      };
      setRoomState({
        roomId: event.roomId,
        hostSocketId: event.players.find((p) => p.isHost)?.socketId || null,
        players: event.players,
        bots: event.bots,
        config: event.config,
        status: event.status,
        allReady: false,
      });
    });

    const unsubPlayerJoined = client.on("player:joined", (data: unknown) => {
      const event = data as { player: Player; players: Player[] };
      setRoomState((prev) => ({
        ...prev,
        players: event.players,
      }));
    });

    const unsubPlayerLeft = client.on("player:left", (data: unknown) => {
      const event = data as {
        socketId: string;
        players: Player[];
        newHost?: string;
      };
      setRoomState((prev) => ({
        ...prev,
        players: event.players,
        hostSocketId: event.newHost || prev.hostSocketId,
      }));
    });

    const unsubPlayerReady = client.on("player:ready", (data: unknown) => {
      const event = data as {
        socketId: string;
        isReady: boolean;
        allReady: boolean;
      };
      setRoomState((prev) => ({
        ...prev,
        players: prev.players.map((p) =>
          p.socketId === event.socketId
            ? { ...p, isReady: event.isReady }
            : p
        ),
        allReady: event.allReady,
      }));
    });

    const unsubConfigUpdated = client.on("room:configUpdated", (data: unknown) => {
      const event = data as { config: RoomConfig };
      setRoomState((prev) => ({
        ...prev,
        config: event.config,
      }));
    });

    const unsubBotAdded = client.on("bot:added", (data: unknown) => {
      const event = data as {
        bot: BotPlayer;
        bots: BotPlayer[];
        players: Player[];
      };
      setRoomState((prev) => ({
        ...prev,
        bots: event.bots,
        players: event.players,
      }));
    });

    const unsubBotRemoved = client.on("bot:removed", (data: unknown) => {
      const event = data as {
        botId: string;
        bots: BotPlayer[];
        players: Player[];
      };
      setRoomState((prev) => ({
        ...prev,
        bots: event.bots,
        players: event.players,
      }));
    });

    const unsubPlayerDisconnected = client.on("player:disconnected", (data: unknown) => {
      const event = data as {
        socketId: string;
        player: Player;
        reconnectionToken: string;
        players: Player[];
      };
      // If this is the current player, store reconnection token
      if (event.socketId === clientRef.current?.getSocketId()) {
        setReconnectionToken(event.reconnectionToken);
        setDisconnectedRoomId(roomState.roomId);
      }
      setRoomState((prev) => ({
        ...prev,
        players: event.players,
      }));
    });

    const unsubBotTakeover = client.on("player:botTakeover", (data: unknown) => {
      const event = data as {
        socketId: string;
        bot: BotPlayer;
        bots: BotPlayer[];
        players: Player[];
      };
      setRoomState((prev) => ({
        ...prev,
        bots: event.bots,
        players: event.players,
      }));
    });

    const unsubPlayerReconnected = client.on("player:reconnected", (data: unknown) => {
      const event = data as {
        roomId: string;
        player: Player;
        players: Player[];
        bots: BotPlayer[];
        config: RoomConfig;
        status: RoomState["status"];
      };
      setRoomState({
        roomId: event.roomId,
        hostSocketId: event.players.find((p) => p.isHost)?.socketId || null,
        players: event.players,
        bots: event.bots,
        config: event.config,
        status: event.status,
        allReady: false,
      });
      setReconnectionToken(null);
      setDisconnectedRoomId(null);
    });

    const unsubPlayerRejoined = client.on("player:rejoined", (data: unknown) => {
      const event = data as {
        player: Player;
        removedBot?: BotPlayer;
        players: Player[];
        bots: BotPlayer[];
      };
      setRoomState((prev) => ({
        ...prev,
        players: event.players,
        bots: event.bots,
      }));
    });

    const unsubError = client.on("error", (data: unknown) => {
      const event = data as { message: string };
      setError(event.message);
    });

    unsubscribeFunctions.push(
      unsubCreated,
      unsubJoined,
      unsubPlayerJoined,
      unsubPlayerLeft,
      unsubPlayerReady,
      unsubConfigUpdated,
      unsubBotAdded,
      unsubBotRemoved,
      unsubPlayerDisconnected,
      unsubBotTakeover,
      unsubPlayerReconnected,
      unsubPlayerRejoined,
      unsubError
    );

    // Connect to server
    client
      .connect()
      .catch((err) => {
        console.error("Failed to connect to multiplayer server:", err);
        setError("Failed to connect to server");
      });

    // Cleanup on unmount
    return () => {
      unsubscribeFunctions.forEach((unsub) => unsub());
      client.disconnect();
    };
  }, [serverUrl]);

  const createRoom = (
    playerId: string,
    playerName: string,
    config?: Partial<RoomConfig>
  ) => {
    clientRef.current?.createRoom(playerId, playerName, config);
  };

  const joinRoom = (roomId: string, playerId: string, playerName: string) => {
    clientRef.current?.joinRoom(roomId, playerId, playerName);
  };

  const leaveRoom = (roomId: string) => {
    clientRef.current?.leaveRoom(roomId);
    setRoomState({
      roomId: null,
      hostSocketId: null,
      players: [],
      bots: [],
      config: null,
      status: "waiting",
      allReady: false,
    });
  };

  const updateRoomConfig = (roomId: string, config: Partial<RoomConfig>) => {
    clientRef.current?.updateRoomConfig(roomId, config);
  };

  const setPlayerReady = (roomId: string, isReady: boolean) => {
    clientRef.current?.setPlayerReady(roomId, isReady);
  };

  const addBot = (roomId: string) => {
    clientRef.current?.addBot(roomId);
  };

  const removeBot = (roomId: string, botId: string) => {
    clientRef.current?.removeBot(roomId, botId);
  };

  const reconnectToRoom = () => {
    if (disconnectedRoomId && reconnectionToken && clientRef.current) {
      clientRef.current.reconnectToRoom(disconnectedRoomId, reconnectionToken);
    }
  };

  const startGame = (roomId: string) => {
    clientRef.current?.startGame(roomId);
  };

  const isHost = roomState.hostSocketId === clientRef.current?.getSocketId();
  const canReconnect = disconnectedRoomId !== null && reconnectionToken !== null;

  return {
    isConnected,
    roomState,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    updateRoomConfig,
    setPlayerReady,
    addBot,
    removeBot,
    reconnectToRoom,
    startGame,
    isHost,
    socketId: clientRef.current?.getSocketId(),
    canReconnect,
    reconnectionToken,
    client: clientRef.current,
  };
}

