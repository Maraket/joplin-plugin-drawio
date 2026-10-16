export const TitlePrefix = 'drawio-'
export const DataImageRegex = /^data:image\/(?<extension>png|svg)(?:\+xml)?;base64,(?<blob>.*)/

export function buildTitle(options: any): string {
    return TitlePrefix + JSON.stringify(options)
}

export function parseTitle(title: string): any {
    return JSON.parse(title.replace(TitlePrefix, ''))
}
