import { test } from 'node:test'
import * as assert from 'node:assert/strict'
import { extractCodeFromIdAttribute, getDiagramTagId } from '../src/contentScript/diagramId'

const ID = 'dc918ec87077460fbdbb0986a91c4c9d'

test('extracts the id from a Markdown view resource link', () => {
    assert.equal(extractCodeFromIdAttribute(`:/${ID}`), ID)
})

test('extracts the id from a rich text file URL (png and svg, with cache buster)', () => {
    const base = 'file://C:/Users/user/.config/joplin-desktop/resources/'
    assert.equal(extractCodeFromIdAttribute(`${base}${ID}.png?t=1647790570726`), ID)
    assert.equal(extractCodeFromIdAttribute(`${base}${ID}.svg`), ID)
})

test('returns null for sources that are not a resource link', () => {
    for (const src of ['', 'https://example.com/a.png', 'data:image/png;base64,AAAA', 'file:///a/b.gif', ' :/abc']) {
        assert.equal(extractCodeFromIdAttribute(src), null, src)
    }
})

test('Markdown view id only keeps alphanumerics, so it is safe to interpolate into inline JS', () => {
    const id = extractCodeFromIdAttribute(`:/abc'+alert(1)+'`)
    assert.match(id, /^[A-Za-z0-9]+$/)
    assert.equal(id, 'abc')
})

test('getDiagramTagId reads the src attribute of a token', () => {
    assert.equal(getDiagramTagId({ attrs: [['alt', 'drawio'], ['src', `:/${ID}`]] }), `:/${ID}`)
})

test('getDiagramTagId returns an empty string when there is no src', () => {
    assert.equal(getDiagramTagId({ attrs: [['alt', 'drawio']] }), '')
    assert.equal(getDiagramTagId({ attrs: [] }), '')
    assert.equal(getDiagramTagId({}), '')
})
