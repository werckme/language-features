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

class FileSystemInspectorMock implements IFileSystemInspector {
  constructor() {}
  async getParentPath(path: string): Promise<string> {
    return "";
  }
  async ls(path: Path): Promise<FileInfo[]> {
    return [];
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

describe('should return command argument completion', () => {
  it('should return volume arguments', async () => {
    const fs = new FileSystemInspectorMock();
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument("volume: _");
    expect((await toTest.autoComplete(doc)).length).to.equal(1);
    expect((await toTest.autoComplete(doc))[0].text).to.equal("to");
  });
  it('should return signature arguments', async () => {
    const fs = new FileSystemInspectorMock();
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument("signature: _");
    const hints = (await toTest.autoComplete(doc)).map(x => x.text);
    expect(hints.length).to.equal(2);
    expect(hints).to.contains("upper");
    expect(hints).to.contains("lower");
  });  
});
