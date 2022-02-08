import * as chai from 'chai';
import "regenerator-runtime/runtime";
import { IActiveSourceDocument, 
  FileInfo, 
  IFileSystemInspector, 
  LanguageFeatures, 
  Path,
  Cursor} 
from '../src';
import * as _ from 'lodash';
import { IPathSuggestion } from '../src/features/autocomplete/IPathSuggestion';
import { getRangeFromText, TestDocument } from './helper';
import * as pathModule from 'path';
import { exit } from 'process';

const expect = chai.expect;


function file(name: string): FileInfo {
  return {name: name, isDirectory: false};
} 

function dir(name: string): FileInfo {
  return {name: name, isDirectory: true};
} 

class FileSystemInspectorMock implements IFileSystemInspector {
  constructor(private fs: {[dir: string]: FileInfo[]}) {}
  
  public async resolve(basePath: string, path: string): Promise<string> {
    const result = pathModule.resolve(basePath, path);
    return result;
  }
  
  public async getParentPath(path: string): Promise<string> {
    path = path.trim().replace(/\/$/, '');
    const segments = path.split('/');
    const result = segments.slice(0, segments.length - 1).join('/') + '/';
    return result;
  }
  public async ls(path: Path): Promise<FileInfo[]> {
    return this.fs[path] || [];
  }
}

chai.should();

const numberOfPreInstalledAuxDirectories = 4;

