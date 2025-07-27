import React, { useState } from "react";
import PropTypes from "prop-types";
import CardUI from "./CardUI";
import "../css/BiddingModal.css";
import { getFormattedPlayerName } from "../utils/gameUtils";

const BiddingModal = React.memo(function BiddingModal({
  biddingState,
  playerNames,
  userHand,
  onPlaceBid,
  onPassBid,
}) {
  const [customBid, setCustomBid] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [error, setError] = useState("");

  const {
    currentBid,
    currentBidder,
    passedPlayers,
    bidStatusByPlayer,
    bidTimer,
  } = biddingState;

  // Determine min increment
  const minIncrement = currentBid < 200 ? 5 : 10;
  const maxBid = 250;
  const canBid = !passedPlayers.includes(0) && currentBidder === 0;

  // Bid action handlers
  const handleBid = (increment) => {
    const newBid = currentBid + increment;
    if (newBid > maxBid) return;
    onPlaceBid({ playerIndex: 0, bidAmount: newBid });
    setShowCustomInput(false);
    setCustomBid("");
    setError("");
  };

  const handleCustomBid = () => {
    const value = Number(customBid);
    if (
      isNaN(value) ||
      value <= currentBid ||
      value > maxBid ||
      (currentBid < 200 && (value - currentBid) % 5 !== 0) ||
      (currentBid >= 200 && (value - currentBid) % 10 !== 0)
    ) {
      setError("Invalid custom bid.");
      return;
    }
    onPlaceBid({ playerIndex: 0, bidAmount: value });
    setShowCustomInput(false);
    setCustomBid("");
    setError("");
  };

  const handlePass = () => {
    onPassBid({ playerIndex: 0 });
    setShowCustomInput(false);
    setCustomBid("");
    setError("");
  };

  return (
    <div className="bidding-modal-overlay">
      <div className="bidding-modal">
        <h2>Bidding Round</h2>
        <div className="mini-hand-display-overlap">
          {userHand.map((card, idx) => (
            <span key={idx} className="mini-hand-card-wrapper-overlap">
              <CardUI card={card} />
            </span>
          ))}
        </div>
        <div className="bidding-info">
          <div>
            Current Highest Bid: <b>{currentBid}</b>
          </div>
          <div>
            Current Bidder:{" "}
            <b>{getFormattedPlayerName(playerNames, currentBidder)}</b>
          </div>
          <div>
            Timer: <b>{bidTimer}s</b>
          </div>
        </div>
        <div className="bidding-players-status">
          {Object.entries(bidStatusByPlayer).map(([idx, status]) => (
            <div
              key={idx}
              className={`bidding-player-status${
                Number(idx) === currentBidder ? " current" : ""
              }${passedPlayers.includes(Number(idx)) ? " passed" : ""}`}
            >
              {getFormattedPlayerName(playerNames, idx)}: {status}
            </div>
          ))}
        </div>
        {canBid && (
          <div className="bidding-controls">
            <button
              onClick={() => handleBid(minIncrement)}
              disabled={currentBid + minIncrement > maxBid}
            >
              +{minIncrement}
            </button>
            <button
              onClick={() => handleBid(10)}
              disabled={currentBid + 10 > maxBid}
            >
              +10
            </button>
            <button onClick={() => setShowCustomInput(true)}>Custom Bid</button>
            <button onClick={handlePass}>Pass</button>
            {showCustomInput && (
              <div className="custom-bid-input-group">
                <input
                  type="number"
                  value={customBid}
                  onChange={(e) => setCustomBid(e.target.value)}
                  min={currentBid + minIncrement}
                  max={maxBid}
                  step={minIncrement}
                  autoFocus
                />
                <button onClick={handleCustomBid}>Submit</button>
                <button onClick={() => setShowCustomInput(false)}>
                  Cancel
                </button>
              </div>
            )}
            {error && <div className="bidding-error">{error}</div>}
          </div>
        )}
        {!canBid && (
          <div className="bidding-wait">Waiting for other players...</div>
        )}
      </div>
    </div>
  );
});

BiddingModal.propTypes = {
  biddingState: PropTypes.shape({
    currentBid: PropTypes.number.isRequired,
    currentBidder: PropTypes.number.isRequired,
    passedPlayers: PropTypes.arrayOf(PropTypes.number).isRequired,
    bidStatusByPlayer: PropTypes.object.isRequired,
    bidTimer: PropTypes.number.isRequired,
  }).isRequired,
  playerNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  userHand: PropTypes.arrayOf(
    PropTypes.shape({
      rank: PropTypes.string.isRequired,
      suite: PropTypes.string.isRequired,
    })
  ).isRequired,
  onPlaceBid: PropTypes.func.isRequired,
  onPassBid: PropTypes.func.isRequired,
};

export default BiddingModal;
