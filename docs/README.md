# Documentation

Documentation for shipped functionality and the current state of the codebase.
Planning documents (roadmaps, trackers) are kept outside version control.

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
- [Dependencies](./dependencies.md) - inventory, audit, upgrade findings
- [Testing](./testing.md) - current state, gaps, manual checklist
- [Standards audit](./standards-audit.md) - declared process vs. repository, conventions, code health
- [ADR index](./adr/) - architecture decision records
