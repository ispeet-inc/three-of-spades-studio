import React from "react";
import CardUI from "./pure_components/CardUI";
import "./SimpleUserHand.css";

/**
 * SimpleUserHand component - displays cards horizontally in a single line
 * @param {Object[]} cards - Array of card objects: { value: string, suit: string }
 */
export default function SimpleUserHand({ cards }) {
  return (
    <div className="simple-hand-container">
      <div className="simple-hand-box">
        {cards.map((card, idx) => (
          <div key={idx} className="card-wrapper">
            <CardUI value={card.value} suit={card.suit} />
          </div>
        ))}
      </div>
    </div>
  );
}
