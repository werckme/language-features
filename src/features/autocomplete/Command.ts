import _ = require("lodash");
import { ISourceDocument } from "../../ISourceDocument";
import { CommandDb } from "../../parser/docParser";
import { IAutoComplete } from "./IAutoComplete";
import { ISuggestion } from "./ISuggestion";
import { getAutoHintDb } from "../../WerckmeisterAutoHintDb";

export class Command implements IAutoComplete {
    commandDb: CommandDb;
    constructor() {
        this.commandDb = getAutoHintDb();
    }
    
    public async getSuggestions(line: string, document: ISourceDocument): Promise<ISuggestion[]> {
        const searchTerm = line.toLowerCase();
        const matches =_(this.commandDb)
            .filter((v, k) => k.toLowerCase().indexOf(searchTerm) >= 0)
            .value();
        console.log(_(this.commandDb).map((x, y)=>y + " " + x.getDocumentContext()).value());
        return matches.map(x => ({
            displayText: x.getName(),
            text: x.getName(),
            description: x.getDescription()
        }));
    }
   
}