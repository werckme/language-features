import { Using } from "./features/autocomplete/Using";
import { FileInfo, IFileSystemInspector } from "./IFileSystemInspector";
import { ILanguageFeatures } from "./ILanguageFeatures";
import { IActiveSourceDocument } from "./ISourceDocument";

export class LanguageFeatures implements ILanguageFeatures {
    features = {
        autoCompletes: [
            new Using(this.fileSystemInspector)
        ]
    }
    constructor(private fileSystemInspector: IFileSystemInspector) {}

    public async autoComplete(document: IActiveSourceDocument): Promise<string[]> {
        const cursor = await document.getCursor();
        const line = ((await document.getRange({line: cursor.line, col: 0}, cursor)) || "").trim();
        if (!line) {
            return [];
        }
        const suggestions:string[] = [];
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