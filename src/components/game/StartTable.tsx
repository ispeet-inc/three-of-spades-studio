/*
 * The Club Table: an asymmetrical publisher-grade entry surface with tactile paper,
 * calm hierarchy, and one unmistakable route into the four-game series.
 */
import { GameMode } from "@/types/game";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  RotateCcw,
  Settings2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface StartTableProps {
  hasSavedMatch: boolean;
  onResume: () => void;
  onStartGame: (playerName: string, mode: GameMode) => void;
  onOpenRules: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
}

const modes = [
  {
    mode: GameMode.Series,
    marker: "04",
    title: "Series",
    description: "Compete across four games with cumulative scoring and a rotating starting player.",
    meta: "4 Games • Epic Battle",
  },
  {
    mode: GameMode.Single,
    marker: "01",
    title: "Single Game",
    description: "Play one complete game from auction to result.",
    meta: "1 Game • Quick Play",
  },
] as const;

export function StartTable({
  hasSavedMatch,
  onResume,
  onStartGame,
  onOpenRules,
  onOpenStats,
  onOpenSettings,
}: StartTableProps) {
  const [name, setName] = useState("You");
  const [mode, setMode] = useState<GameMode>(GameMode.Series);

  useEffect(() => {
    const savedName = localStorage.getItem("threeOfSpades_playerName")?.trim();
    if (savedName) setName(savedName);
  }, []);

  const begin = () => {
    const cleanName = name.trim().slice(0, 24) || "You";
    localStorage.setItem("threeOfSpades_playerName", cleanName);
    onStartGame(cleanName, mode);
  };

  return (
    <main className="start-table">
      <div className="start-table__image" aria-hidden="true" />
      <div className="start-table__veil" aria-hidden="true" />

      <header className="start-table__header">
        <a className="brand-lockup" href="/" aria-label="Three of Spades home">
          <img
            className="brand-lockup__mark"
            src="/assets/three-of-spades/partner-mark.png"
            alt=""
          />
          <span>
            <strong>Three of Spades</strong>
            <small>A hidden-partner card game</small>
          </span>
        </a>

        <nav className="quiet-nav" aria-label="Reference and settings">
          <button type="button" onClick={onOpenRules}>
            <BookOpen aria-hidden="true" />
            <span>How to Play</span>
          </button>
          <button type="button" onClick={onOpenStats}>
            <BarChart3 aria-hidden="true" />
            <span>Stats</span>
          </button>
          <button type="button" onClick={onOpenSettings}>
            <Settings2 aria-hidden="true" />
            <span className="sr-only">Settings</span>
          </button>
        </nav>
      </header>

      <section className="start-table__intro" aria-labelledby="start-title">
        <p className="eyebrow">Four seats · Ten tricks · One hidden teammate</p>
        <h1 id="start-title">Read the table.<br />Find your partner.</h1>
        <p className="start-table__lede">
          Bid for the contract, choose trump, and name the card that quietly decides
          who plays beside you.
        </p>
      </section>

      <section className="match-slip" aria-label="Start a match">
        <div className="match-slip__heading">
          <div>
            <span className="folio">MATCH ENTRY</span>
            <h2>Welcome</h2>
          </div>
          <span className="match-slip__edition">CLUB EDITION / 01</span>
        </div>

        {hasSavedMatch && (
          <button type="button" className="resume-match" onClick={onResume}>
            <span className="resume-match__icon"><RotateCcw aria-hidden="true" /></span>
            <span>
              <strong>Resume the table</strong>
              <small>An unfinished game is saved on this device.</small>
            </span>
            <ArrowRight aria-hidden="true" />
          </button>
        )}

        <label className="name-field">
          <span>Your name at the table</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && begin()}
            maxLength={24}
            autoComplete="nickname"
            spellCheck={false}
          />
        </label>

        <fieldset className="mode-fieldset">
          <legend>Choose Your Game Mode</legend>
          {modes.map((item) => (
            <label
              key={item.mode}
              className={`mode-row ${mode === item.mode ? "is-selected" : ""}`}
            >
              <input
                type="radio"
                name="game-mode"
                value={item.mode}
                checked={mode === item.mode}
                onChange={() => setMode(item.mode)}
              />
              <span className="mode-row__marker">{item.marker}</span>
              <span className="mode-row__copy">
                <strong>{item.title}</strong>
                <small>{item.description}</small>
                <em>{item.meta}</em>
              </span>
              <span className="mode-row__radio" aria-hidden="true" />
            </label>
          ))}
        </fieldset>

        <button type="button" className="primary-action" onClick={begin}>
          <span>Start Game</span>
          <ArrowRight aria-hidden="true" />
        </button>

        <div className="room-note" aria-label="Private rooms are in progress">
          <Users aria-hidden="true" />
          <span>
            <strong>Private rooms are next.</strong>
            <small>Invite friends into longer tournaments when multiplayer opens.</small>
          </span>
          <span className="status-stamp">IN PROGRESS</span>
        </div>

        <p className="bot-note"><Bot aria-hidden="true" /> Today’s table seats three adaptive computer players.</p>
      </section>
    </main>
  );
}
