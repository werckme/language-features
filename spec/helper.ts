import { Cursor, IActiveSourceDocument } from "../src";
import * as _ from 'lodash';

export class TestDocument implements IActiveSourceDocument {
    public documentPath = "/testDocument.sheet";
    constructor(private text: string, private cursor: Cursor = undefined) {
        if (cursor === undefined) {
            const lines = text.split('\n');
            const lastLine = _.last(lines);
            this.cursor = { line: lines.length - 1, col: lastLine.length - 1 };
        }
    }
    async getCursor(): Promise<Cursor> {
        return this.cursor;
    }
    async getRange(from: Cursor, to: Cursor): Promise<string> {
        const line = getRangeFromText(from, to, this.text);
        return line;
    }
    async getAbsolutePath(): Promise<string> {
        return this.documentPath;
    }
    async getLine(lineNr: number): Promise<string> {
        const lines = this.text.split('\n');
        if (lineNr >= lines.length) {
            throw new Error("invalid line nr");
        }
        return lines[lineNr];
    }
}

export function getRangeFromText(from: Cursor, to: Cursor, text: string): string {
    text = text || "";
    if (!text) {
        return "";
    }
    const lines = text.split('\n');
    const invalidIndices = from.line < 0 || from.line >= lines.length || to.line < 0 || to.line >= lines.length;
    const invalidRange = from.line > to.line;
    if (invalidIndices || invalidRange) {
        throw new Error("invalid range");
    }
    const resultLines: string[] = [];
    for (let lineIndex = from.line; lineIndex <= to.line; ++lineIndex) {
        const isFistLine = lineIndex === from.line;
        const isLastLine = lineIndex === to.line;
        let line = lines[lineIndex];
        if (lineIndex === from.line || lineIndex === to.line) {
            const beginCol = lineIndex === from.line ? from.col : 0;
            const endCol = lineIndex === to.line ? to.col : line.length - 1;
            line = line.substring(beginCol, endCol + 1);
        }
        resultLines.push(line);
    }
    return resultLines.join('\n');
}