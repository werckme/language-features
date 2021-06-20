import { ISuggestion } from "./features/autocomplete/ISuggestion";
import { FileInfo } from "./IFileSystemInspector";
import { IActiveSourceDocument } from "./ISourceDocument";

export interface ILanguageFeatures {
    autoComplete(document: IActiveSourceDocument): Promise<ISuggestion[]>;
}