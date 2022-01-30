import { getExpressionDocContext, getExpressionLine } from "./Common";
import { CommandArgument } from "./features/autocomplete/CommandArgument";
import { Command } from "./features/autocomplete/Command";
import { ISuggestion } from "./features/autocomplete/ISuggestion";
import { Using } from "./features/autocomplete/Using";
import { FileInfo, IFileSystemInspector } from "./IFileSystemInspector";
import { ILanguageFeatures } from "./ILanguageFeatures";
import { IActiveSourceDocument } from "./ISourceDocument";

export class LanguageFeatures implements ILanguageFeatures {
    features = {
        autoCompletes: [
            new Using(this.fileSystemInspector),
            new Command(),
            new CommandArgument()
        ]
    }
    constructor(private fileSystemInspector: IFileSystemInspector) {}

    public async autoComplete(document: IActiveSourceDocument): Promise<ISuggestion[]> {
        const cursor = await document.getCursor();
        const line = await getExpressionLine(document, cursor);
        if (!line) {
            return [];
        }
        const documentContext = await getExpressionDocContext(document, cursor);
        const suggestions:ISuggestion[] = [];
        for(const feature of this.features.autoCompletes) {
            const featureSuggestions = await feature.getSuggestions(line, document, documentContext);
            if (!featureSuggestions) {
                continue;
            }
            suggestions.push(...featureSuggestions);
        }
        return suggestions;
    }
}