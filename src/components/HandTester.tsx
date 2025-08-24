import { useState } from "react";
import { sampleDiscardedCards, sampleHand } from "../data/testData";
import {
  getHandScore,
  getPointCardCount,
  getSuiteAnalysis,
  getSuiteCount,
  perSuiteScoreAndCard,
} from "../testing_framework/handAnalysisUtils";
import { Card } from "../types/game";
import { sortHand } from "../utils/cardUtils";
import { sampleHandAndDiscard } from "../utils/sampleHandGenerator";
import { SUITE_DATA } from "../utils/suiteUtils";
import { HandPreview } from "./game/HandPreview";
import { PlayingCard } from "./game/PlayingCard";

// Testing UI Component
export function HandTester() {
  const [hand, setHand] = useState<Card[]>(sampleHand);
  const [discardedCards, setDiscardedCards] =
    useState<Card[]>(sampleDiscardedCards);
  const [handSize, setHandSize] = useState<number>(10);
  const [discardSize, setDiscardSize] = useState<number>(8);

  const suiteAnalysis = getSuiteAnalysis(hand);
  const perSuiteData = perSuiteScoreAndCard(hand, discardedCards);
  console.log("perSuiteData", perSuiteData);

  const loadSampleData = () => {
    setHand(sortHand(sampleHand));
    setDiscardedCards(sortHand(sampleDiscardedCards));
  };

  const generateRandomDeck = () => {
    if (handSize + discardSize > 40) {
      alert(
        `Total cards (${handSize + discardSize}) cannot exceed deck size (40)`
      );
      return;
    }

    const { hand, discard } = sampleHandAndDiscard(handSize, discardSize);
    setHand(hand);
    setDiscardedCards(discard);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-felt-green-dark min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8 text-gold">
        Hand Preview Testing UI
      </h1>

      {/* Random Deck Generation Controls */}
      <div className="bg-felt-green rounded-lg border border-gold/20 p-3 mb-4 max-w-sm mx-auto">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <label htmlFor="handSize" className="text-xs text-foreground/70">
              Hand:
            </label>
            <input
              id="handSize"
              type="number"
              min="1"
              max="40"
              value={handSize}
              onChange={e => {
                const value = Math.max(
                  1,
                  Math.min(40, Number(e.target.value) || 1)
                );
                setHandSize(value);
              }}
              className="w-12 px-1 py-0.5 text-center bg-casino-black/30 border border-gold/30 rounded text-xs text-foreground"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="discardSize" className="text-xs text-foreground/70">
              Discard:
            </label>
            <input
              id="discardSize"
              type="number"
              min="1"
              max="40"
              value={discardSize}
              onChange={e => {
                const value = Math.max(
                  1,
                  Math.min(40, Number(e.target.value) || 1)
                );
                setDiscardSize(value);
              }}
              className="w-12 px-1 py-0.5 text-center bg-casino-black/30 border border-gold/30 rounded text-xs text-foreground"
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-foreground/60">
            {handSize + discardSize}/40 cards
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={generateRandomDeck}
              className="bg-felt-green text-foreground px-3 py-1.5 rounded border border-gold/20 hover:border-gold/50 transition-colors duration-200 text-sm font-medium"
            >
              Generate 🎲
            </button>
            <button
              onClick={loadSampleData}
              className="bg-felt-green text-foreground px-3 py-1.5 rounded border border-gold/20 hover:border-gold/50 transition-colors duration-200 text-sm font-medium"
            >
              Load Sample Data
            </button>
          </div>
        </div>
      </div>

      {/* Display the hand and discarded cards side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Current Hand */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            Current Hand:
          </h2>
          <HandPreview hand={hand} />
        </div>

        {/* Discarded Cards */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            Discarded Cards:
          </h2>
          <div className="bg-casino-black/20 rounded-xl p-4 border border-gold/20">
            {discardedCards.length > 0 ? (
              <div className="flex gap-1 justify-center flex-wrap">
                {discardedCards.map((card, idx) => (
                  <div
                    key={idx}
                    className="transform hover:scale-105 transition-transform duration-200"
                  >
                    <PlayingCard card={card} className="shadow-card -ml-6" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-foreground/50 italic py-8">
                No discarded cards
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Display suite analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {suiteAnalysis.map((suiteData, index) => (
          <div
            key={index}
            className="bg-felt-green rounded-lg border border-gold/20 p-4 shadow-card"
          >
            <h3 className="text-lg font-semibold mb-3 text-foreground">
              {SUITE_DATA[suiteData.suite].label}
            </h3>

            <div className="mb-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-foreground/70">Score: </span>
                <span className="font-bold text-lg text-gold">
                  {perSuiteData[suiteData.suite].score}
                </span>
              </div>

              {perSuiteData[suiteData.suite].card ? (
                <div className="bg-casino-black/30 rounded-lg border border-gold/30 p-3">
                  <div className="text-sm text-foreground/70 mb-2 text-center">
                    Best Card
                  </div>
                  <div className="flex justify-center">
                    <PlayingCard
                      card={perSuiteData[suiteData.suite].card as Card}
                      className="shadow-card"
                    />
                  </div>
                  <div className="text-center mt-2 text-sm text-foreground/70">
                    {perSuiteData[suiteData.suite].card?.hash}
                  </div>
                </div>
              ) : (
                <div className="text-center text-foreground/50 italic py-4">
                  No cards in this suite
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Hand and Discarded Cards Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Hand Statistics */}
        <div className="bg-felt-green rounded-lg border border-gold/20 p-6 shadow-card">
          <h3 className="text-xl font-semibold mb-4 text-foreground">
            Hand Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gold">{hand.length}</div>
              <div className="text-sm text-foreground/70">Total Cards</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gold">
                {getHandScore(hand)}
              </div>
              <div className="text-sm text-foreground/70">Total Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gold">
                {getSuiteCount(hand)}
              </div>
              <div className="text-sm text-foreground/70">Suites</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gold">
                {getPointCardCount(hand)}
              </div>
              <div className="text-sm text-foreground/70">Point Cards</div>
            </div>
          </div>
        </div>

        {/* Discarded Cards Statistics */}
        <div className="bg-felt-green rounded-lg border border-gold/20 p-6 shadow-card">
          <h3 className="text-xl font-semibold mb-4 text-foreground">
            Discarded Cards Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gold">
                {discardedCards.length}
              </div>
              <div className="text-sm text-foreground/70">Total Discarded</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gold">
                {getHandScore(discardedCards)}
              </div>
              <div className="text-sm text-foreground/70">Points Lost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gold">
                {getSuiteCount(discardedCards)}
              </div>
              <div className="text-sm text-foreground/70">Suites</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gold">
                {getPointCardCount(discardedCards)}
              </div>
              <div className="text-sm text-foreground/70">Point Cards</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
