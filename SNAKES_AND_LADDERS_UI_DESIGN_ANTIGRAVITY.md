# Snakes & Ladders — UI Design + Development Specification
## Antigravity-ready implementation brief

**Document purpose:** This file is the single implementation brief for designing and building the Snakes & Ladders web app. Give this entire document to Google Antigravity as the project instruction.

**Product:** Mobile-first Snakes & Ladders web app  
**Primary experience:** Play quickly on a phone, either locally with friends/family or online with other players  
**Design direction:** Cheerful, polished, playful, modern, accessible, and easy to understand  
**Implementation approach:** Build a complete local-play MVP first. Add online multiplayer only after the local game is reliable.

---

# 1. Instructions to Antigravity

Act as a senior product designer and senior full-stack engineer.

Do not create a generic dashboard or a plain board-game website. Design a distinctive, production-quality casual game experience.

Before coding:
1. Inspect the existing repository and preserve working functionality.
2. Identify the framework, package manager, and existing game logic.
3. If this is a new project, use the stack in this document.
4. Create a short implementation plan and a screen/component checklist.
5. Build the responsive UI and the playable game together; do not deliver static mock screens only.
6. Use reusable components, typed data models, and clear separation between game rules, UI, and multiplayer services.
7. Run the project, test the important flows, fix console/build errors, and verify phone-sized layouts.
8. Do not leave non-functional buttons, fake online status, placeholder links, or decorative controls that look interactive.
9. Do not claim online multiplayer works until two separate browser sessions can join and play the same room.
10. If a backend feature is not configured, show a clear setup state rather than pretending it is connected.

**Priority order:** usability → correct game rules → responsive layout → visual polish → animation → online features.

---

# 2. Product and UX goals

The app should let a first-time player understand how to start a game within a few seconds.

Core goals:
- Start a game without creating an account.
- Support 2–4 players.
- Offer local pass-and-play mode.
- Make the board and current player easy to understand on a small screen.
- Show dice results, token movement, snakes, ladders, and turns clearly.
- Prevent invalid moves and accidental repeated dice rolls.
- Provide a satisfying winner screen and a quick rematch.
- Support installable PWA behavior where practical.
- Keep the interface lightweight and fast on average Android phones.

## Default product decisions

- Board: 10 × 10, numbered 1–100 in the standard zigzag pattern.
- Players: 2–4.
- Dice: one six-sided die.
- Start rule: a player must roll a 6 to enter the board at square 1. After entering, normal movement applies. If the existing game already has a different agreed rule, preserve that rule and make it configurable.
- Finish rule: exact roll required to land on square 100. If a roll exceeds 100, the player stays in place.
- Snakes and ladders: data-driven configuration, not hard-coded into UI.
- Local mode: guest-friendly; no sign-in required.
- Online mode: design for private rooms and matchmaking, but implement only after local MVP is stable.

---

# 3. Visual design concept

## Theme: “Playful Adventure”

Create a bright, friendly board-game world with a premium mobile-game feel. It should feel welcoming to children and adults without looking childish or cluttered.

### Visual characteristics
- Soft, warm background with subtle gradients.
- A strong primary color for actions.
- Distinct player colors with accessible contrast.
- Rounded cards and controls.
- Large, readable typography.
- Board squares with subtle alternating colors.
- Snakes illustrated as friendly characters; ladders clean and instantly recognizable.
- Tokens with clear player initials or numbers.
- Short, purposeful animations; avoid excessive motion.
- Use shadows sparingly to create depth.
- Avoid dense grid-line decoration, overly glossy effects, and excessive glassmorphism.

### Suggested palette

Use CSS variables so the palette can be changed centrally.

