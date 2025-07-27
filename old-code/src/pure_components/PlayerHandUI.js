import React from "react";
import PropTypes from "prop-types";
import CardUI from "../pure_components/CardUI";
import "../css/PlayerHandUI.css"; // Import PlayerHand specific CSS
import { getFormattedPlayerName } from "../utils/gameUtils";

const PlayerHandUI = React.memo(function PlayerHandUI({
  hand,
  idx,
  turn,
  tableCards,
  playCard,
  runningSuite,
  trumpSuite,
  playerNames,
  botCardsHidden,
  playerAgents,
}) {
  // Function to determine if a card is playable
  const isCardPlayable = (card) => {
    // If it's not this player's turn, card is not playable
    // if (turn !== idx) return false;

    // If player has already played this round, card is not playable
    if (tableCards.find((c) => c.player === idx)) return false;

    // Check if player has any cards of the running suite
    const hasRunningSuite = hand.some((card) => card.suite === runningSuite);

    // If there's a running suite and player has cards of that suite,
    // they must play a card of that suite
    if (runningSuite != null && hasRunningSuite) {
      return card.suite === runningSuite;
    }
    return true;
  };

  // Determine if this player is a bot
  const isBot = playerAgents && playerAgents[idx];

  return (
    <div
      key={idx}
      className={`player-hand-container ${
        turn !== idx ? "disabled" : "enabled"
      }`}
    >
      <div
        className={`player-hand-card${
          turn === idx ? " active-player-card" : ""
        }`}
      >
        <div className="player-hand-header">
          <span
            className={`player-title${turn === idx ? " active-player" : ""}`}
          >
            {getFormattedPlayerName(playerNames, idx)} {turn === idx && "👈"}
          </span>
        </div>
        <div className="player-hand-content">
          <div className="player-cards">
            {hand.map((card, cardIndex) => (
              <div
                key={cardIndex}
                className={`card-item ${
                  !isCardPlayable(card) ? "disabled" : ""
                }`}
                onClick={() => {
                  if (isCardPlayable(card)) {
                    playCard(idx, cardIndex);
                  } else {
                    // if player has running suite
                    // give hint saying - "You have to play card of the same suite".
                    // Hint - You can use trump to cut
                  }
                }}
              >
                <CardUI card={card} hidden={!!(botCardsHidden && isBot)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

PlayerHandUI.propTypes = {
  hand: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      suite: PropTypes.number.isRequired,
    })
  ).isRequired,
  idx: PropTypes.number.isRequired,
  turn: PropTypes.number.isRequired,
  tableCards: PropTypes.arrayOf(
    PropTypes.shape({
      player: PropTypes.number.isRequired,
    })
  ).isRequired,
  playCard: PropTypes.func.isRequired,
  runningSuite: PropTypes.number,
  trumpSuite: PropTypes.number,
  playerNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  botCardsHidden: PropTypes.bool.isRequired,
  playerAgents: PropTypes.object,
};

PlayerHandUI.defaultProps = {
  runningSuite: null,
  trumpSuite: null,
  playerAgents: {},
};

export default PlayerHandUI;
