import { test } from 'node:test'
import * as assert from 'node:assert/strict'
import contentScript from '../src/contentScript/contentScript'

const ID = 'dc918ec87077460fbdbb0986a91c4c9d'

async function render(token: any): Promise<string> {
    const rules: any = { image: undefined }
    await contentScript({ contentScriptId: 'test-script' }).plugin({ renderer: { rules } } as any, {})
    const defaultOutput = '<img src="x">'
    // The plugin wraps the previous rule; with none set it falls back to self.renderToken.
    const self = { renderToken: () => defaultOutput }
    return rules.image([token], 0, {}, {}, self)
}

test('a drawio image is wrapped in a container with a hidden Edit button', async () => {
    const html = await render({ content: 'drawio', attrs: [['src', `:/${ID}`]] })
    assert.match(html, /<span class="drawio-container">/)
    assert.match(html, new RegExp(`<button id="drawio-${ID}-edit" style="display:none">Edit</button>`))
})

test('the inline script posts edit and check messages for the diagram id', async () => {
    const html = await render({ content: 'drawio', attrs: [['src', `:/${ID}`]] })
    assert.match(html, /webviewApi\.postMessage\('test-script'/)
    assert.match(html, new RegExp(`diagramId&quot;:&quot;${ID}&quot;`))
})

test('images whose alt text is not drawio are left untouched', async () => {
    assert.equal(await render({ content: 'photo', attrs: [['src', `:/${ID}`]] }), '<img src="x">')
})

test('drawio images whose src is not a resource link are left untouched', async () => {
    assert.equal(await render({ content: 'drawio', attrs: [['src', 'https://example.com/a.png']] }), '<img src="x">')
})

// S4 (docs/security-analysis.md): the viewer relies on an inline `onload`
// handler on a <style> element. Remove `todo` when it is replaced.
test('the rendered HTML does not use inline event handlers', { todo: 'S4: inline onload handler' }, async () => {
    const html = await render({ content: 'drawio', attrs: [['src', `:/${ID}`]] })
    assert.doesNotMatch(html, /\sonload=/)
})
