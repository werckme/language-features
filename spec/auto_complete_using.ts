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

const expect = chai.expect;


function file(path: string): FileInfo {
  return {path: path, isDirectory: false};
} 

function dir(path: string): FileInfo {
  return {path: path, isDirectory: true};
} 

class FileSystemInspectorMock implements IFileSystemInspector {
  constructor(private fs: {[dir: string]: FileInfo[]}) {}
  async getParentPath(path: string): Promise<string> {
    const segments = path.split('/');
    return segments.slice(0, segments.length - 1).join('/') + '/';
  }
  async ls(path: Path): Promise<FileInfo[]> {
    return this.fs[path];
  }
}

class TestDocument implements IActiveSourceDocument {
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
  async getPath(): Promise<string> {
    return "./testDocument.sheet";
  }
}

chai.should();

describe('should return files and directories', () => {
  it('return nothing', async () => {
    const fs = new FileSystemInspectorMock({'./': []});
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument("");
    expect(await toTest.autoComplete(doc)).to.deep.equal([]);
  });
  it('return supported files for using', async () => {
    const fs = new FileSystemInspectorMock({ './': [
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
    const fs = new FileSystemInspectorMock({ './': [
      file("file.sheet")
    ]});
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument('using "');
    const suggestions = await toTest.autoComplete(doc);
    expect(suggestions.length).to.equal(0);
  });
  it('return nothing if using line is complete', async () => {
    const fs = new FileSystemInspectorMock({ './': [
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
    const fs = new FileSystemInspectorMock({ './': [
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
    expect(suggestions[0]).to.equal("file.lua");
  });
  it('return directories', async () => {
    const fs = new FileSystemInspectorMock({'./': [
      dir("dir"),
    ]});
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument('using "');
    const suggestions = await toTest.autoComplete(doc);
    expect(suggestions.length).to.equal(1);
  });
  it('return content of sub directories', async () => {
    const fs = new FileSystemInspectorMock({'./dir1': [
      file("file1.lua"),
    ], 
    './dir2': [
      file("file2.lua"),
    ]});
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument('using "dir1/');
    const suggestions = await toTest.autoComplete(doc);
    expect(suggestions.length).to.equal(1);
    expect(suggestions[0]).to.equal("file1.lua");
  });  
});
