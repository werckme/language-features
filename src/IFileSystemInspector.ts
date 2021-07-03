export type Path = string;
export type FileInfo = {
    name: string,
    isDirectory: boolean
};
export interface IFileSystemInspector {
    ls(path: Path): Promise<FileInfo[]>;
    getParentPath(path): Promise<Path>;
}