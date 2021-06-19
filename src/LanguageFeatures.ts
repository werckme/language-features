import { FileInfo, IFileSystemInspector } from "./IFileSystemInspector";
import { ILanguageFeatures } from "./ILanguageFeatures";
import { IActiveSourceDocument } from "./ISourceDocument";

export class LanguageFeatures implements ILanguageFeatures {
    constructor(private fileSystemInspector: IFileSystemInspector) {}

    public async autoComplete(document: IActiveSourceDocument): Promise<FileInfo> {
        throw new Error("TODO");
    }
}