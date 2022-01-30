export interface ICommandParameter {
    getName(): string;
    getIsOptional(): boolean;
    getType(): string;
    getDescription(): string;
    getIsDeprecated(): boolean;
    getDeprecatedText(): string;
}

export interface ICommand {
    getName(): string;
    /**
     * return the "where" the command appears. E.g.: ["document", "track", "voice", ...]
     */
    getDocumentContext(): string[];
    getDescription(): string;
    getParameter(): ICommandParameter[];
    getUrl(): string;
}
