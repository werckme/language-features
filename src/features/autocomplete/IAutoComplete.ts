import { ISourceDocument } from "../../ISourceDocument";
import { IFeature } from "../IFeature";

export interface IAutoComplete extends IFeature {
    getSuggestions(line: string, document: ISourceDocument): Promise<string[]>;
}