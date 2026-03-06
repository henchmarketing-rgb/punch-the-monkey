# Boss spawn order — plan

## Required flow

1. **Kill all enemies** — no advance to boss until every enemy is gone (including death animations).
2. **"Boss Fight - The Angry Gorilla"** — title card appears on screen (no boss visible yet).
3. **Boss appears** — spawn boss, then camera/zoom if desired.
4. **Boss fight** — play.
5. **Level end** — after boss defeat.

---

## Problems today

### A. Advance too early

- `onEnemyDefeated` uses `activeEnemies = filter(active && aiState !== 'ko')`. Enemies in `'ko'` (death anim, 380ms before emit) are excluded.
- So when the *last* enemy to die triggers the callback, we remove them; any *other* enemy still in the list might be in `'ko'` (not yet removed). Then `activeEnemies.length === 0` and we call `advanceWave()` while another enemy is still on screen.
- **Fix:** Only advance when **no one is left in the list** (and no pending spawns): after removing the defeated enemy, require `this.enemies.length === 0 && (this.pendingSpawns || 0) === 0` before calling `advanceWave()`. That way we wait until every enemy’s defeat has been processed (list empty).

### B. Boss on screen before title

- Current order: `spawnBossNow()` runs → boss is spawned and added to world → `showBossIntro(boss)` runs (zoom to boss, then title card over him).
- Desired: show **title card first** (no boss), then spawn boss, then optional zoom/fight.

---

## Implementation plan

### 1. Stricter gate in `onEnemyDefeated` (GameScene.js)

- After `this.enemies = this.enemies.filter(e => e !== enemy)`:
- Replace the “can we advance?” check with:
  - `if (this.enemies.length > 0 || (this.pendingSpawns || 0) > 0) return`
- So we only call `advanceWave()` when the list is **empty** and there are no pending spawns.

### 2. Same strict “field clear” in `advanceWave()` boss branch

- Keep the 700ms delayed check, but define “field clear” as:
  - `this.enemies.length === 0 && (this.pendingSpawns || 0) === 0`
- So we never run `spawnBossNow()` while any enemy (including `'ko'`) is still in the list.

### 3. Order change: title card first, then spawn boss

- In the boss-wave branch of `advanceWave()`:
  - When field is clear (after delay + retry), **do not** call `spawnBossNow()` yet.
  - Call a new helper, e.g. `showBossTitleCard(opts, onComplete)`, that:
    - Freezes player (same as now).
    - Shows the “Boss Fight - The Angry Gorilla” (or correct title for the level) in the **center of the screen** (no boss, no zoom).
    - Uses overlay + text, same style as current title in `showBossIntro`.
    - After a short hold (~2–2.5s), fades out and calls `onComplete()`.
  - In `onComplete`, call `spawnBossNow()` (spawn boss, then call `showBossIntro(boss, ...)` for zoom/cinematic, or skip zoom and just unfreeze and start fight).

- Optional: keep `showBossIntro` for the zoom-in on the boss *after* he’s spawned, so the flow is: title card (no boss) → spawn boss → zoom to boss (current intro) → fight. Or simplify to: title card → spawn boss → unfreeze and fight (no zoom). Plan assumes we keep the zoom for the “boss appears” moment.

### 4. `showBossTitleCard(opts, onComplete)` (new)

- No boss reference; only `opts` (count, isFinal, isEaster, sorBoss) to pick title/subtitle text.
- Draw overlay (dark), center title + subtitle on screen (fixed/screen space, not world).
- Hold, then fade out and call `onComplete()`.
- Reuse the same title/subtitle strings as in `showBossIntro` (e.g. “BOSS FIGHT”, “— THE ANGRY GORILLA —”).

### 5. Flow after changes

1. Last enemy dies → 380ms later `enemy-defeated` → remove from list. If `enemies.length === 0` and `pendingSpawns === 0` → `advanceWave()`.
2. `advanceWave()`: boss wave → `_bossSpawning = true` → 700ms (and retry until) `enemies.length === 0` and `pendingSpawns === 0` → **showBossTitleCard(opts, () => { spawnBossNow() })**.
3. Title card shows “Boss Fight - The Angry Gorilla” (or correct title), holds, fades.
4. `spawnBossNow()`: spawn boss, then `showBossIntro(boss, ...)` (zoom to boss, optional extra title display or just zoom), then onComplete unfreeze → fight.
5. Boss defeated → level end (existing logic).

---

## Files to touch

- **GameScene.js**
  - `onEnemyDefeated`: advance only when `this.enemies.length === 0` and no pending spawns.
  - `advanceWave()` boss branch: field-clear check use `this.enemies.length === 0` (and pending); when clear, call `showBossTitleCard(opts, () => spawnBossNow())`.
  - Add `showBossTitleCard(opts, onComplete)` that shows overlay + centered title/subtitle, hold, fade, then `onComplete()`. Reuse title/subtitle logic from `showBossIntro` (or pass strings).

No changes to Enemy.js or Boss.js for this.
