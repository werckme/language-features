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

    private getModName(line: string): string {
        line = line || "";
        let match = line.match(/\s*(mod|modOnce|voicingStrategy)\s*:.*_use="?([a-zA-Z0-9]+)"?/)
        if(!match) {
            match = line.match(/\s*(mod|modOnce|voicingStrategy)\s*:\s*([a-zA-Z0-9]+)/)
        }
        if (!match || match.length < 2) {
            return "";
        }
        const modName = match[2];
        return modName;
    }

    private getInstrumentConfModName(line: string): string {
        line = line || "";
        const commandTail = (line.match(/.*(mod.*|voicingStrategy.*)/) || [])[1];
        if (!commandTail) {
            return;
        }
        let match = commandTail.match(/\s*_use="?([a-zA-Z0-9]+)"?/);
        if(match && match.length > 1) {
            return match[1];            
        }
        match = commandTail.match(/\s*(mod|voicingStrategy)\s*([a-zA-Z0-9]+)/);
        if (!match || match.length < 2) {
            return "";
        }
        const modName = match[2];
        return modName;
    }

    private isMod(commandName: string): boolean {
        return commandName === "mod"
            || commandName === "modOnce"
            || commandName === "voicingStrategy";
    }

    private isInstrumentConf(commandName: string): boolean {
        return commandName === "instrumentConf";
    }

    public async getSuggestions(line: string, document: ISourceDocument): Promise<ISuggestion[]> {
        if (!line) {
            return [];
        }
        const match = line.match(/.*?(\w+)\s*:.*?_(\w*)$/);
        if (!match) {
            return [];
        }
        let commandName = (match[1] || "").trim();
        const typingArgName = (match[2] || "").trim();
        if (this.isMod(commandName)) {
            commandName = this.getModName(line);
        }
        if (this.isInstrumentConf(commandName)) {
            commandName = this.getInstrumentConfModName(line);
        }
        const command = this.autoHintDb[commandName];
        if (!command) {
            return [];
        }
        let parameters = command.getParameter();
        if (!!typingArgName) {
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