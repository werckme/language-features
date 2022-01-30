import { fromXML } from 'from-xml'
import { ICommand, ICommandParameter } from '../model/Command';

export type CommandDb = {[name: string]: ICommand};

class CommandParameter implements ICommandParameter {
    constructor(private rawObject) {}
    public getName(): string { return (this.rawObject || {})['@name']; }
    public getIsOptional(): boolean { return (this.rawObject || {})['@optional'] === '1'; }
    public getType(): string { return (this.rawObject || {})['@type']; }
    public getDescription(): string { 
        const result = (this.rawObject || {})['#']; 
        if (result && result.join) {
            return result.join('\n');
        }
        return result;
    }
    public getIsDeprecated(): boolean { return (this.rawObject || {})['@deprecated'].length > 0; }
    public getDeprecatedText(): string { return (this.rawObject || {})['@deprecated']; }
}

class Command implements ICommand {
    constructor(private rawObject) {
    }
    getDocumentContext(): string[] { 
        const txtValue:string|undefined = (this.rawObject?.doc?.command || {})['@where'];
        if (!txtValue) {
            return [];
        }
        return txtValue.split(',')
            .map(x => x.trim());
    }
    public getName(): string { return (this.rawObject?.doc?.command || {})['@name']; }
    public getDescription(): string { 
        let result = (this.rawObject?.doc?.command || {})['#']; 
        if (result && result.join) {
            result = (result as Array<string>).join('\n');
        }
        return result;
    }
    public getParameter(): ICommandParameter[] {
        let params = this.rawObject?.doc?.param;
        if (!params) {
            return [];
        }
        if (!Array.isArray(params)) {
            // happens if only one object exists
            params = [params];
        }
        return (params || []).map(x => new CommandParameter(x)); 
    }
}

export function parseCommandDbJson(jsonText: string): CommandDb{
    const db: CommandDb = {};
    const json = JSON.parse(jsonText);
    for(const commandName in json) {
        db[commandName] = new Command(json[commandName].rawObject);
    }
    return db;
}

export class DocParser {
    public commandDb: CommandDb = {};
    private getDocComment(text:string , docCommentToken: string): string {
        const resLines = [];
        let withinDocBlock = false;
        for(const line of text.split('\n')) {
            const isDocCommentLine = line.trim().startsWith(docCommentToken);
            if (!withinDocBlock && isDocCommentLine) {
                withinDocBlock = true;
            }
            if (withinDocBlock && !isDocCommentLine) {
                break;
            }
            if (isDocCommentLine) {
                resLines.push(line.replace(docCommentToken, '').trim());
            }
        }
        return resLines.join('\n');
    }

    private normalizeText(text: string) {
        return text
            .replace(/manual\/#/g, 'https://werckme.github.io/manual#')
            .replace(/\\n/g, '');
    }

    private parseDocumentText(text: string) {
        text = this.normalizeText(text);
        const xml = fromXML(`<doc>${text}</doc>`);
        const command = new Command(xml);
        const commandName = command.getName();
        if (!commandName) {
            return;
        }
        this.commandDb[commandName] = command;
    }

    public parseLua(text: string) {
        text = this.normalizeText(text);
        const docText = this.getDocComment(text, '--');
        if (!docText) {
            return;
        }
        this.parseDocumentText(docText);
    }
    public parseHpp(text: string) {
        text = this.normalizeText(text);
        const docText = this.getDocComment(text, '///');
        if (!docText) {
            return;
        }
        this.parseDocumentText(docText);
    }    
}