# Documentation

Documentation for shipped functionality and the current state of the codebase.
Work that is not yet built lives in [`plans/`](../plans/).

| Path | Contents |
| --- | --- |
| [`images/`](./images/) | Screenshots used by the root `README.md` |
| [`development/`](./development/) | Contributor and tooling notes |

The user-facing guide is the root [`README.md`](../README.md).

## Layout conventions

- One topic per file, `kebab-case.md`.
- Images go in `docs/images/`, referenced with relative links.
- Developer and architecture docs sit at the top level or in a topic folder.
- ADRs go in `docs/adr/NNNN-<concise-title>.md`.

## Index

- [Architecture](./architecture.md) - components, directory hierarchy, module boundaries
- [Data flow](./data-flow.md) - create, render, edit flows and trust boundaries
- [Security analysis](./security-analysis.md) - trust boundaries, findings S1-S8
