import { ICommand, ICommandParameter } from "../../model/Command";
import { ISuggestion } from "./ISuggestion";

export interface ICommandSuggestion extends ISuggestion {
    command: ICommand;
    parameter?: ICommandParameter;
}