import { CommandDb, parseCommandDbJson } from "../../parser/docParser";

const fs = require('fs');
const autoHintDbJson = fs.readFileSync('./data/werckmeisterAutoHintDb.json', 'utf8');
const commandDb = parseCommandDbJson(autoHintDbJson);

export function getAutoHintDb(): CommandDb {
    return commandDb;
}