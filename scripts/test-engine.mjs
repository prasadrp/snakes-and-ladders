import assert from 'node:assert';
import {
  getCellCoordinates,
  getBoardNumber,
  generateBoardCells,
} from '../src/lib/game/board.ts';
import {
  calculateNextPosition,
  checkSnakesAndLadders,
  rollDice,
} from '../src/lib/game/rules.ts';
import {
  createInitialGame,
  executeTurn,
} from '../src/lib/game/engine.ts';
import {
  DEFAULT_LADDERS,
  DEFAULT_SNAKES,
} from '../src/lib/game/constants.ts';

console.log('--- RUNNING SNAKES & LADDERS ENGINE TESTS ---');

// 1. Board numbering test: 1 to 100
console.log('1. Testing Board Numbering & Zigzag Layout...');
assert.strictEqual(getBoardNumber(9, 0), 1, 'Square 1 should be bottom-left (row 9, col 0)');
assert.strictEqual(getBoardNumber(9, 9), 10, 'Square 10 should be bottom-right (row 9, col 9)');
assert.strictEqual(getBoardNumber(8, 9), 11, 'Square 11 should be above square 10 (row 8, col 9)');
assert.strictEqual(getBoardNumber(8, 0), 20, 'Square 20 should be far-left (row 8, col 0)');
assert.strictEqual(getBoardNumber(7, 0), 21, 'Square 21 should be above square 20 (row 7, col 0)');
assert.strictEqual(getBoardNumber(7, 9), 30, 'Square 30 should be far-right (row 7, col 9)');
assert.strictEqual(getBoardNumber(0, 9), 91, 'Square 91 should be top-right (row 0, col 9)');
assert.strictEqual(getBoardNumber(0, 0), 100, 'Square 100 should be top-left (row 0, col 0)');

// Test coordinates round-trip for all 100 squares
const allCells = generateBoardCells();
assert.strictEqual(allCells.length, 100, 'Should have exactly 100 cells');
for (let pos = 1; pos <= 100; pos++) {
  const coord = getCellCoordinates(pos);
  const calculatedPos = getBoardNumber(coord.row, coord.col);
  assert.strictEqual(
    calculatedPos,
    pos,
    `Round-trip failure for position ${pos}: got ${calculatedPos} at row ${coord.row}, col ${coord.col}`
  );
}
console.log('   ✓ Board numbering and 100-cell zigzag coordinates verified.');

// 2. Dice rolling test
console.log('2. Testing Dice Generation...');
for (let i = 0; i < 1000; i++) {
  const d = rollDice();
  assert.ok(d >= 1 && d <= 6, `Dice value ${d} out of range 1-6`);
}
console.log('   ✓ Dice values strictly 1–6 across 1,000 rolls.');

// 3. Six-to-start rule tests
console.log('3. Testing Six-to-Start Rule...');
const dummyPlayer = {
  id: 'p1',
  name: 'Test',
  colorId: 'red',
  color: { id: 'red', name: 'Red', bgHex: '#f00', borderHex: '#900', glowHex: '', textColor: '#fff' },
  position: 0,
  hasEntered: false,
  isWinner: false,
};
const configSixReq = {
  playerCount: 2,
  requireSixToStart: true,
  exactRollToFinish: true,
  extraTurnOnSix: false,
  snakes: DEFAULT_SNAKES,
  ladders: DEFAULT_LADDERS,
};

// Roll 1..5 should not enter
for (let dice = 1; dice <= 5; dice++) {
  const res = calculateNextPosition(dummyPlayer, dice, configSixReq);
  assert.strictEqual(res.nextPosition, 0, `Player should stay at 0 on rolling ${dice}`);
  assert.strictEqual(res.entered, false);
}
// Roll 6 enters at 1
const enterRes = calculateNextPosition(dummyPlayer, 6, configSixReq);
assert.strictEqual(enterRes.nextPosition, 1, 'Player should enter at square 1 on rolling 6');
assert.strictEqual(enterRes.entered, true);
console.log('   ✓ Six-to-start rule verified (stays at 0 on 1-5, enters at 1 on 6).');

// 4. Ladders & Snakes tests
console.log('4. Testing Ladders & Snakes...');
// All ladders must go up
for (const [from, to] of Object.entries(DEFAULT_LADDERS)) {
  const fromNum = Number(from);
  assert.ok(to > fromNum, `Ladder at ${from} should lead to higher square than ${to}`);
  const ladderCheck = checkSnakesAndLadders(fromNum, configSixReq, 'Test');
  assert.strictEqual(ladderCheck.type, 'ladder');
  assert.strictEqual(ladderCheck.to, to);
}
// All snakes must go down
for (const [from, to] of Object.entries(DEFAULT_SNAKES)) {
  const fromNum = Number(from);
  assert.ok(to < fromNum, `Snake at ${from} should lead to lower square than ${to}`);
  const snakeCheck = checkSnakesAndLadders(fromNum, configSixReq, 'Test');
  assert.strictEqual(snakeCheck.type, 'snake');
  assert.strictEqual(snakeCheck.to, to);
}
console.log('   ✓ All ladders point upward, all snakes point downward.');

// 5. Exact-roll-to-finish test
console.log('5. Testing Exact-Roll-to-Finish Rule...');
const nearEndPlayer = { ...dummyPlayer, position: 98, hasEntered: true };
// Roll 3 would go to 101 -> overshoot!
const overshootRes = calculateNextPosition(nearEndPlayer, 3, configSixReq);
assert.strictEqual(overshootRes.nextPosition, 98, 'Player should stay at 98 on rolling 3 (overshoot)');
assert.strictEqual(overshootRes.event, 'overshoot');

// Roll 2 reaches 100 exactly!
const winRes = calculateNextPosition(nearEndPlayer, 2, configSixReq);
assert.strictEqual(winRes.nextPosition, 100, 'Player should reach 100 on exact roll');
console.log('   ✓ Exact roll to finish verified (overshoot rejected, exact lands at 100).');

// 6. Turn execution & Winner detection
console.log('6. Testing Turn Execution & State Transitions...');
const game = createInitialGame(['Alice', 'Bob']);
assert.strictEqual(game.players.length, 2);
assert.strictEqual(game.currentPlayerIndex, 0);

// Alice rolls 6 -> enters at 1
const turn1 = executeTurn(game, 6);
assert.strictEqual(turn1.nextState.players[0].position, 1);
assert.strictEqual(turn1.nextState.currentPlayerIndex, 1, 'Next turn should be Bob');

// Simulate reaching 100
const nearWinGame = {
  ...game,
  players: [
    { ...game.players[0], position: 97, hasEntered: true },
    game.players[1],
  ],
  currentPlayerIndex: 0,
};
const winTurn = executeTurn(nearWinGame, 3);
assert.strictEqual(winTurn.nextState.players[0].position, 100);
assert.strictEqual(winTurn.nextState.status, 'finished');
assert.strictEqual(winTurn.nextState.winnerId, game.players[0].id);

// No turns permitted after winner
const postWinTurn = executeTurn(winTurn.nextState, 4);
assert.strictEqual(postWinTurn.nextState.status, 'finished');
assert.strictEqual(postWinTurn.events.length, 0);
console.log('   ✓ Turn transitions, winner state, and game termination verified.');

console.log('✅ ALL ENGINE TESTS PASSED SUCCESSFULLY!');
