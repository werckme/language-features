import * as chai from 'chai';
import "regenerator-runtime/runtime";
import { IActiveSourceDocument, 
  FileInfo, 
  IFileSystemInspector, 
  LanguageFeatures, 
  Path} 
from '../src';

const expect = chai.expect;

class FileSystemInspectorMock implements IFileSystemInspector {
  constructor(private files: FileInfo[]) {}
  ls(path: Path): FileInfo[] {
    return this.files;
  }
}

class TestDocument implements IActiveSourceDocument {
  constructor() {}
}

chai.should();

describe('should return files and directories', () => {
  it('return nothing', async () => {
    const fs = new FileSystemInspectorMock([]);
    const toTest = new LanguageFeatures(fs);
    const doc = new TestDocument();
    expect(await toTest.autoComplete(doc)).to.equal([]);
  });
});
