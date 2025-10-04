import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Lightbulb, Settings } from "lucide-react";
import { useEffect, useState } from "react";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  isObserver?: boolean;
}

export const SettingsModal = ({
  open,
  onClose,
  isObserver = false,
}: SettingsModalProps) => {
  const [helperMode, setHelperMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load helper mode setting from localStorage on mount
  useEffect(() => {
    const savedHelperMode = localStorage.getItem("game-helper-mode");

    if (savedHelperMode !== null) {
      const helperModeValue = JSON.parse(savedHelperMode);
      setHelperMode(helperModeValue);
    }

    setIsInitialized(true);
  }, []);

  // Save helper mode setting to localStorage when it changes
  useEffect(() => {
    // Only save after initialization to prevent overwriting with default values
    if (!isInitialized) return;

    localStorage.setItem("game-helper-mode", JSON.stringify(helperMode));

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("helperModeChanged"));
  }, [helperMode, isInitialized]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm bg-gradient-to-br from-casino-black/95 via-casino-black/90 to-casino-black/95 border border-gold/30 shadow-2xl backdrop-blur-xl rounded-2xl p-0 overflow-hidden">
        {/* Premium Header with Glow Effect */}
        <div className="relative bg-gradient-to-r from-gold/20 via-gold/30 to-gold/20 p-6 border-b border-gold/20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent"></div>
          <div className="relative flex items-center justify-center gap-3">
            <div className="p-2 bg-gold/20 rounded-full border border-gold/40">
              <Settings className="w-5 h-5 text-gold" />
            </div>
            <DialogTitle className="text-xl font-bold text-gold tracking-wide">
              Game Settings
            </DialogTitle>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Helper Mode Section */}
          <div className="relative">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gold/5 to-transparent rounded-xl border border-gold/20 hover:border-gold/40 transition-all duration-300 group">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gold/20 rounded-lg border border-gold/30 group-hover:bg-gold/30 transition-colors duration-300">
                  <Lightbulb className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <Label
                    htmlFor="helper-mode"
                    className="text-gold font-semibold text-base cursor-pointer"
                  >
                    Helper Mode
                  </Label>
                  <p className="text-xs text-gold/60 mt-1">
                    Get contextual hints during gameplay
                  </p>
                </div>
              </div>
              <Switch
                id="helper-mode"
                checked={helperMode}
                onCheckedChange={setHelperMode}
                disabled={isObserver}
                className="data-[state=checked]:bg-gold data-[state=checked]:border-gold"
              />
            </div>
          </div>

          {/* Auto-save Notice */}
          <div className="mt-6 p-3 bg-gold/5 rounded-lg border border-gold/10">
            <p className="text-xs text-gold/50 text-center">
              Settings are automatically saved
            </p>
          </div>
        </div>

        {/* Premium Footer */}
        <div className="border-t border-gold/20 bg-gradient-to-r from-transparent via-gold/5 to-transparent p-4">
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-casino-black font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
