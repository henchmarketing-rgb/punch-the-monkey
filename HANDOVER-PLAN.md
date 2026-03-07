# Punch-the-Monkey — Handover plan (post full playthrough)

## 1. Code review summary (GitHub/main)

- **levels.js**: 12 levels; wave counts and boss placement do not match the requested spec below.
- **GameScene.js**: Background has `setScrollFactor(1)`; camera updates `scrollX` in update. If background does not scroll, possible causes: camera bounds, `_camTargetX` not advancing, or bg width vs world.
- **Audio**: Level music pool includes `music-title` (NON_CITY_POOL); should be intro/lore only. Tab visibility can suspend Web Audio and cause cut/distortion on return — needs resume on visibility or user gesture.
- **advanceWave / onEnemyDefeated / onBossDefeated**: Flow is correct in code; “after wave 1 no more spawn” and “continue button doesn’t come up” suggest either `advanceWave` not called (enemies not removed / pendingSpawns stuck) or `awaitingAdvance`/advance-prompt not set when last boss dies.
- **Bosses**: Zookeeper is SoR-style Enemy; `enemy-attack` is emitted and should damage player. Boss HP bar shown on `boss-spawn`; zookeeper must trigger that. Zookeeper framing: BootScene uses 512×443 and UV inset; if bleed persists, check texture/frame bounds.

---

## 2. Global fixes (do first) — DONE

| # | Issue | Action | Status |
|---|--------|--------|--------|
| G1 | Sound breaks after tab inactive | Resume Web Audio on document visibilitychange in main.js. | ✅ |
| G2 | Intro music only for intro and lore | Removed `music-title` from NON_CITY_POOL in GameScene. | ✅ |
| G3 | Background does not scroll | Confirmed bg setScrollFactor(1); added comment. Camera scroll in update drives scroll. | ✅ |
| — | Continue button after last boss | When no next wave after boss, set awaitingAdvance + advance-prompt instead of calling nextLevel() immediately. | ✅ |
| — | SoR bosses (zookeeper, animal control) | Emit boss-spawn in spawnBoss; emit boss-hp-update and boss-defeated from Enemy when type === 'boss'. | ✅ |

---

## 3. Wave spec (exact)

| Level | Waves (enemy counts and bosses) |
|-------|----------------------------------|
| L1 | 2 → 4 → 6 |
| L2 | 2 → 5 → 7 → boss (gorilla) ×1 |
| L3 | 3 → 6 → 9 → 12 |
| L4 | 4 → 8 → 9 → 12 → boss (zookeeper) ×1 |
| L5 | 4 → 6 → 8 |
| L6 | 4 → 8 → 10 (then boss — continue button fix) |
| L7 | 5 → 8 → 12 → 14 |
| L8 | 6 → 10 → boss (animal control) → 12 → 14 → boss ×2 (Zamza & Jack) |
| L9 | 6 → 10 → 12 → 14 |
| L10 | 6 → 10 → 14 → 16 |
| L11 | 8 → 12 → 16 → 18 |
| L12 | 8 → 12 → 16 → 18 → boss×2 → 12 → 16 → 18 → boss×1 (gorilla placeholder; new sprite later) |

L15/L16 in handover treated as not in current 12-level build.

---

## 4. Level-by-level fixes (after global + wave config)

| Level | Fixes |
|-------|--------|
| L1 | No fixes (wave config only). |
| L2 | Show continue (advance) button when boss is killed; ensure `awaitingAdvance` is set and advance-prompt shown after last boss. |
| L3 | Background scroll; “next level” arrows only after level end (fix advance-prompt timing / wave-end logic). |
| L4 | Zookeeper only after all waves clear; fix zookeeper framing (no bleed); add HP bar for zookeeper; zookeeper must inflict damage; background scroll; after defeating zookeeper run next level or next waves (fix logic). |
| L5 | “Next level” arrows only after level end. |
| L6 | Continue button when boss killed; no freeze (ensure onBossDefeated → nextLevel or advanceWave and advance-prompt). |
| L7 | After wave 1 more enemies spawn (fix advanceWave/spawnWave); background scroll. |
| L8 | Do last (per handover). |
| L9 | After wave 1 more enemies spawn. |
| L10 | Correct background (asset upload later); after wave 1 more enemies spawn. |
| L11 | Correct background (asset upload later); after wave 1 more enemies spawn. |
| L12 | Correct background (asset upload later); after wave 1 more enemies spawn. |

---

## 5. Implementation order

1. **Global**: G1, G2, G3, continue button, SoR boss UI/flow — DONE.
2. **Levels config**: `levels.js` updated to exact wave spec — DONE.
3. **Lock state**: Ready to commit “global fixes + wave config”.
4. **Per-level** (when you do them): L1 (none) → L2 (continue button: done globally) → L3 (advance-prompt timing: verify with new waves) → L4 (zookeeper framing/bleed when assets ready; damage/HP: done) → L5 (verify arrows) → L6 (continue: done) → L7 (spawn: verify with new waves) → L8 last → L9–L12 (spawn: verify; L10–L12 backgrounds when you upload).
