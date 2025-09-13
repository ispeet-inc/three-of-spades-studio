import { loadStats } from "@/lib/statsEngine";
import { PlayerStats } from "@/types/stats";
import { BarChart3 } from "lucide-react";
import React, { useState } from "react";
import { Button } from "./button";
import { StatsModal } from "./StatsModal";

interface StatsButtonProps {
  className?: string;
}

export const StatsButton: React.FC<StatsButtonProps> = ({ className = "" }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats] = useState<PlayerStats>(() => loadStats());

  return (
    <>
      {/* Floating Stats Button */}
      <div className={`fixed top-6 right-6 z-50 ${className}`}>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="group relative bg-gradient-gold text-casino-black font-bold text-lg px-6 py-4 rounded-2xl shadow-elevated hover:shadow-glow transition-all duration-300 hover:scale-105 animate-stats-float"
          size="lg"
        >
          <BarChart3 className="w-6 h-6 mr-2 group-hover:rotate-12 transition-transform duration-300" />
          <span className="hidden sm:inline">Stats</span>

          {/* Floating particles effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gold-light/20 to-gold/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />

          {/* Glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gold/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10" />
        </Button>
      </div>

      {/* Stats Modal */}
      <StatsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        stats={stats}
      />
    </>
  );
};
