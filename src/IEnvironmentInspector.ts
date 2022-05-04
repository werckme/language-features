export type MidiDeviceInfo = {name: string, id: string};
export interface IEnvironmentInspector {
    getMidiOutputDevices(): Promise<MidiDeviceInfo[]>;
}