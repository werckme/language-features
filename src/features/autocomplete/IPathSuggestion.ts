import { FileInfo } from "../../IFileSystemInspector";
import { ISuggestion } from "./ISuggestion";

export interface IPathSuggestion extends ISuggestion {
    file: FileInfo;
}