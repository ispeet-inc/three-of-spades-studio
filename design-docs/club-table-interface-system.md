# Three of Spades — Product and Interface System

## Information Architecture

The redesign has one primary path and three supporting reference surfaces. Navigation remains shallow so every detail view has an obvious return to the table.

| Surface | Primary purpose | Principal action |
|---|---|---|
| **Start Table** | Choose name and match format; resume an interrupted series when available | Begin single game or four-game series |
| **Match Table** | Bid, choose trump and hidden partner, follow the trick, and understand the current contract | Take the current legal action |
| **Result Sheet** | Explain the outcome of one game and the movement in cumulative scores | Continue the series or return to the start table |
| **Series Record** | Resolve the four-game series and show the final ranking | Play another series |
| **Rules Book** | Teach setup, bidding, partner selection, play, scoring, strategy, and card values | Return to the previous context |
| **Statistics Ledger** | Review aggregate play history without competing with active gameplay | Close and return |
| **Settings Sheet** | Control guidance, sound, haptics where supported, and reduced presentation | Save and return |

Private rooms are a future entry path into the same Match Table. P1 may show the structural destination in the start interface, but it must not pretend that networking is live.

## Stage-to-Surface Mapping

| Engine stage | Center-table subject | Compact match-status emphasis | Guidance subject |
|---|---|---|---|
| `INIT` | Start Table | Prior series or concise rules access | Match formats and expected duration |
| `DISTRIBUTE_CARDS` | Deal motion and player positions | Game mark and starting player | What happens after the deal |
| `BIDDING` | Auction record plus bid controls | Current high bid and active bidder | Legal bid range, pass consequence, and hand-reading prompt |
| `BIDDING_COMPLETE` | Closed auction record | Contract owner | Transition to contract setup |
| `TRUMP_SELECTION` | Suit selection and hidden-partner card | Bidder and bid amount | Trump role and partner-card tradeoff |
| `TRUMP_SELECTION_COMPLETE` | Partner mark, contract card, and trump | Complete contract line | Hidden teammate explanation |
| `PLAYING` | Current four-card trick | Contract, tricks, team state, and game score | Turn, running suit, and legal-card explanation |
| `CARDS_DISPLAY` | Completed trick | Trick winner | Why the trick was won |
| `TRICK_COMPLETE` | Cleared trick and next leader | Updated trick register | Next lead and contract progress |
| `GAME_OVER` | Single-game result sheet | Final contract result | Scoring explanation |
| `GAME_SUMMARY` | Between-game score sheet | Cumulative series position | Next starting player and continuation |
| `SERIES_SUMMARY` | Final series record | Complete four-game register | Ranking and next series action |

## App Composition

```text
App
├── StartTable
│   ├── BrandLockup
│   ├── PlayerNameField
│   ├── MatchFormatSelector
│   ├── ResumeSeriesNotice
│   └── ReferenceActions
├── MatchShell
│   ├── CompactMatchStatus
│   │   ├── GameMark
│   │   ├── ContractLine
│   │   └── MatchDetailsTrigger
│   ├── GameTable
│   │   ├── OpponentSeat × 3
│   │   ├── CircularAuction | TrickCenter | RevealStage
│   │   ├── ContextualGuidance
│   │   └── PlayerHand
│   ├── TransientPhaseControls
│   └── MatchDetailsOverlay
│       ├── SeriesRegister
│       ├── ScoreRows
│       ├── TrickHistory
│       └── MatchActions
├── RulesBook
├── StatisticsLedger
├── SettingsSheet
└── ResultSheet
```

## Design Tokens

### Color

The CSS implementation uses OKLCH variables so tonal relationships remain predictable in Tailwind 4.

| Token | Approximate OKLCH | Role |
|---|---|---|
| `--table` | `oklch(0.34 0.07 160)` | Signature green play surface |
| `--table-deep` | `oklch(0.24 0.05 160)` | Outer frame and deep wells |
| `--table-lift` | `oklch(0.42 0.07 160)` | Active seat and hover surface |
| `--ivory` | `oklch(0.95 0.025 80)` | Cards, sheets, and light text |
| `--ivory-aged` | `oklch(0.87 0.03 80)` | Quiet paper and disabled surfaces |
| `--ink` | `oklch(0.25 0.01 100)` | Light-surface text |
| `--brass` | `oklch(0.71 0.08 80)` | Contract, focus, progress, primary action |
| `--brass-light` | `oklch(0.81 0.085 80)` | Small high-contrast highlight |
| `--oxblood` | `oklch(0.51 0.14 30)` | Red suits, failure, destructive actions |
| `--chalk` | `oklch(0.92 0.02 100)` | Primary text on green |

