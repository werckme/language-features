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

class FileSystemInspectorMock implements IFileSystemInspector {
  constructor() {}
  resolve(basePath: string, path: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
  async getParentPath(path: string): Promise<string> {
    return "";
  }
  async ls(path: Path): Promise<FileInfo[]> {
    return [];
  }
}

chai.should();

describe('should command suggestions', () => {
  it('should return nothing', async () => {
    const fs = new FileSystemInspectorMock();
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument("");
    expect((await toTest.autoComplete(doc)).length).to.equal(0);
  });
  it('should return instrumentDef document config', async () => {
    const fs = new FileSystemInspectorMock();
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument("instrumentD");
    expect((await toTest.autoComplete(doc)).length).to.equal(1);
    expect((await toTest.autoComplete(doc))[0].displayText).to.equal("instrumentDef");
  });
  it('should return volume command', async () => {
    const fs = new FileSystemInspectorMock();
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument("/vol");
    expect((await toTest.autoComplete(doc)).length).to.equal(1);
    expect((await toTest.autoComplete(doc))[0].displayText).to.equal("volume");
  });
});
