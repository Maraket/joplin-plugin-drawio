import { test } from 'node:test'
import * as assert from 'node:assert/strict'
import { buildDialogHtml, resolveThemeUi } from '../src/dialogHtml'

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
// without escaping. Remove `todo` when the fix lands.
test('a quote in the server setting cannot break out of the settings attribute', { todo: 'S1: no attribute escaping' }, () => {
    const html = buildDialogHtml('x', 'kennedy', { server: `x' onfocus='alert(1)` })
    assert.doesNotMatch(html, /onfocus='alert\(1\)/)
})

test('a quote in the diagram body cannot break out of the diagram attribute', { todo: 'S1: no attribute escaping' }, () => {
    const html = buildDialogHtml(`x" onfocus="alert(1)`, 'kennedy', {})
    assert.doesNotMatch(html, /onfocus="alert\(1\)/)
})

test('a quote in the theme cannot break out of the theme attribute', { todo: 'S1: no attribute escaping' }, () => {
    const html = buildDialogHtml('x', `kennedy' onfocus='alert(1)`, {})
    assert.doesNotMatch(html, /onfocus='alert\(1\)/)
})
