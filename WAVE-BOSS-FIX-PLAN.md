# Wave / boss end fixes — plan (all levels)

## Findings from code

1. **Boss never removed from `this.enemies`**  
   Boss uses `deathSequence()` → `_deathFinale()` → `emit('boss-defeated')` and `destroy()`. It never emits `enemy-defeated`, so `onEnemyDefeated` never runs for the boss. The dead boss stays in `this.enemies` and can confuse any logic that uses the list (e.g. length, iteration).

2. **Ghost references**  
   If any enemy is destroyed without going through `_die()` (e.g. destroyed elsewhere, or reference kept after destroy), they stay in `this.enemies`. Then `enemies.length` never reaches 0 and we never call `advanceWave()` → wave/boss transition appears to freeze.

3. **Boss-wave check**  
   `tryBossSequence()` uses `this.enemies.length === 0`. If the list still has a dead boss or ghost from a previous wave, we never see 0 and the boss sequence never runs.

## Fixes (apply everywhere)

1. **Prune list to active only**  
   Before any “all enemies gone” check, set  
   `this.enemies = this.enemies.filter(e => e && e.active)`.  
   Do this in:
   - `onEnemyDefeated` (before checking length and calling `advanceWave()`)
   - Inside `tryBossSequence()` (before `fieldClear`), so the boss wave only runs when the list is really empty of living enemies.

2. **Clean up on boss defeat**  
   In `onBossDefeated`, after the existing logic, prune the list:  
   `this.enemies = this.enemies.filter(e => e && e.active)`.  
   That removes the defeated boss (and any other destroyed refs) so the list stays consistent for the next level or wave.

No changes to Enemy/Boss death emission; only GameScene list handling.
