# Security Analysis

Point-in-time review of trust boundaries and input handling. Severity is the
reviewer's estimate for a desktop note-taking plugin. Remediation is tracked in the maintainer's
local remediation roadmap, which is not versioned.

## Attack surface

1. Remote editor: the draw.io server loaded in an iframe inside the dialog.
2. Dialog HTML built by string interpolation in `EditorDialog.buildDialogHTML`.
3. Inline script emitted by the markdown-it content script.
4. Image data written to disk and imported as a resource.
5. Build-time dependency tree.

## Findings

### S1. Attribute injection in dialog HTML (Medium) - fixed in `ffe320a`

`buildDialogHTML` writes `JSON.stringify(settings)` into a **single-quoted**
attribute and `themeUi` / `diagramBody` into double-quoted ones, with no escaping.
The `server` setting is free text, so a value containing `'` closes the attribute
and injects markup into the dialog webview. Settings can arrive through Joplin
sync, so the source is not always the local user. Fix: escape attribute values,
or pass data through a non-HTML channel.

### S2. Wildcard `postMessage` target and no origin check (Medium)

`DiagramEditor.js` sends with `postMessage(..., '*')` and the receive handler
verifies only `evt.source === frame.contentWindow`. Messages carry diagram XML.
If the iframe navigates to another origin, that origin receives and can send
messages. Fix: use `new URL(drawDomain).origin` for both directions.

### S3. Arbitrary editor server (Medium)

The advanced `server` setting selects the origin whose JavaScript runs in the
dialog and receives every diagram. There is no scheme check (`https` only), no
allow-list and no warning. Self-hosting is a legitimate use, so validate rather
than forbid. The existing `_checks` hook in `settings.ts` is empty and fits this.

### S4. Inline event handler in rendered notes (Low-Medium)

The content script injects `<style onload="...">` carrying JS. Interpolated
values are limited: `diagramId` is matched by `[A-Za-z0-9]+` or `[a-z0-9]+`, and
`contentScriptId` is a constant. This is safe today, but it depends on that regex
staying strict and on the viewer allowing inline handlers, which Joplin may
restrict. Prefer a content-script asset (`assets()` JS) with event delegation.

### S5. Weak validation of returned image (Low)

`DataImageRegex` checks the prefix `data:image/(png|svg)` and writes the rest as
base64. An SVG is stored unsanitised and later rendered in the viewer. Joplin
sanitises note HTML, but resources are still user-controlled content that the
plugin round-trips from a remote editor. Consider size limits and an SVG
sanitiser. The `drawio-` title prefix is the only ownership check, and any
resource a user renames to `drawio-...` gets an Edit button.

### S6. Sensitive data in logs (Low)

`console.log` calls print whole resource payloads (`getDiagramResource`),
dialog results and messages. Diagrams can hold confidential content. Remove or
gate behind a debug flag.

### S7. Temp files left on disk (Low)

Exports are written to `<tmpdir>/joplin-drawio-plugin/` and cleared only at
startup. Diagram files persist unencrypted until the next launch.

### S8. Vulnerable build dependencies (Info for runtime)

`npm audit` reports 30 findings (5 critical, 16 high, 9 moderate), concentrated
in webpack 4, `tar`, `copy-webpack-plugin` and `uuid`. All are `devDependencies`
bundled at build time, so end users do not receive them, but the build host
does. See [dependencies](./dependencies.md).

## Positive controls

- `diagramId` is regex-constrained before use in the viewer.
- No secrets, tokens or network calls originate from the plugin itself.
- Draw.io runs in an iframe, not in the plugin main process.
- Resources are never deleted by the plugin.

## Not reviewed

Draw.io's own code, Joplin's dialog sandbox implementation, and the Joplin
sanitiser configuration.
