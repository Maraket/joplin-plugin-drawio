# Progress Tracker

Updated: 2026-10-16

## Status

- Critical analysis docs shipped (`docs/`), remediation roadmap written.
- ADR-0001 accepted and implemented on `adr/test-runner`: `node:test` + `tsx`, `npm test`,
  `npm run typecheck`, 4 pure modules extracted, test suite established.
- Phase 1 fix 1.1 (security S1) implemented on `adr/test-runner`: HTML attribute escaping
  in `buildDialogHtml`, S1 todo tests converted to passing regression tests (30 passing tests, 2 remaining todo for S4/S5).
- Lockfile refreshed so `npm ci` works.
- Branches `docs/restructure-and-analysis` and `adr/test-runner` are pushed. `master` is
  untouched and equals `origin/master`.

## In Progress

Phase 1 remediations on `adr/test-runner` (1.1 complete; next: 1.5, S5, 1.3).

## Next Steps

1. Sort out branches / PRs (docs branch first, then `adr/test-runner`).
2. Continue Phase 1 fixes, each with its regression test and removal of matching `todo`:
   `themeUi` default (1.5), S5 base64 validation, server validation (1.3), `postMessage` origin check (1.2).
3. CI workflow: `npm ci`, `typecheck`, `test`, `dist` (Phase 4).
4. Record ADRs for existing decisions and extend `.standards/` (3.6).

## Blockers

- `CLAUDE.md` stays unversioned (decision). Its `npx tsc --noEmit` gate is now
  `npm run typecheck` and must be updated by hand locally.
- `npm run dist` needs `NODE_OPTIONS=--openssl-legacy-provider` on Node >= 17 until the
  webpack upgrade (roadmap 3.3).
- This machine cannot reach GitHub on SSH port 22; pushes use `ssh.github.com:443`.
