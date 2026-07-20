/*
 * The Club Table: results read like signed match sheets. Individual games are composed
 * and restrained; a series victory earns the only full-surface ceremonial moment.
 */
import type { PlayerDisplayData, SeriesProgress } from "@/types/game";
import { ArrowRight, Award, RotateCcw, X } from "lucide-react";

const playerIndex = (player: PlayerDisplayData) => Number(player.id.replace("player-", ""));

interface GameResultSheetProps {
  series: SeriesProgress;
  players: PlayerDisplayData[];
  viewerIndex: number;
  isSeries: boolean;
  nextStarterName?: string;
  onContinue: () => void;
  onLeave: () => void;
}

export function GameResultSheet({
  series,
  players,
  viewerIndex,
  isSeries,
  nextStarterName,
  onContinue,
  onLeave,
}: GameResultSheetProps) {
  const scores = series.gameScores[series.currentGame] ?? {};
  const viewerWon = (scores[viewerIndex] ?? 0) > 0;
  const gameNumber = Math.max(series.currentGame, 1);
  const resultFolio = isSeries ? `GAME ${String(gameNumber).padStart(2, "0")} / RESULT` : "SINGLE GAME / RESULT";
  const resultTitle = isSeries ? `Game ${gameNumber} ${viewerWon ? "won!" : "lost!"}` : `Game ${viewerWon ? "won!" : "lost!"}`;
  const resultDescription = viewerWon
    ? isSeries
      ? "Your team won this game and added to the series score."
      : "Your team won this game."
    : isSeries
      ? "The opposing team won this game. The series remains open."
      : "The opposing team won this game.";
  const pointsDescription = viewerWon
    ? isSeries
      ? "points to your series total"
      : "points won this game"
    : isSeries
      ? "no series points awarded"
      : "no game points awarded";
  const ranked = [...players].sort(
    (a, b) => (series.seriesScores[playerIndex(b)] ?? 0) - (series.seriesScores[playerIndex(a)] ?? 0),
  );

  return (
    <div className="result-overlay" role="dialog" aria-modal="true" aria-labelledby="game-result-title">
      <article className="game-result-sheet">
        <button type="button" className="sheet-close" onClick={onLeave} aria-label="Leave result"><X aria-hidden="true" /></button>
        <header>
          <span className="folio">{resultFolio}</span>
          <h2 id="game-result-title">{resultTitle}</h2>
          <p>{resultDescription}</p>
        </header>

        <div className="result-ruling">
          <span>THIS GAME</span>
          <strong>{viewerWon ? `+${scores[viewerIndex] ?? 0}` : "—"}</strong>
          <small>{pointsDescription}</small>
        </div>

        <section className="result-register" aria-labelledby="standings-heading">
          <div className="section-label"><span id="standings-heading">{isSeries ? "Series Leaderboard" : "Game Result"}</span><span>TOTAL</span></div>
          <ol>
            {ranked.map((player, index) => {
              const id = playerIndex(player);
              const gameScore = scores[id] ?? 0;
              return (
                <li key={player.id} className={id === viewerIndex ? "is-you" : ""}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{player.name}<small>{gameScore > 0 ? "Winner" : player.isBidWinner ? "Bidder" : player.isTeammate ? "Teammate" : "Defender"}</small></strong>
                  <em>{gameScore > 0 ? `+${gameScore}` : "—"}</em>
                  <b>{isSeries ? series.seriesScores[id] ?? 0 : gameScore}</b>
                </li>
              );
            })}
          </ol>
        </section>

        <footer>
          {isSeries && nextStarterName && (
            <p><span className="folio">NEXT GAME STARTING SOON</span><strong>{nextStarterName}</strong> starts next round.</p>
          )}
          <button type="button" className="primary-action primary-action--ink" onClick={onContinue}>
            {isSeries ? "Next Game" : "Main Menu"}<ArrowRight aria-hidden="true" />
          </button>
        </footer>
      </article>
    </div>
  );
}

interface SeriesVictorySheetProps {
  series: SeriesProgress;
  players: PlayerDisplayData[];
  viewerIndex: number;
  onPlayAgain: () => void;
  onLeave: () => void;
}

export function SeriesVictorySheet({ series, players, viewerIndex, onPlayAgain, onLeave }: SeriesVictorySheetProps) {
  const winnerIndex = series.seriesWinner ?? 0;
  const winner = players.find((player) => playerIndex(player) === winnerIndex);
  const viewerWon = winnerIndex === viewerIndex;
  const ranked = [...players].sort(
    (a, b) => (series.seriesScores[playerIndex(b)] ?? 0) - (series.seriesScores[playerIndex(a)] ?? 0),
  );

  return (
    <div className="series-victory" role="dialog" aria-modal="true" aria-labelledby="series-title">
      <div className="series-victory__grain" aria-hidden="true" />
      <header className="series-victory__brand">
        <img src="/assets/three-of-spades/partner-mark.png" alt="" />
        <span>THREE OF SPADES / MATCH COMPLETE</span>
      </header>
      <main>
        <div className="victory-seal" aria-hidden="true"><Award /></div>
        <span className="folio">FOUR-GAME SERIES / FINAL</span>
        <h2 id="series-title">{viewerWon ? "Series Won!" : "Series Complete!"}</h2>
        <p>{viewerWon ? "You finished with the highest score across four games." : `${winner?.name ?? "The winner"} finished with the highest series score.`}</p>

        <h3 className="series-victory__standing-title">Final Standings</h3>
        <ol className="final-standing" aria-label="Final series standings">
          {ranked.map((player, index) => {
            const id = playerIndex(player);
            return (
              <li key={player.id} className={id === winnerIndex ? "is-winner" : ""}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{player.name}{id === viewerIndex && <small>YOU</small>}</strong>
                <b>{series.seriesScores[id] ?? 0}</b>
              </li>
            );
          })}
        </ol>

        <p className="series-victory__restart"><strong>Ready for Another Series?</strong></p>
        <div className="series-victory__actions">
          <button type="button" className="primary-action primary-action--ivory" onClick={onPlayAgain}><RotateCcw aria-hidden="true" /> Play Again</button>
          <button type="button" className="quiet-light-action" onClick={onLeave}>Main Menu <ArrowRight aria-hidden="true" /></button>
        </div>
      </main>
      <footer>Recorded locally · {new Date().toLocaleDateString(undefined, { day: "2-digit", month: "long", year: "numeric" })}</footer>
    </div>
  );
}
