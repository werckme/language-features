import { FileInfo, IFileSystemInspector } from "../../IFileSystemInspector";
import { getFileExtension, SupportedUsingFileExtensions } from "../../Common";
import { ISourceDocument } from "../../ISourceDocument";
import { IAutoComplete } from "./IAutoComplete";
import * as _ from 'lodash';
import { ISuggestion } from "./ISuggestion";
import { ICommand } from "../../documents/Command";
import { CommandDb, parseCommandDbJson } from "../../parser/docParser";
import { ICommandParameter } from "../../../out/documents/Command";

const fs = require('fs');
const autoHintDbJson = fs.readFileSync('./data/werckmeisterAutoHintDb.json', 'utf8');

export class CommandArgument implements IAutoComplete {
    private autoHintDb: CommandDb;
    constructor() {
        this.autoHintDb = parseCommandDbJson(autoHintDbJson);
    }
    public async getSuggestions(line: string, document: ISourceDocument): Promise<ISuggestion[]> {
        if (!line) {
            return [];
        }
        const match = line.match(/.*?(\w+)\s*:.*?_(\w*)$/);
        if (!match) {
            return [];
        }
        const commandName = (match[1] || "").trim();
        const typingArgName = (match[2] || "").trim();
        const command = this.autoHintDb[commandName];
        if (!command) {
            return [];
        }
        let parameters = command.getParameter();
        if (!!typingArgName) {
            console.log(typingArgName)
            parameters = parameters.filter(parameter => parameter.getName().startsWith(typingArgName))
        }
        return parameters
            .sort((a: ICommandParameter, b: ICommandParameter) => {
                return a.getName().localeCompare(b.getName());
            })
            .map(parameter => ({
          displayText: parameter.getName(),
          text: `_${parameter.getName()}=`
        }));
    }
}