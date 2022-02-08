
const inDirs = ['./ext/werckmeister/src', './ext/werckmeister/examples/lua'];
const autoHintOutFile = './data/werckmeisterAutoHintDb.json';
const preInstalledAuxFiles = './data/preInstalledAuxFiles.json';
const dree = require('dree');
import { DocParser, parseCommandDbJson } from '../src/parser/docParser';
import * as fsPath from 'path';
import * as fs from 'fs';
const docParser = new DocParser();

function onFile(el) {
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
fs.writeFileSync(autoHintOutFile, json);

const auxFiles: {[path:string]: any[]} = {};
dree.scan("./ext/werckmeister/examples", {stat:false, normalize: true, emptyDirectory: true}, (file)=> {
    const path:string = file.relativePath;
    let dir = '/' + fsPath.dirname(path);
    if (dir === '/.') {
        dir = '/';
    }
    let files = auxFiles[dir];
    if (!files) {
        const absDirPath = fsPath.dirname(file.path);
        files = [];
        auxFiles[dir] = files;
        const subDirectories = fs.readdirSync(absDirPath)
            .filter(x => fs.statSync(fsPath.join(absDirPath, x)).isDirectory())
            .map(x => ({name: x, isDirectory: true}));
        files.push(...subDirectories);
    }
    if (file.name.trim().startsWith('_') || dir === '/') {
        return;
    }    
    files.push({
        name: file.name
    });
}, dirObject => {
    const dir = "/" + dirObject.relativePath;
    if (dir === '/.') {
        return;
    }
    let files = auxFiles[dir];
    if (!files) {
        const absDirPath = dirObject.path;
        files = [];
        auxFiles[dir] = files;
        const subDirectories = fs.readdirSync(absDirPath)
            .filter(x => fs.statSync(fsPath.join(absDirPath, x)).isDirectory())
            .map(x => ({name: x, isDirectory: true}));
        files.push(...subDirectories);
    }
});
const auxFilesJson = JSON.stringify(auxFiles);
fs.writeFileSync(preInstalledAuxFiles, auxFilesJson);