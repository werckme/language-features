import { FileInfo, IFileSystemInspector } from "../../IFileSystemInspector";
import { getFileExtension, SupportedUsingFileExtensions } from "../../Common";
import { ISourceDocument } from "../../ISourceDocument";
import { IAutoComplete } from "./IAutoComplete";
import * as _ from 'lodash';
import { IPathSuggestion } from "./IPathSuggestion";

export class Using implements IAutoComplete {
    constructor(private fileInspector: IFileSystemInspector) {}
    public async getSuggestions(line: string, document: ISourceDocument): Promise<IPathSuggestion[]> {
        if (!line) {
            return [];
        }
        const isUsingLine = !!line.match(/^\s*using\s*"{0,1}[^"]*$/);
        if (!isUsingLine) {
            return [];
        }
        const typingPath = (line.match(/.+"(.*)/) || [])[1];
        const filename = typingPath ? _.last(typingPath.split('/')) : "";
        let documentPath = await document.getAbsolutePath();
        documentPath = await this.fileInspector.getParentPath(documentPath);
        let searchPath = typingPath;
        if (!!filename) {
            searchPath = await this.fileInspector.getParentPath(typingPath);
        }
        searchPath = searchPath.replace('../', await this.fileInspector.getParentPath(documentPath));
        searchPath = searchPath.replace('./', documentPath);
        const files = await this.fileInspector.ls(searchPath);
        let result = files
            .filter(file => file.isDirectory 
                || SupportedUsingFileExtensions.includes(getFileExtension(file.name)))
        if (!!filename) {
            result = result.filter(file => file.name.startsWith(filename))
        }
        return result
            .sort((a: FileInfo, b: FileInfo) => {
                if (a.isDirectory && !b.isDirectory) {
                    return -1;
                }
                if (!a.isDirectory && b.isDirectory) {
                    return 1;
                }
                return a.name.localeCompare(b.name);
            })
            .map(file => ({
                text: file.name,
                file: file
            }));
    }
    
}