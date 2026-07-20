/*
 * The Club Table: the production cardinal geometry is the source of truth.
 * Premium materials and semantic motion refine the table without moving its anchors.
 */
import { cn } from "@/lib/utils";
import { GameStages, type GameStage } from "@/store/gameStages";
import type {
  BiddingState,
  Card,
  GameConfig,
  GameProgress,
  PlayerDisplayData,
  PlayerState,
  TableState,
} from "@/types/game";
import { Suite } from "@/types/game";
import {
  MAX_BID,
  MIN_INCREMENT_ABOVE_200,
  MIN_INCREMENT_BELOW_200,
} from "@/utils/constants";
import { getPlayerPosition, getPlayerPositions, type PlayerPosition } from "@/utils/positionUtils";
import { getSuiteName, getSuiteSymbol } from "@/utils/suiteUtils";
import { Bot, Check, Eye, RotateCw, TimerReset } from "lucide-react";
import { useMemo, useState, type CSSProperties } from "react";
import type { GuidanceMode } from "./MatchScorebook";
import { PlayingCard } from "./PlayingCard";

interface MatchTableProps {
  stage: GameStage;
  bidding: BiddingState;
  config: GameConfig | null;
  progress: GameProgress;
  table: TableState;
  playerState: PlayerState;
  players: PlayerDisplayData[];
  viewerIndex: number;
  isObserver: boolean;
  isDealing: boolean;
  guidanceMode: GuidanceMode;
  onBid: (amount: number) => void;
  onPass: () => void;
  onPlayCard: (card: Card) => void;
}

const isLegalCard = (hand: Card[], card: Card, runningSuite: Suite | null) => {
  if (runningSuite === null) return true;
  const mustFollow = hand.some((candidate) => candidate.suite === runningSuite);
  return !mustFollow || card.suite === runningSuite;
};

function Seat({
  player,
  position,
  active,
  passed,
  viewer,
  observer,
  dealing,
}: {
  player: PlayerDisplayData;
  position: PlayerPosition;
  active: boolean;
  passed: boolean;
  viewer: boolean;
  observer: boolean;
  dealing: boolean;
}) {
  const faceUp = viewer && observer;
  const visibleBacks = Math.min(player.hand.length, position === "top" ? 10 : 8);

  return (
    <section
      className={cn("player-seat", `player-seat--${position}`, active && "is-active", passed && "is-passed")}
      aria-label={`${player.name}, ${position} seat, ${player.hand.length} cards`}
    >
      <div
        className={cn("opponent-stack", `opponent-stack--${position}`, dealing && "is-dealing")}
        aria-label={`${player.hand.length} cards remaining`}
      >
        {faceUp
          ? player.hand.slice(0, visibleBacks).map((card, index) => (
              <PlayingCard
                key={card.hash}
                card={card}
                size="mini"
                className="opponent-card"
                style={{ "--card-index": index } as CSSProperties}
              />
            ))
          : Array.from({ length: visibleBacks }, (_, index) => (
              <PlayingCard
                key={index}
                faceDown
                size="mini"
                className="opponent-card"
                style={{ "--card-index": index } as CSSProperties}
              />
            ))}
      </div>

      <div className="player-seat__name">
        <span className="presence-dot" aria-hidden="true" />
        <strong>{player.name}</strong>
        <small>
          {observer && viewer ? (
              <><Eye aria-hidden="true" /> Observer View</>
          ) : (
              <><Bot aria-hidden="true" /> {passed ? "Passed" : active ? "Current Turn" : "Ready"}</>
          )}
        </small>
        <span className="player-seat__count">{String(player.hand.length).padStart(2, "0")}</span>
      </div>

      {player.isBidWinner && <span className="seat-stamp">BID WINNER</span>}
      {player.isFirstPersonTeammate && <span className="seat-stamp seat-stamp--partner">TEAMMATE</span>}
    </section>
  );
}

