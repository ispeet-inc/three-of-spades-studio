import React from "react";
import PropTypes from "prop-types";
import "./css/Card.css";
import { suitNames } from "../utils/suiteUtils";

function getCardImage(card, { hidden, mini }) {
  if (!card || hidden) return "/cards/card_red_back.svg";
  const cardKey = `${card.id}_of_${suitNames[card.suite]}`;
  return mini
    ? `/cards/mini_card_${cardKey}.svg`
    : `/cards/card_${cardKey}.svg`;
}

const Card = React.memo(function Card({
  card,
  hidden,
  mini,
  selected,
  glow,
  hoverZoom,
  onClick,
  className,
  ...rest
}) {
  if (!card && !hidden) return null;
  const cardImage = getCardImage(card, { hidden, mini });
  const cardKey = card ? `${card.id}_of_${suitNames[card.suite]}` : "Card Back";
  const classes = [
    "card",
    mini ? "card--mini" : "",
    selected ? "card--selected" : "",
    glow ? "card--glow" : "",
    hoverZoom ? "card--hoverZoom" : "",
    className || "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : "img"}
      aria-label={hidden ? "Card Back" : cardKey}
      onClick={onClick}
      {...rest}
    >
      <img
        src={cardImage}
        alt={hidden ? "Card Back" : cardKey}
        className="card__img"
        draggable={false}
      />
    </div>
  );
});

Card.propTypes = {
  card: PropTypes.shape({
    id: PropTypes.string.isRequired,
    suite: PropTypes.number.isRequired,
  }),
  hidden: PropTypes.bool,
  mini: PropTypes.bool,
  selected: PropTypes.bool,
  glow: PropTypes.bool,
  hoverZoom: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

Card.defaultProps = {
  hidden: false,
  mini: false,
  selected: false,
  glow: false,
  hoverZoom: false,
  onClick: undefined,
  className: "",
};

export default Card;
