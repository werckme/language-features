"use strict";
exports.__esModule = true;
var fs = require("fs");
var inDirs = ['./ext/werckmeister/src', './ext/werckmeister/examples/lua'];
var outFile = './data/werckmeisterAutoHintDb.json';
var dree = require('dree');
var docParser_1 = require("../src/parser/docParser");
var docParser = new docParser_1.DocParser();
function onFile(el) {
    var txt = fs.readFileSync(el.path, { encoding: 'utf8', flag: 'r' });
    if (el.extension === 'lua') {
        docParser.parseLua(txt);
    }
    if (el.extension === 'h' || el.extension === 'hpp') {
        docParser.parseHpp(txt);
    }
}
var options = {
    stat: false,
    normalize: true,
    extensions: ['hpp', 'h', 'lua']
};
inDirs.forEach(function (dir) { return dree.scan(dir, options, onFile); });
var json = JSON.stringify(docParser.commandDb);
fs.writeFileSync(outFile, json);
