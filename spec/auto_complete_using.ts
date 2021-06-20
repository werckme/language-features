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
    const segments = path.split('/');
    return segments.slice(0, segments.length - 1).join('/') + '/';
  }
  async ls(path: Path): Promise<FileInfo[]> {
    return this.fs[path] || [];
  }
}

class TestDocument implements IActiveSourceDocument {
  public documentPath = "/testDocument.sheet";
  constructor(private text: string, private cursor: Cursor = undefined) {
    if (cursor === undefined) {
      this.cursor = {line: 0, col: text.length - 1};
    }
  }
  async getCursor(): Promise<Cursor> {
    return this.cursor;
  }
  async getRange(from: Cursor, to: Cursor): Promise<string> {
    if (from.line > 0 || to.line >0) {
      throw new Error("TODO");
    }
    return this.text.slice(from.col, to.col+1);
  }
  async getAbsolutePath(): Promise<string> {
    return this.documentPath;
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
    const doc = new TestDocument('using "');
    const suggestions = await toTest.autoComplete(doc);
    expect(suggestions.length).to.equal(5);
  });
  it('do not return unsupported file for using', async () => {
    const fs = new FileSystemInspectorMock({ '/': [
      file("file.sheet")
    ]});
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument('using "');
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
    expect(suggestions[0].text).to.equal("file.lua");
  });
  it('return directories', async () => {
    const fs = new FileSystemInspectorMock({'/': [
      dir("dir"),
    ]});
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument('using "');
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
    expect(suggestions[0].text).to.equal("file1.lua");
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
    expect(suggestions[0].text).to.equal("file.lua");
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
    expect(suggestions.map(x => x.text)).to.have.ordered.members([
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
    expect(suggestions.map(x => x.text)).to.have.ordered.members([
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
    expect(suggestions[0].text).to.equal("a");
    expect(suggestions[1].text).to.equal("01.lua");
    expect((suggestions[0] as IPathSuggestion).file.isDirectory).to.equal(true);
    expect((suggestions[1] as IPathSuggestion).file.isDirectory).to.equal(false);
  });      
});
