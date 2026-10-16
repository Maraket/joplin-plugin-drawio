# Progress Tracker

Updated: 2026-10-16

## Status

- Critical analysis of dependencies, structure, data flow, testing and standards done.
- Docs restructured into `docs/` (`images/`, `development/`) and analysis docs added.
- Remediation roadmap written: `plans/01-remediation-roadmap.md`.
- No code changes yet.

## In Progress

Nothing.

## Next Steps

1. Council review and ADR for a unit test runner (roadmap 3.1).
2. Create `.standards/consolidated-standards.md` with ADRs for existing decisions (3.6).
3. Phase 1 fixes, each with tests and its own commit.

## Blockers

- `CLAUDE.md` is globally gitignored, so process rules are not versioned.
  Decide whether to commit it.
- Upgrade path for webpack 4 / TypeScript 3.9 depends on the Joplin generator template.
