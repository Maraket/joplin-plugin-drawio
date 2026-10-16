# Remediation Roadmap

Source: critical analysis in [`docs/`](../docs/README.md). No item here is started.
Items marked **ADR** are architectural and need council review and an ADR first.

## Phase 1 - Low-risk fixes (no ADR)

| # | Item | Source | Size |
| --- | --- | --- | --- |
| 1.1 | Escape attribute values in `buildDialogHTML` | security S1 | S |
| 1.2 | Restrict `postMessage` target and check `evt.origin` in `DiagramEditor.js` | security S2 | S |
| 1.3 | Validate `server` setting (https URL) via `_checks` | security S3 | S |
| 1.4 | Remove payload logging, gate the rest behind a debug flag | security S6 | S |
| 1.5 | Fix `themeUi` default (`'en'` to `'kennedy'`) | standards | XS |
| 1.6 | Remove duplicate `clearDiskCache` and temp-folder constant | architecture | XS |
| 1.7 | Share id/title constants between plugin and content script | architecture | S |
| 1.8 | Wrap save path in try/catch and show a user-visible error | standards | S |
| 1.9 | Remove unused `before-build-webpack`; replace `uuid` with `crypto.randomUUID` | dependencies | S |

## Phase 2 - Behaviour fixes

| # | Item | Source |
| --- | --- | --- |
| 2.1 | Prevent stale-body overwrite on edit (use editor text as source of truth) | data-flow |
| 2.2 | Handle duplicate diagram ids in one note (class + delegation, not id) | data-flow |
| 2.3 | Size cap and temp-file cleanup after import | security S5, S7 |
| 2.4 | Unescaped id in `new RegExp(...)` in `edit` | data-flow |

## Phase 3 - Architectural (ADR required)

| # | Item | Notes |
| --- | --- | --- |
| 3.1 | ~~ADR~~ Unit test runner: decided, see [ADR-0001](../docs/adr/0001-unit-test-runner.md) (node:test + tsx). Implemented on branch `adr/test-runner`. | Unblocks every later item. |
| 3.2 | **ADR** Replace inline `<style onload>` with content-script asset and event delegation | security S4 |
| 3.3 | **ADR** Toolchain upgrade: webpack 5, TypeScript 5, current `@types` | Clears most audit findings. Track against Joplin generator template. |
| 3.4 | **ADR** Retire or bundle remote editor (offline, version pinning) | Large. Evaluate licence and size first. |
| 3.5 | **ADR** Split `EditorDialog` (lifecycle / HTML / note mutation) | architecture |
| 3.6 | **ADR** Record existing decisions listed in `docs/standards-audit.md` | Creates `.standards/` |

## Phase 4 - Process

- Add a CI workflow: `npm ci`, `npx tsc --noEmit`, `npm run dist`, tests.
- Enable `strict` in `tsconfig.json` incrementally.
- Commit the process rules from `CLAUDE.md` or mirror them in `docs/`.
- Single source for `version` (manifest and `package.json`).

## Suggested order

3.1 and 3.6 first (test runner, standards baseline), then Phase 1 with tests,
then Phase 2, then 3.2 to 3.5 as separate ADR-backed changes.
