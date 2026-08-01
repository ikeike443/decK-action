---
name: dependency-updates
description: How to handle Dependabot PRs and dependency/security updates in decK-action. Use when triaging Dependabot PRs, running npm audit, or updating package-lock.json.
---

# Dependency updates in decK-action

## Runtime reality: `action/dist/index.js` is what actually runs
`Dockerfile` copies `action/dist/index.js` (a webpack/ncc bundle committed in 2020) and runs
`node /index.js`. The bundle vendors its dependencies, so **`package.json` / `package-lock.json`
changes do not affect the running action**. Dependabot PRs and `npm audit fix` results are
repo hygiene only; a real runtime dependency fix would require rebuilding the bundle
(project owner's decision — currently the bundle is not rebuilt).

## Preferred workflow for a backlog of Dependabot PRs
Merging them one by one does not work well: every PR touches `package-lock.json`, so each merge
forces the rest to rebase. Instead:

1. `npm install` then `npm audit fix` (no `--force`) on a fresh branch to regenerate the lockfile.
2. Check what remains with `npm audit --json`; anything with `isSemVerMajor: true`
   (currently `jest` 26→30, `@actions/github` 2→9) belongs in a separate, reviewed PR.
3. Open one PR with the regenerated lockfile, then close the superseded Dependabot PRs.

## Gotchas
- The regenerated lockfile is `lockfileVersion: 3` (npm 7+). `.github/workflows/npm-test.yml`
  must target Node 18.x/20.x — npm 6 (Node 10/12) cannot read it.
- There are **no tests**: `npm test` exits 1 with "No tests found". Do not read a passing
  test suite as validation. Sanity-check with `node -e "require('./action/src/main.js')"`.
- The npm package named `require` was an unused dependency and has been removed; do not
  re-add it (source code only uses Node's built-in `require`).
