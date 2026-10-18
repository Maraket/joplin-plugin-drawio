import { test } from 'node:test'
import * as assert from 'node:assert/strict'
import { buildDialogHtml, resolveThemeUi, escapeAttribute } from '../src/dialogHtml'

test('sketch mode always selects the sketch theme', () => {
    assert.equal(resolveThemeUi(true, 'kennedy', false), 'sketch')
    assert.equal(resolveThemeUi(true, 'min', true), 'sketch')
})

test('dark mode only rewrites the kennedy theme to dark', () => {
    assert.equal(resolveThemeUi(false, 'kennedy', true), 'dark')
    assert.equal(resolveThemeUi(false, 'min', true), 'min')
    assert.equal(resolveThemeUi(false, 'atlas', true), 'atlas')
})

test('light mode keeps the configured theme', () => {
    assert.equal(resolveThemeUi(false, 'kennedy', false), 'kennedy')
    assert.equal(resolveThemeUi(false, 'atlas', false), 'atlas')
})

test('dialog HTML carries settings, theme and diagram in hidden inputs', () => {
    const html = buildDialogHtml('data:image/png;base64,QUJD', 'kennedy', { grid: true, server: 'https://embed.diagrams.net/' })
    assert.match(html, /<form name="main">/)
    assert.match(html, /id="settings" value='\{"grid":true,"server":"https:\/\/embed\.diagrams\.net\/"\}'/)
    assert.match(html, /id="setting-theme-ui" value='kennedy'/)
    assert.match(html, /id="diagram" name="diagram" value="data:image\/png;base64,QUJD"/)
    assert.match(html, /onclick="startDrawio\(\)"/)
})

// S1 (docs/security-analysis.md): values interpolated into HTML attributes must be
// escaped. Fixed in Phase 1 (1.1).
test('a quote in the server setting cannot break out of the settings attribute', () => {
    const html = buildDialogHtml('x', 'kennedy', { server: "x' onfocus='alert(1)" })
    assert.doesNotMatch(html, /onfocus='alert\(1\)/)
    assert.match(html, /x&#39; onfocus=&#39;alert\(1\)/)
})

test('a quote in the diagram body cannot break out of the diagram attribute', () => {
    const html = buildDialogHtml('x" onfocus="alert(1)', 'kennedy', {})
    assert.doesNotMatch(html, /onfocus="alert\(1\)/)
    assert.match(html, /x&quot; onfocus=&quot;alert\(1\)/)
})

test('a quote in the theme cannot break out of the theme attribute', () => {
    const html = buildDialogHtml('x', "kennedy' onfocus='alert(1)", {})
    assert.doesNotMatch(html, /onfocus='alert\(1\)/)
    assert.match(html, /kennedy&#39; onfocus=&#39;alert\(1\)/)
})

test('tags and brackets in diagram body and theme are escaped', () => {
    const html = buildDialogHtml('x</form><script>alert(1)</script>', 'kennedy</form>', {})
    assert.doesNotMatch(html, /<\/form><script>/)
    assert.match(html, /x&lt;\/form&gt;&lt;script&gt;alert\(1\)&lt;\/script&gt;/)
    assert.match(html, /kennedy&lt;\/form&gt;/)
})

test('escapeAttribute handles empty or falsy values safely', () => {
    assert.equal(escapeAttribute(''), '')
    assert.equal(escapeAttribute(null as any), '')
    assert.equal(escapeAttribute(undefined as any), '')
})

// Mirrors what the HTML parser does to an attribute value before `.value` is read
// in bootstrap.js. `&amp;` is decoded last so `&amp;quot;` stays literal.
function decodeAttribute(value: string): string {
    return value
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
}

test('escaping round-trips: decoding the attribute restores the original value', () => {
    for (const value of [
        'plain',
        `it's "quoted" & <tagged>`,
        '&amp; &quot; &#39; already-escaped looking text',
        'data:image/png;base64,QUJD+/=',
        '\n\ttabs and newlines',
    ]) {
        assert.equal(decodeAttribute(escapeAttribute(value, '"')), value, value)
        assert.equal(decodeAttribute(escapeAttribute(value, "'")), value, value)
    }
})

test('the settings JSON survives escaping and parses back to the same object', () => {
    const settings = { server: `https://example.com/?a=1&b='2'`, themeDark: true, note: '<b>"x"</b>' }
    const html = buildDialogHtml('x', 'kennedy', settings)
    const attr = /id="settings" value='([^']*)'/.exec(html)[1]
    assert.deepEqual(JSON.parse(decodeAttribute(attr)), settings)
})
