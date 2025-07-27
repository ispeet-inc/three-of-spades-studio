import createCard from "../classes/Card";
import Suite from "../classes/Suite";

// --- Sample card data for demonstration ---
// In a real game, replace with actual player hands and played cards from game state.
export const sampleHand = [
  createCard(Suite.HEART, 9),
  createCard(Suite.DIAMOND, 8),
  createCard(Suite.CLUB, 4),
  createCard(Suite.HEART, 10),
  createCard(Suite.SPADE, 6),
];

// --- Player info (names, colors, etc.) ---
export const player_info = [
  {
    pos: "bottom",
    name: "You",
    score: 0,
    color: "#ffe082",
    handDirection: "hand-horizontal-v2",
  },
  {
    pos: "left",
    name: "Charlie",
    score: 0,
    color: "#90caf9",
    handDirection: "hand-vertical-v2",
  },
  {
    pos: "top",
    name: "Marie",
    score: 0,
    color: "#ffab91",
    handDirection: "hand-horizontal-v2",
  },
  {
    pos: "right",
    name: "Jim",
    score: 0,
    color: "#a5d6a7",
    handDirection: "hand-vertical-v2",
  },
];

export const overrideTableCards = [
  {
    suite: 3,
    number: 13,
    id: "K",
    rank: 13,
    points: 10,
    positionValue: 313,
    hash: "3,13",
    player: 0,
  },
  {
    suite: 3,
    number: 1,
    id: "A",
    rank: 14,
    points: 10,
    positionValue: 314,
    hash: "3,1",
    player: 1,
  },
  {
    suite: 3,
    number: 5,
    id: 5,
    rank: 5,
    points: 5,
    positionValue: 305,
    hash: "3,5",
    player: 2,
  },
  {
    suite: 3,
    number: 12,
    id: "Q",
    rank: 12,
    points: 10,
    positionValue: 312,
    hash: "3,12",
    player: 3,
  },
];

// const overrideTableCards2 = [
//   {
//     suite: 0,
//     number: 1,
//     id: "A",
//     rank: 14,
//     points: 10,
//     positionValue: 14,
//     hash: "0,1",
//     player: 1,
//   },
//   {
//     suite: 0,
//     number: 7,
//     id: 7,
//     rank: 7,
//     points: 0,
//     positionValue: 7,
//     hash: "0,7",
//     player: 2,
//   },
//   {
//     suite: 0,
//     number: 5,
//     id: 5,
//     rank: 5,
//     points: 5,
//     positionValue: 5,
//     hash: "0,5",
//     player: 3,
//   },
// ];
