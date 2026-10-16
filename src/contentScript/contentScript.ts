import * as MarkdownIt from "markdown-it"
import { RenderRule } from "markdown-it/lib/renderer"
import { extractCodeFromIdAttribute, getDiagramTagId } from "./diagramId"

const htmlTagRegExp = /^drawio$/i

function buildRenderer(contentScriptId: string, renderer: RenderRule) {
    const defaultRender = renderer || function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options)
    }

    return function (tokens, idx, options, env, self) {
        const token = tokens[idx]
        const defaultOutput = defaultRender(tokens, idx, options, env, self)
        // console.log('token', token)
        // console.log('defaultOutput', defaultOutput)
        if (htmlTagRegExp.test(token.content)) {
            const diagramId = extractCodeFromIdAttribute(getDiagramTagId(token))
            if (diagramId) {
                const messages = {
                    edit: JSON.stringify({ diagramId: diagramId, action: 'edit' }),
                    check: JSON.stringify({ diagramId: diagramId, action: 'check' }),
                }
                const sendContentToJoplinPlugin = `
                    document.getElementById('drawio-${diagramId}-edit').addEventListener('click', async e => {
                        webviewApi.postMessage('${contentScriptId}', ${messages.edit});
                    });

                    webviewApi.postMessage('${contentScriptId}', ${messages.check}).then((response) => {
                        if (response.isValid) {
                            document.getElementById('drawio-${diagramId}-edit').style = "";
                        } else {
                            document.getElementById('drawio-${diagramId}-edit').remove();
                        }
                    });
                `.replace(/"/g, '&quot;')
                return `
                    <span class="drawio-container">
                        ${defaultOutput}
                        <button id="drawio-${diagramId}-edit" style="display:none">Edit</button>
                    </span>
                    <style onload="${sendContentToJoplinPlugin}"></style>
                `
            }
        }
        return defaultOutput
    }
}

export default function (context: { contentScriptId: string }) {
    return {
        plugin: async function (markdownIt: MarkdownIt, _options) {
            markdownIt.renderer.rules.image = buildRenderer(context.contentScriptId, markdownIt.renderer.rules.image)
        },
        assets: function () {
            return [
                { name: 'style.css' },
            ]
        },
    }
}
