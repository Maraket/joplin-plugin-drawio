# Dependencies

Snapshot from `package.json` and `package-lock.json`. `npm audit` was run against
the lockfile.

## Runtime shape

The plugin has **no `dependencies`**. Everything is in `devDependencies` because
webpack bundles code into the `.jpl`. Anything imported from `src/` (`uuid`) is
effectively a runtime dependency. `fs-extra` is also obtained at runtime through
`joplin.require('fs-extra')` (supplied by Joplin), so the `fs-extra` bundle entry
is only used by `webpack.config.js`.

## Direct dependencies

| Package | Range | Used by | Notes |
| --- | --- | --- | --- |
| `uuid` | ^8.3.2 | `src/` (id generation) | Only runtime import. `crypto.randomUUID()` in Node would remove it. |
| `typescript` | ^3.9.3 | build | 2020 release. Locked 3.9.10. Blocks modern `@types`. |
| `ts-loader` | ^7.0.5 | build | |
| `webpack`, `webpack-cli` | ^4.43 / ^3.3 | build | Webpack 4 is end-of-life. |
| `copy-webpack-plugin` | ^6.1.0 | build | Copies `src/dialog`, `style.css`. |
| `on-build-webpack`, `before-build-webpack` | ^0.1 / ^0.2 | build | Unmaintained. `before-build-webpack` is not referenced in `webpack.config.js`. |
| `fs-extra`, `glob`, `chalk`, `tar`, `yargs` | various | `webpack.config.js` | Archive and script helpers from the Joplin generator. |
| `@types/node` | ^14 | types | Node 14 typings. |
| `@types/markdown-it` | ^12.2.3 | content script types | |

## Audit result

30 advisories: 5 critical, 16 high, 9 moderate, 0 low.
Direct packages affected: `tar` (critical), `copy-webpack-plugin` and `webpack`
(high), `webpack-cli` and `uuid` (moderate). Each fix is a semver-major jump
(`webpack` 5, `webpack-cli` 7, `tar` 7, `uuid` 14).

Exposure: all affected packages run at build time only. The shipped `.jpl`
contains the bundled `uuid` code. The `uuid` advisory (buffer bounds check with a
caller-provided `buf`) does not apply because the plugin calls `uuidv4()` with
no buffer.

## Findings

1. **Dependencies are classified wrongly.** Bundled runtime code should sit in
   `dependencies`, or the choice should be documented as a bundler convention.
2. **Toolchain is two majors behind.** Upgrading webpack 4 to 5 and TypeScript
   3.9 to 5.x needs the Joplin generator template as reference, since
   `webpack.config.js` is generated.
3. **Dead dependency candidates:** `before-build-webpack`; `uuid` (replaceable).
4. **`prepare` runs `npm run dist`.** Every `npm install` triggers a full build.
   This slows CI and installs of the repository as a dependency.
5. **`update` script installs globally** (`npm install -g generator-joplin`),
   which conflicts with the project rule of no ad-hoc global packages.
6. **Version drift risk.** `package.json` and `src/manifest.json` both carry
   `version` (both 2.3.0) and are bumped by hand.
7. **External runtime dependency.** The editor itself comes from
   `embed.diagrams.net` at use time. It is not pinned, versioned or vendored.
   Offline use is impossible and upstream UI or protocol changes can break the
   plugin silently.
8. **Vendored code.** `src/dialog/DiagramEditor.js` is a copy of JGraph's embed
   helper (Apache-2.0 header) with local edits. There is no recorded upstream
   version, and `api/` (20 generated files) is vendored from Joplin.

## Recommended order

Replace `uuid`; drop `before-build-webpack`; fix dependency classification; then
plan the webpack 5 and TypeScript upgrade as one tracked change (it is an
architectural change under the project's ADR process).
