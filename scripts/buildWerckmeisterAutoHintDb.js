"use strict";
exports.__esModule = true;
var inDirs = ['./ext/werckmeister/src', './ext/werckmeister/examples/lua'];
var autoHintOutFile = './data/werckmeisterAutoHintDb.json';
var preInstalledAuxFiles = './data/preInstalledAuxFiles.json';
var dree = require('dree');
var docParser_1 = require("../src/parser/docParser");
var fsPath = require("path");
var fs = require("fs");
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
fs.writeFileSync(autoHintOutFile, json);
var auxFiles = {};
dree.scan("./ext/werckmeister/examples", { stat: false, normalize: true, emptyDirectory: true }, function (file) {
    var path = file.relativePath;
    var dir = '/' + fsPath.dirname(path);
    if (dir === '/.') {
        dir = '/';
    }
    var files = auxFiles[dir];
    if (!files) {
        var absDirPath_1 = fsPath.dirname(file.path);
        files = [];
        auxFiles[dir] = files;
        var subDirectories = fs.readdirSync(absDirPath_1)
            .filter(function (x) { return fs.statSync(fsPath.join(absDirPath_1, x)).isDirectory(); })
            .map(function (x) { return ({ name: x, isDirectory: true }); });
        files.push.apply(files, subDirectories);
    }
    if (file.name.trim().startsWith('_') || dir === '/') {
        return;
    }
    files.push({
        name: file.name
    });
}, function (dirObject) {
    var dir = "/" + dirObject.relativePath;
    if (dir === '/.') {
        return;
    }
    var files = auxFiles[dir];
    if (!files) {
        var absDirPath_2 = dirObject.path;
        files = [];
        auxFiles[dir] = files;
        var subDirectories = fs.readdirSync(absDirPath_2)
            .filter(function (x) { return fs.statSync(fsPath.join(absDirPath_2, x)).isDirectory(); })
            .map(function (x) { return ({ name: x, isDirectory: true }); });
        files.push.apply(files, subDirectories);
    }
});
var auxFilesJson = JSON.stringify(auxFiles);
fs.writeFileSync(preInstalledAuxFiles, auxFilesJson);
