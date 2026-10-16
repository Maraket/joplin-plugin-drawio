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

// S1 (docs/security-analysis.md): values are interpolated into HTML attributes
// without escaping. Fixed in Phase 1 (1.1).
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