### Typography

| Token | Family | Use |
|---|---|---|
| `--font-display` | Fraunces | Wordmark, major score, reveal, and result headings |
| `--font-interface` | DM Sans | Controls, guidance, labels, and body copy |
| `--font-notation` | IBM Plex Mono | Bids, scores, timers, game marks, and trick history |

Major in-game headings remain between 30 and 52 px on desktop. The player’s next action is never communicated through an oversized title. Interface copy targets 14–16 px; essential phone-landscape labels do not drop below 12 px.

### Geometry and Depth

| Token | Value | Use |
|---|---:|---|
| `--radius-card` | `8px` | Physical playing cards only |
| `--radius-control` | `4px` | Buttons, fields, and sheets |
| `--radius-table` | `18px` | Outer physical table frame |
| `--rule` | `1px` | Brass and ivory dividers |
| `--shadow-card` | layered soft shadow | Lifted playable cards |
| `--shadow-sheet` | short dark offset | Ivory result and settings sheets |
| `--shadow-inset` | deep green inset | Table well and compact match surfaces |

Rounded rectangles are not the default container. Open regions, rules, edge changes, and material contrast establish hierarchy.

### Spacing

The base unit is 4 px. Repeated controls use 8, 12, and 16 px rhythm. Major regions use 24, 32, and 48 px. No persistent information surface may reserve horizontal table width. Compact corner status should remain within approximately 220–260 px; expanded records appear as overlays above the unchanged game geometry.

## Responsive Composition

| Condition | Composition |
|---|---|
| **Wide desktop, ≥ 1280 px** | Full-viewport spatial table; generous hand fan; compact upper-left match status; details open as a floating overlay |
| **Compact desktop/tablet landscape, 900–1279 px** | Same cardinal anchors with proportional tightening; compact status and transient lower-right controls remain at the edges |
| **Phone landscape, height ≤ 540 px** | Same hierarchy with compressed opponent hands, protected card size, a thin match-status trigger, and full-screen match details on demand |
| **Portrait, width < 760 px** | Rotation recommendation plus functional stacked table; only essential contract and score remain in compact chrome; references open full-screen |

The interface must never scale the entire desktop composition down. It changes information strategy: secondary score history moves behind the match-details trigger, card size is protected, and the current action keeps a 44 px minimum target.

### Geometry Preservation

The production table is the spatial source of truth. Bottom, left, top, and right seats remain anchored to the corresponding viewport edges; viewer rotation changes player identity, not the geometry. The center instrument remains centered throughout bidding and play. The human hand remains centered along the bottom edge, and bidding controls remain transient at lower right. Opening match details must never resize, shift, or reflow the underlying table.

## Interaction States

### Playing Card

| State | Presentation |
|---|---|
| **Playable** | Full ivory, readable suit, quiet shadow, 6–10 px lift on hover/focus |
| **Selected** | Brass outline, stronger lift, concise accessible label |
| **Unavailable** | Lower saturation and elevation; still fully legible; cursor and semantics communicate disabled state |
| **Played** | Travels from the originating cardinal seat or bottom hand into its corresponding center slot, then becomes static |
| **Collected** | After a brief winner hold, all four cards travel approximately 280 px toward the winning cardinal seat before clearing |
| **Back** | Generated green-and-brass card-back artwork; no per-card animation loop |

### Player Seat

The active seat receives a short brass rule and a brighter name. The bid winner receives a contract mark. Teammate state uses the split-spade partner mark only after revelation. Connection and bot metadata occupy a quiet mono label and do not change the main hierarchy.

### Controls

Primary actions use brass fill on deep green or deep-green fill on ivory. Secondary actions are transparent with strengthened rules. Destructive or exit actions use text and outline first; oxblood fill is reserved for confirmed destructive choices. Every control has hover, active, focus-visible, disabled, loading, success, and error behavior.

## Progressive Guidance Framework

### Modes

| Mode | Behavior |
|---|---|
| **Full** | Explains each new phase, defines the current legal action, and provides one strategic prompt |
| **Contextual** | Appears only for rule constraints, unusual states, or after an invalid attempt |
| **Off** | Hides instructional copy while preserving required turn and error feedback |

The preference persists locally. Full is the initial default. A player can change mode from the Match Details overlay or Settings Sheet at any time.

### Hint Anatomy

