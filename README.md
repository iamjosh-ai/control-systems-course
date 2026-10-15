# Control Systems 101 + 201 · Mastery Course

Offline PWA, forked from `../rams-course` (same engine: blocked L3 / L2 / L1 staging, 100 % mastery gate, recall cards, quickcheck, predict, match, search, localStorage key `ctrl-course-state-v1`).

## Status (9 Oct 2026)
- COMPLETE: 101 (C0 to C5) and 201 (C6 to C11), 36 gated stages (L3 concept, L2 formulae, L1 quantitative per module), plus the free Simulation Lab.
- Grounding, all in `../../../Research/`:
  - `control-systems-101-2026-10-08.md` (NotebookLM 99711aae: 66 of 71 tutor-playlist videos, CTMS, Wikipedia)
  - `control-systems-201-2026-10-08.md` (NotebookLM f72eb24f: 94 sources incl. Åström & Murray draft, CTMS, lecture notes)
  - `control-systems-interactive-pedagogy-2026-10-08.md` (NotebookLM cdfd3fae: predict / task / reflect framing, misconceptions)
- "EXT" marks material the playlist does not cover. Topics with no playlist video: Routh array, Mason, Ziegler-Nichols, windup, D filter, lead/lag, discretisation.
- Engine: modules carry `part`; each part is block-staged on its own (all 101 before 201). `free:true` = Lab, never locked, no test.
- Browser check: every stage renders with 0 KaTeX errors and every phase test passes with its own answers (headless Chromium, 9 Oct 2026).

## Files
- `index.html` engine (UI, lesson renderer, test engine). Adds `video` block and custom-mount sims.
- `sims.js` numerical core `CTRL_MATH` (roots, TF step via RK4, metrics, freq response, margins, Routh, locus), `CTRL_SIMS`, `CTRL_DIAGRAMS`.
- `curriculum.js` content. `test-math.js` maths vs textbook values. `qa.js` full non-browser QA. `verify.js` offline asset check.

## Simulations
cruise, firstorder, secondorder, polezero (drag poles), pid, pidgame (tune-to-spec game), blocks (Simulink-lite sandbox), sserror, routh, rootlocus, bode (+ Nyquist), zn (Ziegler-Nichols), lead, phase (state-space portrait), sampling (ZOH), windup (saturation + anti-windup), dnoise (derivative kick, noise, D filter).

## Run
`npx http-server -p 8765 .` then open http://localhost:8765. QA: `node qa.js` must print `RESULT: PASS`. Bump `CACHE_VERSION` in `sw.js` on every content change.
