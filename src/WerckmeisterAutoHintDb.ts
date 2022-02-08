import _ = require("lodash");
import { CommandDb, parseCommandDbJson } from "./parser/docParser";

const fs = require('fs');
const autoHintDbJson = fs.readFileSync('./data/werckmeisterAutoHintDb.json', 'utf8');
const commandDb = parseCommandDbJson(autoHintDbJson);

export function getAutoHintDb(): CommandDb {
    return commandDb;
}

const preInstalledAuxFiles = JSON.parse(fs.readFileSync('./data/preInstalledAuxFiles.json', 'utf8'));


export function getPreInstalledAuxFiles(): {[path: string]: {name: string, isDirectory?: boolean}[] } {
    return preInstalledAuxFiles;
}
