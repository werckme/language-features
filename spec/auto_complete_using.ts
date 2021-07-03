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
const expect = chai.expect;


function file(name: string): FileInfo {
  return {name: name, isDirectory: false};
} 

function dir(name: string): FileInfo {
  return {name: name, isDirectory: true};
} 

class FileSystemInspectorMock implements IFileSystemInspector {
  constructor(private fs: {[dir: string]: FileInfo[]}) {}
  async getParentPath(path: string): Promise<string> {
    path = path.trim().replace(/\/$/, '');
    const segments = path.split('/');
    const result = segments.slice(0, segments.length - 1).join('/') + '/';
    return result;
  }
  async ls(path: Path): Promise<FileInfo[]> {
    return this.fs[path] || [];
  }
}

chai.should();

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
      file("file.config")
    ]});
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument('using "/');
    const suggestions = await toTest.autoComplete(doc);
    expect(suggestions.length).to.equal(5);
  });
  it('do not return unsupported file for using', async () => {
    const fs = new FileSystemInspectorMock({ '/': [
      file("file.sheet")
    ]});
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument('using "/');
    const suggestions = await toTest.autoComplete(doc);
    expect(suggestions.length).to.equal(0);
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
    expect(suggestions.length).to.equal(1);
  });
  it('return content of sub directories', async () => {
    const fs = new FileSystemInspectorMock({'/dir1/': [
      file("file1.lua"),
    ], 
    '/dir2/': [
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
    expect(suggestions.length).to.equal(5);
  });  
  it('return resolved relative sub path', async () => {
    const fs = new FileSystemInspectorMock({ '/dir/': [
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
    const fs = new FileSystemInspectorMock({ '/dir/': [
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
    const fs = new FileSystemInspectorMock({ '/dir/': [
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
    expect(suggestions.length).to.equal(2);
    expect(suggestions[0].displayText).to.equal("a");
    expect(suggestions[1].displayText).to.equal("01.lua");
    expect((suggestions[0] as IPathSuggestion).file.isDirectory).to.equal(true);
    expect((suggestions[1] as IPathSuggestion).file.isDirectory).to.equal(false);
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
    expect(suggestions.length).to.equal(5);
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
    expect(suggestions.length).to.equal(5);
  });  
});
