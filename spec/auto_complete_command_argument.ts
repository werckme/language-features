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
    expect((await toTest.autoComplete(doc))[0].displayText).to.equal("to");
  });
  it('should return signature arguments', async () => {
    const fs = new FileSystemInspectorMock();
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument("signature: _");
    const hints = (await toTest.autoComplete(doc)).map(x => x.displayText);
    expect(hints.length).to.equal(2);
    expect(hints).to.contains("upper");
    expect(hints).to.contains("lower");
  });
  it('should return suggestion text', async () => {
    const fs = new FileSystemInspectorMock();
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument("volume: _");
    expect((await toTest.autoComplete(doc)).length).to.equal(1);
    expect((await toTest.autoComplete(doc))[0].text).to.equal("_to=");
  });
  it('should return filtered suggestion text', async () => {
    const fs = new FileSystemInspectorMock();
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument("instrumentDef: _c");
    const hints = (await toTest.autoComplete(doc)).map(x => x.displayText);
    expect(hints.length).to.equal(2);
    expect(hints).to.contains("cc");
    expect(hints).to.contains("ch");
  });
  it('should return orderd suggestion text', async () => {
    const fs = new FileSystemInspectorMock();
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument("instrumentDef: _");
    const hints = (await toTest.autoComplete(doc)).map(x => x.displayText);
    expect(hints).to.have.ordered.members([
      "cc",
      "ch",
      "onDevice",
      "pc", 
      "setName",
    ]);
  });
  it('should handle multi lines', async () => {
    const fs = new FileSystemInspectorMock();
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument("instrumentDef: \n_");
    const hints = (await toTest.autoComplete(doc)).map(x => x.displayText);
    expect(hints.length).to.equal(5);
  });
  it('should handle mods', async () => {
    const fs = new FileSystemInspectorMock();
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument("mod: swing _");
    const hints = (await toTest.autoComplete(doc)).map(x => x.displayText);
    expect(hints.length).to.equal(2);
    expect(hints).to.contains("grid");
    expect(hints).to.contains("offset");
  });
  it('should handle mods with _use', async () => {
    const fs = new FileSystemInspectorMock();
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument("mod: _use=\"swing\" _");
    const hints = (await toTest.autoComplete(doc)).map(x => x.displayText);
    expect(hints.length).to.equal(2);
    expect(hints).to.contains("grid");
    expect(hints).to.contains("offset");
  });  
  it('should handle mod once', async () => {
    const fs = new FileSystemInspectorMock();
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument("modOnce: swing _");
    const hints = (await toTest.autoComplete(doc)).map(x => x.displayText);
    expect(hints.length).to.equal(2);
    expect(hints).to.contains("grid");
    expect(hints).to.contains("offset");
  });
  it('should handle instrumentDef mod', async () => {
    const fs = new FileSystemInspectorMock();
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument("instrumentConf: bass volume 50 mod swing _");
    const hints = (await toTest.autoComplete(doc)).map(x => x.displayText);
    expect(hints.length).to.equal(2);
    expect(hints).to.contains("grid");
    expect(hints).to.contains("offset");
  });
  it('should handle voicing strategy', async () => {
    const fs = new FileSystemInspectorMock();
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument("voicingStrategy: voicelead _");
    const hints = (await toTest.autoComplete(doc)).map(x => x.displayText);
    expect(hints.length).to.equal(1);
    expect(hints).to.contains("range");
  });
  it('should handle instrumentDef voicingStrategy', async () => {
    const fs = new FileSystemInspectorMock();
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument("instrumentConf: bass volume 50 mod swing voicingStrategy voicelead _");
    const hints = (await toTest.autoComplete(doc)).map(x => x.displayText);
    expect(hints.length).to.equal(2);
    expect(hints.length).to.equal(1);
    expect(hints).to.contains("range");
  });   
});