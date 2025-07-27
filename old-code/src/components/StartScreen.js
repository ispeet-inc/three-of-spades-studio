import React from "react";
// import CardUI from '../pure_components/CardUI';
import Card from "../foundational_components/Card";
import Button from "../foundational_components/Button";
import createCard from "../classes/Card";
import Suite from "../classes/Suite";
import "../css/StartScreen.css";

function StartScreen({ onStartGame, onStartGamev2 }) {
  const logoCard = createCard(Suite.SPADE, 3);

  return (
    <div className="start-game-container">
      <div className="game-logo">
        <Card card={logoCard} className="start-card" />
      </div>
      <h1 className="game-title">Three of Spades</h1>
      <Button
        onClick={onStartGame}
        size="large"
        fullWidth={false}
        className="start-button"
      >
        Start Game
      </Button>
      <Button
        onClick={onStartGamev2}
        size="large"
        fullWidth={false}
        className="start-button"
      >
        Try Beta version!
      </Button>
      <div className="game-tagline">Bid smart. Play bold. Win big.</div>
    </div>
  );
}

export default StartScreen;
