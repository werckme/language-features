import { EnvironmentType, IEnvironmentInspector, MidiDeviceInfo } from "./IEnvironmentInspector";

export class DummyEnvironmentInspector implements IEnvironmentInspector{
    environment: EnvironmentType = "local";
    webplayerPresets?: string[];
    public async getMidiOutputDevices(): Promise<MidiDeviceInfo[]> {
        return [];
    }
}