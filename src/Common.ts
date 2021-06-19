export const SupportedUsingFileExtensions = [
    '.lua',
    '.template',
    '.chords',
    '.pitchmap',
    '.config'
];

export const SupportedFileExtensions = [...SupportedUsingFileExtensions, '.sheet'];

export function getFileExtension(path: string): string|undefined {
    if (!path) {
        return undefined;
    }
    return (path.match(/^.*(\.\w+)$/) || [])[1];
}