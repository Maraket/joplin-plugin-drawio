export function resolveThemeUi(sketch: boolean, themeUi: string, themeDark: boolean): string {
    if (sketch) {
        return 'sketch'
    }
    if (themeDark === true && themeUi === 'kennedy') {
        return 'dark'
    }
    return themeUi
}

export function buildDialogHtml(diagramBody: string, themeUi: string, settings: object): string {
    return `
            <form name="main">
                <a href="#" onclick="startDrawio()">Click here to load draw.io if it does not start automatically...</a>
                <input type="hidden" id="settings" value='${JSON.stringify(settings)}' />
                <input type="hidden" id="setting-theme-ui" value='${themeUi}' />
                <input type="hidden" id="diagram" name="diagram" value="${diagramBody}">
            </form>
            `
}
