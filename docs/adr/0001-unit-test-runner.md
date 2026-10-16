# 0001. Adopt node:test with tsx as the unit test runner

- Status: Accepted and implemented (branch `adr/test-runner`)
- Date: 2026-10-16
- Supersedes: none
- Superseded by: none

## Context & Problem Statement

The project has no automated tests ([docs/testing.md](../testing.md)). Quality
relies on a manual Joplin checklist. About 20 fixes are queued in the
[remediation roadmap](../../plans/01-remediation-roadmap.md), several touching
security-relevant regexes and escaping (findings S1, S3, S4, S5 in
[security-analysis](../security-analysis.md)). A runner is needed that works with
the frozen toolchain (TypeScript 3.9.10, webpack 4, `@types/node` 14), because
upgrading the toolchain is a separate decision (roadmap 3.3).

Constraints established during review:

- Every module except the content script imports `joplin from 'api'`. `api` has
  no runtime export, and `resources.ts` and `index.ts` call `joplin.require`
  at load. Importing them in any runner throws.
- `ts-jest` 29 requires TypeScript >=4.3. `ts-jest` 26 requires Jest 26 (aged,
  unverified on current Node). Vitest 5 requires Node >=22.12 and adds Vite.
- `CopyPlugin` copies everything under `src/` that is not `.ts`/`.tsx` into the
  `.jpl`. `tsconfig.json` has no `include`, so `tsc` sees every `.ts` file.

## Decision Outcome

**Accepted.** Use Node's built-in `node:test` and `node:assert`, executed through
`tsx` (`node --import tsx --test tests/*.test.ts`).

Rules:

1. **Scope:** pure functions only. Tests never import a module that imports
   `api` or touches `fs`/`os` at load. No Joplin mock or adapter in this decision.
2. **Layout:** tests live in `tests/` at the repo root, mirroring `src/` paths.
   No tests, fixtures or snapshots under `src/`.
3. **Type gate:** root `tsconfig.json` gets `"include": ["src"]`. A
   `tests/tsconfig.json` extends it and includes `../src` and tests. `tsx` does not
   type-check, so `tsc` stays mandatory: an npm `typecheck` script runs both
   configs.
4. **Pure modules** are extracted behavior-preserving, with no `joplin` import:
   `src/contentScript/diagramId.ts`, `src/resourceTitle.ts`, `src/dialogHtml.ts`,
   and settings defaults and validation. The content script bundle may import only
   `contentScript/*`.
5. **Syntax:** `isolatedModules`-safe only (no `const enum`, `import type` for
   types). Tests and pure modules use relative imports, never the `api` alias or
   bare `baseUrl` paths.
6. **Scripts:** add `test` and `typecheck`. Tests must **not** run in `prepare`
   or `dist`. A full run should take under 10 seconds.
7. **Dependencies:** `tsx` as an exact-pinned devDependency; `engines.node`
   declared; `package-lock.json` committed. Fixtures are synthetic.
8. **Order of work:** write regression tests for the id regexes and escaping
   before refactoring. S1, S4 and S5 tests begin as expected-failure cases until
   their fixes land. S3 is deferred: no server-URL validator exists to test, so its
   test is written together with the fix (roadmap 1.3). Each Phase 1 fix lands with a regression test.
9. **Verification:** after implementation, compare `dist/index.js` hash and
   `tar tf publish/*.jpl` before and after; both must be unchanged by test files.
10. **Exit path:** if the runner blocks the toolchain upgrade (roadmap 3.3), delete
    it rather than block the upgrade. Revisit Jest/Vitest after that upgrade.
11. The manual Joplin checklist stays for dialog, viewer and settings behaviour.
12. The shared-constants refactor is out of scope and gets its own decision.

## Reasoning for Outcome

`node:test` + `tsx` is the only option with no coupling to the project's
TypeScript version: `tsx` only strips types. It adds one direct dependency (plus
esbuild), needs no config file or transformer pairing, starts fast, and is
unaffected by the later webpack and TypeScript upgrades. Jest + ts-jest is
infeasible without a TypeScript upgrade. Vitest raises the Node floor and adds a
second bundler beside webpack 4. Pure-function scope does not need Jest's mocking.

Consequences: no snapshots and only basic mocks; types are unchecked at test time
(mitigated by rule 3); contributors need Node >=18.18; and without CI the tests are
a local habit (CI is roadmap Phase 4).

## Agent Perspectives

**Critical Analysis.** Accept with conditions. Verified that ts-jest 29 needs
TS >=4.3 and Vitest 5 needs Node >=22.12. Top risks: the `api` alias and
import-time side effects, toolchain skew, tests that do not type-check the real
build, refactor risk with no safety net, and no CI. Required joplin-free modules,
TS pinned at 3.9.10, `tsc` kept as a separate gate, regression tests before
refactors, and unchanged `.jpl` contents. Recommended `node:test` + `tsx`.

**Security Conscious.** Accept with conditions. The dev-only footprint is modest
next to the 30 existing advisories and nothing reaches the `.jpl`. Tests give
regression coverage for S1 (attribute escaping), S3 (server validation), S4
(diagramId regex invariant) and S5 (data-URI strictness); S2 lives in vendored
JS and is testable only if extracted. Conditions: pinned versions and lockfile,
tests outside the webpack graph, named exports of pure functions only, synthetic
fixtures, security tests as expected failures first, no tests in `prepare`.
Preferred `node:test` + a TS loader (fewest packages), then Vitest, then Jest.

