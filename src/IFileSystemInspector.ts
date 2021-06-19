export type Path = {};
export type FileInfo = {
    path: Path,
    isDirectory: boolean
};
export interface IFilesystemInspector {
    ls(path: Path): FileInfo[];
}