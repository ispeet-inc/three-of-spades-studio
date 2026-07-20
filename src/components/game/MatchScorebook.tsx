/*
 * The Club Table: compact match notation yields to the production table geometry,
 * while the complete paper record opens above the unchanged play surface on demand.
 */
import type {
  BiddingState,
  GameConfig,
  GameProgress,
  PlayerDisplayData,
  SeriesProgress,
} from "@/types/game";
import { GameMode } from "@/types/game";
import { getSuiteSymbol } from "@/utils/suiteUtils";
import { BookOpen, HelpCircle, LogOut, Settings2, X } from "lucide-react";

export type GuidanceMode = "full" | "contextual" | "off";

interface MatchScorebookProps {
  bidding: BiddingState;
  config: GameConfig | null;
  gameMode: GameMode;
  progress: GameProgress;
  series: SeriesProgress;
  players: PlayerDisplayData[];
  guidanceMode: GuidanceMode;
  onGuidanceChange: (mode: GuidanceMode) => void;
  onOpenRules: () => void;
  onOpenSettings: () => void;
  onExit: () => void;
  onCollapse?: () => void;
  compact?: boolean;
}

const guidanceLabels: Record<GuidanceMode, string> = {
  full: "Full guidance",
  contextual: "Context only",
  off: "Hints off",
};

