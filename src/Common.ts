import { Cursor, ISourceDocument } from "./ISourceDocument";
import * as _ from 'lodash';

export const SupportedUsingFileExtensions = [
    '.lua',
    '.template',
    '.chords',
    '.pitchmap',
    '.config',
    '.conductions'
];

export const MetaCommands = {
    instrument: "instrument", 
    volume: "volume", 
    pan: "pan", 
    mod: "mod", 
    do: "do", 
    doOnce: "doOnce", 
    modOnce: "modOnce",
    voicingStrategy: "voicingStrategy",
    tempo: "tempo",
    signature: "signature",
    mark: "mark",
    jump: "jump",
    type: "type",
    template: "template",
    name: "name",
    instrumentDef: "instrumentDef",
    instrumentConf: "instrumentConf",
    device: "device",
};

export const Keywords = {
    using: "using", 
    ...MetaCommands
};

export const AllKeywords = _.values(Keywords);
export const AllMetaCommands = _.values(MetaCommands);


const ExpressionRegex = [
    `(${AllMetaCommands.join('|')})\\s*:\\s*.*`,

    `${Keywords.using}.*`,

]
const IsExpression = new RegExp(`.*(${ExpressionRegex.join('|')})`, 's');

export const SupportedFileExtensions = [...SupportedUsingFileExtensions, '.sheet'];

export function getFileExtension(path: string): string|undefined {
    if (!path) {
        return undefined;
    }
    return (path.match(/^.*(\.\w+)$/) || [])[1];
}

/**
 * returns the expression until the cursor, ignoring new lines
 * @param document 
 * @param cursor 
 */
export async function getExpressionLine(document: ISourceDocument, cursor: Cursor): Promise<string> {
    for(let lineNr = cursor.line; lineNr >= 0; --lineNr) {
        const fromCursor = {line: lineNr, col: 0};
        let line = await document.getRange(fromCursor, cursor);
        const match = IsExpression.exec(line);
        if (match) {
            const str = match[1];
            return str.replace(/\n/g, ' ')
        }
    }
    return "";
}