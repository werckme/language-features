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
import { getExpressionLine } from '../src/Common';
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
volume 100;`)
    const line = await getExpressionLine(document, await document.getCursor());
    expect(line).to.equal(`instrumentConf: bass mod staccato _grid=16 volume 100;`);
  });
  it('return two expressions in one line', async () => {
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
});