**Performance Conscious.** Accept with conditions. Unimported test files never
enter the bundle, but non-`.ts` files under `src/` would be copied into the
`.jpl`. Costs: Jest about 60-100 MB and 1.5-3 s cold start; Vitest 2.8 MB
unpacked plus Vite and Node >=22.12; `tsx` about 10 MB with esbuild and 0.2-0.4 s
(estimates). Conditions: tests outside `src/`, runner config at repo root,
tests never import `api`, tests not in `prepare`/`dist`, before/after hash
comparison. Preferred `tsx` + `node:test`.

**Benefit Analysis.** Accept with conditions. Upkeep is small at pure-function
scope; payoff is concentrated in the roadmap, since an 11-item manual checklist
cannot cheaply catch regex and escaping regressions. A passing `npm test` also
lets external contributors review without installing Joplin. Conditions: capped
scope, dev-only, under 10 s, wire into CI, a regression test per Phase 1 fix, a
documented exit path, manual checklist kept. Preferred `node:test` + `tsx`.

**System Architecture.** Accept with conditions. Proposed the `tests/` layout,
root `include: ["src"]`, `tests/tsconfig.json`, extraction of
`diagramId.ts`, `resourceTitle.ts`, `dialogHtml.ts`, and the boundary rules above;
deferred the shared-constants refactor. Initially preferred Jest + ts-jest; in
round 2 withdrew it after the verified peer ranges, and accepted `node:test` +
`tsx` with guard rails: ban the `api` alias and bare `baseUrl` imports in pure
modules and tests, keep `isolatedModules`-safe syntax, pin tsx and Node.

## Deliberation Summary

- **Runner choice.** Round 1 split 4 to 1. The architecture agent favoured Jest
  for matching the commonjs/es2015 setup. Three agents showed ts-jest 29 cannot
  run on TS 3.9, and the only compatible pair (ts-jest 26 with Jest 26) is aged and
  unverified. In round 2 the architecture agent withdrew. Consensus: 5 of 5.
- **Rejected: Jest + ts-jest 29.** Requires a TypeScript upgrade first.
- **Rejected: Jest 26 + ts-jest 26.** Frozen, unsupported pair.
- **Rejected: Vitest 5.** Node >=22.12 floor, second bundler, ESM friction. Kept
  as the fallback if module mocking becomes necessary.
- **Rejected: `@swc/jest`.** Avoids the TS conflict but still pulls jest-cli
  (about 40 MB).
- **Rejected: colocated `*.test.ts` in `src/`.** Safe only for `.ts` files and
  one stray import from shipping; `tests/` outside `src/` chosen.
- **Rejected: mocking `api` via runner alias.** Brittle per runner. Boundary rule
  (tests import only joplin-free modules) removes the need; adapter deferred.
- **Tension, type safety.** `tsx` does not type-check. Resolved by keeping `tsc`
  as a mandatory second gate over tests too.
- **Tension, `CLAUDE.md` gate.** Its `npx tsc --noEmit` step becomes the
  two-config `typecheck` script. `CLAUDE.md` is unversioned by decision, so this
  is recorded in `.standards/` and must be applied to local copies by hand.

## Implementation Notes

Recorded after implementation; none of these change the decision.

- **Local typings.** `@types/node` 14 has no `node:test`, and `@types/node` 16 and 18
  fail to parse under TypeScript 3.9 (TS1005/TS1110 in `crypto.d.ts`, `events.d.ts`).
  `tests/node-test.d.ts` declares the used surface. Remove it after the toolchain upgrade.
- **`skipLibCheck`** was added to the root `tsconfig.json`. The unmodified
  `npx tsc --noEmit` already failed with 14 errors, all in generated `api/*.d.ts`, so
  the documented gate was red before this change.
- **`npm ci`** was failing on `master`; the lockfile was refreshed in a separate commit.
- **Todo tests** (`{ todo }`) record unfixed findings S1, S4 and S5. They keep the run green
  and are removed when the fixes land, satisfying rule 8.
- **Rule 4 partly met.** `Settings` (class) stays in `src/settings.ts` because it imports
  runtime enums from `api/types`; only `settingsDefaults.ts` was extracted.
- **Rule 9 verified.** `.jpl` file list identical before and after; only `index.js` and
  `contentScript.js` hashes changed, from the module splits.
- **Rule 8 amended for S3 (implementer amendment, 2026-10-16; not re-deliberated by the council, ratification pending).** There is no pure validator for the `server` setting yet
  (`_checks` in `settings.ts` is empty), so no expected-failure test can be written.
  The test is added with fix 1.3. S1 (3 cases), S4 (1 case) and S5 (1 case) are todo tests.
  S4 is testable without extraction because `contentScript.ts` has no Joplin dependency.
- **Test command.** The glob is unquoted (`tests/*.test.ts`) so the shell expands it;
  Node's own `--test` glob support needs Node >= 21. `--import` needs Node >= 18.18,
  hence `engines.node >= 18.18.0`. Tests are therefore kept flat in `tests/`.
- **Review follow-ups.** `skipLibCheck` also skips checking `tests/node-test.d.ts`;
  accepted because the root config needs it for `api/`. A todo test that starts passing
  is not flagged by `node:test`: when fixing a finding, `grep -rn "todo:" tests`.
  `esbuild` (a `tsx` dependency) runs an install script, as on every `npm install`.
