import { test } from 'node:test'
import * as assert from 'node:assert/strict'
import { TitlePrefix, DataImageRegex, buildTitle, parseTitle } from '../src/resourceTitle'

test('buildTitle prefixes the JSON options with drawio-', () => {
    assert.equal(buildTitle({ sketch: true }), 'drawio-{"sketch":true}')
    assert.equal(buildTitle({}), 'drawio-{}')
})

test('parseTitle round-trips the options written by buildTitle', () => {
    assert.deepEqual(parseTitle(buildTitle({ sketch: false })), { sketch: false })
    assert.deepEqual(parseTitle(buildTitle({ sketch: true })), { sketch: true })
})

test('parseTitle throws on malformed JSON (callers must catch)', () => {
    assert.throws(() => parseTitle('drawio-{not json'))
    assert.throws(() => parseTitle('drawio-'))
})

test('TitlePrefix is the marker the content script check relies on', () => {
    assert.equal(TitlePrefix, 'drawio-')
    assert.ok(buildTitle({}).startsWith(TitlePrefix))
})

test('DataImageRegex accepts png and svg data URIs and captures extension and blob', () => {
    const png = DataImageRegex.exec('data:image/png;base64,QUJD')
    assert.equal(png.groups.extension, 'png')
    assert.equal(png.groups.blob, 'QUJD')

    const svg = DataImageRegex.exec('data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=')
    assert.equal(svg.groups.extension, 'svg')
    assert.equal(svg.groups.blob, 'PHN2Zz48L3N2Zz4=')
})

test('DataImageRegex accepts the empty-diagram PNG seed (empty blob)', () => {
    assert.equal(DataImageRegex.exec('data:image/png;base64,').groups.blob, '')
})

test('DataImageRegex rejects other image types and non-base64 encodings', () => {
    for (const data of [
        'data:image/jpeg;base64,QUJD',
        'data:image/gif;base64,QUJD',
        'data:text/html;base64,QUJD',
        'data:image/png,QUJD',
        'data:image/pngx;base64,QUJD',
        ' data:image/png;base64,QUJD',
        'javascript:alert(1)',
        '',
    ]) {
        assert.equal(DataImageRegex.test(data), false, data)
    }
})

// S5 (docs/security-analysis.md): the blob is not validated as base64 and a
// newline silently truncates it. Remove `todo` when the fix lands.
test('DataImageRegex only accepts a base64 alphabet payload', { todo: 'S5: blob is not validated' }, () => {
    assert.equal(DataImageRegex.test('data:image/png;base64,<script>alert(1)</script>'), false)
})
