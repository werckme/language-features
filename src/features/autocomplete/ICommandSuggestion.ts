import { ICommand } from "../../documents/Command";
import { ISuggestion } from "./ISuggestion";

export interface ICommandSuggestion extends ISuggestion {
    command: ICommand;
}