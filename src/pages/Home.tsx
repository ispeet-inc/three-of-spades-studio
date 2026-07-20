/*
 * The Club Table: one coherent application shell preserves the production table geometry,
 * with compact match status, on-demand records, progressive guidance, and ceremonial results.
 */
import { ContractSetup } from "@/components/game/ContractSetup";
import { MatchScorebook, type GuidanceMode } from "@/components/game/MatchScorebook";
import { MatchTable } from "@/components/game/MatchTable";
import { RulesBook, SettingsSheet, StatsLedger } from "@/components/game/ReferenceSheets";
import { GameResultSheet, SeriesVictorySheet } from "@/components/game/ResultSheets";
import { StartTable } from "@/components/game/StartTable";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useStats } from "@/hooks/useStats";
import {
  botShouldBid,
  botShouldPlayCard,
  botShouldSelectTrump,
  clearGameError,
  gameStageTransition,
  passBid,
  placeBid,
  playCard,
  playerSetup,
  resetStateForNewSeries,
  restoreGameState,
  setBidAndTrump,
  setGameMode,
  setPlayerName,
  startGame,
} from "@/store/gameSlice";
import { GameStages } from "@/store/gameStages";
import { selectIsDealing, selectPlayerDisplayData } from "@/store/selectors";
import type { Card } from "@/types/game";
import { GameMode, Suite } from "@/types/game";
import { FIRST_PLAYER_ID, NUM_PLAYERS } from "@/utils/constants";
import { rotateStartingPlayer } from "@/utils/gameUtils";
import { getSuiteName, getSuiteSymbol } from "@/utils/suiteUtils";
import { AlertTriangle, ArrowRight, Eye, LoaderCircle, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "threeOfSpadesGameState";
type OpenSheet = "rules" | "stats" | "settings" | null;

const readSavedMatch = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.gameProgress?.stage && parsed.gameProgress.stage !== GameStages.INIT ? parsed : null;
  } catch {
    return null;
  }
};

