import { IEnvironmentInspector, MidiDeviceInfo } from "./IEnvironmentInspector";

export class DummyEnvironmentInspector implements IEnvironmentInspector{
    public async getMidiOutputDevices(): Promise<MidiDeviceInfo[]> {
        return [];
    }
}