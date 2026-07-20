/*
 * The Club Table: contract selection appears as a deliberate ivory score sheet,
 * keeping strategic choices tactile and legible rather than treating them as a generic modal.
 */
import type { Card } from "@/types/game";
import { Suite } from "@/types/game";
import { getTeammateOptions } from "@/utils/gameUtils";
import { getSuiteName, getSuiteSymbol } from "@/utils/suiteUtils";
import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { PlayingCard } from "./PlayingCard";

interface ContractSetupProps {
  playerHand: Card[];
  bidderName: string;
  onConfirm: (trump: Suite, teammateCard: Card) => void;
}

const suits = [Suite.Spade, Suite.Heart, Suite.Club, Suite.Diamond];

export function ContractSetup({ playerHand, bidderName, onConfirm }: ContractSetupProps) {
  const [trump, setTrump] = useState<Suite | null>(null);
  const [partnerSuit, setPartnerSuit] = useState<Suite>(Suite.Spade);
  const [partnerCard, setPartnerCard] = useState<Card | null>(null);

  const partnerOptions = useMemo(
    () => getTeammateOptions(playerHand, partnerSuit),
    [playerHand, partnerSuit],
  );

  const choosePartnerSuit = (suit: Suite) => {
    setPartnerSuit(suit);
    setPartnerCard(null);
  };

  return (
    <div className="contract-setup" role="dialog" aria-modal="true" aria-labelledby="contract-title">
      <div className="contract-setup__sheet">
        <header>
          <span className="folio">CONTRACT / {bidderName.toUpperCase()}</span>
          <h2 id="contract-title">Choose Trump & Teammate Card</h2>
          <p>Select the trump suite, then choose the card that will identify your hidden teammate.</p>
        </header>

        <div className="contract-setup__columns">
          <fieldset className="contract-choice">
            <legend><span>01</span> Trump Suite</legend>
            <div className="suit-selector">
              {suits.map((suit) => (
                <button
                  key={suit}
                  type="button"
                  className={trump === suit ? "is-selected" : ""}
                  aria-pressed={trump === suit}
                  onClick={() => setTrump(suit)}
                >
                  <span className={suit === Suite.Heart || suit === Suite.Diamond ? "is-red" : ""}>
                    {getSuiteSymbol(suit)}
                  </span>
                  <small>{getSuiteName(suit)}</small>
                </button>
              ))}
            </div>
            <p className="field-note">Trump outranks the suit that opens a trick.</p>
          </fieldset>

          <fieldset className="contract-choice">
            <legend><span>02</span> Choose Teammate Card</legend>
            <div className="partner-suit-tabs" role="tablist" aria-label="Teammate card suit">
              {suits.map((suit) => (
                <button
                  key={suit}
                  type="button"
                  role="tab"
                  aria-selected={partnerSuit === suit}
                  className={partnerSuit === suit ? "is-active" : ""}
                  onClick={() => choosePartnerSuit(suit)}
                >
                  {getSuiteSymbol(suit)}
                </button>
              ))}
            </div>
            <div className="partner-card-grid">
              {partnerOptions.map((card) => (
                <PlayingCard
                  key={card.hash}
                  card={card}
                  size="picker"
                  playable
                  selected={partnerCard?.hash === card.hash}
                  onSelect={setPartnerCard}
                />
              ))}
            </div>
            <p className="field-note">The holder becomes your teammate and stays hidden until this card is played.</p>
          </fieldset>
        </div>

        <footer>
          <div className="contract-summary" aria-live="polite">
            <small>Your selection</small>
            <strong>
              {trump === null ? "No trump chosen" : `${getSuiteSymbol(trump)} ${getSuiteName(trump)} trump`}
              <span> / </span>
              {partnerCard ? `${partnerCard.number === 1 ? "A" : partnerCard.number} ${getSuiteSymbol(partnerCard.suite)} teammate` : "No teammate card selected"}
            </strong>
          </div>
          <button
            type="button"
            className="primary-action primary-action--ink"
            disabled={trump === null || !partnerCard}
            onClick={() => trump !== null && partnerCard && onConfirm(trump, partnerCard)}
          >
            Submit <ArrowRight aria-hidden="true" />
          </button>
        </footer>
      </div>
    </div>
  );
}
