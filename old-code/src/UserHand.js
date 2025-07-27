import React from "react";
import CardUI from "./pure_components/CardUI";
import "./UserHand.css";

// const userCards = [
//   { value: '4', suit: '♣' },
//   { value: '6', suit: '♠' },
//   // { value: 'Q', suit: '♥' },
//   // { value: '2', suit: '♦' },
//   // { value: 'K', suit: '♥' },
//   // { value: '7', suit: '♦' },
//   // { value: 'A', suit: '♠' },
// ];
/**
 * UserHand component
 * @param {Object[]} cards - Array of card objects: { value: string, suit: string }
 */
export default function UserHand({ cards }) {
  const total = cards.length;
  const maxFan = 40; // total degrees to fan
  const maxCurve = 18; // max px to curve
  const overlap = 40; // px to overlap each card

  return (
    <div className="user-hand-container">
      {cards.map((card, idx) => {
        // Fan: -maxFan/2 to +maxFan/2
        const rotate =
          total === 1 ? 0 : -maxFan / 2 + (maxFan / (total - 1)) * idx;
        // Curve: middle card is lowest, outer cards are higher
        const curve =
          total === 1
            ? 0
            : -Math.pow((idx - (total - 1) / 2) / ((total - 1) / 2), 2) *
                maxCurve +
              maxCurve;
        return (
          <div
            key={idx}
            className="card-wrapper"
            style={{
              marginLeft: idx === 0 ? 0 : -overlap,
              zIndex: idx,
              transform: `rotate(${rotate}deg) translateY(${curve}px)`,
              transition: "transform 0.2s",
            }}
          >
            <CardUI value={card.value} suit={card.suit} />
          </div>
        );
      })}
    </div>
  );
}
