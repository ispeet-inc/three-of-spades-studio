import React from "react";
import PropTypes from "prop-types";
import CardUI from "./CardUI";
import { suitSymbols } from "../utils/suiteUtils";
import "../css/BidResultModal.css";

const BidResultModal = React.memo(function BidResultModal({
  bidWinner,
  bidAmount,
  trumpSuite,
  teammateCard,
  playerNames,
  onClose,
}) {
  return (
    <div className="bid-trump-modal-overlay">
      <div className="bid-trump-modal bid-result-modal">
        <h2 className="bid-trump-title">Bidding Complete!</h2>
        <div className="bid-result-section">
          <div className="bid-result-winner">
            <b>{playerNames[bidWinner] || `Player ${bidWinner + 1}`}</b> won the
            bid!
          </div>
          <div className="bid-result-row">
            <span className="bid-result-label">Bid:</span> {bidAmount}
          </div>
          <div className="bid-result-row">
            <span className="bid-result-label">Trump:</span>{" "}
            <span className="bid-result-trump">{suitSymbols[trumpSuite]}</span>
          </div>
          <div className="bid-result-flex-row">
            <span className="bid-result-label">Teammate Card:</span>
            <CardUI card={teammateCard} mini />
          </div>
        </div>
        <button className="bid-trump-submit bid-result-btn" onClick={onClose}>
          Let's begin!
        </button>
      </div>
    </div>
  );
});

BidResultModal.propTypes = {
  bidWinner: PropTypes.number.isRequired,
  bidAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  trumpSuite: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  teammateCard: PropTypes.object.isRequired,
  playerNames: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default BidResultModal;
