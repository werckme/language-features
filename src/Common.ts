import { Cursor, ISourceDocument } from "./ISourceDocument";

export const SupportedUsingFileExtensions = [
    '.lua',
    '.template',
    '.chords',
    '.pitchmap',
    '.config'
];

export const Keywords = {
    using: "using", 
    instrument: "instrument", 
    volume: "volume", 
    pan: "pan", 
    mod: "mod", 
    modOnce: "modOnce",
    voicingStrategy: "voicingStrategy",
    instrumentDef: "instrumentDef",
    instrumentConf: "instrumentConf",
};

export const SupportedFileExtensions = [...SupportedUsingFileExtensions, '.sheet'];

export function getFileExtension(path: string): string|undefined {
    if (!path) {
        return undefined;
    }
    return (path.match(/^.*(\.\w+)$/) || [])[1];
}

/**
 * returns the expression until the cursor ignoring lines
 * @param document 
 * @param cursor 
 */
export function getExpressionLine(document: ISourceDocument, cursor: Cursor): string {
    return "";
}