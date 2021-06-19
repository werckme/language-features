export type Path = {};
export type FileInfo = {
    path: Path,
    isDirectory: boolean
};
export interface IFileSystemInspector {
    ls(path: Path): FileInfo[];
}