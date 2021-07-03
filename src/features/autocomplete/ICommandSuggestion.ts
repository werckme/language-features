import { ICommand, ICommandParameter } from "../../documents/Command";
import { ISuggestion } from "./ISuggestion";

export interface ICommandSuggestion extends ISuggestion {
    command: ICommand;
    parameter?: ICommandParameter;
}