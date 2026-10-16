# Testing

## Current state

- No test runner, no test files, no `test` script, no CI workflow
  (`.github/` holds only `FUNDING.yml`).
- Quality gate is manual: `npm run dist` plus installing the `.jpl` in Joplin.
- `npx tsc --noEmit` is the project's type check. `tsconfig.json` has no
  `strict`, so `null` defaults (`private _handler: string = null`) and implicit
  `any` pass silently.
- No linter or formatter config. Code style is consistent by habit (4 spaces,
  no semicolons) except in `index.ts` where `;` appears.
- Git history has one commit titled "Refactoring and tests" but no tests remain.

## What is testable today

Logic that needs no Joplin runtime can be unit tested with small refactors:

| Unit | Location | Why valuable |
| --- | --- | --- |
| `extractCodeFromIdAttribute` | `contentScript.ts` | Two URL shapes, regex-driven, security-relevant. Not exported. |
| `buildTitle` / `parseTitle` | `resources.ts` | Round-trip of options, error path on bad JSON. Not exported. |
| `DataImageRegex` + `writeTempFile` | `resources.ts` | Rejects non-image data, picks extension. |
| `Settings.toObject` / `get` | `settings.ts` | Unknown key throws. |
| `getThemeUi` | `editorDialog.ts` | Branching on sketch and dark mode. Private. |
| `buildDialogHTML` | `editorDialog.ts` | Escaping regression tests for S1. |
| note body id replacement | `editorDialog.ts` | Inline regex, `gi` flags, id used unescaped in `RegExp`. |

Everything else (`index.ts`, dialog open/close, `joplin.data`) needs a Joplin API
double. A thin adapter module around `joplin` would allow that.

## Gaps

1. No regression protection for the id regexes or for dialog HTML escaping.
2. No contract test between content script message shape and plugin handler.
3. No automated build verification, so a broken `npm run dist` is found late.
4. No manual test checklist. The project standard requires manual Joplin
   verification for dialog, content script and settings changes, but does not
   say what to check.

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

## Recommendation

Introduce Jest with ts-jest (or Vitest) limited to pure functions first. That is
an architectural change under the project rules and needs a council review and
an ADR. See [`plans/01-remediation-roadmap.md`](../plans/01-remediation-roadmap.md).
