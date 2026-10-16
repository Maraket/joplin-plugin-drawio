# Data Flow

How a diagram moves between the note, the plugin, and the draw.io editor.

## Storage model

A diagram is a Joplin resource (PNG or SVG) with the draw.io XML embedded in the
image. Identification relies on two conventions:

- Markdown: `![drawio](:/<resourceId>)` (alt text `drawio`).
- Resource title: `drawio-{"sketch":true|false}`. Options are JSON in the title.

## Create

```
Tools > Draw.io > Create new ...
  -> EditorDialog.new(EmptyDiagram, sketch)
  -> setHtml: hidden inputs { settings JSON, theme, diagram = empty data URI }
  -> dialog opens; bootstrap.js builds URL params, DiagramEditor adds iframe
  -> iframe (draw.io server) <-> DiagramEditor via window.postMessage
  -> Save: bootstrap.dialogDone sends `export` (format xmlpng|xmlsvg)
  -> export result written to hidden input `diagram` (data URI)
  -> dialog result formData.main.diagram
  -> resources.createDiagramResource: regex-validate, write temp file,
     POST /resources with title drawio-{options}
  -> commands.execute('insertText', '![drawio](:/id)')
```

## Render

```
markdown-it image rule override (contentScript.ts)
  -> token alt text matches /^drawio$/i and src yields an id
     (`:/id` in Markdown view, `file://.../id.png|svg` in rich text)
  -> emit <span.drawio-container> img + hidden Edit button
     + <style onload="..."> that runs inline JS
  -> JS posts {action:'check'} to the plugin
  -> plugin: GET /resources/id, answers isValid = title startsWith 'drawio-'
  -> viewer shows the button, or removes it
```

## Edit

```
Edit click -> postMessage {action:'edit', diagramId}
  -> EditorDialog.edit
  -> getDiagramResource: GET resource + file, rebuild data URI, parse options
  -> dialog as in Create, seeded with the existing image
  -> Save: updateDiagramResource creates a NEW resource (new id)
  -> selectedNote(); regex-replace old id with new id in note.body
  -> PUT /notes/:id {body}; editor.setText(body)
```

The old resource is intentionally kept in case another note references it.

## Settings

`Settings.read` pulls values from `joplin.settings`. `EditorDialog.buildDialogHTML`
serialises **all** settings into a hidden `<input>` for `bootstrap.js`.
On any settings change the dialog handle is dropped (`dialog.reset()`) and a new
dialog is created on next use.

## Trust and data boundaries

| Boundary | Data crossing | Notes |
| --- | --- | --- |
| Viewer -> plugin | `{diagramId, action}` | `diagramId` comes from a regex limited to `[A-Za-z0-9]+`. |
| Plugin -> dialog | HTML string with settings + full image as data URI | Interpolated into attributes. See [security-analysis](./security-analysis.md). |
| Dialog -> draw.io server | Diagram XML (inside image) | Sent to the configured server, default is third party. |
| Dialog -> plugin | `formData` data URI | Validated only by `DataImageRegex`. |

## Risks found while tracing

- **Stale body overwrite.** `edit` reads `note.body` from the database and calls
  `editor.setText`. Unsaved editor text typed since the last autosave can be lost.
- **Resource churn.** Every save creates a new resource. Cleanup of the old one
  depends on Joplin's own orphan handling (not verified here).
- **Duplicate ids.** The button id is `drawio-<id>-edit`. The same diagram twice
  in one note yields duplicate ids and only the first button is wired.
- **Large payloads.** The whole image travels as a string through HTML and
  `formData`. Large PNGs inflate dialog setup time and memory.
- **Verbose logging.** `getDiagramResource` logs the whole resource body.
