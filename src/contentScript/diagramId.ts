const idAttributeName = 'src'

export function extractCodeFromIdAttribute(idAttribute: string): string {
    //:/dc918ec87077460fbdbb0986a91c4c9d
    const splitViewMatch = idAttribute.match(/^\:\/([A-Za-z0-9]+)/)
    if (splitViewMatch) {
        return splitViewMatch[1]
    }
    //file://C:/Users/user/.config/joplin-desktop/resources/dc918ec87077460fbdbb0986a91c4c9d.png?t=1647790570726
    const richTextMatch = idAttribute.match(/^file\:\/\/.+?([a-z0-9]+)\.(svg|png)(\?t=[0-9]+)?$/)
    if (richTextMatch) {
        return richTextMatch[1]
    }
    return null
}

export function getDiagramTagId(token: any): string {
    if (token.attrs && token.attrs.length > 0) {
        for (const attr of token.attrs) {
            if (attr[0] === idAttributeName) {
                return attr[1]
            }
        }
    }
    return ""
}
