export type MidiDeviceInfo = {name: string, id: string};
export type EnvironmentType = 'web' | 'local';
export interface IEnvironmentInspector {
    environment: EnvironmentType;
    getMidiOutputDevices(): Promise<MidiDeviceInfo[]>;
    webplayerPresets?: string[];
}