| Token | Suggested value | Usage |
|---|---|---|
| `--color-bg` | `#FFF8EF` | Main app background |
| `--color-surface` | `#FFFFFF` | Cards and panels |
| `--color-primary` | `#6558E8` | Main actions |
| `--color-primary-dark` | `#4C40C7` | Hover/pressed |
| `--color-accent` | `#FFB84D` | Dice/highlights |
| `--color-success` | `#36B879` | Ladders/success |
| `--color-danger` | `#F06B6B` | Snakes/warnings |
| `--color-text` | `#25233A` | Primary text |
| `--color-muted` | `#77758A` | Secondary text |
| `--color-board-a` | `#F4E9D8` | Board cell A |
| `--color-board-b` | `#FFFDF8` | Board cell B |
| `--color-border` | `#E9E2D9` | Subtle borders |

These are starting values, not rigid requirements. Validate contrast and visual harmony during implementation.

### Typography
- Use a friendly sans-serif such as Inter, Nunito, or a locally available system fallback.
- Use bold weights for headings and game status.
- Use tabular numerals for dice, scores, and square numbers.
- Avoid tiny text. Important mobile labels should generally be at least 14px.

### Shape and spacing
- Cards: 18–24px radius.
- Buttons: 14–18px radius; pill shape only for compact chips.
- Use a consistent spacing scale based on 4px.
- Touch targets: aim for at least 44 × 44px.
- Use visible focus states for keyboard users.

---

# 4. Information architecture

Main navigation should remain simple.

1. **Home**
   - Brand/logo
   - Play Now
   - Play with Friends
   - How to Play
   - Settings
2. **Game Setup**
   - Local game / Online game
   - Player count
   - Player names and colors
   - Start game
3. **Game Room**
   - Board
   - Player status
   - Dice
   - Turn message
   - Game actions
4. **Results**
   - Winner
   - Final player order
   - Play Again
   - Home
5. **How to Play**
   - Rules and visual examples
6. **Settings**
   - Sound on/off
   - Reduced motion
   - Theme preference if implemented

For small screens, use a compact header and avoid a permanent desktop-style sidebar.

---

# 5. Screen-by-screen UI requirements

## 5.1 Home screen

### Desktop layout
- Centered content area with a comfortable maximum width.
- Brand mark and title near the top.
- Large hero section with a visual preview of the board.
- Primary action: **Play Now**.
- Secondary action: **Play with Friends**.
- Smaller links: How to Play and Settings.
- A compact “How it works” section may appear below the hero.

### Mobile layout
- Single-column layout.
- Logo/title at the top.
- Board illustration or compact game preview.
- Large full-width Play Now button.
- Secondary Play with Friends button.
- How to Play and Settings as simple text/icon actions.
- Keep the first action visible without excessive scrolling.

### Home screen behavior
- Play Now opens Game Setup in local mode.
- Play with Friends opens the online entry screen. If online service is not configured, show a clear “Coming soon / setup required” state and keep local play available.
- How to Play opens the rules screen or dialog.
- Settings opens the settings panel.

## 5.2 Game setup screen

### Layout
- Back navigation.
- Page title: “Set up your game”.
- Mode selector: Local Game / Online Game.
- Player count selector: 2, 3, or 4.
- Player name fields.
- Player color selection with four distinct colors.
- Start Game button.

### Interaction
- Default to 2 players.
- Default names: Player 1, Player 2, etc.
- Names must be trimmed and limited to a reasonable length (e.g. 16 characters).
- Prevent duplicate colors where possible.
- Validate player count and names.
- Keep setup state if the user goes back and returns.

### Online setup state
For a future online release, design the following states:
- Create private room.
- Join with room code.
- Waiting room with player slots.
- Host start action.
- Copy room code action.
- Connection/reconnection status.
Do not show these as operational until backend room creation and synchronization are implemented.

## 5.3 Game screen — main priority

This is the most important screen. The board must remain readable and playable on a typical phone in portrait orientation.

### Mobile layout order
1. Compact top bar: Home/Exit, game title or room code, sound control.
2. Current-turn status: “Rajendra’s turn”.
3. Board: square, centered, as large as available width allows.
4. Dice and roll action.
5. Player strip/cards with current position and turn status.
6. Optional move/activity message.

