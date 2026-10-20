# Standards Audit

Compares the process the project declares (`CLAUDE.md`) with what exists in the
repository, and records the coding conventions observed in `src/`.

## Declared process vs. repository

| Requirement | Present | Notes |
| --- | --- | --- |
| `.standards/consolidated-standards.md` | No | Nothing to consult yet. |
| `docs/adr/` with ADRs | No | No accepted architectural decisions are recorded. |
| `plans/` with `README.md` index and `plans/09-progress-tracker.md` | Local only | Kept untracked on purpose (global gitignore), so absent from the repository. |
| Tests where a runner exists | No runner | See [testing](./testing.md). |
| Conventional Commits | Partly | Recent history is free-form ("Update libs", "Add funding option"). Adopted going forward. |
| `docs/` for developer docs | Now yes | Introduced by the doc restructure. |

`CLAUDE.md` is listed in a global gitignore on the author's machine, so it is not
versioned with the repository. Contributors cloning the repo do not receive these
rules. Consider committing it or moving the durable parts into `docs/`.

## Decisions that already exist but are unrecorded

These should become ADRs when next touched, so `.standards/` can reference them:

1. Diagram identity encoded as alt text `drawio` plus resource title `drawio-{json}`.
2. A new resource is created on every edit and the old one is kept.
3. The editor is loaded remotely from a configurable server, not bundled.
4. Content script triggers messages through an inline `onload` handler.
5. Settings are serialised wholesale into the dialog HTML.

## Observed code conventions

- TypeScript, 4-space indent, single quotes, mostly no semicolons.
- One class per concern (`Settings`, `EditorDialog`), free functions in `resources.ts`.
- Per-file `Config` object for constants. Names are not shared across files.
- `enum` for fixed values; `const` objects for command ids.
- Errors are thrown as `Error` (resources) or strings (`settings.ts` throws a
  bare string). Handlers do not catch, so a failed save surfaces only in the console.
- `console.log` is used for tracing in production code.
- Comments are sparse. Some dead code is commented out.

## Code health items

- Duplicate `clearDiskCache` and temp-folder constant (`index.ts`, `resources.ts`).
- Unused `SettingDefaults.ui` and empty `_checks` in `settings.ts`.
- `themeUi` default value is `'en'`, which is not a valid option key
  (`kennedy`, `min`, `atlas`). Likely a copy-paste error from `languageUi`.
- Typing: `any` in `buildTitle`/`parseTitle`/`toObject`; `null` assigned to typed
  fields; `tsconfig` has `jsx: react` with no JSX in the project.
- `dialogResult.formData.main.diagram` is read without checking it exists.
- `async reset()` has no awaits.
- Version number maintained in two files.

## Recommendation

Create `.standards/` and the first ADRs from the list above, in the order of the
local remediation roadmap (not versioned).
