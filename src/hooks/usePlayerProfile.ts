/**
 * React hook for managing player profile
 */

import { useEffect, useState } from "react";
import {
  getOrCreatePlayerProfile,
  loadPlayerProfile,
  savePlayerProfile,
  updatePlayerProfile,
  type PlayerProfile,
} from "@/utils/playerProfile";

export function usePlayerProfile() {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load profile on mount
    const loaded = loadPlayerProfile();
    setProfile(loaded);
    setIsLoading(false);
  }, []);

  const createProfile = (name: string) => {
    const newProfile = getOrCreatePlayerProfile(name);
    setProfile(newProfile);
    return newProfile;
  };

  const updateProfile = (updates: Partial<PlayerProfile>) => {
    const updated = updatePlayerProfile(updates);
    if (updated) {
      setProfile(updated);
    }
    return updated;
  };

  const saveProfile = (profileToSave: PlayerProfile) => {
    savePlayerProfile(profileToSave);
    setProfile(profileToSave);
  };

  return {
    profile,
    isLoading,
    createProfile,
    updateProfile,
    saveProfile,
  };
}