The board should take visual priority. Avoid putting large player cards above the board on mobile.

### Desktop layout
- Center the board in the main content area.
- Place player cards and game status in a side panel.
- Keep the dice control near the board or in the side panel.
- Ensure the layout does not stretch the board cells into rectangles.

### Board requirements
- Exactly 100 cells in a 10 × 10 arrangement.
- Standard zigzag numbering:
  - Bottom row: 1 to 10 from left to right.
  - Next row: 11 to 20 from right to left.
  - Continue alternating direction until 100.
- Show square numbers clearly.
- Use alternating cell backgrounds with sufficient contrast.
- Show snake and ladder artwork without hiding square numbers.
- Show tokens clearly when multiple players occupy the same square.
- Use responsive square sizing: the board must always remain a perfect square.
- Avoid relying only on color to communicate player identity; add initials, numbers, or shapes.
- Provide a legend or clear visual distinction between snakes and ladders.

### Tokens
- Each player has a unique color.
- Tokens should be circular or character-like with a clear outline.
- When multiple tokens occupy one square, arrange them in a compact cluster without obscuring the square number.
- Animate movement cell by cell or with a clear short path.
- Keep token position synchronized with the actual game state.

### Dice area
- Large dice face with values 1–6.
- Roll Dice button with clear enabled/disabled states.
- While rolling or moving, disable repeated input.
- Display the result in text for accessibility, e.g. “You rolled a 4”.
- Add a short roll animation, but keep the final value stable and readable.
- If sound is enabled, play a subtle roll/move sound. Sound must be optional.

### Turn and event messages
Examples:
- “Player 1’s turn”
- “You need a 6 to start”
- “Rolled 5 — move to 18”
- “Ladder! Climb from 14 to 31”
- “Snake! Slide from 47 to 22”
- “One step away from the finish!”
- “Player 2 wins!”

Messages should be short and placed consistently. Do not rely on color alone.

### Exit/pause
- Exit action should open a confirmation dialog if a game is in progress.
- Options: Continue Playing / Exit Game.
- Do not accidentally reset the game when a user taps the home icon.

## 5.4 Winner/results screen

- Celebrate the winner with a concise animation or confetti effect.
- Show winner name and player color.
- Show final positions/rankings if relevant.
- Primary action: Play Again.
- Secondary action: Back to Home.
- Respect reduced-motion settings.
- Ensure the screen is still usable if animation is disabled or fails.

## 5.5 How to Play screen

Explain rules in simple steps with small visual illustrations:
1. Choose 2–4 players.
2. Roll the dice.
3. Roll a 6 to enter if the selected rule requires it.
4. Move forward according to the dice.
5. Climb ladders.
6. Slide down snakes.
7. Reach square 100 with the required finish rule to win.

Include a clear note if the app uses exact-roll-to-finish and six-to-start rules.

## 5.6 Settings

Initial settings:
- Sound effects: On/Off.
- Reduced motion: System / On / Off.
- Theme: Light initially; dark theme is optional.
- Reset preferences.

Persist non-sensitive preferences locally.

---

# 6. Responsive behavior

Design mobile-first, then expand for tablet and desktop.

### Breakpoints
Use the framework's responsive utilities or a consistent equivalent:
- Small: below 640px.
- Medium: 640px–1023px.
- Large: 1024px and above.

### Rules
- No horizontal page scrolling at 320px viewport width.
- Board width must be `min(100%, available width)` and aspect ratio 1:1.
- Use CSS Grid for the 10 × 10 board.
- Use `min-width: 0` on flex/grid children where needed.
- Keep action buttons reachable near the board.
- On landscape mobile, allow a compact side-by-side layout if it improves board size.
- Test at 320px, 360px, 390px, 430px, 768px, 1024px, and 1440px.
- Account for safe-area insets on supported mobile browsers.
- Prevent dialogs and bottom controls from being hidden behind browser UI.