describe('should return files and directories', () => {
  it('return nothing', async () => {
    const fs = new FileSystemInspectorMock({'/': []});
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument("");
    expect(await toTest.autoComplete(doc)).to.deep.equal([]);
  });
  it('return supported files for using', async () => {
    const fs = new FileSystemInspectorMock({ '/': [
      file("file.lua"),
      file("file.template"),
      file("file.chords"),
      file("file.pitchmap"),
      file("file.config"),
      file("file.conductions")
    ]});
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument('using "/');
    const suggestions = await toTest.autoComplete(doc);
    expect(suggestions.length).to.equal(6 + numberOfPreInstalledAuxDirectories);
  });
  it('do not return unsupported file for using', async () => {
    const fs = new FileSystemInspectorMock({ '/': [
      file("file.sheet")
    ]});
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument('using "/');
    const suggestions = await toTest.autoComplete(doc);
    expect(suggestions.length).to.equal(numberOfPreInstalledAuxDirectories);
  });
  it('return nothing if using line is complete', async () => {
    const fs = new FileSystemInspectorMock({ '/': [
      file("file.lua"),
      file("file.template"),
      file("file.chords"),
      file("file.pitchmap"),
      file("file.config")
    ]});
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument('using "myFile.lua"');
    const suggestions = await toTest.autoComplete(doc);
    expect(suggestions.length).to.equal(0);
  });
  it('return filtered filename', async () => {
    const fs = new FileSystemInspectorMock({ '/': [
      file("file.lua"),
      file("file.template"),
      file("file.chords"),
      file("file.pitchmap"),
      file("file.config")
    ]});
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument('using "file.l');
    const suggestions = await toTest.autoComplete(doc);
    expect(suggestions.length).to.equal(1);
    expect(suggestions[0].displayText).to.equal("file.lua");
  });
  it('return directories', async () => {
    const fs = new FileSystemInspectorMock({'/': [
      dir("dir"),
    ]});
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument('using "/');
    const suggestions = await toTest.autoComplete(doc);
    expect(suggestions.length).to.equal(1 + numberOfPreInstalledAuxDirectories);
  });
  it('return content of sub directories', async () => {
    const fs = new FileSystemInspectorMock({'/dir1': [
      file("file1.lua"),
    ], 
    '/dir2': [
      file("file2.lua"),
    ]});
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument('using "/dir1/');
    const suggestions = await toTest.autoComplete(doc);
    expect(suggestions.length).to.equal(1);
    expect(suggestions[0].displayText).to.equal("file1.lua");
  });
  it('return resolved relative path', async () => {
    const fs = new FileSystemInspectorMock({ '/': [
      file("file.lua"),
      file("file.template"),
      file("file.chords"),
      file("file.pitchmap"),
      file("file.config")
    ]});
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument('using "./');
    const suggestions = await toTest.autoComplete(doc);
    expect(suggestions.length).to.equal(5 + numberOfPreInstalledAuxDirectories);
  });  
  it('return resolved relative sub path', async () => {
    const fs = new FileSystemInspectorMock({ '/dir': [
      file("file.lua"),
      file("file.template"),
      file("file.chords"),
      file("file.pitchmap"),
      file("file.config")
    ]});
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument('using "./dir/');
    const suggestions = await toTest.autoComplete(doc);
    expect(suggestions.length).to.equal(5);
  });
  it('return resolved relative sub path filterd file', async () => {
    const fs = new FileSystemInspectorMock({ '/dir': [
      file("file.lua"),
      file("file.template"),
      file("file.chords"),
      file("file.pitchmap"),
      file("file.config")
    ]});
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument('using "./dir/file.l');
    const suggestions = await toTest.autoComplete(doc);
    expect(suggestions.length).to.equal(1);
    expect(suggestions[0].displayText).to.equal("file.lua");
  });
  it('return resolved relative sub document root path', async () => {
    const fs = new FileSystemInspectorMock({ '/dir': [
      file("file.lua"),
      file("file.template"),
      file("file.chords"),
      file("file.pitchmap"),
      file("file.config")
    ]});
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument('using "./');
    doc.documentPath = "/dir/testDocument.sheet";
    const suggestions = await toTest.autoComplete(doc);
    expect(suggestions.length).to.equal(5);
  });  
  it('return ordered', async () => {
    const fs = new FileSystemInspectorMock({ '/': [
      file("01.lua"),
      file("x.template"),
      file("@.chords"),
      file("c.pitchmap"),
      file("a.config")
    ]});
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument('using "/');
    const suggestions = await toTest.autoComplete(doc);
    expect(suggestions.map(x => x.displayText)).to.have.ordered.members([
      "chords",
      "lua",
      "pitchmaps",
      "templates",
      "@.chords", 
      "01.lua",
      "a.config",
      "c.pitchmap",
      "x.template"
    ]);
  });  
  it('return ordered directories first', async () => {
    const fs = new FileSystemInspectorMock({ '/': [
      file("01.lua"),
      file("x.template"),
      file("@.chords"),
      file("c.pitchmap"),
      dir("z"),
      dir("a")
    ]});
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument('using "/');
    const suggestions = await toTest.autoComplete(doc);
    expect(suggestions.map(x => x.displayText)).to.have.ordered.members([
      "a",
      "chords",
      "lua",
      "pitchmaps",
      "templates",
      "z",
      "@.chords", 
      "01.lua",
      "c.pitchmap",
      "x.template"
    ]);
  });
  it('return path suggestion', async () => {
    const fs = new FileSystemInspectorMock({ '/': [
      file("01.lua"),
      dir("a")
    ]});
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument('using "/');
    const suggestions = await toTest.autoComplete(doc);
    expect(suggestions.length).to.equal(2 + numberOfPreInstalledAuxDirectories);
    expect(suggestions[0].displayText).to.equal("a");
    expect(suggestions[5].displayText).to.equal("01.lua");
    expect((suggestions[0] as IPathSuggestion).file.isDirectory).to.equal(true);
    expect((suggestions[5] as IPathSuggestion).file.isDirectory).to.equal(false);
  });
  it('return resolved relative parent path', async () => {
    const fs = new FileSystemInspectorMock({ '/': [
      file("file.lua"),
      file("file.template"),
      file("file.chords"),
      file("file.pitchmap"),
      file("file.config")
    ]});
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument('using "../');
    doc.documentPath = "/sub/testDoc.sheet";
    const suggestions = await toTest.autoComplete(doc);
    expect(suggestions.length).to.equal(5 + numberOfPreInstalledAuxDirectories);
  });
  it('return resolved relative parent of parent path', async () => {
    const fs = new FileSystemInspectorMock({ '/': [
      file("file.lua"),
      file("file.template"),
      file("file.chords"),
      file("file.pitchmap"),
      file("file.config")
    ]});
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument('using "../../');
    doc.documentPath = "/sub/sub/testDoc.sheet";
    const suggestions = await toTest.autoComplete(doc);
    expect(suggestions.length).to.equal(5 + numberOfPreInstalledAuxDirectories);
  });  
  it('return filter from beginning', async () => {
    const fs = new FileSystemInspectorMock({ '/': [
      file("file.template"),
      file("file.chords"),
      file("file.pitchmap"),
      file("my.file.lua"),
      file("file.config")
    ]});
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument('using "/file');
    const suggestions = await toTest.autoComplete(doc);
    expect(suggestions.length).to.equal(4);
    expect(suggestions.map(x => x.displayText)).to.contains.all.members([
      "file.template",
      "file.chords",
      "file.pitchmap",
      "file.config"
    ]);
  });
  it('return without error', async () => {
    const fs = new FileSystemInspectorMock({ '/': []});
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument('using ');
    const suggestions = await toTest.autoComplete(doc);
    expect(suggestions.length).to.equal(0);
  });
  it('return if using with multiple lines', async () => {
    const fs = new FileSystemInspectorMock({ '/': [
      file("file.lua"),
      file("file.template"),
      file("file.chords"),
      file("file.pitchmap"),
      file("file.config")
    ]});
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument(`using 
    "/`);
    const suggestions = await toTest.autoComplete(doc);
    expect(suggestions.length).to.equal(5 + numberOfPreInstalledAuxDirectories);
  });
  it('return pre installed aux files', async () => {
    const fs = new FileSystemInspectorMock({});
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument(`using "/`);
    const suggestions = await toTest.autoComplete(doc);
    expect(suggestions.length).to.equal(4);
    expect(suggestions.map(x => x.text)).to.contains('lua');
    expect(suggestions.map(x => x.text)).to.contains('chords');
    expect(suggestions.map(x => x.text)).to.contains('pitchmaps');
    expect(suggestions.map(x => x.text)).to.contains('templates');
  });
  it('return pre installed lua directories', async () => {
    const fs = new FileSystemInspectorMock({});
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument(`using "/lua/`);
    const suggestions = await toTest.autoComplete(doc);
    expect(suggestions.length).to.equal(3);
    expect(suggestions.map(x => x.text)).to.contains('mods');
    expect(suggestions.map(x => x.text)).to.contains('voicings');
  });    
});