function Auction({ bidding, players, viewerIndex }: { bidding: BiddingState; players: PlayerDisplayData[]; viewerIndex: number }) {
  return (
    <section className="auction" aria-labelledby="auction-title">
      <div className="auction__dial">
        <header>
          <span className="folio">BIDDING</span>
          <h2 id="auction-title">{bidding.currentBid || "—"}</h2>
          <p>{bidding.currentBid ? "Current Bid" : "No bids yet"}</p>
        </header>
        <div className="auction__timer" aria-label={`${bidding.bidTimer} seconds remaining`}>
          <TimerReset aria-hidden="true" />
          <progress max={30} value={bidding.bidTimer} />
          <span>{String(bidding.bidTimer).padStart(2, "0")}</span>
        </div>
      </div>

      <ol className="auction__record" aria-label="Auction record">
        {players.map((player) => {
          const index = Number(player.id.replace("player-", ""));
          const position = getPlayerPosition(index, viewerIndex).position;
          const bid = bidding.bidHistory[index];
          const passed = bidding.passedPlayers.includes(index);
          const active = bidding.currentBidder === index && bidding.bidWinner === null;
          return (
            <li
              key={player.id}
              className={cn(`auction__record--${position}`, active && "is-active", index === viewerIndex && "is-you")}
            >
              <span>{index === viewerIndex ? "YOU" : player.name}</span>
              <b>{passed ? "PASS" : bid ?? "—"}</b>
              {active && <i>NOW</i>}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function BidControls({
  bidding,
  canBid,
  onBid,
  onPass,
}: {
  bidding: BiddingState;
  canBid: boolean;
  onBid: (amount: number) => void;
  onPass: () => void;
}) {
  const increment = bidding.currentBid < 200 ? MIN_INCREMENT_BELOW_200 : MIN_INCREMENT_ABOVE_200;
  const quickBid = bidding.currentBid + increment;
  const [showCustomBid, setShowCustomBid] = useState(false);
  const [customBidAmount, setCustomBidAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const closeCustomBid = () => {
    setShowCustomBid(false);
    setCustomBidAmount("");
    setError(null);
  };

  const commitCustomBid = () => {
    const amount = Number.parseInt(customBidAmount, 10);
    const valid =
      Number.isFinite(amount) &&
      amount > bidding.currentBid &&
      amount <= MAX_BID &&
      (amount <= 200 ? amount % MIN_INCREMENT_BELOW_200 === 0 : amount % MIN_INCREMENT_ABOVE_200 === 0);

    if (!valid) {
      setError("Please enter a valid bid amount that follows the increment rules.");
      return;
    }

    onBid(amount);
    closeCustomBid();
  };

  return (
    <div className={cn("bid-controls", !canBid && "is-waiting")} aria-label="Bidding controls">
      <div className="bid-controls__buttons">
        <button
          type="button"
          className="bid-controls__quick"
          disabled={!canBid || quickBid > MAX_BID}
          onClick={() => onBid(quickBid)}
        >
          +{increment}
        </button>
        <button
          type="button"
          className="bid-controls__custom"
          disabled={!canBid}
          aria-label="Custom Bid"
          onClick={() => {
            setShowCustomBid(true);
            setCustomBidAmount(String(quickBid));
            setError(null);
          }}
        >
          ?
        </button>
        <button type="button" className="bid-controls__pass" disabled={!canBid} onClick={onPass}>Pass</button>
      </div>

      {showCustomBid && (
        <div
          className="custom-bid-popover"
          role="dialog"
          aria-modal="false"
          aria-labelledby="custom-bid-title"
          onKeyDown={(event) => {
            if (event.key === "Enter") commitCustomBid();
            if (event.key === "Escape") closeCustomBid();
          }}
        >
          <header>
            <h3 id="custom-bid-title">Custom Bid</h3>
            <p>Enter your bid amount</p>
          </header>
          <input
            type="number"
            value={customBidAmount}
            onChange={(event) => {
              setCustomBidAmount(event.target.value);
              setError(null);
            }}
            min={quickBid}
            max={MAX_BID}
            step={increment}
            aria-describedby={error ? "custom-bid-error" : undefined}
            autoFocus
          />
          {error && (
            <p id="custom-bid-error" className="custom-bid-popover__error" role="alert">
              <strong>Invalid Bid</strong>
              <span>{error}</span>
            </p>
          )}
          <div className="custom-bid-popover__actions">
            <button type="button" onClick={closeCustomBid}>Cancel</button>
            <button type="button" className="is-primary" onClick={commitCustomBid} disabled={!customBidAmount}>Bid</button>
          </div>
        </div>
      )}
    </div>
  );
}

function TrickCenter({
  table,
  config,
  viewerIndex,
  players,
  collecting,
}: {
  table: TableState;
  config: GameConfig | null;
  viewerIndex: number;
  players: PlayerDisplayData[];
  collecting: boolean;
}) {
  const winnerName = table.trickWinner
    ? players.find((player) => Number(player.id.replace("player-", "")) === table.trickWinner?.player)?.name
    : null;
  const winnerPosition = table.trickWinner
    ? getPlayerPosition(table.trickWinner.player, viewerIndex).position
    : null;

  return (
    <section
      className={cn("trick-center", collecting && winnerPosition && "is-collecting", winnerPosition && `collect-to-${winnerPosition}`)}
      aria-label="Current trick"
    >
      <div className="trick-center__mark" aria-hidden="true">
        <img src="/assets/three-of-spades/partner-mark.png" alt="" />
      </div>
      {config && (
        <div className="trick-center__contract" aria-label={`${config.bidAmount}, ${getSuiteName(config.trumpSuite)} trump`}>
          <span>{config.bidAmount}</span>
          <strong>{getSuiteSymbol(config.trumpSuite)}</strong>
        </div>
      )}
      {table.tableCards.map((card, trickIndex) => {
        const position = getPlayerPosition(card.player, viewerIndex).position;
        return (
          <PlayingCard
            key={`${card.player}-${card.hash}`}
            card={card}
            size="table"
            className={cn("trick-card", `trick-card--${position}`, table.trickWinner?.hash === card.hash && "is-winning")}
            style={{ "--trick-index": trickIndex } as CSSProperties}
          />
        );
      })}
      {table.tableCards.length === 0 && (
        <p className="trick-center__empty">
          <span>{table.runningSuite === null ? "Opening lead" : `${getSuiteSymbol(table.runningSuite)} ${getSuiteName(table.runningSuite)} led`}</span>
          <small>The first card sets the suit for this trick.</small>
        </p>
      )}
      {winnerName && <div className="trick-winner"><Check aria-hidden="true" /> {winnerName} takes the trick</div>}
    </section>
  );
}

export function MatchTable({
  stage,
  bidding,
  config,
  progress,
  table,
  playerState,
  players,
  viewerIndex,
  isObserver,
  isDealing,
  guidanceMode,
  onBid,
  onPass,
  onPlayCard,
}: MatchTableProps) {
  const [invalidHint, setInvalidHint] = useState<string | null>(null);
  const positions = getPlayerPositions(viewerIndex);
  const human = playerState.players[viewerIndex];
  const humanTurn = stage === GameStages.PLAYING && table.turn === viewerIndex && !isObserver;
  const canBid = stage === GameStages.BIDDING && bidding.currentBidder === viewerIndex && !bidding.passedPlayers.includes(viewerIndex) && !isObserver;
  const collecting = stage === GameStages.TRICK_COMPLETE && Boolean(table.trickWinner);

  const guidance = useMemo(() => {
    if (invalidHint) return { title: "Follow the lead suit", copy: invalidHint, tone: "error" };
    if (guidanceMode === "off") {
      if (humanTurn) return { title: "Your turn", copy: "Choose a card.", tone: "quiet" };
      if (canBid) return { title: "Your bid", copy: "Raise or pass.", tone: "quiet" };
      return null;
    }
    if (stage === GameStages.BIDDING) {
      return canBid
        ? { title: "Bid or Pass", copy: "Highest bidder selects trump and teammate.", tone: "normal" }
        : guidanceMode === "full"
          ? { title: `${players.find((player) => Number(player.id.replace("player-", "")) === bidding.currentBidder)?.name ?? "The table"} is bidding`, copy: "Passing ends their bidding for this game.", tone: "quiet" }
          : null;
    }
    if (stage === GameStages.PLAYING && humanTurn) {
      const mustFollow = table.runningSuite !== null && human.hand.some((card) => card.suite === table.runningSuite);
      return mustFollow
        ? { title: `Follow ${getSuiteName(table.runningSuite as Suite)}`, copy: "You must follow the leading suit. Legal cards are lifted.", tone: "normal" }
        : { title: table.runningSuite === null ? "Lead a card" : "Play a card", copy: table.runningSuite === null ? "Your card sets the leading suit." : "You cannot follow suit. Any card is legal.", tone: "normal" };
    }
    if (stage === GameStages.PLAYING && guidanceMode === "full") {
      const current = players.find((player) => Number(player.id.replace("player-", "")) === table.turn);
      return { title: `${current?.name ?? "The next player"}'s turn`, copy: "Waiting for card.", tone: "quiet" };
    }
    return null;
  }, [invalidHint, guidanceMode, stage, humanTurn, canBid, table.runningSuite, table.turn, human.hand, players, bidding.currentBidder]);

  const chooseCard = (card: Card) => {
    if (!humanTurn) return;
    if (!isLegalCard(human.hand, card, table.runningSuite)) {
      const suit = table.runningSuite as Suite;
      setInvalidHint(`You must follow ${getSuiteName(suit)}. Choose a highlighted ${getSuiteSymbol(suit)} card.`);
      return;
    }
    setInvalidHint(null);
    onPlayCard(card);
  };

  return (
    <div className="game-table">
      <div className="game-table__texture" aria-hidden="true" />
      <div className="game-table__inlay" aria-hidden="true" />

      <div className="orientation-note" role="note">
        <RotateCw aria-hidden="true" />
        <span><strong>Turn your phone sideways</strong><small>The full table is composed for landscape play.</small></span>
      </div>

      {positions.filter(({ position }) => position !== "bottom").map(({ playerIndex, position }) => {
        const player = players.find((candidate) => Number(candidate.id.replace("player-", "")) === playerIndex);
        if (!player) return null;
        return (
          <Seat
            key={player.id}
            player={player}
            position={position}
            active={player.isCurrentPlayer}
            passed={bidding.passedPlayers.includes(playerIndex)}
            viewer={playerIndex === viewerIndex}
            observer={isObserver}
            dealing={isDealing}
          />
        );
      })}

      <div className={cn(
        "game-table__center",
        stage === GameStages.BIDDING ? "is-auction" : "is-play",
        table.tableCards.length > 0 && "has-cards",
        collecting && "is-collecting",
      )}>
        {stage === GameStages.BIDDING ? (
          <Auction bidding={bidding} players={players} viewerIndex={viewerIndex} />
        ) : (
          <TrickCenter
            table={table}
            config={config}
            viewerIndex={viewerIndex}
            players={players}
            collecting={collecting}
          />
        )}
      </div>

      {stage === GameStages.BIDDING && (
        <BidControls bidding={bidding} canBid={canBid} onBid={onBid} onPass={onPass} />
      )}

      {guidance && (
        <section className={cn("guidance-line", guidance.tone === "error" && "is-error")} aria-live="polite">
          <strong>{guidance.title}</strong><span>{guidance.copy}</span>
        </section>
      )}

      <section className={cn("player-hand", humanTurn && "is-active", isDealing && "is-dealing")} aria-label={`${players.find((player) => Number(player.id.replace("player-", "")) === viewerIndex)?.name ?? "Your"} hand`}>
        <div className="player-hand__label">
          <span className="presence-dot" aria-hidden="true" />
          <strong>{players.find((player) => Number(player.id.replace("player-", "")) === viewerIndex)?.name ?? "You"}</strong>
          <small>{isObserver ? "Observed hand" : humanTurn ? "Your turn" : `${human.hand.length} cards`}</small>
        </div>
        <div className="player-hand__cards">
          {human.hand.map((card, index) => {
            const legal = isLegalCard(human.hand, card, table.runningSuite);
            return (
              <PlayingCard
                key={card.hash}
                card={card}
                size="hand"
                playable={humanTurn && legal}
                disabled={!humanTurn || isObserver}
                onSelect={chooseCard}
                className={cn(index > 0 && "player-hand__overlap", humanTurn && !legal && "is-rule-blocked")}
                style={{ "--hand-index": index, "--hand-count": human.hand.length } as CSSProperties}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
