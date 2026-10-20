# Architecture

Joplin plugin that embeds the draw.io (diagrams.net) editor. Diagrams are stored
as ordinary Joplin image resources (PNG or SVG with the draw.io XML embedded).

## Runtime components

Three isolated JavaScript contexts, joined only by Joplin message passing.

| Context | Source | Role |
| --- | --- | --- |
| Plugin main process | `src/index.ts`, `src/editorDialog.ts`, `src/resources.ts`, `src/settings.ts` | Registers commands, menu and settings. Owns the Joplin Data API. Creates and reads resources. |
| Markdown-it content script | `src/contentScript/contentScript.ts`, `style.css` | Runs in the note viewer. Wraps `drawio` images, adds the Edit button. |
| Dialog webview | `src/dialog/DiagramEditor.js`, `src/dialog/bootstrap.js` | Runs in a Joplin dialog. Hosts an iframe pointing at the draw.io server. |

The draw.io editor itself is **not bundled**. It is loaded from the configured
server (default `https://embed.diagrams.net/`) inside the dialog iframe, which is
why the plugin needs an internet connection.

## Directory hierarchy

```
.
├── api/                 Generated Joplin plugin typings (do not edit; `npm run update`)
├── docs/                Documentation (this folder)
├── src/
│   ├── index.ts         Entry: register settings, commands, Tools menu, content script, message handler
│   ├── editorDialog.ts  EditorDialog: dialog lifecycle, new/edit flows, note body rewrite
│   ├── resources.ts     Resource create/read/update, title-encoded options, temp files
│   ├── settings.ts      Setting definitions, registration, change handling
│   ├── manifest.json    Plugin manifest (version duplicated in package.json)
│   ├── contentScript/   markdown-it plugin + CSS (separate webpack entry)
│   └── dialog/          Vendored draw.io embed helper + bootstrap (plain JS, copied as-is)
├── webpack.config.js    Generator-provided build; do not restructure
├── plugin.config.json   Lists extra webpack entries (content script)
├── tsconfig.json
└── publish/ dist/       Build output (gitignored)
```

## Module responsibilities and coupling

- `index.ts` composes everything. It depends on `editorDialog`, `settings`, `resources`.
- `editorDialog.ts` depends on `resources` and `settings`. It mixes three concerns:
  dialog lifecycle, HTML generation, and note-body mutation.
- `resources.ts` is the only module that touches resource files. It also encodes
  diagram options (`sketch`) into the resource **title** as `drawio-{json}`.
- `settings.ts` holds both the setting schema and the language list.
- The content script has no imports from the plugin; the contract is the
  message shape `{ diagramId, action: 'edit' | 'check' }` and the
  `drawio-` title prefix.

## Build

`npm run dist` runs three webpack passes (main bundle, extra scripts, archive).
Output is a `.jpl` archive in `publish/`. `src/dialog/` and `style.css` are copied
verbatim by `CopyPlugin`, not bundled.

## Observations

- Module boundaries match the three Joplin contexts well. The coupling that
  matters is implicit: the `drawio-` title prefix and the `![drawio](:/id)` alt
  text are shared by `resources.ts`, `editorDialog.ts` and the content script
  without a shared constant.
- `Config.TempFolder` (`resources.ts`) and `Config.DiagramsCacheFolder` (`index.ts`)
  duplicate the same path. `clearDiskCache` also exists in both files and the
  `resources.ts` copy is unused.
- Vendored `DiagramEditor.js` and `bootstrap.js` are untyped globals loaded by
  script order. `bootstrap.js` depends on `window.DiagramEditor`, hence the
  200 ms retry.
