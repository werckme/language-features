import { FileInfo } from "./IFileSystemInspector";
import { IActiveSourceDocument } from "./ISourceDocument";

export interface ILanguageFeatures {
    autoComplete(document: IActiveSourceDocument): Promise<string[]>;
}