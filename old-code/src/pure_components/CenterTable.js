import React from "react";
import PropTypes from "prop-types";
import CardUI from "./CardUI";
import "../css/CenterTable.css";
import {
  getDisplayPlayerName,
  getPlayedCardForPlayer,
} from "../utils/gameUtils";

const playerPositionMap = {
  0: "bottom",
  1: "left",
  2: "top",
  3: "right",
};

const CenterTable = React.memo(function CenterTable({
  tableCards,
  players,
  roundWinner,
  onClose,
  playerNames,
}) {
  // // Map cards and player indices for display
  // const playerOrder = players.map((_, idx) => idx);
  // const cardsInOrder = playerOrder.map((idx) =>
  //   tableCards.find((card) => card.player === idx)
  // );

  console.log("Table Cards:", tableCards);
  return (
    <div className="center-cards-v2">
      {players.map((hand, idx) => {
        const playedCard = getPlayedCardForPlayer(tableCards, idx);
        const position = playerPositionMap[idx];
        return (
          <React.Fragment key={idx}>
            <div className={`played-card-v2 played-card-${position}-v2`}>
              {playedCard && <CardUI card={playedCard} small />}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
});

CenterTable.propTypes = {
  tableCards: PropTypes.array.isRequired,
  players: PropTypes.array.isRequired,
  roundWinner: PropTypes.number,
  onClose: PropTypes.func.isRequired,
  playerNames: PropTypes.array,
};

export default CenterTable;
