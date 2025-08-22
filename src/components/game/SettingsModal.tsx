import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Eye,
  EyeOff,
  Gamepad2,
  Settings,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useState } from "react";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  botCardsHidden: boolean;
  onToggleBotCards: () => void;
}

export const SettingsModal = ({
  open,
  onClose,
  botCardsHidden,
  onToggleBotCards,
}: SettingsModalProps) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSoundEnabled = localStorage.getItem("game-sound-enabled");
    const savedAnimationsEnabled = localStorage.getItem(
      "game-animations-enabled"
    );
    const savedAutoPlay = localStorage.getItem("game-auto-play");

    if (savedSoundEnabled !== null)
      setSoundEnabled(JSON.parse(savedSoundEnabled));
    if (savedAnimationsEnabled !== null)
      setAnimationsEnabled(JSON.parse(savedAnimationsEnabled));
    if (savedAutoPlay !== null) setAutoPlay(JSON.parse(savedAutoPlay));
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem("game-sound-enabled", JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem(
      "game-animations-enabled",
      JSON.stringify(animationsEnabled)
    );
  }, [animationsEnabled]);

  useEffect(() => {
    localStorage.setItem("game-auto-play", JSON.stringify(autoPlay));
  }, [autoPlay]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-felt-green-light to-felt-green-dark border-2 border-gold/40 shadow-elevated backdrop-blur-sm">
        <DialogHeader className="text-center mb-6">
          <DialogTitle className="text-2xl font-casino text-gold mb-2 flex items-center justify-center gap-2">
            <Settings className="w-6 h-6" />
            Game Settings
          </DialogTitle>
          <div className="w-16 h-1 bg-gradient-gold mx-auto rounded-full"></div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Display Settings */}
          <div className="bg-casino-black/20 rounded-xl p-4 border border-gold/30">
            <h3 className="text-lg font-semibold text-gold mb-4 uppercase tracking-wide">
              Display Options
            </h3>

            <div className="space-y-4">
              {/* Bot Cards Visibility */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {botCardsHidden ? (
                    <EyeOff className="w-5 h-5 text-gold" />
                  ) : (
                    <Eye className="w-5 h-5 text-gold" />
                  )}
                  <Label htmlFor="bot-cards" className="text-gold font-medium">
                    Hide Bot Cards
                  </Label>
                </div>
                <Switch
                  id="bot-cards"
                  checked={botCardsHidden}
                  onCheckedChange={onToggleBotCards}
                />
              </div>

              {/* Animations */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Gamepad2 className="w-5 h-5 text-gold" />
                  <Label htmlFor="animations" className="text-gold font-medium">
                    Enable Animations
                  </Label>
                </div>
                <Switch
                  id="animations"
                  checked={animationsEnabled}
                  onCheckedChange={setAnimationsEnabled}
                />
              </div>
            </div>
          </div>

          {/* Audio Settings */}
          <div className="bg-casino-black/20 rounded-xl p-4 border border-gold/30">
            <h3 className="text-lg font-semibold text-gold mb-4 uppercase tracking-wide">
              Audio Options
            </h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-gold" />
                ) : (
                  <VolumeX className="w-5 h-5 text-gold" />
                )}
                <Label htmlFor="sound" className="text-gold font-medium">
                  Sound Effects
                </Label>
              </div>
              <Switch
                id="sound"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>
          </div>

          {/* Gameplay Settings */}
          <div className="bg-casino-black/20 rounded-xl p-4 border border-gold/30">
            <h3 className="text-lg font-semibold text-gold mb-4 uppercase tracking-wide">
              Gameplay Options
            </h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gamepad2 className="w-5 h-5 text-gold" />
                <Label htmlFor="auto-play" className="text-gold font-medium">
                  Auto-play when possible
                </Label>
              </div>
              <Switch
                id="auto-play"
                checked={autoPlay}
                onCheckedChange={setAutoPlay}
              />
            </div>
          </div>

          {/* Settings Info */}
          <div className="bg-gold/10 rounded-xl p-4 border border-gold/20">
            <p className="text-xs text-gold/70 text-center font-medium">
              Settings are automatically saved and will persist across game
              sessions.
            </p>
          </div>

          {/* Close Button */}
          <div className="text-center pt-2">
            <Button
              onClick={onClose}
              className="w-full h-12 text-lg font-bold font-casino bg-gradient-gold text-casino-black shadow-glow hover:shadow-glow/80 border-2 border-gold-dark transition-all duration-300"
            >
              Apply Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
