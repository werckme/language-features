import _ = require("lodash");
import { ISourceDocument } from "../../ISourceDocument";
import { CommandDb } from "../../parser/docParser";
import { IAutoComplete } from "./IAutoComplete";
import { ISuggestion } from "./ISuggestion";
import { getAutoHintDb } from "./WerckmeisterAutoHintDb";

export class Command implements IAutoComplete {
    commandDb: CommandDb;
    constructor() {
        this.commandDb = getAutoHintDb();
    }
    
    public async getSuggestions(line: string, document: ISourceDocument): Promise<ISuggestion[]> {
        const termMatches = line.match(/(.*\/(?<a>\w+$))|(^(?<b>\w+)$)/)?.groups || {};
        let searchTerm =  termMatches.a || termMatches.b;
        if (!searchTerm) {
            return [];
        }
        searchTerm = searchTerm.toLowerCase();
        const matches =_(this.commandDb)
            .filter((v, k) => k.toLowerCase().indexOf(searchTerm) >= 0)
            .value();
        return matches.map(x => ({
            displayText: x.getName(),
            text: x.getName(),
            description: x.getDescription()
        }));
    }
   
}