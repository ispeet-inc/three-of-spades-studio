import React from "react";
import PropTypes from "prop-types";
import Chip from "./Chip";
import "../css/Scoreboard.css";

function Scoreboard({
  team1Name,
  team2Name,
  team1Score,
  team2Score,
  currentBid,
  trump,
  round,
  teammate,
}) {
  return (
    <div className="scoreboard-container">
      <div className="scoreboard-team scoreboard-team1">
        <Chip label={team1Name} color="gold" />
        <span className="scoreboard-score">{team1Score}</span>
      </div>
      <div className="scoreboard-info">
        <Chip
          label={`Bid: ${currentBid}`}
          color="gold"
          className="scoreboard-bid"
        />
        <Chip
          label={trump?.label || "—"}
          color={trump?.color || "gray"}
          icon={trump?.icon}
          className="scoreboard-trump"
        />
        <span className="scoreboard-round">Round: {round}</span>
        {teammate && (
          <Chip
            label={`Teammate: ${teammate}`}
            color="blue"
            className="scoreboard-teammate"
          />
        )}
      </div>
      <div className="scoreboard-team scoreboard-team2">
        <Chip label={team2Name} color="blue" />
        <span className="scoreboard-score">{team2Score}</span>
      </div>
    </div>
  );
}

Scoreboard.propTypes = {
  team1Name: PropTypes.string.isRequired,
  team2Name: PropTypes.string.isRequired,
  team1Score: PropTypes.number.isRequired,
  team2Score: PropTypes.number.isRequired,
  currentBid: PropTypes.number,
  trump: PropTypes.shape({
    label: PropTypes.string,
    color: PropTypes.oneOf(["gold", "blue", "red", "green", "gray"]),
    icon: PropTypes.node,
  }),
  round: PropTypes.number,
  teammate: PropTypes.string,
};

Scoreboard.defaultProps = {
  currentBid: 0,
  trump: { label: "—", color: "gray", icon: null },
  round: 1,
  teammate: "",
};

export default Scoreboard;
