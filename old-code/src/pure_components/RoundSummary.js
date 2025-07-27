import React from "react";
import PropTypes from "prop-types";
import CardUI from "./CardUI";
import "../css/RoundSummary.css";
import { getDisplayPlayerName } from "../utils/gameUtils";

const RoundSummary = React.memo(function RoundSummary({
  tableCards,
  players,
  roundWinner,
  onClose,
  playerNames,
}) {
  // Only show if all players have played
  if (!tableCards || tableCards.length !== players.length) return null;

  // Map cards and player indices for display
  const playerOrder = players.map((_, idx) => idx);
  const cardsInOrder = playerOrder.map((idx) =>
    tableCards.find((card) => card.player === idx)
  );

  return (
    <div className="round-summary-overlay">
      <div className="round-summary">
        <button
          className="round-summary-close"
          onClick={onClose}
          title="Start next round"
        >
          ×
        </button>
        <div className="round-summary-title">Round Summary</div>
        <div className="round-summary-cards-row">
          {cardsInOrder.map((card, idx) => (
            <div
              key={idx}
              className={`round-summary-card-container${
                idx === roundWinner ? " round-summary-winner" : ""
              }`}
            >
              {idx === roundWinner && (
                <span className="round-summary-winner-badge">Winner!</span>
              )}
              <div className="round-summary-card">
                {card ? (
                  <CardUI card={card} />
                ) : (
                  <span className="round-summary-no-card">No card played</span>
                )}
              </div>
              <div className="round-summary-player-name-row">
                {getDisplayPlayerName(playerNames, idx)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

RoundSummary.propTypes = {
  tableCards: PropTypes.array.isRequired,
  players: PropTypes.array.isRequired,
  roundWinner: PropTypes.number,
  onClose: PropTypes.func.isRequired,
  playerNames: PropTypes.array,
};

export default RoundSummary;
