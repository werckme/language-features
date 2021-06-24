export interface ICommandParameter {
    getName(): string;
    getIsOptional(): boolean;
    getType(): string;
    getDescription(): string;
}

export interface ICommand {
    getName(): string;
    getDescription(): string;
    getParameter(): ICommandParameter[];
}