export default function Home() {
  const dispatch = useAppDispatch();
  const game = useAppSelector((state) => state.game);
  const players = useAppSelector(selectPlayerDisplayData);
  const isDealing = useAppSelector(selectIsDealing);
  const { stats, refreshStats, clearAllStats } = useStats();

  const query = useMemo(() => new URLSearchParams(window.location.search), []);
  const isObserver = query.get("observer") === "true";
  const requestedViewer = Number(query.get("viewer") ?? FIRST_PLAYER_ID);
  const viewerIndex = Number.isInteger(requestedViewer) && requestedViewer >= 0 && requestedViewer < NUM_PLAYERS
    ? requestedViewer
    : FIRST_PLAYER_ID;

  const [openSheet, setOpenSheet] = useState<OpenSheet>(null);
  const [scorebookOpen, setScorebookOpen] = useState(false);
  const [exitPrompt, setExitPrompt] = useState(false);
  const [hasSavedMatch, setHasSavedMatch] = useState(() => Boolean(readSavedMatch()));
  const [partnerReveal, setPartnerReveal] = useState<string | null>(null);
  const previousReveal = useRef(false);
  const [guidanceMode, setGuidanceMode] = useState<GuidanceMode>(() => {
    const saved = localStorage.getItem("threeOfSpades_guidance");
    return saved === "contextual" || saved === "off" ? saved : "full";
  });
  const [reduceMotion, setReduceMotion] = useState(() => localStorage.getItem("threeOfSpades_reduceMotion") === "true");

  useEffect(() => {
    if (!scorebookOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setScorebookOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [scorebookOpen]);

  const openStats = useCallback(() => {
    refreshStats();
    setOpenSheet("stats");
  }, [refreshStats]);

  const changeGuidance = (mode: GuidanceMode) => {
    setGuidanceMode(mode);
    localStorage.setItem("threeOfSpades_guidance", mode);
    localStorage.setItem("threeOfSpades_guidanceExplicit", "true");
  };

  useEffect(() => {
    const playerChoseMode = localStorage.getItem("threeOfSpades_guidanceExplicit") === "true";
    if (playerChoseMode) return;
    setGuidanceMode(stats.game.totalGames >= 3 ? "contextual" : "full");
  }, [stats.game.totalGames]);

  const changeMotion = (value: boolean) => {
    setReduceMotion(value);
    localStorage.setItem("threeOfSpades_reduceMotion", String(value));
  };

  useEffect(() => {
    if (game.gameProgress.stage === GameStages.INIT || isObserver) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
    setHasSavedMatch(true);
  }, [game, isObserver]);

  useEffect(() => {
    if (!isObserver) return;
    const saved = readSavedMatch();
    if (saved) dispatch(restoreGameState(saved));
    const sync = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try { dispatch(restoreGameState(JSON.parse(event.newValue))); } catch { /* ignore malformed external state */ }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [dispatch, isObserver]);

  useEffect(() => {
    if (game.gameProgress.stage === GameStages.PLAYING && game.tableState.turn !== FIRST_PLAYER_ID && !isObserver) {
      dispatch(botShouldPlayCard({ playerIndex: game.tableState.turn }));
    }
  }, [dispatch, game.gameProgress.stage, game.tableState.turn, isObserver]);

  useEffect(() => {
    if (
      game.gameProgress.stage === GameStages.BIDDING &&
      game.biddingState.currentBidder !== FIRST_PLAYER_ID &&
      game.biddingState.passedPlayers.length < 3 &&
      game.biddingState.bidWinner === null &&
      !isObserver
    ) {
      dispatch(botShouldBid({ playerIndex: game.biddingState.currentBidder }));
    }
  }, [dispatch, game.gameProgress.stage, game.biddingState.currentBidder, game.biddingState.passedPlayers.length, game.biddingState.bidWinner, isObserver]);

  useEffect(() => {
    if (
      game.gameProgress.stage === GameStages.TRUMP_SELECTION &&
      game.biddingState.bidWinner !== FIRST_PLAYER_ID &&
      game.biddingState.bidWinner !== null &&
      !isObserver
    ) {
      dispatch(botShouldSelectTrump({ playerIndex: game.biddingState.bidWinner }));
    }
  }, [dispatch, game.gameProgress.stage, game.biddingState.bidWinner, isObserver]);

  const revealedTeammateName = players.find((player) => player.isTeammate)?.name;

  useEffect(() => {
    const revealed = Boolean(game.gameConfig?.isTeammateRevealed);
    if (revealed && !previousReveal.current) {
      setPartnerReveal(revealedTeammateName ?? "The hidden teammate");
      const timer = window.setTimeout(() => setPartnerReveal(null), reduceMotion ? 900 : 1900);
      previousReveal.current = true;
      return () => window.clearTimeout(timer);
    }
    previousReveal.current = revealed;
  }, [game.gameConfig?.isTeammateRevealed, revealedTeammateName, reduceMotion]);

  useEffect(() => {
    if (
      game.gameProgress.stage === GameStages.GAME_OVER ||
      game.gameProgress.stage === GameStages.GAME_SUMMARY ||
      game.gameProgress.stage === GameStages.SERIES_SUMMARY
    ) {
      setPartnerReveal(null);
    }
  }, [game.gameProgress.stage]);

  const startMatch = (name: string, mode: GameMode) => {
    dispatch(setGameMode(mode));
    dispatch(setPlayerName({ playerIndex: FIRST_PLAYER_ID, name }));
    dispatch(playerSetup());
    dispatch(startGame({ startingPlayer: Math.floor(Math.random() * NUM_PLAYERS) }));
  };

  const resumeMatch = () => {
    const saved = readSavedMatch();
    if (saved) dispatch(restoreGameState(saved));
  };

  const leaveMatch = () => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch(resetStateForNewSeries());
    setExitPrompt(false);
    setHasSavedMatch(false);
  };

  const playCardFromHand = (card: Card) => {
    if (isObserver) return;
    const hand = game.playerState.players[FIRST_PLAYER_ID].hand;
    const cardIndex = hand.findIndex((candidate) => candidate.hash === card.hash);
    if (cardIndex >= 0) dispatch(playCard({ playerIndex: FIRST_PLAYER_ID, cardIndex }));
  };

  const setContract = (trumpSuite: Suite, teammateCard: Card) => {
    if (game.biddingState.bidWinner === null) return;
    dispatch(setBidAndTrump({ trumpSuite, teammateCard, bidder: game.biddingState.bidWinner }));
  };

  const nextGame = () => {
    const next = rotateStartingPlayer(game.seriesProgress.startingPlayerIndex, NUM_PLAYERS);
    dispatch(startGame({ startingPlayer: next }));
  };

  const newSeries = () => {
    const name = game.playerState.playerNames[FIRST_PLAYER_ID] || "You";
    dispatch(resetStateForNewSeries());
    startMatch(name, GameMode.Series);
  };

  const nextStarter = rotateStartingPlayer(game.seriesProgress.startingPlayerIndex, NUM_PLAYERS);
  const nextStarterName = game.playerState.playerNames[nextStarter] || `Player ${nextStarter + 1}`;

  if (game.gameProgress.stage === GameStages.INIT) {
    if (isObserver) {
      return (
        <main className="observer-empty">
          <img src="/assets/three-of-spades/partner-mark.png" alt="" />
          <span className="folio"><Eye aria-hidden="true" /> OBSERVER TABLE</span>
          <h1>No active match found.</h1>
          <p>Start a game in another tab. This view will follow the saved table without exposing player controls.</p>
          <a href="/">Return to player mode <ArrowRight aria-hidden="true" /></a>
        </main>
      );
    }

    return (
      <div className={reduceMotion ? "reduce-motion" : ""}>
        <StartTable
          hasSavedMatch={hasSavedMatch}
          onResume={resumeMatch}
          onStartGame={startMatch}
          onOpenRules={() => setOpenSheet("rules")}
          onOpenStats={openStats}
          onOpenSettings={() => setOpenSheet("settings")}
        />
        {openSheet === "rules" && <RulesBook onClose={() => setOpenSheet(null)} />}
        {openSheet === "stats" && <StatsLedger stats={stats} onReset={clearAllStats} onClose={() => setOpenSheet(null)} />}
        {openSheet === "settings" && (
          <SettingsSheet
            guidanceMode={guidanceMode}
            reduceMotion={reduceMotion}
            onGuidanceChange={changeGuidance}
            onReduceMotionChange={changeMotion}
            onClose={() => setOpenSheet(null)}
          />
        )}
      </div>
    );
  }

  const scorebookProps = {
    bidding: game.biddingState,
    config: game.gameConfig,
    gameMode: game.gameMode,
    progress: game.gameProgress,
    series: game.seriesProgress,
    players,
    guidanceMode,
    onGuidanceChange: changeGuidance,
    onOpenRules: () => {
      setScorebookOpen(false);
      setOpenSheet("rules" as const);
    },
    onOpenSettings: () => {
      setScorebookOpen(false);
      setOpenSheet("settings" as const);
    },
    onExit: () => {
      setScorebookOpen(false);
      setExitPrompt(true);
    },
  };

  return (
    <main className={`match-shell ${reduceMotion ? "reduce-motion" : ""}`}>
      <div className="match-shell__status">
        <MatchScorebook {...scorebookProps} compact onCollapse={() => setScorebookOpen(true)} />
      </div>
      {scorebookOpen && (
        <div
          className="match-details-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Match details"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setScorebookOpen(false);
          }}
        >
          <MatchScorebook {...scorebookProps} onCollapse={() => setScorebookOpen(false)} />
        </div>
      )}

      <MatchTable
        stage={game.gameProgress.stage}
        bidding={game.biddingState}
        config={game.gameConfig}
        progress={game.gameProgress}
        table={game.tableState}
        playerState={game.playerState}
        players={players}
        viewerIndex={viewerIndex}
        isObserver={isObserver}
        isDealing={isDealing}
        guidanceMode={guidanceMode}
        onBid={(amount) => dispatch(placeBid({ playerIndex: FIRST_PLAYER_ID, bidAmount: amount }))}
        onPass={() => dispatch(passBid({ playerIndex: FIRST_PLAYER_ID }))}
        onPlayCard={playCardFromHand}
      />

      {isObserver && <div className="observer-ribbon"><Eye aria-hidden="true" /> Observer · {players.find((player) => Number(player.id.replace("player-", "")) === viewerIndex)?.name}</div>}

      {game.gameProgress.stage === GameStages.TRUMP_SELECTION && game.biddingState.bidWinner === FIRST_PLAYER_ID && !isObserver && (
        <ContractSetup
          playerHand={game.playerState.players[FIRST_PLAYER_ID].hand}
          bidderName={game.playerState.playerNames[FIRST_PLAYER_ID]}
          onConfirm={setContract}
        />
      )}

      {game.gameProgress.stage === GameStages.TRUMP_SELECTION_COMPLETE && game.gameConfig && (
        <div className="contract-reveal" role="dialog" aria-modal="true" aria-labelledby="contract-reveal-title">
          <div className="contract-reveal__sheet">
            <span className="folio">BIDDING COMPLETE!</span>
            <div className="contract-reveal__number"><strong>{game.gameConfig.bidAmount}</strong><span>{getSuiteSymbol(game.gameConfig.trumpSuite)}</span></div>
            <h2 id="contract-reveal-title">Bidding Complete!</h2>
            <p><b>Winning bid:</b> {game.gameConfig.bidAmount} by {game.playerState.playerNames[game.gameConfig.bidWinner]}</p>
            <p><b>Trump Suite</b> {getSuiteName(game.gameConfig.trumpSuite)} · <b>Teammate Card</b> {game.gameConfig.teammateCard.number === 1 ? "A" : game.gameConfig.teammateCard.number} {getSuiteSymbol(game.gameConfig.teammateCard.suite)}</p>
            {!isObserver && <button type="button" className="primary-action primary-action--ink" onClick={() => dispatch(gameStageTransition(GameStages.PLAYING))}>Let&apos;s Begin! <ArrowRight aria-hidden="true" /></button>}
          </div>
        </div>
      )}

      {isDealing && (
        <div className="dealing-notice" aria-live="polite"><LoaderCircle aria-hidden="true" /><span><strong>Dealing the hand</strong><small>Ten cards to each seat</small></span></div>
      )}

      {partnerReveal && (
        <div className="partner-reveal" role="status">
          <span className="folio">TEAMMATE REVEALED</span>
          <strong>{partnerReveal}</strong>
          <small>The teams are now revealed.</small>
        </div>
      )}

      {game.uiState.showWhitewashAnimation && <div className="whitewash-wash" aria-label="Whitewash achieved"><span>250</span><strong>WHITEWASH</strong></div>}

      {game.gameProgress.stage === GameStages.GAME_SUMMARY && (
        <GameResultSheet
          series={game.seriesProgress}
          players={players}
          viewerIndex={viewerIndex}
          isSeries
          nextStarterName={nextStarterName}
          onContinue={nextGame}
          onLeave={() => setExitPrompt(true)}
        />
      )}

      {game.gameProgress.stage === GameStages.GAME_OVER && (
        <GameResultSheet
          series={game.seriesProgress}
          players={players}
          viewerIndex={viewerIndex}
          isSeries={false}
          onContinue={leaveMatch}
          onLeave={() => setExitPrompt(true)}
        />
      )}

      {game.gameProgress.stage === GameStages.SERIES_SUMMARY && (
        <SeriesVictorySheet series={game.seriesProgress} players={players} viewerIndex={viewerIndex} onPlayAgain={newSeries} onLeave={leaveMatch} />
      )}

      {openSheet === "rules" && <RulesBook onClose={() => setOpenSheet(null)} />}
      {openSheet === "stats" && <StatsLedger stats={stats} onReset={clearAllStats} onClose={() => setOpenSheet(null)} />}
      {openSheet === "settings" && (
        <SettingsSheet
          guidanceMode={guidanceMode}
          reduceMotion={reduceMotion}
          onGuidanceChange={changeGuidance}
          onReduceMotionChange={changeMotion}
          onClose={() => setOpenSheet(null)}
        />
      )}

      {game.error && (
        <div className="game-error" role="alert">
          <AlertTriangle aria-hidden="true" />
          <span><strong>The table paused.</strong><small>{game.error.message}</small></span>
          <button type="button" onClick={() => dispatch(clearGameError())}><X aria-hidden="true" /><span className="sr-only">Dismiss error</span></button>
        </div>
      )}

      {exitPrompt && (
        <div className="exit-prompt" role="dialog" aria-modal="true" aria-labelledby="exit-title">
          <section>
            <span className="folio">LEAVE THE TABLE?</span>
            <h2 id="exit-title">The unfinished match will be cleared.</h2>
            <p>Your completed results stay in the local record.</p>
            <div>
              <button type="button" className="quiet-action" onClick={() => setExitPrompt(false)}>Keep playing</button>
              <button type="button" className="danger-action" onClick={leaveMatch}>Leave match</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
