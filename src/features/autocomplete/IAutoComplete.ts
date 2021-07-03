import { ISourceDocument } from "../../ISourceDocument";
import { IFeature } from "../IFeature";
import { ISuggestion } from "./ISuggestion";

export interface IAutoComplete extends IFeature {
    getSuggestions(line: string, document: ISourceDocument): Promise<ISuggestion[]>;
}