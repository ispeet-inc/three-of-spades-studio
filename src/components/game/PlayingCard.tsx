/*
 * The Club Table: physical-card clarity, warm ivory paper, restrained brass focus,
 * square geometry, and motion that only explains state changes.
 */
import { cn } from "@/lib/utils";
import type { Card } from "@/types/game";
import { getSuiteName, getSuiteSymbol } from "@/utils/suiteUtils";
import type { CSSProperties, KeyboardEvent } from "react";

export type PlayingCardSize = "mini" | "table" | "hand" | "picker";

interface PlayingCardProps {
  card?: Card;
  faceDown?: boolean;
  size?: PlayingCardSize;
  playable?: boolean;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  onSelect?: (card: Card) => void;
  tabIndex?: number;
}

const rankLabel = (number: number) => {
  if (number === 1) return "A";
  if (number === 11) return "J";
  if (number === 12) return "Q";
  if (number === 13) return "K";
  return String(number);
};

export function PlayingCard({
  card,
  faceDown = false,
  size = "hand",
  playable = false,
  selected = false,
  disabled = false,
  className,
  style,
  onSelect,
  tabIndex,
}: PlayingCardProps) {
  const interactive = Boolean(card && onSelect && !disabled && !faceDown);
  const suitName = card ? getSuiteName(card.suite) : "hidden";
  const label = card
    ? `${rankLabel(card.number)} of ${suitName}${playable ? ", playable" : ""}`
    : "Face-down card";

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!interactive || !card) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect?.(card);
    }
  };

  if (faceDown || !card) {
    return (
      <div
        className={cn("playing-card playing-card--back", `playing-card--${size}`, className)}
        style={style}
        role="img"
        aria-label={label}
      >
        <img
          src="/assets/three-of-spades/card-back.svg"
          alt=""
          aria-hidden="true"
          draggable={false}
        />
      </div>
    );
  }

  const isRed = card.suite === 1 || card.suite === 3;

  return (
    <button
      type="button"
      className={cn(
        "playing-card playing-card--face",
        `playing-card--${size}`,
        isRed ? "playing-card--red" : "playing-card--black",
        playable && "is-playable",
        selected && "is-selected",
        disabled && "is-disabled",
        className,
      )}
      style={style}
      aria-label={label}
      aria-pressed={selected || undefined}
      aria-disabled={!interactive}
      disabled={!interactive}
      tabIndex={interactive ? tabIndex : -1}
      onClick={() => card && onSelect?.(card)}
      onKeyDown={handleKeyDown}
    >
      <span className="playing-card__corner" aria-hidden="true">
        <strong>{rankLabel(card.number)}</strong>
        <span>{getSuiteSymbol(card.suite)}</span>
      </span>
      <span className="playing-card__pip" aria-hidden="true">
        {getSuiteSymbol(card.suite)}
      </span>
      <span className="playing-card__corner playing-card__corner--reverse" aria-hidden="true">
        <strong>{rankLabel(card.number)}</strong>
        <span>{getSuiteSymbol(card.suite)}</span>
      </span>
    </button>
  );
}
