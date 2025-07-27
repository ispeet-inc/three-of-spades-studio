import React from "react";
import PropTypes from "prop-types";
import "../css/GameSummary.css";
import { getFormattedPlayerName } from "../utils/gameUtils";

const GameSummary = React.memo(function GameSummary({
  scores,
  playerStates,
  playerNames,
  bidAmount,
  bidder,
  teams,
  teamColors,
  onNewGame,
}) {
  // Calculate team scores
  const teamScores = {
    0: scores[0], // bidding team
    1: scores[1], // defending team
  };

  // teams[0] is always bidding team, teams[1] is always defending team
  const biddingTeam = 0;
  const defendingTeam = 1;

  // Determine winner based on bid
  let winningTeam = null;
  let bidMet = false;
  if (teamScores[biddingTeam] >= bidAmount) {
    winningTeam = biddingTeam;
    bidMet = true;
  } else {
    winningTeam = defendingTeam;
    bidMet = false;
  }

  return (
    <div className="game-summary">
      <h2 className="summary-title">Fin.</h2>
      <div className="bid-summary">
        {getFormattedPlayerName(playerNames, bidder)} bid {bidAmount}
      </div>
      <br></br>
      <div className="team-scores">
        {Object.entries(teams).map(([teamId, players]) => (
          <div
            key={teamId}
            className={`team-score ${
              winningTeam === parseInt(teamId) ? "winner" : ""
            }`}
            style={{ borderColor: teamColors[teamId] }}
          >
            <div
              className="team-header"
              style={{ backgroundColor: teamColors[teamId] }}
            >
              <span className="team-name">Team {parseInt(teamId) + 1}</span>
              <span className="team-score">{teamScores[teamId]}</span>
            </div>
            <div className="team-players">
              {players.map((playerIndex) => (
                <div key={playerIndex} className="team-player">
                  <span className="player-name">
                    {getFormattedPlayerName(playerNames, playerIndex)}
                  </span>
                  <span className="player-score">
                    {playerStates[playerIndex].score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="winner-announcement">
        {winningTeam !== null ? (
          <div className="winner-text">
            <span
              className="team-name"
              style={{ color: teamColors[winningTeam] }}
            >
              Team {winningTeam + 1}
            </span>
            <span> wins! </span>
            <span className="bid-result">
              ({bidMet ? "Bid and won" : "Bid failed"})
            </span>
          </div>
        ) : (
          <div className="tie-text">It's a tie!</div>
        )}
      </div>

      <button className="new-game-button" onClick={onNewGame}>
        New Game
      </button>
    </div>
  );
});

GameSummary.propTypes = {
  scores: PropTypes.arrayOf(PropTypes.number).isRequired,
  playerStates: PropTypes.arrayOf(
    PropTypes.shape({
      score: PropTypes.number.isRequired,
    })
  ).isRequired,
  playerNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  bidAmount: PropTypes.number.isRequired,
  bidder: PropTypes.number.isRequired,
  teams: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
  teamColors: PropTypes.objectOf(PropTypes.string).isRequired,
  onNewGame: PropTypes.func.isRequired,
};

export default GameSummary;