---

# 7. Motion and sound design

Use Framer Motion or CSS animations for small, purposeful feedback.

### Required motion
- Home hero: subtle entrance.
- Screen transitions: short fade/slide.
- Dice: brief roll animation.
- Token: move along the route in sequence.
- Ladder: upward movement feedback.
- Snake: downward movement feedback.
- Winner: short celebration.

### Motion rules
- Never delay a player's turn with long animations.
- Avoid animations that cause layout shifts.
- Keep motion smooth on mid-range Android devices.
- Support `prefers-reduced-motion`.
- Provide a settings override for reduced motion.
- Do not autoplay loud audio.
- Sound effects must be optional and default to a reasonable volume.

---

# 8. Component architecture

Create reusable components. Suggested structure:

```text
src/
  app/
    page.tsx
    game/
      setup/page.tsx
      local/page.tsx
      online/page.tsx
      result/page.tsx
    how-to-play/page.tsx
    settings/page.tsx
    globals.css
  components/
    layout/
      AppHeader.tsx
      PageContainer.tsx
      MobileActionBar.tsx
    home/
      HomeHero.tsx
      ModeCard.tsx
    setup/
      ModeSelector.tsx
      PlayerCountSelector.tsx
      PlayerForm.tsx
      ColorPicker.tsx
    game/
      GameBoard.tsx
      BoardCell.tsx
      BoardArtwork.tsx
      PlayerToken.tsx
      Dice.tsx
      RollButton.tsx
      TurnIndicator.tsx
      PlayerStatusCard.tsx
      PlayerStatusList.tsx
      GameEventMessage.tsx
      ExitGameDialog.tsx
    result/
      WinnerPanel.tsx
      FinalRanking.tsx
    common/
      Button.tsx
      Dialog.tsx
      IconButton.tsx
      Toast.tsx
      LoadingState.tsx
  lib/
    game/
      board.ts
      rules.ts
      engine.ts
      types.ts
      validation.ts
    storage/
      preferences.ts
      local-game.ts
    multiplayer/
      client.ts
      rooms.ts
      sync.ts
  hooks/
    useGame.ts
    useSound.ts
    useReducedMotion.ts
  public/
    images/
    sounds/
```

Adapt this structure to the existing repository rather than forcing a rewrite.

## Component responsibilities
- `GameBoard`: renders the 100 cells and board-level artwork.
- `BoardCell`: renders one square and its number.
- `PlayerToken`: renders one player's marker.
- `Dice`: displays the current dice value and animation state.
- `RollButton`: triggers the validated roll action.
- `TurnIndicator`: shows whose turn it is.
- `PlayerStatusList`: shows all players and their positions.
- `GameEventMessage`: communicates the latest game event.
- `useGame`: connects UI actions to the game engine.
- `engine.ts`: contains deterministic game rules and state transitions; no React code.

---

# 9. Game state and rules contract

Use typed data models. Suggested TypeScript types:

```ts
export type PlayerId = string;

export interface Player {
  id: PlayerId;
  name: string;
  color: string;
  position: number; // 0 means not yet entered; 1–100 are board squares
  hasEntered: boolean;
  isWinner: boolean;
}

export interface GameConfig {
  playerCount: 2 | 3 | 4;
  requireSixToStart: boolean;
  exactRollToFinish: boolean;
  snakes: Record<number, number>;
  ladders: Record<number, number>;
}

export interface GameState {
  id: string;
  players: Player[];
  currentPlayerIndex: number;
  diceValue: number | null;
  status: "setup" | "playing" | "finished";
  winnerId: PlayerId | null;
  lastEvent: string | null;
  isRolling: boolean;
  turnNumber: number;
}
```

Implement pure functions such as:

```ts
getBoardNumber(row: number, col: number): number;
getCellCoordinates(position: number): { row: number; col: number };
rollDice(random?: () => number): number;
getNextPosition(position: number, dice: number, config: GameConfig): number;
applySnakesAndLadders(position: number, config: GameConfig): {
  position: number;
  event: "snake" | "ladder" | null;
  from: number;
  to: number;
};
takeTurn(state: GameState, diceValue: number): GameState;
getNextPlayerIndex(state: GameState): number;
```

### Rule safeguards
- Validate the active player before applying a move.
- Do not allow a second roll while a roll/move is being processed.
- Do not allow turns after the game is finished.
- Do not mutate the previous state object.
- Use injectable randomness in tests.
- Ensure the board numbering algorithm is tested for all 100 cells.
- Ensure snakes point downward and ladders point upward.
- Prevent a move beyond 100 when exact-roll-to-finish is enabled.
- Define whether rolling a 6 grants another turn; make it an explicit configurable rule. Default: no extra turn unless the product owner confirms otherwise.
- Define the behavior when a player rolls a 6 to enter and has remaining movement; document and test the selected rule. Default: entering places the token on square 1 and ends the turn, unless the existing game already defines a different rule.

Keep the rules in one place. Do not duplicate game logic inside UI components.

---

# 10. Online multiplayer UI and architecture (future phase)

Design the experience now, but do not mark it as complete until it is backed by a working server-authoritative implementation.

Planned experience:
- Firebase Authentication for Google sign-in and guest/anonymous identity if enabled.
- Supabase PostgreSQL for persistent room/game data.
- Supabase Realtime or a suitable broadcast/presence mechanism for live room updates.
- Server-side validation for every dice roll and move.
- Room code generated securely.
- Host and player roles.
- Reconnection support.
- Room expiry and abandoned-room handling.

### Important security rules
- Never trust a dice value supplied by the browser.
- Generate dice rolls on the trusted server for online games.
- Never let a client directly set another player's position.
- Validate turn ownership, game status, and move legality on the server.
- Apply database access policies so players can only access permitted rooms.
- Do not expose service-role keys in client code.
- Keep secrets in environment variables.
- A client-side random dice roll is acceptable only for local play.

### UI states to design
- Creating room.
- Waiting for players.
- Room full.
- Invalid room code.
- Player disconnected.
- Reconnecting.
- Host left.
- Game started.
- Game completed.
- Network unavailable.

---

# 11. Accessibility and usability

- Use semantic buttons and headings.
- All controls must be keyboard accessible.
- Provide visible focus styles.
- Add accessible labels to icon-only buttons.
- Announce dice results and turn changes with an appropriate live region.
- Do not communicate state only through color.
- Maintain adequate text/background contrast.
- Support reduced motion.
- Make touch targets large enough for mobile.
- Keep instructions simple and avoid unexplained game jargon.
- Ensure dialogs can be closed with keyboard controls and have sensible focus behavior.

---

# 12. Technical implementation guidance

If creating a new project, use:
- Next.js with App Router.
- TypeScript.
- Tailwind CSS.
- Framer Motion for selected animations.
- Firebase Authentication for identity when online login is introduced.
- Supabase PostgreSQL and Realtime for online room/game data.
- Vercel or another compatible platform for deployment.
- PWA manifest and service worker using a maintained approach compatible with the chosen Next.js version.

Use the existing project's package manager and lockfile. Do not replace package managers without a clear reason.

### Engineering rules
- Keep components small and focused.
- Use strict TypeScript; avoid `any`.
- Keep game rules framework-independent.
- Use server actions/API routes or trusted backend functions for online state changes.
- Handle loading, empty, error, and offline states.
- Avoid unnecessary dependencies.
- Optimize images and keep assets lightweight.
- Do not store authentication secrets in local storage.
- Use local storage only for non-sensitive preferences and optional local game recovery.
- Add error boundaries or a clear fallback for unexpected UI failures.

---

# 13. Testing checklist

