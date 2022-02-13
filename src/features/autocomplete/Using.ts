import { FileInfo, IFileSystemInspector } from "../../IFileSystemInspector";
import { getFileExtension, SupportedUsingFileExtensions } from "../../Common";
import { ISourceDocument } from "../../ISourceDocument";
import { IAutoComplete } from "./IAutoComplete";
import * as _ from 'lodash';
import { IPathSuggestion } from "./IPathSuggestion";
import { getPreInstalledAuxFiles } from "../../WerckmeisterAutoHintDb";

const preInstalledAuxFiles = getPreInstalledAuxFiles();

export class Using implements IAutoComplete {
    constructor(private fileInspector: IFileSystemInspector) {}

    private async ls(path: string, typingPath: string): Promise<FileInfo[]> {
        let fileContent = await this.fileInspector.ls(path);
        typingPath = typingPath.trim();
        if (typingPath.endsWith('/') && typingPath.length > 1) {
            typingPath = _.trimEnd(typingPath, '/');
        }
        const auxFiles = preInstalledAuxFiles[typingPath];
        if (auxFiles) {
            fileContent.push(...(auxFiles.map(x => ({
                name: x.name,
                isDirectory: x.isDirectory || false
            }))));
        }
        fileContent = _.uniqBy(fileContent, x => x.name);
        return fileContent;
    }

    public async getSuggestions(line: string, document: ISourceDocument, documentContext: string): Promise<IPathSuggestion[]> {
        if (!line) {
            return [];
        }
        const isUsingLine = !!line.match(/^\s*using\s*"{0,1}[^"]*$/);
        if (!isUsingLine) {
            return [];
        }
        const typingPath = (line.match(/.+"(.*)/) || [])[1];
        if (!typingPath) {
            return [];
        }
        const filename = typingPath ? _.last(typingPath.split('/')) : "";
        let documentPath = await document.getAbsolutePath();
        documentPath = await this.fileInspector.getParentPath(documentPath);
        let searchPath = typingPath;
        if (!!filename) {
            searchPath = await this.fileInspector.getParentPath(typingPath);
        }
        searchPath = await this.fileInspector.resolve(documentPath, searchPath);
        const files = await this.ls(searchPath, typingPath);
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
                displayText: file.name,
                text: file.name,
                file: file
            }));
    }
    
}