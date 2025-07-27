import React from "react";
import PropTypes from "prop-types";
import "../css/TeamInfo.css";
import { getDisplayPlayerName } from "../utils/gameUtils";

const TeamInfo = React.memo(function TeamInfo({
  playerNames,
  teams,
  teamColors,
  scores,
  turn,
}) {
  return (
    <div className="team-info-minimal">
      {Object.entries(teams).map(([teamId, players]) => (
        <div key={teamId} className="team-minimal">
          <span
            className="team-dot"
            style={{ backgroundColor: teamColors[teamId] }}
          />
          <span className="team-label">Team {parseInt(teamId) + 1}</span>
          <span className="team-score-minimal">{scores[teamId]}</span>
          <span className="team-players-minimal-wrapper">
            <span className="team-players-minimal">
              {players.map((playerIndex) => {
                const displayName = getDisplayPlayerName(
                  playerNames,
                  playerIndex
                );
                const firstLetter = displayName.charAt(0).toUpperCase();
                return (
                  <span
                    key={playerIndex}
                    className={`team-player-icon${
                      playerIndex === turn ? " current-player-icon" : ""
                    }`}
                  >
                    {firstLetter}
                  </span>
                );
              })}
            </span>
            <div className="team-players-tooltip">
              {players
                .map((playerIndex) =>
                  getDisplayPlayerName(playerNames, playerIndex)
                )
                .join(" & ")}
            </div>
          </span>
        </div>
      ))}
    </div>
  );
});

TeamInfo.propTypes = {
  playerNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  teams: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
  teamColors: PropTypes.objectOf(PropTypes.string).isRequired,
  scores: PropTypes.arrayOf(PropTypes.number).isRequired,
  turn: PropTypes.number.isRequired,
};

export default TeamInfo;
