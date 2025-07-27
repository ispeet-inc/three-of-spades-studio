import React, { memo, useCallback } from "react";
import PropTypes from "prop-types";
import { suitSymbols } from "../utils/suiteUtils";
import CardUI from "./CardUI";
import TeamInfo from "./TeamInfo";
import "../css/GameHeader.css";

const GameHeader = memo(function GameHeader({
  round,
  trumpSuite,
  teammateCard,
  bidAmount,
  botCardsHidden,
  onToggleBotCardsHidden,
  playerNames,
  teams,
  teamColors,
  scores,
  turn,
}) {
  // Memoize the onChange handler to prevent unnecessary re-renders
  const handleToggleChange = useCallback(
    (e) => {
      onToggleBotCardsHidden(e.target.checked);
    },
    [onToggleBotCardsHidden]
  );

  return (
    <div className="game-header">
      <div className="game-header-left">
        <div className="header-title">Three of Spades</div>
        <div className="header-badges">
          <span className="header-badge-minimal">
            Trump: {suitSymbols[trumpSuite]}
          </span>
          {teammateCard && (
            <span className="header-badge-minimal header-badge-teammate">
              Teammate:
              <CardUI card={teammateCard} mini />
            </span>
          )}
          {bidAmount && (
            <span className="header-badge-minimal">Bid: {bidAmount}</span>
          )}
          <span className="header-badge-minimal">Round {round + 1}</span>
        </div>
      </div>
      <div className="game-header-right header-toggle-row">
        {/* Toggle Switch for hiding bot cards */}
        <label className="header-toggle-label">
          <input
            type="checkbox"
            checked={botCardsHidden}
            onChange={handleToggleChange}
            className="header-toggle-checkbox"
            aria-label="Hide Bot Cards"
          />
          Hide Bot Cards
        </label>
        <TeamInfo
          playerNames={playerNames}
          teams={teams}
          teamColors={teamColors}
          scores={scores}
          turn={turn}
        />
      </div>
    </div>
  );
});

GameHeader.propTypes = {
  round: PropTypes.number.isRequired,
  trumpSuite: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  teammateCard: PropTypes.object,
  bidAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  botCardsHidden: PropTypes.bool.isRequired,
  onToggleBotCardsHidden: PropTypes.func.isRequired,
  playerNames: PropTypes.array,
  teams: PropTypes.object,
  teamColors: PropTypes.object,
  scores: PropTypes.array,
  turn: PropTypes.number,
};

export default GameHeader;
