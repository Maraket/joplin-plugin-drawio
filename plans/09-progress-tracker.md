# Progress Tracker

Updated: 2026-10-16

## Status

- Critical analysis docs shipped (`docs/`), remediation roadmap written.
- ADR-0001 accepted and implemented on `adr/test-runner`: `node:test` + `tsx`, `npm test`,
  `npm run typecheck`, 4 pure modules extracted, 25 tests (21 pass, 4 todo for S1/S5).
- Lockfile refreshed so `npm ci` works.
- Branches `docs/restructure-and-analysis` and `adr/test-runner` are pushed. `master` is
  untouched and equals `origin/master`.

## In Progress

Review of the `adr/test-runner` diff; branch sorting with the user.

## Next Steps

1. Sort out branches / PRs (docs branch first, then `adr/test-runner`).
2. Phase 1 fixes, each with its regression test and removal of the matching `todo`:
   S1 escaping (1.1), S5 base64 validation, server validation (1.3), `themeUi` default (1.5).
3. CI workflow: `npm ci`, `typecheck`, `test`, `dist` (Phase 4).
4. Record ADRs for existing decisions and extend `.standards/` (3.6).

## Blockers

- `CLAUDE.md` stays unversioned (decision). Its `npx tsc --noEmit` gate is now
  `npm run typecheck` and must be updated by hand locally.
- `npm run dist` needs `NODE_OPTIONS=--openssl-legacy-provider` on Node >= 17 until the
  webpack upgrade (roadmap 3.3).
- This machine cannot reach GitHub on SSH port 22; pushes use `ssh.github.com:443`.
