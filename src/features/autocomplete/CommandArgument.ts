import { ISourceDocument } from "../../ISourceDocument";
import { IAutoComplete } from "./IAutoComplete";
import * as _ from 'lodash';
import { CommandDb, parseCommandDbJson } from "../../parser/docParser";
import { ICommand, ICommandParameter } from "../../model/Command";
import { Keywords } from "../../Common";
import { ICommandSuggestion } from "./ICommandSuggestion";
import { GMInstruments } from "./GMInstruments";
import { getAutoHintDb } from "../../WerckmeisterAutoHintDb";
import { IEnvironmentInspector } from "../../IEnvironmentInspector";

const LoadModInstructions = [Keywords.mod, Keywords.voicingStrategy, Keywords.do, Keywords.doOnce];
const BuiltInMods = [Keywords.volume, Keywords.pan]
const Mods = [...BuiltInMods, ...LoadModInstructions];

export class CommandArgument implements IAutoComplete {
    private autoHintDb: CommandDb;
    constructor(private environmentInspector: IEnvironmentInspector) {
        this.autoHintDb = getAutoHintDb();
    }

    private getModName(line: string): string {
        line = line || "";
        const modsJoined = Mods.join('|');
        let match = new RegExp(`\\s*(${Keywords.modOnce}|${modsJoined})\\s*:.*_use="?([a-zA-Z0-9]+)"?`).exec(line);
        if(!match) {
            match = new RegExp(`\\s*(${Keywords.modOnce}|${modsJoined})\\s*:\\s*([a-zA-Z0-9]+)`).exec(line);
        }
        if (!match || match.length < 2) {
            return "";
        }
        const modName = match[2];
        return modName;
    }

    private getInstrumentConfModName(line: string): string {
        line = line || "";
        let modsJoined = Mods.join('|');
        let buildInMod = (new RegExp(`.*(${modsJoined}).*`).exec(line) || [])[1];
        if (buildInMod && BuiltInMods.includes(buildInMod)) {
            return buildInMod;
        }
        modsJoined = Mods.map(x => `${x}.*`).join('|');
        const commandTail = (new RegExp(`.*(${modsJoined})`).exec(line) || [])[1];
        if (!commandTail) {
            return;
        }
        let match = commandTail.match(/\s*_use="?([a-zA-Z0-9]+)"?/);
        if(match && match.length > 1) {
            return match[1];            
        }
        modsJoined = Mods.join('|');
        match = new RegExp(`\\s*(${modsJoined})\\s*([a-zA-Z0-9]+)`).exec(commandTail);
        if (!match || match.length < 2) {
            return "";
        }
        const modName = match[2];
        return modName;
    }

    private isMod(commandName: string): boolean {
        return commandName === Keywords.mod
            || commandName === Keywords.modOnce
            || commandName === Keywords.voicingStrategy;
    }

    private isInstrumentConf(commandName: string): boolean {
        return commandName === Keywords.instrumentConf;
    }

