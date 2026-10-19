# Testing

## Current state

Runner: Node's built-in `node:test`, executed through `tsx`
([ADR-0001](./adr/0001-unit-test-runner.md)).

```bash
npm test             # node --import tsx --test tests/*.test.ts
npm run typecheck    # tsc over src, then over src + tests
```

- Needs Node >= 18.18 (`engines`): `--import` needs 18.18, and the glob is left to the
  shell because Node's own `--test` glob support needs Node 21. Keep tests flat in `tests/`.
  Runs in under a second. On Windows `cmd.exe` the glob is not expanded, so use Git Bash or
  Node >= 21 there.
- `tsx` strips types without checking them, so `typecheck` is a required gate.
  The root `tsconfig.json` includes only `src` and `tests/tsconfig.json` adds the tests.
- `skipLibCheck` is on because the generated `api/*.d.ts` files reference
  upstream-only paths (`../Plugin`) and report 14 errors that are not ours.
- `tests/node-test.d.ts` supplies typings for `node:test` and `node:assert/strict`.
  `@types/node` 14 predates them and newer `@types/node` does not parse under
  TypeScript 3.9 (checked with 16 and 18). Delete it after the toolchain upgrade.
- Tests are not part of `prepare` or `dist`. The built `.jpl` file list is unchanged
  by the test setup.
- No CI workflow exists yet, so the gate is local (roadmap Phase 4).

### Layout

| Test | Covers | Pure module under test |
| --- | --- | --- |
| `tests/contentScript.diagramId.test.ts` | Resource id extraction for Markdown and rich text, id charset | `src/contentScript/diagramId.ts` |
| `tests/resourceTitle.test.ts` | Title codec, data-URI regex | `src/resourceTitle.ts` |
| `tests/contentScript.render.test.ts` | Rendered viewer HTML for `drawio` images (stubbed markdown-it) | `src/contentScript/contentScript.ts` (no Joplin imports) |
| `tests/dialogHtml.test.ts` | Theme resolution, dialog HTML structure | `src/dialogHtml.ts` |
| `tests/settingsDefaults.test.ts` | Default language, theme, server | `src/settingsDefaults.ts` |

### Rules for writing tests

- Import only joplin-free modules, by relative path. Never `api`, never a module that
  imports it. Pure logic goes in its own module.
- Use `import * as assert from 'node:assert/strict'`, `import type` for types, no `const enum`.
- Known-bug cases use `{ todo: '<finding>' }`. A todo test runs, is reported as failing
  in the output, and does not fail the run. When the fix lands, delete the `todo` option.
  `node:test` does not flag a todo that starts passing, so find them with
  `grep -rn "todo:" tests`. Open todos: S4 (1 case) and S5 (1 case). S1 is fixed (`escapeAttribute`), S3 gets its test with fix 1.3.
- `npm install` runs the `esbuild` install script (a `tsx` dependency).
- Fixtures are synthetic.

### Verifying that tests do not ship

```bash
NODE_OPTIONS=--openssl-legacy-provider npm run dist
tar tf publish/*.jpl | sort     # must list no tests/ or tsx files
```

### Build notes found while setting this up

- **`npm ci` was broken** on a clean checkout (lockfile out of sync with the
  `overrides` in `package.json`). Fixed by refreshing the lockfile.
- **`npm run dist` fails on Node >= 17** with `ERR_OSSL_EVP_UNSUPPORTED` because webpack 4
  hashes with MD4. Use `NODE_OPTIONS=--openssl-legacy-provider` until the webpack upgrade.
- `npx tsc` without a local install fetches an unrelated `tsc` package. Run
  `npm install` first and use `npm run typecheck`.

## Gaps

1. Not unit-testable without a Joplin test double: `index.ts`, `EditorDialog` lifecycle,
   `resources.ts` I/O, the `Settings` class (imports runtime enums from `api/types`),
   the note-body id replacement in `edit`, and the vendored `src/dialog/*.js`.
2. No contract test between the content script message shape and the plugin handler.
3. No CI, so nothing enforces `npm test`, `typecheck` or the build.
4. Two known-bug tests are todo (S4, S5) and do not yet protect anything; S3 has none.
5. The S1 fix assumes Joplin's dialog parses `setHtml` content like a browser (entities in attribute
   values decoded before `.value` is read). Unit tests mirror this with a decoder; confirm in Joplin.

## Manual verification checklist (interim)

Run after any change to the dialog, content script or settings.

- [ ] Create PNG diagram, SVG diagram, PNG sketch, SVG sketch from Tools menu.
- [ ] Diagram is inserted at the cursor and renders in the viewer.
- [ ] Hover shows Edit button; click opens editor with the existing diagram.
- [ ] Save in the editor replaces the image and the note body id.
- [ ] Undo after edit behaves (regression: commit `fb3e691`).
- [ ] A normal image with alt text `drawio` but no `drawio-` title has no button.
- [ ] Same diagram twice in one note.
- [ ] Change theme, dark mode and language settings; reopen editor.
- [ ] Custom server setting with a bad URL fails visibly.
- [ ] Rich text editor mode (`file://` image src) still shows the button.
- [ ] Light and dark Joplin themes.

Next: wire `npm ci`, `typecheck`, `test` and `dist` into CI (roadmap Phase 4), then fix S1 and S5 and remove their `todo` markers.
