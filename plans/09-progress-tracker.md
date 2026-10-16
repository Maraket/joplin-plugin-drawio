# Progress Tracker

Updated: 2026-10-16

## Status

- Critical analysis of dependencies, structure, data flow, testing and standards done.
- Docs restructured into `docs/` (`images/`, `development/`) and analysis docs added.
- Remediation roadmap written: `plans/01-remediation-roadmap.md`.
- ADR-0001 accepted (test runner, branch `adr/test-runner`).
- No code changes yet.

## In Progress

Nothing.

## Next Steps

1. Implement ADR-0001: add tsx, `test`/`typecheck` scripts, tests/ layout, extract pure modules (roadmap 3.1).
2. Record ADRs for existing decisions and extend `.standards/` (3.6).
3. Phase 1 fixes, each with tests and its own commit.

## Blockers

- `CLAUDE.md` stays unversioned (decision). Its `npx tsc --noEmit` gate must become the `typecheck` script by hand once ADR-0001 is implemented.
  Decide whether to commit it.
- Upgrade path for webpack 4 / TypeScript 3.9 depends on the Joplin generator template.