export function MatchScorebook({
  bidding,
  config,
  gameMode,
  progress,
  series,
  players,
  guidanceMode,
  onGuidanceChange,
  onOpenRules,
  onOpenSettings,
  onExit,
  onCollapse,
  compact = false,
}: MatchScorebookProps) {
  const orderedPlayers = [...players].sort(
    (a, b) => (series.seriesScores[b.id.replace("player-", "") as unknown as number] ?? 0) -
      (series.seriesScores[a.id.replace("player-", "") as unknown as number] ?? 0),
  );

  const bidder = config
    ? players.find((player) => Number(player.id.replace("player-", "")) === config.bidWinner)
    : players.find((player) => Number(player.id.replace("player-", "")) === bidding.bidWinner);
  const revealedTeammate = config?.isTeammateRevealed
    ? players.find((player) => player.isTeammate)
    : undefined;
  const gameNumber = Math.max(1, series.currentGame);
  const totalGames = gameMode === GameMode.Series ? series.totalGames : 1;
  const startingPlayer = players.find(
    (player) => Number(player.id.replace("player-", "")) === series.startingPlayerIndex,
  );
  const teammateCard = config
    ? `${config.teammateCard.number === 1 ? "A" : config.teammateCard.number}${getSuiteSymbol(config.teammateCard.suite)}`
    : null;

  if (compact) {
    return (
      <div className="match-hud" role="group" aria-label="Game information and score">
        <button type="button" className="match-hud__game" onClick={onCollapse} aria-label="Open game information">
          <span>
            <b>{gameMode === GameMode.Series ? `Game ${gameNumber} of ${totalGames}` : "Single Game"}</b>
            <small>Trick {Math.min(progress.trick + 1, 10)} of 10</small>
          </span>
          {config ? (
            <span className="match-hud__config">
              <small>Trump: <b>{getSuiteSymbol(config.trumpSuite)}</b></small>
              <small>Teammate: <b>{teammateCard}</b></small>
              <small>Bid: <b>{config.bidAmount}</b></small>
            </span>
          ) : (
            <strong>{bidding.currentBid ? `Bid: ${bidding.currentBid}` : `Starting Player: ${startingPlayer?.name ?? "—"}`}</strong>
          )}
        </button>
        <button type="button" className="match-hud__score" onClick={onCollapse} aria-label={`Open score. ${progress.scores.team1} to ${progress.scores.team2}`}>
          <small>Score</small><strong>{progress.scores.team1}—{progress.scores.team2}</strong>
        </button>
      </div>
    );
  }

  return (
    <aside className="scorebook scorebook--overlay" aria-label="Complete match record">
      <div className="scorebook__brand">
        <img src="/assets/three-of-spades/partner-mark.png" alt="" />
        <span>
          <strong>Three of Spades</strong>
          <small>Game Information</small>
        </span>
        {onCollapse && (
          <button type="button" className="scorebook__collapse" onClick={onCollapse} aria-label="Close match details" autoFocus>
            <X aria-hidden="true" />
          </button>
        )}
      </div>

      <section className="scorebook__folio">
        <span>{gameMode === GameMode.Series ? "SERIES" : "GAME"}</span>
        <strong>{String(gameNumber).padStart(2, "0")} / {String(totalGames).padStart(2, "0")}</strong>
        <small>{gameMode === GameMode.Series ? "Four-game series" : "Single game"}</small>
      </section>

      <section className="scorebook__section" aria-labelledby="contract-heading">
        <div className="section-label">
          <span id="contract-heading">Game Information</span>
          <span>{config ? "SET" : "OPEN"}</span>
        </div>
        {config ? (
          <div className="contract-block">
            <strong className="contract-block__amount">{config.bidAmount}</strong>
            <span className="contract-block__suit" aria-label={`Trump suit ${config.trumpSuite}`}>
              {getSuiteSymbol(config.trumpSuite)}
            </span>
            <dl>
              <div><dt>Bidder</dt><dd>{bidder?.name ?? "—"}</dd></div>
              <div>
                <dt>Teammate</dt>
                <dd>{revealedTeammate?.name ?? `${getSuiteSymbol(config.teammateCard.suite)} ${config.teammateCard.number === 1 ? "A" : config.teammateCard.number}`}</dd>
              </div>
              <div><dt>Status</dt><dd>{config.isTeammateRevealed ? "Revealed" : "Hidden"}</dd></div>
            </dl>
          </div>
        ) : (
          <div className="open-contract">
            <strong>{bidding.currentBid || "—"}</strong>
            <span>Current bid</span>
            <small>{bidder ? `${bidder.name} leads` : "Auction in progress"}</small>
          </div>
        )}
      </section>

      <section className="scorebook__section" aria-labelledby="score-heading">
        <div className="section-label">
          <span id="score-heading">Series Leaderboard</span>
          <span>PTS</span>
        </div>
        <ol className="score-register">
          {orderedPlayers.map((player, index) => {
            const playerIndex = Number(player.id.replace("player-", ""));
            return (
              <li key={player.id} className={playerIndex === 3 ? "is-you" : ""}>
                <span className="score-register__rank">{index + 1}</span>
                <span className="score-register__name">
                  <strong>{player.name}</strong>
                  <small>{player.isBidWinner ? "Bidder" : player.isTeammate ? "Teammate" : player.isCurrentPlayer ? "Current Turn" : "Player"}</small>
                </span>
                <b>{series.seriesScores[playerIndex] ?? 0}</b>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="scorebook__section scorebook__progress" aria-labelledby="tricks-heading">
        <div className="section-label">
          <span id="tricks-heading">Tricks</span>
          <span>{Math.min(progress.trick + 1, 10)} / 10</span>
        </div>
        <div className="trick-register" aria-label={`${progress.trick} tricks complete`}>
          {Array.from({ length: 10 }, (_, index) => (
            <span key={index} className={index < progress.trick ? "is-complete" : index === progress.trick ? "is-current" : ""}>
              {index + 1}
            </span>
          ))}
        </div>
        <div className="team-tally">
          <span><small>Contract team</small><strong>{progress.scores.team1}</strong></span>
          <span><small>Defenders</small><strong>{progress.scores.team2}</strong></span>
        </div>
      </section>

      <section className="scorebook__section scorebook__help" aria-labelledby="help-heading">
        <div className="section-label">
          <span id="help-heading">Table guidance</span>
          <HelpCircle aria-hidden="true" />
        </div>
        <div className="segmented-control" role="group" aria-label="Guidance level">
          {(["full", "contextual", "off"] as GuidanceMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              className={guidanceMode === mode ? "is-active" : ""}
              aria-pressed={guidanceMode === mode}
              onClick={() => onGuidanceChange(mode)}
            >
              {guidanceLabels[mode]}
            </button>
          ))}
        </div>
      </section>

      <nav className="scorebook__actions" aria-label="Match actions">
        <button type="button" onClick={onOpenRules}><BookOpen aria-hidden="true" /> How to Play</button>
        <button type="button" onClick={onOpenSettings}><Settings2 aria-hidden="true" /> Settings</button>
        <button type="button" onClick={onExit}><LogOut aria-hidden="true" /> Main Menu</button>
      </nav>
    </aside>
  );
}
