import React, { useState } from "react";
import PropTypes from "prop-types";
import "../css/TrumpSelectionModal.css";
import Suite from "../classes/Suite";
import CardUI from "../pure_components/CardUI";
import { getTeammateOptions } from "../utils/gameUtils";
import { SUITES } from "../utils/suiteUtils";

const TrumpSelectionModal = React.memo(function TrumpSelectionModal({
  onSubmit,
  userHand,
}) {
  const [suite, setSuite] = useState("");
  const [error, setError] = useState("");
  const [teammateSuiteTab, setTeammateSuiteTab] = useState(Suite.SPADE);
  const [teammateCard, setTeammateCard] = useState(null);

  // Get teammate card options using util
  const teammateOptions = getTeammateOptions(userHand, teammateSuiteTab);

  const validate = () => {
    if (suite === "" || suite === null) {
      setError("Please select a trump suite.");
      return false;
    }
    if (!teammateCard) {
      setError("Please select a teammate card.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ trumpSuite: Number(suite), teammateCard });
    }
  };

  return (
    <div className="bid-trump-modal-overlay">
      <div className="bid-trump-modal">
        {/* Mini hand display with overlap/fan */}
        <div className="mini-hand-display-overlap">
          {userHand.map((card, idx) => {
            const overlap = 40; // px to overlap each card
            const marginLeft = idx === 0 ? "0px" : `${-overlap}px`;
            return (
              <span
                key={idx}
                className="mini-hand-card-wrapper-overlap"
                style={{
                  marginLeft,
                  zIndex: idx,
                  // transform: `rotate(${rotate}deg) translateY(${curve}px)`
                }}
              >
                <CardUI card={card} />
              </span>
            );
          })}
        </div>
        <h2 className="bid-trump-title">Choose Trump & Teammate Card</h2>
        <form onSubmit={handleSubmit}>
          <div className="suite-select-group">
            <label>Trump Suite</label>
            <div className="suite-options">
              {SUITES.map((s) => (
                <button
                  type="button"
                  key={s.value}
                  className={`suite-btn${
                    suite === String(s.value) ? " selected" : ""
                  }`}
                  onClick={() => setSuite(String(s.value))}
                  aria-label={s.label}
                >
                  <span className="suite-icon">{s.icon}</span>
                  <span className="suite-label">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="teammate-card-group">
            <label>Choose Teammate Card</label>
            <div className="teammate-suite-tabs">
              {SUITES.map((s) => (
                <button
                  type="button"
                  key={s.value}
                  className={`teammate-suite-tab${
                    teammateSuiteTab === s.value ? " selected" : ""
                  }`}
                  onClick={() => setTeammateSuiteTab(s.value)}
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
            <div className="teammate-card-grid">
              {teammateOptions.map((card) => {
                const isSelected =
                  teammateCard &&
                  card.suite === teammateCard.suite &&
                  card.number === teammateCard.number;
                return (
                  <button
                    type="button"
                    key={`${card.suite}-${card.number}`}
                    className={`teammate-card-btn${
                      isSelected ? " selected" : ""
                    }`}
                    onClick={() =>
                      setTeammateCard({
                        suite: card.suite,
                        number: card.number,
                      })
                    }
                  >
                    <CardUI card={card} />
                  </button>
                );
              })}
            </div>
          </div>
          {error && <div className="bid-trump-error">{error}</div>}
          <button
            type="submit"
            className="bid-trump-submit"
            disabled={suite === "" || !teammateCard || !!error}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
});

TrumpSelectionModal.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  userHand: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      suite: PropTypes.number.isRequired,
      number: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default TrumpSelectionModal;
