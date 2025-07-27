import React from "react";
import PropTypes from "prop-types";
import "../css/CardUI.css";
import { suitNames } from "../utils/suiteUtils";

const CardUI = React.memo(function CardUI({ card, hidden, mini, small }) {
  if (!card) {
    return null;
  }
  if (hidden) {
    return (
      <div className={`Card${small ? " small-card" : ""}`}>
        <img
          src="/cards/card_red_back.svg"
          alt="Card Back"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }
  const cardKey = `${card.id}_of_${suitNames[card.suite]}`;
  const cardImage = mini
    ? `/cards/mini_card_${cardKey}.svg`
    : `/cards/card_${cardKey}.svg`;
  return (
    <div
      className={`Card${mini ? " mini-card" : ""}${small ? " small-card" : ""}`}
    >
      <img
        src={cardImage}
        alt={`${cardKey}`}
        className="w-full h-full object-cover"
      />
    </div>
  );
});

CardUI.propTypes = {
  card: PropTypes.shape({
    id: PropTypes.string.isRequired,
    suite: PropTypes.number.isRequired,
  }),
  hidden: PropTypes.bool,
  mini: PropTypes.bool,
  small: PropTypes.bool,
};

CardUI.defaultProps = {
  hidden: false,
  mini: false,
  small: false,
};

export default CardUI;
