// Minimal typings for the Node built-ins used by the tests.
// @types/node 14 (pinned by TypeScript 3.9) predates `node:test`, and newer
// @types/node does not parse under TypeScript 3.9. Delete this file once the
// toolchain upgrade (remediation roadmap item 3.3: webpack 5 and TypeScript 5) allows @types/node >= 18.

declare module 'node:test' {
    interface TestOptions {
        todo?: boolean | string
        skip?: boolean | string
    }
    export function test(name: string, fn: () => void | Promise<void>): void
    export function test(name: string, options: TestOptions, fn: () => void | Promise<void>): void
}

declare module 'node:assert/strict' {
    export function ok(value: unknown, message?: string): void
    export function equal(actual: unknown, expected: unknown, message?: string): void
    export function notEqual(actual: unknown, expected: unknown, message?: string): void
    export function deepEqual(actual: unknown, expected: unknown, message?: string): void
    export function match(value: string, regexp: RegExp, message?: string): void
    export function doesNotMatch(value: string, regexp: RegExp, message?: string): void
    export function throws(fn: () => unknown, expected?: RegExp | Function, message?: string): void
}
