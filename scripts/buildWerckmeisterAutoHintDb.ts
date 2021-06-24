const fs = require("fs");
const inDirs = ['./ext/werckmeister/src', './ext/werckmeister/examples/lua'];
const outFile = './data/werckmeisterAutoHintDb.json';
const dree = require('dree');
import { DocParser, parseCommandDbJson } from '../src/parser/docParser';

const docParser = new DocParser();

function onFile(el) {
    //console.log(el)
    const txt = fs.readFileSync(el.path, {encoding:'utf8', flag:'r'});
    if (el.extension === 'lua') {
        docParser.parseLua(txt);
    }
    if (el.extension === 'h' || el.extension === 'hpp') {
        docParser.parseHpp(txt);
    }
}

const options = {
    stat: false,
    normalize: true,
    extensions: ['hpp', 'h', 'lua']
};

inDirs.forEach(dir => dree.scan(dir, options, onFile));
const json = JSON.stringify(docParser.commandDb);
fs.writeFileSync(outFile, json);