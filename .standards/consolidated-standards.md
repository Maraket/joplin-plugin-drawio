# Consolidated Standards

Active rules. Each rule cites the ADR it came from. Consult before design or
non-trivial implementation.

## Testing

| Rule | Source |
| --- | --- |
| Unit tests use `node:test` and `node:assert`, run with `node --import tsx --test tests/`. | [ADR-0001](../docs/adr/0001-unit-test-runner.md) |
| Tests live in `tests/` at the repo root, mirroring `src/`. Nothing test-related under `src/`. | ADR-0001 |
| Tests import only joplin-free modules, by relative path. No `api` alias, no bare `baseUrl` imports, no Joplin mock. | ADR-0001 |
| Pure logic lives in modules with no `joplin`, `fs` or `os` use at load. The content script bundle imports only `contentScript/*`. | ADR-0001 |
| Use `isolatedModules`-safe syntax: no `const enum`, `import type` for types. | ADR-0001 |
| `tsx` does not type-check. Type gate is the `typecheck` script (root `tsconfig.json` with `include: ["src"]`, plus `tests/tsconfig.json`). | ADR-0001 |
| `test` and `typecheck` are separate scripts. Never run tests from `prepare` or `dist`. | ADR-0001 |
| Test tooling is a pinned devDependency, `engines.node` declared, fixtures synthetic. | ADR-0001 |
| Each fix to a security-relevant regex or escaping lands with a regression test. | ADR-0001 |
| Manual Joplin verification remains required for dialog, viewer and settings changes. | ADR-0001 |
| If the runner blocks the toolchain upgrade, remove it instead of blocking the upgrade. | ADR-0001 |
