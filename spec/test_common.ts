import * as chai from 'chai';
import "regenerator-runtime/runtime";
import {
  IActiveSourceDocument,
  LanguageFeatures,
  Cursor
}
  from '../src';
import * as _ from 'lodash';
import { getRangeFromText, TestDocument } from './helper';
import { getExpressionDocContext, getExpressionLine, SupportedDocumentContextValues } from '../src/Common';
import { getAutoHintDb } from '../src/WerckmeisterAutoHintDb';
const expect = chai.expect;

chai.should();

describe('should return expression line', () => {
  it('return expression line for one line', async () => {
    const document = new TestDocument(`using "/`)
    const line = await getExpressionLine(document, await document.getCursor());
    expect(line).to.equal(`using "/`);
  });
  it('return expression line for two lines', async () => {
    const document = new TestDocument(`using
"/`)
    const line = await getExpressionLine(document, await document.getCursor());
    expect(line).to.equal(`using "/`);
  });
  it('return expression line for instrumentConf', async () => {
    const document = new TestDocument(`instrumentConf: bass
mod staccato _grid=16
volume 100`)
    const line = await getExpressionLine(document, await document.getCursor());
    expect(line).to.equal(`instrumentConf: bass mod staccato _grid=16 volume 100`);
  });
  it('return one expressions in one line with two expressions', async () => {
    const document = new TestDocument(`instrumentConf: bass mod staccato; instrumentConf: piano volume 10`)
    const line = await getExpressionLine(document, await document.getCursor());
    expect(line).to.equal(`instrumentConf: piano volume 10`);
  });
  it('return mod line', async () => {
    const document = new TestDocument(`/tempo: `)
    const line = await getExpressionLine(document, await document.getCursor());
    expect(line).to.equal(`tempo: `);
  });
  it('return mod multi line', async () => {
    const document = new TestDocument(`tempo:
_a=100
_b=200`)
    const line = await getExpressionLine(document, await document.getCursor());
    expect(line).to.equal(`tempo: _a=100 _b=200`);
  });
  it('return two mods multi line', async () => {
    const document = new TestDocument(`/tempo:
_a=100
_b=200/
/signature: 2
3`)
    const line = await getExpressionLine(document, await document.getCursor());
    expect(line).to.equal(`signature: 2 3`);
  });
  it('return documentConfig', async () => {
    const document = new TestDocument(`instrument`)
    const line = await getExpressionLine(document, await document.getCursor());
    expect(line).to.equal(`instrument`);
  });
  it('return command', async () => {
    const document = new TestDocument(`/myCommand`)
    const line = await getExpressionLine(document, await document.getCursor());
    expect(line).to.equal(`myCommand`);
  });
  it('return command within line', async () => {
    const document = new TestDocument(`c d e f g | c "ht" /myCommand`)
    const line = await getExpressionLine(document, await document.getCursor());
    expect(line).to.equal(`myCommand`);
  });
  it('return documentConfig within document', async () => {
    const document = new TestDocument(`
using "/somefile";
using "/someOtherFile";
instrumentDef: myInstrument 0 0 0;
instrument`)
    const line = await getExpressionLine(document, await document.getCursor());
    expect(line).to.equal(`instrument`);
  });
  it('return command within voice', async () => {
    const document = new TestDocument(`
using "/somefile";
using "/someOtherFile";
instrumentDef: myInstrument 0 0 0;
[
{
  c d e f | g /volume`)
    const line = await getExpressionLine(document, await document.getCursor());
    expect(line).to.equal(`volume`);
  });
  it("should know all document context values", async () => {
    const ValidDocumentContextValues = _.values(SupportedDocumentContextValues);
    const db = getAutoHintDb();
    for(const dbKey in db) {
        const dbValue = db[dbKey];
        const docContextValues = dbValue.getDocumentContext();
        expect(docContextValues.length).to.greaterThan(0);
        for(const docContextValue of docContextValues) {
            expect(ValidDocumentContextValues, `Weckmeister AutoHintDB: no valid doc context for "${dbKey}" ("${docContextValue}")`)
              .to.contains(docContextValue);
        }
    }
  });
  it('shoukd return expr. doc. context "document" 1', async () => {
    const document = new TestDocument(`
`)
    const line = await getExpressionDocContext(document, await document.getCursor());
    expect(line).to.equal(`document`);
  });  
  it('shoukd return expr. doc. context "document" 2', async () => {
    const document = new TestDocument(`
using "/somefile";
using "/someOtherFile";
instrumentDef: myInstrument 0 0 0;
instrument`)
    const line = await getExpressionDocContext(document, await document.getCursor());
    expect(line).to.equal(`document`);
  });
  it('shoukd return expr. doc. context "document" 3', async () => {
    const document = new TestDocument(`
using "/somefile";
using "/someOtherFile";
instrumentDef: myInstrument 0 0 0;

[
{
c d e /vol: xxxx/
}
]
`)
    const line = await getExpressionDocContext(document, await document.getCursor());
    expect(line).to.equal(`document`);
  });      
  it('shoukd return expr. doc. context "track" 1', async () => {
    const document = new TestDocument(`
using "/somefile";
using "/someOtherFile";
instrumentDef: myInstrument 0 0 0;

[
`)
    const line = await getExpressionDocContext(document, await document.getCursor());
    expect(line).to.equal(`track`);
  });

  it('shoukd return expr. doc. context "track" 2', async () => {
    const document = new TestDocument(`
using "/somefile";
using "/someOtherFile";
instrumentDef: myInstrument 0 0 0;

[
instrument`)
    const line = await getExpressionDocContext(document, await document.getCursor());
    expect(line).to.equal(`track`);
  });

  it('shoukd return expr. doc. context "track" 3', async () => {
    const document = new TestDocument(`
using "/somefile";
using "/someOtherFile";
instrumentDef: myInstrument 0 0 0;

[
instrument: myInstrument;
`)
    const line = await getExpressionDocContext(document, await document.getCursor());
    expect(line).to.equal(`track`);
  });

  it('shoukd return expr. doc. context "voice" 1', async () => {
    const document = new TestDocument(`
using "/somefile";
using "/someOtherFile";
instrumentDef: myInstrument 0 0 0;

[
{
`)
    const line = await getExpressionDocContext(document, await document.getCursor());
    expect(line).to.equal(`voice`);
  });
  it('shoukd return expr. doc. context "voice" 2', async () => {
    const document = new TestDocument(`
using "/somefile";
using "/someOtherFile";
instrumentDef: myInstrument 0 0 0;

[
{
c d e /vol
`)
    const line = await getExpressionDocContext(document, await document.getCursor());
    expect(line).to.equal(`voice`);
  });                
});