A hint contains a concise title, one sentence of explanation, and—only when useful—one direct rule link. It never becomes a modal during live play.

> **Follow the lead suit.** Diamonds were led, so play a diamond while you still hold one.

### Trigger Order

1. A new phase can introduce one concept.
2. The current turn can explain the legal action.
3. An invalid attempt replaces the generic hint with the precise reason.
4. Repeatedly acknowledged hints downgrade from Full to Contextual presentation.
5. Critical errors remain visible regardless of guidance mode.

### Initial Hint Set

| Context | Full-mode guidance |
|---|---|
| Series selection | “A series is four complete games. Scores carry forward and teams may change each game.” |
| Bidding begins | “Bid for the right to choose trump and name the card that identifies your hidden partner.” |
| Considering a pass | “Passing removes you from this auction. You will still play the hand.” |
| Trump selection | “Trump can win a trick when you cannot follow the lead suit—or when trump has already been led.” |
| Partner-card selection | “Choose a card you do not hold. Whoever holds it becomes your teammate when they play it.” |
| Opening trick | “Follow the suit that was led whenever you can. Otherwise, any card is legal.” |
| Invalid card attempt | “Diamonds were led, and you still hold a diamond. Choose one of the highlighted cards.” |
| Teammate reveal | “Your partner is now known. The contract remains shared for the rest of this game.” |
| Game result | “The contract succeeded. The bidder receives the contract bonus; the partner receives the bid value.” |
| Series transition | “Scores carry forward. The next game begins with a different starting player.” |

## Motion and Feedback

Frequent interactions complete within 120–240 ms. Sheets and compact drawers complete within 280 ms. Motion uses transform and opacity, follows a strong ease-out curve, and can be interrupted. The original semantic paths are non-negotiable: dealing resolves toward final seat or hand anchors; a played card enters the center from its originating edge; the completed trick holds long enough to read the winner; collection moves all cards toward the winning seat before state cleanup.

Card play should use approximately 180–240 ms. Winner emphasis should hold without looping. Collection may use 650–800 ms because its travel communicates who takes the trick. The teammate reveal may join the split-spade mark within 280 ms. A game result introduces one score slip. A series victory is the only event permitted a slower 420–520 ms composition change. Reduced-motion mode replaces spatial travel with short fades while retaining the same event order and immediate state visibility.

Success and error feedback remain adjacent to the responsible control or guidance line. Toasts are reserved for global conditions such as state restoration or connection status; they are not used for ordinary game rules.

## Accessibility Contract

The player hand is keyboard navigable with arrow keys, Home, End, and Enter/Space. Focus order follows compact match status, table context, current action, hand, and secondary actions. Opening Match Details moves focus into the overlay and returns it to its trigger on close. Visual table position is never the only identifier; assistive labels name each player and relative seat.

Suit is communicated by symbol and spoken name, never color alone. Scores use tabular numerals. Focus-visible treatment uses a two-layer ivory and brass outline with at least 3 px apparent thickness against both green and ivory surfaces. All current-action controls meet a 44 px minimum target.

Live regions announce turn changes, accepted bids, contract creation, invalid choices, trick winners, teammate reveal, and results without repeating static table content. Dialogs trap focus, have a visible close route, return focus to the trigger, and support Escape unless an irreversible game action is awaiting confirmation.

## Content Rules

Copy is concise and calm. Labels use real game terminology, with a plain-language explanation available at first use. Bot names may retain personality, but interface copy never speaks on their behalf. Competitive language is grounded in the contract and series rather than generic battle rhetoric.

Every surface must answer three questions without searching: **What is happening? What matters now? What can I do next?**

## Acceptance Checklist

| Area | Requirement |
|---|---|
| Current action | One action is visually and semantically primary |
| Contract | Bidder, amount, trump, and teammate state remain available through compact match status or on-demand details |
| Series | Current game and cumulative scores remain accessible without resizing or navigating away from the table |
| Hand | Card values remain readable; legal choices are clear without relying on color |
| Guidance | Hints never cover cards and can be changed among Full, Contextual, and Off |
| Responsive | Desktop and phone landscape protect card size and action targets; portrait remains functional |
| Navigation | Rules, statistics, settings, and result views always return to the prior context |
| Feedback | Loading, empty, success, recoverable error, and fatal error states are designed |
| Motion | Frequent UI motion stays under 300 ms; semantic play and collection paths preserve origin, destination, winner direction, and reduced-motion equivalents |
| Brand | Table Green, Warm Ivory, and Muted Brass remain consistent; casino and esports clichés are absent |
