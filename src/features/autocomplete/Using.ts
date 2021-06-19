import { IFileSystemInspector } from "../../IFileSystemInspector";
import { getFileExtension, SupportedUsingFileExtensions } from "../../Common";
import { ISourceDocument } from "../../ISourceDocument";
import { IAutoComplete } from "./IAutoComplete";

export class Using implements IAutoComplete {
    constructor(private fileInspector: IFileSystemInspector) {}
    public async getSuggestions(line: string, document: ISourceDocument): Promise<string[]> {
        if (!line) {
            return [];
        }
        const isUsingLine = !!line.match(/^\s*using\s*"{0,1}[^"]*$/);
        if (!isUsingLine) {
            return [];
        }
        const typingPath = (line.match(/.+"(.*)/) || [])[1];
        const documentPath = await document.getPath();
        const parentPath = await this.fileInspector.getParentPath(documentPath);
        console.log(parentPath)
        const files = await this.fileInspector.ls(parentPath);
        let result = files
            .filter(file => file.isDirectory 
                || SupportedUsingFileExtensions.includes(getFileExtension(file.path)))
        if (!!typingPath) {
            result = result.filter(file => file.path.indexOf(typingPath) >= 0)
        }
        return result.map(file => file.path);
    }
    
}