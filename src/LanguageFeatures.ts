import { CommandArgument } from "./features/autocomplete/CommandArgument";
import { ISuggestion } from "./features/autocomplete/ISuggestion";
import { Using } from "./features/autocomplete/Using";
import { FileInfo, IFileSystemInspector } from "./IFileSystemInspector";
import { ILanguageFeatures } from "./ILanguageFeatures";
import { IActiveSourceDocument } from "./ISourceDocument";

export class LanguageFeatures implements ILanguageFeatures {
    features = {
        autoCompletes: [
            new Using(this.fileSystemInspector),
            new CommandArgument()
        ]
    }
    constructor(private fileSystemInspector: IFileSystemInspector) {}

    public async autoComplete(document: IActiveSourceDocument): Promise<ISuggestion[]> {
        const cursor = await document.getCursor();
        const line = ((await document.getRange({line: cursor.line, col: 0}, cursor)) || "").trim();
        if (!line) {
            return [];
        }
        const suggestions:ISuggestion[] = [];
        for(const feature of this.features.autoCompletes) {
            const featureSuggestions = await feature.getSuggestions(line, document);
            if (!featureSuggestions) {
                continue;
            }
            suggestions.push(...featureSuggestions);
        }
        return suggestions;
    }
}