    private getParameterSuggestion(command: ICommand, typingArgName: string): ICommandSuggestion[] {
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
          text: `_${parameter.getName()}`,
          deprecated: parameter.getDeprecatedText(),
          command: command,
          description: parameter.getDescription()
        }));
    }

    private getInstrumentDefPcSuggestions(command: ICommand, parameter: ICommandParameter, typingValue: string): ICommandSuggestion[] {
        let instruments = GMInstruments.map((name, index) => ({
            displayText: `${name} (${index})`,
            text: index.toString(),
            command: command,
            parameter: parameter
        }));
        if (!!typingValue) {
            instruments = instruments.filter(instrument => instrument.displayText.
                toLowerCase().indexOf(typingValue.toLowerCase()) >= 0)
        }
        return instruments;
    }

    private getInstrumentDefGmNameSuggestions(command: ICommand, parameter: ICommandParameter, typingValue: string): ICommandSuggestion[] {
        let instruments = GMInstruments.map((name, index) => ({
            displayText: `${name} (${index})`,
            text: name,
            command: command,
            parameter: parameter
        }));
        if (!!typingValue) {
            instruments = instruments.filter(instrument => instrument.displayText.
                toLowerCase().indexOf(typingValue.toLowerCase()) >= 0)
        }
        return instruments;
    }

    private async getDeviceIdList(command: ICommand, parameter: ICommandParameter, typingValue: string): Promise<ICommandSuggestion[]> {
        const devices = await this.environmentInspector.getMidiOutputDevices();
        let suggestions = devices.map((device) => ({
            displayText: `${device.name} (${device.id})`,
            text: device.id,
            command: command,
            parameter: parameter
        }));
        if (!!typingValue) {
            suggestions = suggestions.filter(device => device.displayText.
                toLowerCase().indexOf(typingValue.toLowerCase()) >= 0)
        }
        return suggestions;
    }

    private async getDeviceNameList(command: ICommand, parameter: ICommandParameter, typingValue: string): Promise<ICommandSuggestion[]> {
        const devices = await this.environmentInspector.getMidiOutputDevices();
        let suggestions = devices.map((device) => ({
            displayText: `${device.name} (${device.id})`,
            text: device.name,
            command: command,
            parameter: parameter
        }));
        if (!!typingValue) {
            suggestions = suggestions.filter(device => device.displayText.
                toLowerCase().indexOf(typingValue.toLowerCase()) >= 0)
        }
        return suggestions;
    }

    private async getValueSuggestion(command: ICommand, parameterName: string, typingValue: string): Promise<ICommandSuggestion[]> {
        let parameter = command.getParameter()
            .filter(param => param.getName() === parameterName)[0];
        if (!parameter) {
            return [];
        }
        if (command.getName() === Keywords.instrumentDef && parameterName == 'pc') {
            return this.getInstrumentDefPcSuggestions(command, parameter, typingValue);
        }
        if (command.getName() === Keywords.instrumentDef && parameterName == 'gmName') {
            return this.getInstrumentDefGmNameSuggestions(command, parameter, typingValue);
        }        
        if (command.getName() === Keywords.device && parameterName == 'usePort') {
            return await this.getDeviceIdList(command, parameter, typingValue);
        }
        if (command.getName() === Keywords.device && parameterName == 'useDevice') {
            return await this.getDeviceNameList(command, parameter, typingValue);
        }        
        if (this.environmentInspector.environment === "web" && command.getName() === Keywords.device && parameterName == 'isType') {
            return [{
                command: command,
                displayText: "webPlayer",
                text: "webPlayer",
            }];
        }   
        if (this.environmentInspector.environment === "web" && command.getName() === Keywords.device && parameterName == 'useFont') {
            return (this.environmentInspector.webplayerPresets || [])
                .map(x => ({
                    command: command, 
                    displayText: x,
                    text: x
                }));
        }                
        const typeString = (parameter.getType() || "");
        const valueListMatch = typeString.match(/\[(.*)\]/);
        if (!valueListMatch || !valueListMatch[1]) {
            return [];
        }
        let values = valueListMatch[1].split(',').map(x => x.trim());
        if (!!typingValue) {
            values = values.filter(value => value.startsWith(typingValue))
        }
        return values
            .map(value => ({
          displayText: value,
          text: `"${value}"`,
          command: command,
          parameter: parameter,
        }));
    }

    public async getSuggestions(line: string, document: ISourceDocument, documentContext: string): Promise<ICommandSuggestion[]> {
        if (!line) {
            return [];
        }
        const match = line.match(/.*?(\w+)\s*:.*?_(\w*)(="?(\w*))?$/);
        if (!match) {
            return [];
        }
        let commandName = (match[1] || "").trim();
        const isTypingArgumentValue = match[3] !== undefined;
        const typingText = (match[2] || "").trim();
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
        if (isTypingArgumentValue) {
            const parameterName = (match[2] || "").trim();
            const typingValue = (match[4] || "").trim();
            return await this.getValueSuggestion(command, parameterName, typingValue);
        }
        return this.getParameterSuggestion(command, typingText);
    }
}