import { Cursor, ISourceDocument } from "./ISourceDocument";
import { getAutoHintDb } from "./WerckmeisterAutoHintDb";
import * as _ from 'lodash';

export const SupportedUsingFileExtensions = [
    '.lua',
    '.template',
    '.chords',
    '.pitchmap',
    '.config',
    '.conductions'
];

export const MetaCommands = _.fromPairs(_.map(getAutoHintDb(), (v,k)=>[k, k]));
export const Keywords:{[name: string]: string} = {
    using: "using", 
    ...MetaCommands
};

export const AllKeywords = _.values(Keywords);
export const AllMetaCommands = _.values(MetaCommands);


const ExpressionRegex = [
    `(${AllMetaCommands.join('|')})\\s*:\\s*[^/;]*$`,
    `${Keywords.using}[^;]*$`,

]
const IsExpression = new RegExp(`.*?(${ExpressionRegex.join('|')})`, 's');

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
    
    // check if we are within an expression
    for(let lineNr = cursor.line; lineNr >= 0; --lineNr) {
        const fromCursor = {line: lineNr, col: 0};
        let line = await document.getRange(fromCursor, cursor);
        const match = IsExpression.exec(line);
        if (match) {
            const str = match[1];
            return str.replace(/\n/g, ' ');
        }
    }
    // check if we are at the beginning of an expression
    let line = await document.getRange({line: cursor.line, col: 0}, cursor);
    const termMatches = line.match(/(.*\/(?<a>\w+$))|(^(?<b>[a-zA-Z]+)$)/)?.groups || {};
    let searchTerm =  termMatches.a || termMatches.b;
    if (searchTerm) {
        return searchTerm;
    }
    return "";
}