import { Cursor } from "../src";


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
        const beginCol:number|null = (isFistLine || isLastLine) ? from.col : null;
        const endCol:number|null = (isFistLine || isLastLine) ? to.col : null;
        let line = lines[lineIndex];
        if (beginCol !== null) {
            if (beginCol < 0 || beginCol >= line.length) {
                throw new Error("invalid begin col range");
            }
            if (endCol < 0 || endCol >= line.length) {
                console.log(endCol, line)
                throw new Error("invalid end col range");
            }
            line = line.substring(beginCol, endCol+1);      
        }
        resultLines.push(line);
    }
    return resultLines.join('\n');
}