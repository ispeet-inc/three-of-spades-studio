/*
 * The Club Table: reference surfaces behave like compact publisher inserts—warm paper,
 * thin rules, strong return paths, and no decorative dashboard cards.
 */
import type { PlayerStats } from "@/types/stats";
import { Suite } from "@/types/game";
import { getSuiteSymbol } from "@/utils/suiteUtils";
import { BarChart3, BookOpen, RotateCcw, Settings2, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import type { GuidanceMode } from "./MatchScorebook";

function SheetFrame({
  kicker,
  title,
  icon,
  onClose,
  children,
  wide = false,
}: {
  kicker: string;
  title: string;
  icon: ReactNode;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div className="reference-overlay" role="dialog" aria-modal="true" aria-labelledby="reference-title" onMouseDown={(event) => event.currentTarget === event.target && onClose()}>
      <section className={`reference-sheet ${wide ? "reference-sheet--wide" : ""}`}>
        <header className="reference-sheet__header">
          <span className="reference-sheet__icon" aria-hidden="true">{icon}</span>
          <div>
            <span className="folio">{kicker}</span>
            <h2 id="reference-title">{title}</h2>
          </div>
          <button type="button" className="sheet-close" onClick={onClose} aria-label={`Close ${title}`}><X aria-hidden="true" /></button>
        </header>
        <div className="reference-sheet__body">{children}</div>
      </section>
    </div>
  );
}

const rules = {
  primer: {
    title: "Game Overview",
    intro: "Four players receive ten cards each. The auction creates a temporary team around one hidden partner card.",
    sections: [
      { heading: "At a glance", copy: "40 cards · 4 players · 10 tricks · 250 total points. The Three of Spades alone is worth 30." },
      { heading: "Temporary teams", copy: "The auction winner names a card they do not hold. Whoever holds it becomes the bidder’s teammate, but that identity stays hidden until the card appears." },
      { heading: "Objective", copy: "The contract team tries to collect at least the bid. The defenders try to keep them below it." },
    ],
  },
  auction: {
    title: "Game Phases",
    intro: "Bidding begins at 165 and continues clockwise until three players have passed.",
    sections: [
      { heading: "Raising", copy: "Raise in steps of 5 through 200, then steps of 10. The maximum contract is 250." },
      { heading: "Passing", copy: "A pass removes you from the current auction. You still play the hand." },
      { heading: "Winning the contract", copy: "The last active bidder chooses trump and names the hidden teammate card." },
    ],
  },
  play: {
    title: "Strategy Tips",
    intro: "The first card establishes the running suit. Follow it whenever your hand allows.",
    sections: [
      { heading: "Following suit", copy: "If you hold the led suit, you must play it. If not, you may discard or play trump." },
      { heading: "Taking a trick", copy: "The highest trump wins. If no trump is played, the highest card of the running suit wins." },
      { heading: "Leading next", copy: "The trick winner collects the points and opens the next trick." },
    ],
  },
  scoring: {
    title: "Card Values & Ranking",
    intro: "Point-bearing cards total 250 across the deck; most low cards are strategically useful but score nothing.",
    sections: [
      { heading: "Ten-point cards", copy: "Every Ace, King, Queen, Jack, and Ten is worth 10 points." },
      { heading: "Fives", copy: "Each Five is worth 5 points." },
      { heading: "Three of Spades", copy: "The signature card is worth 30 points and can decide a close contract." },
    ],
  },
} as const;

type RulesTab = keyof typeof rules;

export function RulesBook({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<RulesTab>("primer");
  const page = rules[tab];

  return (
    <SheetFrame kicker="GAME GUIDE" title="How to Play" icon={<BookOpen />} onClose={onClose} wide>
      <nav className="reference-tabs" aria-label="Rules sections">
        {(Object.keys(rules) as RulesTab[]).map((key) => (
          <button key={key} type="button" className={tab === key ? "is-active" : ""} onClick={() => setTab(key)}>{rules[key].title}</button>
        ))}
      </nav>
      <article className="rules-page">
        <header>
          <span className="rules-page__number">{String((Object.keys(rules) as RulesTab[]).indexOf(tab) + 1).padStart(2, "0")}</span>
          <div><h3>{page.title}</h3><p>{page.intro}</p></div>
        </header>
        <div className="rules-page__sections">
          {page.sections.map((section, index) => (
            <section key={section.heading}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><h4>{section.heading}</h4><p>{section.copy}</p></div>
            </section>
          ))}
        </div>
        {tab === "scoring" && (
          <div className="card-value-line" aria-label="Card point values">
            <span><b>A K Q J 10</b><small>10 points each</small></span>
            <span><b>5</b><small>5 points</small></span>
            <span className="is-signature"><b>3 {getSuiteSymbol(Suite.Spade)}</b><small>30 points</small></span>
            <span><b>7 8 9</b><small>0 points</small></span>
          </div>
        )}
      </article>
    </SheetFrame>
  );
}

export function StatsLedger({
  stats,
  onReset,
  onClose,
}: {
  stats: PlayerStats;
  onReset: () => void;
  onClose: () => void;
}) {
  const [confirmReset, setConfirmReset] = useState(false);
  const gameRate = stats.game.totalGames ? Math.round((stats.game.gamesWon / stats.game.totalGames) * 100) : 0;
  const seriesRate = stats.series.totalSeries ? Math.round((stats.series.seriesWon / stats.series.totalSeries) * 100) : 0;
  const empty = stats.game.totalGames === 0 && stats.series.totalSeries === 0;

  return (
    <SheetFrame kicker="PERFORMANCE INSIGHTS" title="Stats" icon={<BarChart3 />} onClose={onClose} wide>
      {empty ? (
        <div className="ledger-empty">
          <span className="ledger-empty__mark">—</span>
          <h3>No completed games yet</h3>
          <p>Your results are recorded on this device after each game and four-game series.</p>
        </div>
      ) : (
        <div className="stats-ledger">
          <section>
            <div className="section-label"><span>Single</span><span>{stats.game.totalGames} PLAYED</span></div>
            <div className="stats-ledger__hero"><strong>{gameRate}%</strong><span>Game win rate</span></div>
            <dl>
              <div><dt>Games won</dt><dd>{stats.game.gamesWon}</dd></div>
              <div><dt>Highest score</dt><dd>{stats.game.highestScore}</dd></div>
              <div><dt>Bids placed</dt><dd>{stats.game.bidsPlaced}</dd></div>
              <div><dt>Bids won</dt><dd>{stats.game.bidsWon}</dd></div>
              <div><dt>Whitewashes</dt><dd>{stats.game.whitewash}</dd></div>
              <div><dt>Best streak</dt><dd>{stats.game.bestStreak}</dd></div>
            </dl>
          </section>
          <section>
            <div className="section-label"><span>Series</span><span>{stats.series.totalSeries} PLAYED</span></div>
            <div className="stats-ledger__hero"><strong>{seriesRate}%</strong><span>Series win rate</span></div>
            <dl>
              <div><dt>Series won</dt><dd>{stats.series.seriesWon}</dd></div>
              <div><dt>Highest total</dt><dd>{stats.series.highestSeriesScore}</dd></div>
              <div><dt>Average total</dt><dd>{Math.round(stats.series.averageSeriesScore)}</dd></div>
              <div><dt>Current streak</dt><dd>{stats.series.currentSeriesStreak}</dd></div>
              <div><dt>Best streak</dt><dd>{stats.series.bestSeriesStreak}</dd></div>
            </dl>
          </section>
        </div>
      )}
      <footer className="ledger-footer">
        <span>Updated {new Date(stats.lastUpdated).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}</span>
        {confirmReset ? (
          <span className="reset-confirm">Reset all statistics? This cannot be undone. <button type="button" onClick={() => { onReset(); setConfirmReset(false); }}>Reset</button><button type="button" onClick={() => setConfirmReset(false)}>Cancel</button></span>
        ) : (
          <button type="button" className="quiet-danger" onClick={() => setConfirmReset(true)}><RotateCcw aria-hidden="true" /> Reset</button>
        )}
      </footer>
    </SheetFrame>
  );
}

export function SettingsSheet({
  guidanceMode,
  reduceMotion,
  onGuidanceChange,
  onReduceMotionChange,
  onClose,
}: {
  guidanceMode: GuidanceMode;
  reduceMotion: boolean;
  onGuidanceChange: (mode: GuidanceMode) => void;
  onReduceMotionChange: (value: boolean) => void;
  onClose: () => void;
}) {
  return (
    <SheetFrame kicker="TABLE PREFERENCES" title="Settings" icon={<Settings2 />} onClose={onClose}>
      <div className="settings-list">
        <fieldset>
          <legend>Beginner guidance</legend>
          <p>Choose how often the table explains rules and decision context.</p>
          {([
            ["full", "Full guidance", "Phase introductions, legal-action help, and one strategic prompt."],
            ["contextual", "Context only", "Help appears for constraints, unusual states, and invalid attempts."],
            ["off", "Hints off", "Only required turn and error feedback remains."],
          ] as [GuidanceMode, string, string][]).map(([value, title, description]) => (
            <label key={value} className={guidanceMode === value ? "is-selected" : ""}>
              <input type="radio" name="guidance" checked={guidanceMode === value} onChange={() => onGuidanceChange(value)} />
              <span><strong>{title}</strong><small>{description}</small></span>
              <i aria-hidden="true" />
            </label>
          ))}
        </fieldset>
        <label className="setting-toggle">
          <span><strong>Reduce motion</strong><small>Remove card travel, stagger, and decorative transitions.</small></span>
          <input type="checkbox" checked={reduceMotion} onChange={(event) => onReduceMotionChange(event.target.checked)} />
          <i aria-hidden="true" />
        </label>
      </div>
    </SheetFrame>
  );
}
