/**
 * Player profile utilities for localStorage-based profile management
 */

import { PlayerProfile } from "@/types/multiplayer";
import { v4 as uuidv4 } from "uuid";

const PROFILE_STORAGE_KEY = "three-of-spades-player-profile";

/**
 * Generate a new player profile
 */
export function createPlayerProfile(name: string): PlayerProfile {
  const now = new Date();
  return {
    id: uuidv4(),
    name: name.trim() || "Player",
    gamesPlayed: 0,
    gamesWon: 0,
    totalPoints: 0,
    createdAt: now,
    lastSeen: now,
  };
}

/**
 * Load player profile from localStorage
 */
export function loadPlayerProfile(): PlayerProfile | null {
  try {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored);
    // Convert date strings back to Date objects
    return {
      ...parsed,
      createdAt: new Date(parsed.createdAt),
      lastSeen: new Date(parsed.lastSeen),
    };
  } catch (error) {
    console.error("Error loading player profile:", error);
    return null;
  }
}

/**
 * Save player profile to localStorage
 */
export function savePlayerProfile(profile: PlayerProfile): void {
  try {
    // Update lastSeen timestamp
    const updatedProfile = {
      ...profile,
      lastSeen: new Date(),
    };
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
  } catch (error) {
    console.error("Error saving player profile:", error);
  }
}

/**
 * Update player profile (merge with existing)
 */
export function updatePlayerProfile(
  updates: Partial<PlayerProfile>
): PlayerProfile | null {
  const existing = loadPlayerProfile();
  if (!existing) {
    return null;
  }

  const updated = {
    ...existing,
    ...updates,
    lastSeen: new Date(),
  };

  savePlayerProfile(updated);
  return updated;
}

/**
 * Get or create a player profile
 * If no profile exists, creates one with the given name
 * If name is not provided, checks StartScreen localStorage for name
 */
export function getOrCreatePlayerProfile(name?: string): PlayerProfile {
  const existing = loadPlayerProfile();
  if (existing) {
    // Update lastSeen
    updatePlayerProfile({});
    return existing;
  }

  // If no name provided, try to get from StartScreen localStorage
  if (!name) {
    const startScreenName = localStorage.getItem("threeOfSpades_playerName");
    if (startScreenName?.trim()) {
      name = startScreenName.trim();
    }
  }

  // Create new profile
  const newProfile = createPlayerProfile(name || "Player");
  savePlayerProfile(newProfile);
  return newProfile;
}

/**
 * Update player stats after a game
 */
export function updatePlayerStats(
  won: boolean,
  points: number
): PlayerProfile | null {
  const profile = loadPlayerProfile();
  if (!profile) {
    return null;
  }

  return updatePlayerProfile({
    gamesPlayed: profile.gamesPlayed + 1,
    gamesWon: profile.gamesWon + (won ? 1 : 0),
    totalPoints: profile.totalPoints + points,
  });
}

