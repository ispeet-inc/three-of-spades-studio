import React from "react";
import PropTypes from "prop-types";
import CardUI from "../pure_components/CardUI";
import "../css/GameContentv2.css";

// --- PlayerArea: Renders avatar, score, name, and hand for a player ---
// For left/right, player-info and hand are side by side (row). For top/bottom, stacked (column).
const PlayerArea = ({
  pos,
  name,
  score,
  handDirection,
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
  isBidder,
  teamId,
  teamColor,
}) => {
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

  const isSide = pos === "left" || pos === "right";
  // Determine hand rotation class for left/right
  let handRotationClass = "";
  if (pos === "left") handRotationClass = "rotate-hand-left";
  if (pos === "right") handRotationClass = "rotate-hand-right";

  const playerBadge = (
    <div className={`player-badge-v2 player-badge-${pos}-v2`}>
      <span className="player-name-v2">
        <b>{name}</b>
      </span>
      {isBidder && (
        <span
          className="player-bidder-crown-v2"
          title="Bid Winner"
          role="img"
          aria-label="Bid Winner"
        >
          👑
        </span>
      )}
      <span
        className="player-team-dot-v2"
        style={{ backgroundColor: teamColor }}
      />
    </div>
  );

  const handDisplay = (
    <div className={`hand-v2 ${handDirection} ${handRotationClass}`}>
      {hand.map((card, cardIndex) => (
        <div
          key={cardIndex}
          className={`card-item ${!isCardPlayable(card) ? "disabled" : ""}`}
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
  );

  // --- Layout by Position ---
  let content;
  if (pos === "bottom") {
    content = (
      <div className="player-flex-col-v2">
        {handDisplay}
        {playerBadge}
      </div>
    );
  } else {
    content = (
      <div className="player-flex-col-v2">
        {playerBadge}
        {handDisplay}
      </div>
    );
  }

  return <div className={`player-v2 player-${pos}-v2`}>{content}</div>;
};

PlayerArea.propTypes = {
  pos: PropTypes.oneOf(["top", "bottom", "left", "right"]).isRequired,
  name: PropTypes.string.isRequired,
  score: PropTypes.number.isRequired,
  handDirection: PropTypes.string.isRequired,
  hand: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      suite: PropTypes.number.isRequired,
      number: PropTypes.number.isRequired,
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
  playerNames: PropTypes.object.isRequired,
  botCardsHidden: PropTypes.bool.isRequired,
  playerAgents: PropTypes.object,
  isBidder: PropTypes.bool.isRequired,
  teamId: PropTypes.number.isRequired,
  teamColor: PropTypes.string.isRequired,
};

export default PlayerArea;
