export function resolveThemeUi(sketch: boolean, themeUi: string, themeDark: boolean): string {
    if (sketch) {
        return 'sketch'
    }
    if (themeDark === true && themeUi === 'kennedy') {
        return 'dark'
    }
    return themeUi
}

export function escapeAttribute(value: string, quote: "'" | '"' = '"'): string {
    if (!value) {
        return ""
    }
    const escaped = value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
    if (quote === "'") {
        return escaped.replace(/'/g, "&#39;")
    }
    return escaped.replace(/"/g, "&quot;")
}

export function buildDialogHtml(diagramBody: string, themeUi: string, settings: object): string {
    const escapedSettings = escapeAttribute(JSON.stringify(settings || {}), "'")
    const escapedThemeUi = escapeAttribute(themeUi, "'")
    const escapedDiagramBody = escapeAttribute(diagramBody, '"')
    return `
            <form name="main">
                <a href="#" onclick="startDrawio()">Click here to load draw.io if it does not start automatically...</a>
                <input type="hidden" id="settings" value='${escapedSettings}' />
                <input type="hidden" id="setting-theme-ui" value='${escapedThemeUi}' />
                <input type="hidden" id="diagram" name="diagram" value="${escapedDiagramBody}">
            </form>
            `
}
