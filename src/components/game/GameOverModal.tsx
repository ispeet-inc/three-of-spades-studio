import { useAppSelector } from "@/hooks";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const GameOverModal = () => {
  const { scores, teams, teamColors, playerNames } = useAppSelector(state => state.game);

  const winningTeam = scores[0] > scores[1] ? 0 : 1;
  const winningPlayers = teams[winningTeam] || [];

  const handleNewGame = () => {
    window.location.reload();
  };

  return (
    <Dialog open={true}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Game Over!</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 text-center">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-primary">
              🎉 Team {winningTeam + 1} Wins! 🎉
            </h3>
            
            <div className="space-y-1">
              {winningPlayers.map(playerId => (
                <div 
                  key={playerId}
                  className="px-3 py-1 rounded text-sm font-medium"
                  style={{ backgroundColor: teamColors[winningTeam] }}
                >
                  {playerNames[playerId]}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold" style={{ color: teamColors[0] }}>
                Team 1
              </div>
              <div className="text-2xl font-bold">{scores[0]}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold" style={{ color: teamColors[1] }}>
                Team 2
              </div>
              <div className="text-2xl font-bold">{scores[1]}</div>
            </div>
          </div>

          <Button onClick={handleNewGame} className="w-full">
            Play Again
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};