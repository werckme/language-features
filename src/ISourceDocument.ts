export type Cursor = {line: number, col: number};

export interface ISourceDocument {
    getRange(from, to): Promise<string>;
    getLine(lineNr: number): Promise<string>;
    getAbsolutePath(): Promise<string>;
}

export interface IActiveSourceDocument extends ISourceDocument {
    getCursor(): Promise<Cursor>;
}