## Game engine tests
- Board numbering from 1 to 100.
- Correct zigzag row direction.
- Dice values are always 1–6.
- Six-to-start behavior.
- Normal movement.
- Snake movement.
- Ladder movement.
- Exact-roll-to-finish behavior.
- Turn changes.
- Winner detection.
- No turns after winner.
- Multiple players on one square.
- Invalid dice values rejected.

## UI tests
- Home → Setup → Game works.
- Player count changes the setup form.
- Player names and colors appear correctly.
- Roll button disables during animation/movement.
- Current player indicator updates.
- Snake/ladder messages are correct.
- Exit confirmation works.
- Winner screen appears.
- Play Again resets the correct state.
- Settings persist after refresh.

## Responsive/manual tests
- 320px small phone.
- 360px Android phone.
- 390px/430px phone.
- Tablet portrait and landscape.
- Desktop 1024px and 1440px.
- No clipped board, hidden dice, or horizontal overflow.
- Touch targets are usable.
- Reduced-motion mode works.
- No blocking console errors.

## Online tests before release
- Two separate browsers can join the same room.
- Both clients see the same turn and positions.
- Out-of-turn moves are rejected.
- Forged dice values are rejected.
- Refresh/reconnect restores the correct room state.
- A disconnected player is handled gracefully.
- Room access policies prevent unauthorized reads/writes.

---

# 14. Build phases and acceptance criteria

## Phase 1 — Design system and app shell
Deliver:
- Color and typography tokens.
- Responsive page container.
- Header and navigation.
- Button, card, dialog, and form components.
- Home screen.

Acceptance:
- Home screen looks polished at phone and desktop widths.
- Navigation actions work.
- No placeholder controls.

## Phase 2 — Setup flow
Deliver:
- Local mode selection.
- 2–4 player selector.
- Player name and color setup.
- Validation.

Acceptance:
- Valid setup creates a game state.
- Invalid setup shows helpful messages.

## Phase 3 — Local game engine and board
Deliver:
- Tested game engine.
- Correct 10 × 10 board.
- Tokens.
- Dice and roll action.
- Turn tracking.
- Snakes and ladders.
- Winner state.

Acceptance:
- A complete local game can be played from start to finish.
- Rules are deterministic in tests.
- The board is usable on a 320px-wide phone.

## Phase 4 — Game polish
Deliver:
- Dice and token animations.
- Sound toggle.
- Reduced-motion support.
- Winner celebration.
- How to Play and Settings.

Acceptance:
- Animations never break game state.
- Sound is optional.
- Accessibility basics pass.

## Phase 5 — PWA and release readiness
Deliver:
- Manifest and app icons.
- Install experience where supported.
- Offline fallback for app shell.
- Production build and deployment instructions.

Acceptance:
- App loads reliably on supported mobile browsers.
- Local play does not require an account or network after assets are available.

## Phase 6 — Online multiplayer
Deliver:
- Authentication.
- Create/join room.
- Waiting room.
- Server-authoritative turn and dice logic.
- Reconnection and room lifecycle.

Acceptance:
- Two or more real clients can complete a game.
- Security and reconnect tests pass.
- No online feature is represented as working before these criteria pass.

---

# 15. Environment variables

Use placeholders only; never commit real secrets.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Only add variables when the corresponding feature is implemented. Keep server-only secrets out of `NEXT_PUBLIC_*`.

---

# 16. Final delivery requirements

Antigravity must finish with:
1. A working responsive web app, not just screenshots.
2. A short summary of implemented screens and features.
3. Setup and run commands.
4. Environment variable instructions.
5. A list of tests run and their results.
6. A list of known limitations.
7. Clear separation between completed local play and future online multiplayer work.
8. Screenshots of the home, setup, and game screens at mobile and desktop sizes, if the environment supports screenshots.

## Definition of done

The first release is done when a user can open the app on a mobile browser, choose 2–4 players, enter names, play a complete Snakes & Ladders game with correct rules, see a winner screen, and start a rematch — with no account required and no broken responsive layout.

**Do not sacrifice a correct, enjoyable local game to rush online multiplayer.**
