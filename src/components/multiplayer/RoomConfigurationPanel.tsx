/**
 * Room Configuration Panel - Host-only settings panel
 */

import { Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useMultiplayer } from "@/hooks/useMultiplayer";
import type { RoomConfig } from "@/types/multiplayer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RoomConfigurationPanelProps {
  roomId: string;
  config: RoomConfig;
}

export default function RoomConfigurationPanel({
  roomId,
  config,
}: RoomConfigurationPanelProps) {
  const { updateRoomConfig } = useMultiplayer();
  const [localConfig, setLocalConfig] = useState<RoomConfig>(config);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local config when server config changes
  useEffect(() => {
    setLocalConfig(config);
    setHasChanges(false);
  }, [config]);

  const handleConfigChange = <K extends keyof RoomConfig>(
    key: K,
    value: RoomConfig[K]
  ) => {
    const newConfig = { ...localConfig, [key]: value };
    setLocalConfig(newConfig);
    setHasChanges(true);
  };

  const handleSave = () => {
    updateRoomConfig(roomId, localConfig);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalConfig(config);
    setHasChanges(false);
  };

  return (
    <Card className="bg-white/5 border-white/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-gold flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Room Settings
        </CardTitle>
        <CardDescription className="text-white/60">
          Configure game settings (Host only)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Series Length */}
        <div className="space-y-2">
          <Label htmlFor="seriesLength" className="text-white/80">
            Number of Games
          </Label>
          <Input
            id="seriesLength"
            type="number"
            min="4"
            value={localConfig.seriesLength}
            onChange={(e) =>
              handleConfigChange("seriesLength", parseInt(e.target.value) || 4)
            }
            className="bg-white/10 border-white/20 text-white"
          />
          <p className="text-xs text-white/50">
            Minimum 4 games per series
          </p>
        </div>

        {/* Minimum Starting Bid */}
        <div className="space-y-2">
          <Label htmlFor="minStartingBid" className="text-white/80">
            Minimum Starting Bid
          </Label>
          <Input
            id="minStartingBid"
            type="number"
            min="165"
            value={localConfig.minStartingBid}
            onChange={(e) =>
              handleConfigChange(
                "minStartingBid",
                parseInt(e.target.value) || 165
              )
            }
            className="bg-white/10 border-white/20 text-white"
          />
          <p className="text-xs text-white/50">
            Minimum bid is 165
          </p>
        </div>

        {/* Time Per Turn */}
        <div className="space-y-2">
          <Label htmlFor="timePerTurn" className="text-white/80">
            Time Per Turn (seconds)
          </Label>
          <Input
            id="timePerTurn"
            type="number"
            min="30"
            value={localConfig.timePerTurn}
            onChange={(e) =>
              handleConfigChange("timePerTurn", parseInt(e.target.value) || 90)
            }
            className="bg-white/10 border-white/20 text-white"
          />
          <p className="text-xs text-white/50">
            Default: 90 seconds
          </p>
        </div>

        {/* Bot Count */}
        <div className="space-y-2">
          <Label htmlFor="botCount" className="text-white/80">
            Number of Bots
          </Label>
          <Select
            value={localConfig.botCount.toString()}
            onValueChange={(value) =>
              handleConfigChange("botCount", parseInt(value))
            }
          >
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-felt-green-dark border-white/20">
              <SelectItem value="0">0 Bots</SelectItem>
              <SelectItem value="1">1 Bot</SelectItem>
              <SelectItem value="2">2 Bots</SelectItem>
              <SelectItem value="3">3 Bots</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-white/50">
            Bots will be added to fill remaining slots
          </p>
        </div>

        {/* Action Buttons */}
        {hasChanges && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-gold via-gold-light to-gold text-casino-black font-bold"
            >
              Save Changes
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Reset
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

